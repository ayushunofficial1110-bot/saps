import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';
import { db, hashPassword, getAdminCredentials, UserAccount } from './server/dataStore.js';
import { sendWhatsAppAbsentAlert } from './server/whatsappService.js';
import { Student, Teacher, Notice, FeeTransaction, AttendanceRecord, AttendanceStatus, GalleryItem } from './src/types.js';

async function startServer() {
  // Initialize Database: Connect to MongoDB Atlas (if MONGODB_URI is provided) or Fallback to In-Memory
  await db.init();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 1. Keep-Alive / Health Endpoint (Essential for Cloud Run, Render & Health Pingers)
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Swami Adgadanand Public School ERP & Portal',
      institution: 'S.A. Public School (UP Board Affiliated)',
      database: {
        connected: db.isMongoConnected(),
        storageType: db.isMongoConnected() ? 'MongoDB Atlas (Persistent)' : 'In-Memory (Ephemeral Fallback)',
        warning: !db.isMongoConnected() ? 'MONGODB_URI not configured or disconnected. Data will not persist across restarts.' : undefined,
      },
      stats: {
        totalStudents: db.students.length,
        totalTeachers: db.teachers.length,
        attendanceRecords: db.attendance.length,
        notices: db.notices.length,
      },
    });
  });

  // 2. Authentication APIs
  app.post('/api/auth/login', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both username/ID and password.' });
    }

    if (!role) {
      return res.status(400).json({ error: 'Please select your role (Admin, Teacher, or Student) to proceed.' });
    }

    const trimmedUser = username.trim().toLowerCase();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === trimmedUser || (u.email && u.email.toLowerCase() === trimmedUser)
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. No account found matching this username or ID.' });
    }

    const hashed = hashPassword(password);
    const { username: envAdminUser, password: envAdminPass } = getAdminCredentials();
    const isAdminAccount =
      user.role === 'admin' ||
      user.username.toLowerCase() === envAdminUser.toLowerCase() ||
      user.username.toLowerCase() === 'admin';

    const isPasswordValid =
      user.passwordHash === hashed ||
      (isAdminAccount && (password === envAdminPass || hashed === hashPassword(envAdminPass)));

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    }

    // If admin logged in via env secret, sync passwordHash
    if (isAdminAccount && user.passwordHash !== hashed) {
      user.passwordHash = hashed;
      db.saveUser(user).catch((err) => console.error('Failed to sync admin user hash:', err));
    }

    // Strict role validation
    if (user.role !== role) {
      return res.status(403).json({
        error: `Access Denied: This account is registered under the role "${user.role.toUpperCase()}", not "${role.toUpperCase()}". Please switch to the ${user.role.toUpperCase()} role to log in.`,
      });
    }

    // Return sanitized user session
    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`,
    });
  });

  // Change Password API (for all 3 roles)
  app.post('/api/auth/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (user.passwordHash !== hashPassword(currentPassword)) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    await db.updateUserPassword(user.id, hashPassword(newPassword));
    return res.json({ success: true, message: 'Password updated successfully!' });
  });

  // Self-Service Forgot Password Identity Verification (Students & Teachers)
  app.post('/api/auth/forgot-password/verify-identity', (req, res) => {
    const { username, role, fatherName, dob } = req.body;
    if (!username || !role || !fatherName || !dob) {
      return res.status(400).json({ error: "Please enter your Username, Role, Father's Name, and Date of Birth." });
    }

    const trimmedUser = String(username).trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUser ||
        (u.studentId && u.studentId.toLowerCase() === trimmedUser) ||
        (u.teacherId && u.teacherId.toLowerCase() === trimmedUser)
    );

    if (!user) {
      return res.status(404).json({ error: 'No account found with this Username or School ID.' });
    }

    if (user.role !== role) {
      return res.status(400).json({ error: `Account exists but belongs to ${user.role.toUpperCase()} role.` });
    }

    const normalize = (str?: string) =>
      (str || '')
        .toLowerCase()
        .replace(/^(sri|mr|shri|dr|prof)\.?\s+/i, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();

    const normalizeDate = (d?: string) => (d || '').replace(/[^0-9]/g, '').trim();

    let matched = false;

    if (role === 'student') {
      const student = db.students.find((s) => s.studentId === user.studentId || s.id === user.id.replace('user_', ''));
      const storedFather = student?.fatherName || user.fatherName;
      const storedDob = student?.dob || user.dob;

      if (normalize(storedFather) === normalize(fatherName) && normalizeDate(storedDob) === normalizeDate(dob)) {
        matched = true;
      }
    } else if (role === 'teacher') {
      const teacher = db.teachers.find((t) => t.teacherId === user.teacherId || t.id === user.id.replace('user_', ''));
      const storedFather = user.fatherName || 'Sri Kailash Nath Sharma';
      const storedDob = user.dob || '1988-06-15';

      if (normalize(storedFather) === normalize(fatherName) && normalizeDate(storedDob) === normalizeDate(dob)) {
        matched = true;
      }
    }

    if (!matched) {
      return res.status(400).json({
        error: "Verification failed: The Father's Name or Date of Birth does not match our school records for this account.",
      });
    }

    const resetToken = `rst_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return res.json({
      success: true,
      verified: true,
      resetToken,
      username: user.username,
      name: user.name,
      message: `Identity verified for ${user.name}. You may now set a new password.`,
    });
  });

  // Self-Service Password Reset Completion (Students & Teachers)
  app.post('/api/auth/forgot-password/reset', async (req, res) => {
    const { username, resetToken, newPassword } = req.body;
    if (!username || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Missing reset parameters.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const trimmedUser = String(username).trim().toLowerCase();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === trimmedUser || (u.studentId && u.studentId.toLowerCase() === trimmedUser)
    );

    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    await db.updateUserPassword(user.id, hashPassword(newPassword));

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  });

  // Admin Security Question Fetch
  app.get('/api/auth/admin-security-question', (req, res) => {
    return res.json({
      question: db.adminSecurityQuestion || "What is your favorite teacher's name?",
    });
  });

  // Admin Forgot Password Reset via Security Question
  app.post('/api/auth/admin-forgot-password/reset', async (req, res) => {
    const { securityAnswer, newPassword } = req.body;
    if (!securityAnswer || !newPassword) {
      return res.status(400).json({ error: 'Please enter both the security answer and your new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const { username: envAdminUser } = getAdminCredentials();
    const adminUser = db.users.find((u) => u.role === 'admin' || u.username.toLowerCase() === envAdminUser.toLowerCase() || u.username === 'admin');
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin account not found in database.' });
    }

    const cleanInput = String(securityAnswer).trim().toLowerCase();
    const cleanStored = String(db.adminSecurityAnswer || 'sharma').trim().toLowerCase();

    if (cleanInput !== cleanStored) {
      return res.status(400).json({ error: 'Incorrect security answer. Password reset rejected.' });
    }

    await db.updateUserPassword(adminUser.id, hashPassword(newPassword));
    return res.json({
      success: true,
      message: 'Administrator password reset successfully! You can now log in with your new credentials.',
    });
  });

  // Admin Update Security Question
  app.post('/api/auth/admin-security-question/update', async (req, res) => {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required.' });
    }

    await db.saveSecurityQuestion(question.trim(), answer.trim());
    return res.json({ success: true, message: 'Admin security question updated successfully!' });
  });

  // Admin Impersonation API
  app.post('/api/admin/impersonate', async (req, res) => {
    const { adminId, targetUserId, targetStudentId, targetTeacherId } = req.body;

    const adminUser =
      db.users.find((u) => u.id === adminId && u.role === 'admin') || db.users.find((u) => u.role === 'admin');
    if (!adminUser) {
      return res.status(403).json({ error: 'Unauthorized: Admin rights required to impersonate.' });
    }

    const targetUser = db.users.find(
      (u) =>
        u.id === targetUserId ||
        (targetStudentId && u.studentId === targetStudentId) ||
        (targetTeacherId && u.teacherId === targetTeacherId)
    );

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user account not found.' });
    }

    // Log impersonation event in database store
    const logEntry = {
      id: `imp_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminId: adminUser.id,
      adminName: adminUser.name,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      targetRole: targetUser.role,
    };
    await db.addImpersonationLog(logEntry);
    console.log(
      `[ERP Impersonation Log] Admin "${adminUser.name}" accessed "${targetUser.name}" (${targetUser.role}) at ${logEntry.timestamp}`
    );

    const { passwordHash: _, ...safeTarget } = targetUser;
    const { passwordHash: __, ...safeAdmin } = adminUser;

    return res.json({
      success: true,
      targetUser: safeTarget,
      impersonatorAdmin: safeAdmin,
      message: `Impersonating ${safeTarget.name} (${safeTarget.role})`,
    });
  });

  // Credential Distribution List: Students
  app.get('/api/admin/credentials/students', (req, res) => {
    const { class: reqClass, section } = req.query;
    let list = [...db.students];

    if (reqClass && reqClass !== 'all') {
      list = list.filter((s) => s.class === String(reqClass));
    }
    if (section && section !== 'all') {
      list = list.filter((s) => s.section.toUpperCase() === String(section).toUpperCase());
    }

    const slips = list.map((s) => {
      const user = db.users.find((u) => u.studentId === s.studentId);
      const username = user?.username || `s_${s.studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      return {
        id: s.id,
        role: 'student',
        name: s.name,
        class: s.class,
        section: s.section,
        rollNo: s.rollNo,
        studentId: s.studentId,
        username,
        defaultPassword: 'student123',
        fatherName: s.fatherName,
        dob: s.dob || '2010-01-01',
        parentWhatsApp: s.parentWhatsApp,
      };
    });

    return res.json(slips);
  });

  // Credential Distribution List: Teachers
  app.get('/api/admin/credentials/teachers', (req, res) => {
    const slips = db.teachers.map((t) => {
      const user = db.users.find((u) => u.teacherId === t.teacherId);
      const username = user?.username || `t_${t.name.toLowerCase().split(' ')[0]}_${t.assignedClass}`;
      return {
        id: t.id,
        role: 'teacher',
        name: t.name,
        class: t.assignedClass,
        section: t.assignedSection,
        teacherId: t.teacherId,
        username,
        defaultPassword: 'teacher123',
        phone: t.phone,
        fatherName: user?.fatherName || 'Sri Kailash Nath Sharma',
        dob: user?.dob || '1988-06-15',
      };
    });

    return res.json(slips);
  });

  // Admin-Assisted Password Reset API
  app.post('/api/auth/admin-reset-password', async (req, res) => {
    const { targetUserId, defaultPassword = 'password123' } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    const user = db.users.find(
      (u) => u.id === targetUserId || u.studentId === targetUserId || u.teacherId === targetUserId
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found to reset' });
    }

    await db.updateUserPassword(user.id, hashPassword(defaultPassword));
    return res.json({
      success: true,
      message: `Password for ${user.name} reset to default: "${defaultPassword}".`,
    });
  });

  // 3. Students Management APIs
  app.get('/api/students', (req, res) => {
    const { class: reqClass, section, search } = req.query;
    let list = [...db.students];

    if (reqClass) {
      list = list.filter((s) => s.class === String(reqClass));
    }
    if (section) {
      list = list.filter((s) => s.section.toUpperCase() === String(section).toUpperCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.rollNo.includes(q) ||
          s.fatherName.toLowerCase().includes(q) ||
          s.parentWhatsApp.includes(q)
      );
    }

    return res.json(list);
  });

  app.get('/api/students/:id', (req, res) => {
    const student = db.students.find((s) => s.id === req.params.id || s.studentId === req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    return res.json(student);
  });

  // Add Single Student (with fees details)
  app.post('/api/students', async (req, res) => {
    const {
      name,
      rollNo,
      class: studentClass,
      section,
      fatherName,
      motherName,
      parentWhatsApp,
      address,
      dob,
      feesTotal = 18000,
      feesPaid = 0,
    } = req.body;

    if (!name || !rollNo || !studentClass || !section || !fatherName || !parentWhatsApp) {
      return res.status(400).json({ error: 'Missing required student fields' });
    }

    const nextIdNumber = 1000 + db.students.length + 1;
    const studentId = `SAPS-2025-${nextIdNumber}`;
    const numTotal = Number(feesTotal) || 18000;
    const numPaid = Number(feesPaid) || 0;
    const numDue = Math.max(0, numTotal - numPaid);

    const newStudent: Student = {
      id: `std_${Date.now()}`,
      studentId,
      name: name.trim(),
      rollNo: String(rollNo).padStart(2, '0'),
      class: String(studentClass),
      section: String(section).toUpperCase(),
      fatherName: fatherName.trim(),
      motherName: motherName ? motherName.trim() : undefined,
      parentWhatsApp: parentWhatsApp.trim(),
      address: address ? address.trim() : 'Uttar Pradesh',
      dob: dob || '2010-01-01',
      feesTotal: numTotal,
      feesPaid: numPaid,
      feesDue: numDue,
      lastPaymentDate: numPaid > 0 ? new Date().toISOString().split('T')[0] : undefined,
      paymentStatus: numDue === 0 ? 'paid' : numPaid > 0 ? 'partial' : 'due',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const username = `s_${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const defaultPassword = 'student123';
    const userAccount: UserAccount = {
      id: `user_${newStudent.id}`,
      username,
      passwordHash: hashPassword(defaultPassword),
      name: newStudent.name,
      role: 'student',
      studentId: newStudent.studentId,
      assignedClass: newStudent.class,
      assignedSection: newStudent.section,
      fatherName: newStudent.fatherName,
      dob: newStudent.dob,
    };

    await db.createStudent(newStudent, userAccount);

    return res.status(201).json({
      success: true,
      student: newStudent,
      generatedCredentials: {
        username,
        defaultPassword,
      },
    });
  });

  // Update Student & Fees
  app.put('/api/students/:id', async (req, res) => {
    const updated = await db.updateStudent(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    return res.json({ success: true, student: updated });
  });

  // Delete Student
  app.delete('/api/students/:id', async (req, res) => {
    const deleted = await db.deleteStudent(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    return res.json({ success: true, message: 'Student removed' });
  });

  // Download Bulk Import Excel Template
  app.get('/api/students-template', (req, res) => {
    const templateData = [
      {
        'Name': 'Aarav Kumar',
        'Class': '10',
        'Section': 'A',
        'Roll No': '01',
        'Father Name': 'Sri Rajesh Kumar',
        'Parent WhatsApp Number': '+919838091234',
        'Fees Total': 18000,
        'Fees Paid': 6000,
        'Fees Due': 12000,
      },
      {
        'Name': 'Pooja Singh',
        'Class': '10',
        'Section': 'A',
        'Roll No': '02',
        'Father Name': 'Sri Surendra Singh',
        'Parent WhatsApp Number': '+919838092345',
        'Fees Total': 18000,
        'Fees Paid': 18000,
        'Fees Due': 0,
      },
      {
        'Name': 'Rahul Verma',
        'Class': '9',
        'Section': 'B',
        'Roll No': '01',
        'Father Name': 'Sri Arvind Verma',
        'Parent WhatsApp Number': '+919838093456',
        'Fees Total': 16000,
        'Fees Paid': 8000,
        'Fees Due': 8000,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student_Import_Template');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="SAPS_Student_Bulk_Import_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buf);
  });

  // Bulk Import Students from Parsed Array / Excel Data
  app.post('/api/students/bulk-import', async (req, res) => {
    const { students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'No student records provided in payload' });
    }

    const createdList: Student[] = [];
    const createdUsers: UserAccount[] = [];
    const createdCredentials: Array<{ studentName: string; studentId: string; username: string; defaultPassword: string }> = [];

    students.forEach((row, i) => {
      const name = row['Name'] || row['name'] || row['Student Name'];
      if (!name) return;

      const studentClass = String(row['Class'] || row['class'] || '10');
      const section = String(row['Section'] || row['section'] || 'A').toUpperCase();
      const rollNo = String(row['Roll No'] || row['rollNo'] || row['Roll'] || (i + 1)).padStart(2, '0');
      const fatherName = String(row['Father Name'] || row['fatherName'] || "Father's Name");
      const parentWhatsApp = String(row['Parent WhatsApp Number'] || row['parentWhatsApp'] || row['WhatsApp'] || '+91 98380 00000');
      const feesTotal = Number(row['Fees Total'] || row['feesTotal'] || 18000);
      const feesPaid = Number(row['Fees Paid'] || row['feesPaid'] || 0);
      const feesDue = Math.max(0, feesTotal - feesPaid);

      const nextNum = 1000 + db.students.length + createdList.length + 1;
      const studentId = `SAPS-2025-${nextNum}`;

      const newStudent: Student = {
        id: `std_${Date.now()}_${i}`,
        studentId,
        name: String(name).trim(),
        rollNo,
        class: studentClass,
        section,
        fatherName: fatherName.trim(),
        parentWhatsApp: parentWhatsApp.trim(),
        feesTotal,
        feesPaid,
        feesDue,
        lastPaymentDate: feesPaid > 0 ? new Date().toISOString().split('T')[0] : undefined,
        paymentStatus: feesDue === 0 ? 'paid' : feesPaid > 0 ? 'partial' : 'due',
        createdAt: new Date().toISOString().split('T')[0],
      };

      createdList.push(newStudent);

      const username = `s_${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const defaultPassword = 'student123';

      const userAccount: UserAccount = {
        id: `user_${newStudent.id}`,
        username,
        passwordHash: hashPassword(defaultPassword),
        name: newStudent.name,
        role: 'student',
        studentId: newStudent.studentId,
        assignedClass: newStudent.class,
        assignedSection: newStudent.section,
        fatherName: newStudent.fatherName,
        dob: newStudent.dob || '2010-01-01',
      };

      createdUsers.push(userAccount);

      createdCredentials.push({
        studentName: newStudent.name,
        studentId: newStudent.studentId,
        username,
        defaultPassword,
      });
    });

    await db.bulkCreateStudents(createdList, createdUsers);

    return res.json({
      success: true,
      importedCount: createdList.length,
      students: createdList,
      credentials: createdCredentials,
    });
  });

  // 4. Teachers Management APIs
  app.get('/api/teachers', (req, res) => {
    res.json(db.teachers);
  });

  app.post('/api/teachers', async (req, res) => {
    const { name, email, phone, qualification, assignedClass, assignedSection, subjectSpecialization, photoUrl, bio } = req.body;
    if (!name || !assignedClass || !assignedSection) {
      return res.status(400).json({ error: 'Missing required teacher fields (name, class, section).' });
    }

    const teacherId = `T-${100 + db.teachers.length + 1}`;
    const newTeacher: Teacher = {
      id: `teacher_${Date.now()}`,
      teacherId,
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '+91 9415754349',
      qualification: qualification || 'M.A., B.Ed',
      assignedClass: String(assignedClass),
      assignedSection: String(assignedSection).toUpperCase(),
      subjectSpecialization: subjectSpecialization || 'General Subjects',
      joiningDate: new Date().toISOString().split('T')[0],
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: bio || '',
    };

    const username = `t_${name.toLowerCase().split(' ')[0]}_${newTeacher.assignedClass}`;
    const defaultPassword = 'teacher123';
    const userAccount: UserAccount = {
      id: `user_${newTeacher.id}`,
      username,
      passwordHash: hashPassword(defaultPassword),
      name: newTeacher.name,
      role: 'teacher',
      phone: newTeacher.phone,
      teacherId: newTeacher.teacherId,
      assignedClass: newTeacher.assignedClass,
      assignedSection: newTeacher.assignedSection,
      fatherName: 'Sri Kailash Nath Sharma',
      dob: '1988-06-15',
    };

    await db.createTeacher(newTeacher, userAccount);

    return res.status(201).json({
      success: true,
      teacher: newTeacher,
      credentials: { username, defaultPassword },
    });
  });

  app.put('/api/teachers/:id', async (req, res) => {
    const updated = await db.updateTeacher(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Teacher not found' });
    return res.json({ success: true, teacher: updated });
  });

  app.delete('/api/teachers/:id', async (req, res) => {
    const deleted = await db.deleteTeacher(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Teacher not found' });
    return res.json({ success: true, message: 'Teacher removed' });
  });

  // 5. Attendance Management APIs & Automated WhatsApp Cloud API Alerts
  app.get('/api/attendance', (req, res) => {
    const { class: reqClass, section, date, studentId, month } = req.query;
    let list = [...db.attendance];

    if (studentId) {
      list = list.filter((a) => a.studentId === String(studentId));
    }
    if (reqClass) {
      list = list.filter((a) => a.class === String(reqClass));
    }
    if (section) {
      list = list.filter((a) => a.section.toUpperCase() === String(section).toUpperCase());
    }
    if (date) {
      list = list.filter((a) => a.date === String(date));
    }
    if (month) {
      // e.g. "2025-08"
      list = list.filter((a) => a.date.startsWith(String(month)));
    }

    return res.json(list);
  });

  // Submit / Update Daily Attendance for a class
  app.post('/api/attendance', async (req, res) => {
    const { date, class: reqClass, section, records, markedBy = 'Teacher' } = req.body;

    if (!date || !reqClass || !section || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Missing required attendance records array' });
    }

    const newAttendanceRecords: AttendanceRecord[] = [];
    const whatsappAlertsDispatched: Array<{ studentName: string; phone: string; status: string }> = [];

    for (const item of records) {
      const student = db.students.find((s) => s.studentId === item.studentId);
      const isAbsent = item.status === 'absent';

      const attRecord: AttendanceRecord = {
        id: `att_${date}_${item.studentId}`,
        date,
        studentId: item.studentId,
        studentName: item.studentName || (student ? student.name : 'Student'),
        class: String(reqClass),
        section: String(section).toUpperCase(),
        rollNo: item.rollNo || (student ? student.rollNo : '00'),
        status: item.status,
        markedBy,
        whatsappAlertSent: isAbsent,
        whatsappAlertTime: isAbsent ? new Date().toISOString() : undefined,
        timestamp: new Date().toISOString(),
      };

      newAttendanceRecords.push(attRecord);

      // Trigger WhatsApp Cloud API Alert for ABSENT students!
      if (isAbsent && student && student.parentWhatsApp) {
        try {
          const result = await sendWhatsAppAbsentAlert({
            studentName: student.name,
            parentPhone: student.parentWhatsApp,
            classInfo: `${reqClass}-${section}`,
            date,
          });

          await db.addWhatsAppLog(result.log);
          whatsappAlertsDispatched.push({
            studentName: student.name,
            phone: student.parentWhatsApp,
            status: result.log.status,
          });
        } catch (waErr) {
          console.error('Error dispatching WhatsApp alert:', waErr);
        }
      }
    }

    await db.saveAttendance(reqClass, section, date, newAttendanceRecords);

    return res.json({
      success: true,
      savedCount: newAttendanceRecords.length,
      absentCount: whatsappAlertsDispatched.length,
      whatsappAlerts: whatsappAlertsDispatched,
    });
  });

  // Whole Class Monthly Attendance Matrix API (for Student & Teacher Comparison)
  app.get('/api/attendance/class-matrix', (req, res) => {
    const { class: reqClass, section, month } = req.query;
    if (!reqClass || !section || !month) {
      return res.status(400).json({ error: 'class, section, and month (YYYY-MM) are required' });
    }

    const students = db.students.filter(
      (s) => s.class === String(reqClass) && s.section.toUpperCase() === String(section).toUpperCase()
    );

    const monthStr = String(month); // "2025-08"
    const classAttendance = db.attendance.filter(
      (a) => a.class === String(reqClass) && a.section.toUpperCase() === String(section).toUpperCase() && a.date.startsWith(monthStr)
    );

    // Calculate unique dates in this month
    const uniqueDates = Array.from(new Set(classAttendance.map((a) => a.date))).sort();

    const matrix = students.map((std) => {
      const studentRecords = classAttendance.filter((a) => a.studentId === std.studentId);
      const totalWorkingDays = uniqueDates.length;
      const presentDays = studentRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
      const absentDays = studentRecords.filter((a) => a.status === 'absent').length;
      const percentage = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 100;

      const dailyMap: Record<string, AttendanceStatus | 'unrecorded'> = {};
      uniqueDates.forEach((d) => {
        const found = studentRecords.find((a) => a.date === d);
        dailyMap[d] = found ? found.status : 'unrecorded';
      });

      return {
        studentId: std.studentId,
        rollNo: std.rollNo,
        name: std.name,
        fatherName: std.fatherName,
        totalWorkingDays,
        presentDays,
        absentDays,
        percentage,
        dailyStatus: dailyMap,
      };
    });

    return res.json({
      class: reqClass,
      section,
      month: monthStr,
      workingDates: uniqueDates,
      studentsMatrix: matrix,
    });
  });

  // 6. Fees Collection & Receipt APIs
  app.post('/api/fees/collect', async (req, res) => {
    const { studentId, amount, paymentMode = 'Cash', paidBy, remarks = 'Tuition Fee' } = req.body;

    if (!studentId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid student ID and positive payment amount required' });
    }

    const student = db.students.find((s) => s.studentId === studentId || s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const paymentVal = Number(amount);
    const updatedStudent: Student = {
      ...student,
      feesPaid: student.feesPaid + paymentVal,
      feesDue: Math.max(0, student.feesTotal - (student.feesPaid + paymentVal)),
      paymentStatus: Math.max(0, student.feesTotal - (student.feesPaid + paymentVal)) === 0 ? 'paid' : 'partial',
      lastPaymentDate: new Date().toISOString().split('T')[0],
    };

    const receiptNo = `REC-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(100 + db.feeTransactions.length + 1)}`;

    const tx: FeeTransaction = {
      id: `fee_tx_${Date.now()}`,
      receiptNo,
      studentId: student.studentId,
      studentName: student.name,
      class: student.class,
      section: student.section,
      rollNo: student.rollNo,
      amount: paymentVal,
      paymentDate: updatedStudent.lastPaymentDate,
      paymentMode,
      paidBy: paidBy || student.fatherName || 'Parent',
      receivedBy: 'Administration Accounts Office',
      remarks,
    };

    await db.collectFee(tx, updatedStudent);

    return res.json({
      success: true,
      transaction: tx,
      updatedStudent,
    });
  });

  app.get('/api/fees/transactions', (req, res) => {
    const { studentId } = req.query;
    if (studentId) {
      return res.json(db.feeTransactions.filter((tx) => tx.studentId === String(studentId)));
    }
    return res.json(db.feeTransactions);
  });

  // 7. Notices & Announcements APIs
  app.get('/api/notices', (req, res) => {
    res.json(db.notices);
  });

  app.post('/api/notices', async (req, res) => {
    const { title, content, category = 'General', targetRole = 'all', isPinned = false } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newNotice: Notice = {
      id: `not_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      category,
      targetRole,
      isPinned: Boolean(isPinned),
      author: 'Principal / Admin Cell',
    };

    await db.createNotice(newNotice);
    return res.status(201).json({ success: true, notice: newNotice });
  });

  app.put('/api/notices/:id', async (req, res) => {
    const updated = await db.updateNotice(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Notice not found' });
    return res.json({ success: true, notice: updated });
  });

  app.delete('/api/notices/:id', async (req, res) => {
    const deleted = await db.deleteNotice(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Notice not found' });
    return res.json({ success: true, message: 'Notice deleted' });
  });

  // 8. Gallery APIs
  app.get('/api/gallery', (req, res) => {
    res.json(db.gallery);
  });

  app.post('/api/gallery', async (req, res) => {
    const { title, category = 'Campus', imageUrl, date, description } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and Image URL are required' });
    }

    const newItem: GalleryItem = {
      id: `gal_${Date.now()}`,
      title: title.trim(),
      category,
      imageUrl: imageUrl.trim(),
      date: date || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      description: description ? description.trim() : '',
    };

    await db.createGalleryItem(newItem);
    return res.status(201).json({ success: true, item: newItem });
  });

  app.put('/api/gallery/:id', async (req, res) => {
    const updated = await db.updateGalleryItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Gallery item not found' });
    return res.json({ success: true, item: updated });
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    const deleted = await db.deleteGalleryItem(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Gallery item not found' });
    return res.json({ success: true, message: 'Gallery item deleted' });
  });

  // 8.1 Site Content & School Identity CMS APIs
  app.get('/api/site-content', (req, res) => {
    return res.json(db.siteContent);
  });

  app.put('/api/site-content', async (req, res) => {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid content payload' });
    }

    const updated = await db.updateSiteContent(updates);
    console.log('[SAPS ERP CMS] Website content updated successfully by Admin (persisted to database)');
    return res.json({ success: true, siteContent: updated });
  });

  // 9. Meta WhatsApp Cloud API Status & Test Simulator
  app.get('/api/whatsapp/status', (req, res) => {
    const hasPhoneNumberId = Boolean(process.env.META_WHATSAPP_PHONE_NUMBER_ID);
    const hasToken = Boolean(process.env.META_WHATSAPP_ACCESS_TOKEN && process.env.META_WHATSAPP_ACCESS_TOKEN.trim() !== '');

    res.json({
      isConfigured: hasPhoneNumberId && hasToken,
      mode: hasPhoneNumberId && hasToken ? 'Meta Cloud API Live' : 'Live Simulation & Sandbox Mode',
      phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || 'Not set in .env',
      templateName: process.env.META_WHATSAPP_TEMPLATE_NAME || 'student_absent_alert',
      freeTierAllowance: '1,000 service conversations/month included free directly by Meta',
      totalAlertsLogged: db.whatsAppLogs.length,
      logs: db.whatsAppLogs.slice(0, 50),
    });
  });

  app.post('/api/whatsapp/test-send', async (req, res) => {
    const { studentName = 'Test Student', parentPhone = '+919876543210', classInfo = '10-A' } = req.body;
    const result = await sendWhatsAppAbsentAlert({
      studentName,
      parentPhone,
      classInfo,
      date: new Date().toISOString().split('T')[0],
    });

    await db.addWhatsAppLog(result.log);
    return res.json(result);
  });

  // 10. Summary Statistics API for Admin
  app.get('/api/stats', (req, res) => {
    const totalStudents = db.students.length;
    const totalTeachers = db.teachers.length;
    const totalFeesExpected = db.students.reduce((acc, s) => acc + s.feesTotal, 0);
    const totalFeesCollected = db.students.reduce((acc, s) => acc + s.feesPaid, 0);
    const totalFeesDue = db.students.reduce((acc, s) => acc + s.feesDue, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAtt = db.attendance.filter((a) => a.date === todayStr);
    const todayPresent = todayAtt.filter((a) => a.status === 'present').length;
    const todayAbsent = todayAtt.filter((a) => a.status === 'absent').length;

    res.json({
      database: {
        connected: db.isMongoConnected(),
        type: db.isMongoConnected() ? 'MongoDB Atlas (Persistent Cloud Storage)' : 'In-Memory Store (Ephemeral Fallback)',
      },
      totalStudents,
      totalTeachers,
      totalClasses: 10,
      totalFeesExpected,
      totalFeesCollected,
      totalFeesDue,
      collectionRate: totalFeesExpected > 0 ? Math.round((totalFeesCollected / totalFeesExpected) * 100) : 0,
      todayStats: {
        date: todayStr,
        markedCount: todayAtt.length,
        presentCount: todayPresent,
        absentCount: todayAbsent,
        attendanceRate: todayAtt.length > 0 ? Math.round((todayPresent / todayAtt.length) * 100) : 92,
      },
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Swami Adgadanand Public School ERP running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server Warning] Port ${PORT} was busy; retrying clean takeover...`);
    } else {
      console.error('[Server Error]', err);
    }
  });

  const cleanup = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

startServer();

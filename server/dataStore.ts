import 'dotenv/config';
import crypto from 'crypto';
import { MongoClient, Db, Collection } from 'mongodb';
import {
  User,
  Student,
  Teacher,
  AttendanceRecord,
  FeeTransaction,
  Notice,
  WhatsAppLog,
  GalleryItem,
  SiteContent,
} from '../src/types.js';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function getAdminCredentials(): { username: string; password: string } {
  const username = (process.env.ADMIN_USERNAME || 'admin').trim();
  const password = (process.env.ADMIN_PASSWORD || 'SapsAdmin@2026').trim();
  return { username, password };
}

export interface UserAccount extends User {
  passwordHash: string;
}

export interface SystemSettingsDoc {
  _id: string;
  adminSecurityQuestion: string;
  adminSecurityAnswer: string;
  impersonationLogs: any[];
}

export class DataStore {
  // In-Memory mirror arrays for ultra-fast, zero-latency synchronous reading and filtering
  users: UserAccount[] = [];
  students: Student[] = [];
  teachers: Teacher[] = [];
  attendance: AttendanceRecord[] = [];
  feeTransactions: FeeTransaction[] = [];
  notices: Notice[] = [];
  whatsAppLogs: WhatsAppLog[] = [];
  gallery: GalleryItem[] = [];
  impersonationLogs: any[] = [];
  adminSecurityQuestion: string =
    process.env.ADMIN_SECURITY_QUESTION?.trim() || "What is your favorite teacher's name?";
  adminSecurityAnswer: string =
    process.env.ADMIN_SECURITY_ANSWER?.trim() || "Sharma";

  // Dynamic Site Content (Editable by Admin in CMS tab)
  siteContent: SiteContent = {
    school: {
      name: 'Swami Adgadanand Public School',
      shortName: 'S.A. Public School',
      tagline: 'Excellence in Value-Based Education',
      motto: 'सा विद्या या विमुक्तये',
      mottoTranslation: 'Knowledge is that which liberates.',
      logoUrl: 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg',
      phone: '+91 9415754349',
      supportPhone: '+91 9415754349',
      email: 'sapublicschool21@gmail.com',
      address:
        'Swami Adgadanand Public School Campus, Main Highway Road, Phulpur / Varanasi Sector, Uttar Pradesh - 221002, India',
      helpSpanText: '24hr',
      academicLevels: 'Classes 1st to 12th',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115408.23230671378!2d82.9087063!3d25.321684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2db76febcf4d%3A0x68131710853ff0b5!2sVaranasi%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    },
    principal: {
      name: 'Mr. Rajesh Kumar Srivastav',
      designation: 'Director of school',
      qualification: '',
      photoUrl:
        'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg',
      welcomeHeadline: 'Empowering Rural & Suburban Youth with Modern Quality Education',
      welcomeMessage:
        'Welcome to Swami Adgadanand Public School. We believe true education enlightens the mind while anchoring the spirit in moral character and self-discipline. Our comprehensive curriculum blends rigorous mathematics, science, language arts, and social sciences with digital literacy and physical wellness.',
      deskMessageP1:
        'Under the holy inspiration and sacred blessings of Param Pujya Swami Adgadanand Ji Maharaj, S.A. Public School was established to provide children of our region access to world-class schooling, disciplined character development, and academic success.',
      deskMessageP2:
        'We believe that true education does not just fill the mind with facts, but kindles the inner light of discernment, curiosity, and moral integrity. Our teachers mentor every student with individual care, fostering curiosity and confidence for board examinations and competitive pursuits.',
    },
    home: {
      heroTitle: 'SWAMI ADGADANAND PUBLIC SCHOOL',
      heroSubtitle:
        'Nurturing moral wisdom, scientific temperament, and academic excellence under the venerable inspiration of Param Pujya Swami Adgadanand Ji Maharaj.',
      statStudents: '250+',
      statPassRate: '100%',
      statTeachers: '15+',
      statVans: '6',
      admissionBannerTitle: 'Admissions Open for Classes 1st to 12th',
      admissionBannerSubtitle:
        'Enroll your child at Swami Adgadanand Public School for quality education, affordable fee structure, and dedicated academic guidance.',
    },
    about: {
      pageTitle: 'About S.A. Public School',
      pageSubtitle:
        'Founded under the eternal inspiration of Param Pujya Swami Adgadanand Ji Maharaj, fostering character, wisdom, and academic brilliance in eastern Uttar Pradesh.',
      legacyTitle: 'Our Divine Foundation & Spiritual Legacy',
      legacyP1:
        "Swami Adgadanand Public School was founded with the benevolent blessings of Param Pujya Swami Adgadanand Ji Maharaj (author of the acclaimed spiritual commentary 'Yatharth Geeta'). The institution embodies the timeless principle 'सा विद्या या विमुक्तये' (Knowledge is that which liberates), striving to provide holistic education that uplifts both the intellect and the soul.",
      legacyP2:
        'Situated in Uttar Pradesh, the school caters to students from surrounding rural and suburban sectors, bridging modern academic curricula with foundational cultural values and ethical character.',
      visionTitle: 'Our Vision',
      visionText:
        'To be a beacon of accessible, value-rooted modern education where every student develops sharp analytical intellect, sound moral judgment, and lifelong discipline.',
      missionTitle: 'Our Mission',
      missionText:
        'To deliver rigorous education from classes 1st to 12th through qualified class mentors, accessible transport networks, transparent digital ERP systems, and individualized student care.',
    },
    facilities: [
      {
        id: 'fac_1',
        title: 'Well-Qualified Class Teachers',
        category: 'Academic Quality',
        badge: '100% Certified Faculty',
        description:
          'Every section at S.A. Public School is mentored by a well-qualified, dedicated class teacher holding post-graduate (M.Sc / M.A.) and professional B.Ed qualifications from recognized state universities.',
        points: [
          'Personal student attention and daily doubt monitoring',
          'Comprehensive Board examination preparation for high scores',
          'Assigned class mentors tracking weekly attendance & progress',
        ],
        iconType: 'teacher',
      },
      {
        id: 'fac_2',
        title: 'School Van / Transport Facility Available',
        category: 'Transportation Service',
        badge: 'Safe & Verified Drivers',
        description:
          'We provide convenient and secure school van and transport services covering all prominent sectors, towns, villages, and rural roads surrounding the school campus.',
        points: [
          'Fixed morning pickup and afternoon drop schedules',
          'Doorstep & designated pickup points for child safety',
          'Dedicated transport in-charge hotline (+91 9415754349)',
        ],
        iconType: 'van',
      },
      {
        id: 'fac_3',
        title: 'Science & Computer Lab Facilities',
        category: 'Practical Learning',
        badge: 'Modern Equipment',
        description:
          'Well-equipped physics, chemistry, biology, and computer laboratories where students gain hands-on experimental learning and digital literacy.',
        points: [
          'Practical experiments under subject specialist supervision',
          'Computer workstation access for students of all grades',
          'Interactive audio-visual learning aids',
        ],
        iconType: 'lab',
      },
      {
        id: 'fac_4',
        title: 'Library & Reading Room',
        category: 'Knowledge Hub',
        badge: '2000+ Books & Periodicals',
        description:
          'A serene reading environment stocked with NCERT textbooks, reference literature, moral philosophy, encyclopedia, and regional periodicals.',
        points: [
          'Curated spiritual and moral texts including Yatharth Geeta',
          'Academic competitive exam guides and reference materials',
          'Dedicated weekly library periods for all classes',
        ],
        iconType: 'library',
      },
    ],
    gallery: {
      moreMediaUrl: '',
      bannerTitle: 'View More Photos & Videos',
      bannerSubtitle:
        'Follow our official channel for daily campus highlights, annual day celebrations, sports meet clips, and live event updates.',
      buttonText: 'Open Official Media Channel',
    },
  };

  // MongoDB connection state & handles
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;
  private isConnected: boolean = false;

  private usersCol: Collection<UserAccount> | null = null;
  private studentsCol: Collection<Student> | null = null;
  private teachersCol: Collection<Teacher> | null = null;
  private attendanceCol: Collection<AttendanceRecord> | null = null;
  private feeTransactionsCol: Collection<FeeTransaction> | null = null;
  private noticesCol: Collection<Notice> | null = null;
  private galleryCol: Collection<GalleryItem> | null = null;
  private siteContentCol: Collection<{ _id: string; content: SiteContent }> | null = null;
  private whatsAppLogsCol: Collection<WhatsAppLog> | null = null;
  private settingsCol: Collection<SystemSettingsDoc> | null = null;

  constructor() {
    // Seed initial in-memory fallback defaults
    this.seedInitialData();
    this.ensureAdminAccountInMemory();
  }

  public isMongoConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Connects to MongoDB Atlas using MONGODB_URI.
   * If MONGODB_URI is absent or invalid, falls back to in-memory mode and logs a prominent warning.
   */
  async init(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI?.trim();

    if (!mongoUri) {
      console.warn(
        '\n========================================================================\n' +
          '⚠️  [SAPS ERP WARNING] MONGODB_URI is not set!\n' +
          '    Running in ephemeral IN-MEMORY fallback mode.\n' +
          '    ALL CHANGES (students, teachers, attendance, fees, CMS) WILL BE LOST\n' +
          '    when the server restarts.\n' +
          '    To enable permanent persistent cloud storage, set MONGODB_URI in .env\n' +
          '========================================================================\n'
      );
      this.isConnected = false;
      return;
    }

    try {
      console.log('[MongoDB] Connecting to MongoDB cluster...');

      // First attempt with standard connection options + IPv4 priority
      const clientOptions: any = {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        family: 4, // Prevents OpenSSL IPv6 handshake alert 80
      };

      // Add TLS options if using mongodb+srv or ssl
      if (mongoUri.includes('mongodb+srv://') || mongoUri.includes('ssl=true') || mongoUri.includes('tls=true')) {
        clientOptions.tls = true;
        clientOptions.tlsAllowInvalidCertificates = true;
      }

      this.mongoClient = new MongoClient(mongoUri, clientOptions);

      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db(); // uses database specified in URI or default
      const dbName = this.mongoDb.databaseName || 'saps_erp';

      // Initialize collection handles
      this.usersCol = this.mongoDb.collection<UserAccount>('users');
      this.studentsCol = this.mongoDb.collection<Student>('students');
      this.teachersCol = this.mongoDb.collection<Teacher>('teachers');
      this.attendanceCol = this.mongoDb.collection<AttendanceRecord>('attendance');
      this.feeTransactionsCol = this.mongoDb.collection<FeeTransaction>('fee_transactions');
      this.noticesCol = this.mongoDb.collection<Notice>('notices');
      this.galleryCol = this.mongoDb.collection<GalleryItem>('gallery');
      this.siteContentCol = this.mongoDb.collection<{ _id: string; content: SiteContent }>('site_content');
      this.whatsAppLogsCol = this.mongoDb.collection<WhatsAppLog>('whatsapp_logs');
      this.settingsCol = this.mongoDb.collection<SystemSettingsDoc>('system_settings');

      // Create indexes for optimal production performance
      await Promise.allSettled([
        this.usersCol.createIndex({ username: 1 }, { unique: false }),
        this.usersCol.createIndex({ studentId: 1 }),
        this.usersCol.createIndex({ teacherId: 1 }),
        this.studentsCol.createIndex({ studentId: 1 }, { unique: true }),
        this.studentsCol.createIndex({ class: 1, section: 1 }),
        this.teachersCol.createIndex({ teacherId: 1 }, { unique: true }),
        this.attendanceCol.createIndex({ studentId: 1, date: 1 }),
        this.attendanceCol.createIndex({ class: 1, section: 1, date: 1 }),
        this.feeTransactionsCol.createIndex({ studentId: 1 }),
        this.feeTransactionsCol.createIndex({ receiptNo: 1 }),
        this.noticesCol.createIndex({ date: -1 }),
        this.galleryCol.createIndex({ category: 1 }),
      ]);

      this.isConnected = true;

      // Check if this database has already been seeded
      const usersCount = await this.usersCol.countDocuments();
      if (usersCount === 0) {
        console.log(`[MongoDB] Database "${dbName}" is empty. Seeding initial SAPS ERP data to MongoDB...`);
        await this.seedMongoDatabase();
        console.log(`[MongoDB] ✅ Database "${dbName}" seeded with all default users, teachers, students, historical attendance, notices, and site content.`);
      } else {
        console.log(`[MongoDB] Existing records found in "${dbName}". Loading persistent collections into memory cache...`);
        await this.loadMongoDataIntoMemory();
      }

      // Ensure the Admin user is up-to-date
      await this.ensureAdminAccount();

      console.log(
        `\n========================================================================\n` +
          `✅ [MongoDB] CONNECTED TO MONGODB: "${dbName}"\n` +
          `   Persistent Cloud Database Active:\n` +
          `   - Students: ${this.students.length}\n` +
          `   - Teachers: ${this.teachers.length}\n` +
          `   - Users: ${this.users.length}\n` +
          `   - Attendance Records: ${this.attendance.length}\n` +
          `   - Fee Transactions: ${this.feeTransactions.length}\n` +
          `   - Notices: ${this.notices.length}\n` +
          `   - Gallery Items: ${this.gallery.length}\n` +
          `========================================================================\n`
      );
    } catch (err: any) {
      if (this.mongoClient) {
        try {
          await this.mongoClient.close();
        } catch (_) {}
        this.mongoClient = null;
      }
      this.mongoDb = null;
      this.isConnected = false;

      console.warn(
        '\n========================================================================\n' +
          `⚠️  [MongoDB Connection Warning] Could not connect to MongoDB cluster: ${err.message}\n` +
          '   Note: If using MongoDB Atlas, ensure your Atlas Network Access allows 0.0.0.0/0 (Allow from anywhere).\n' +
          '   The application is running seamlessly using active IN-MEMORY storage.\n' +
          '========================================================================\n'
      );
      this.seedInitialData();
      this.ensureAdminAccountInMemory();
    }
  }

  /**
   * Seeds all initial data into MongoDB collections on first run.
   */
  private async seedMongoDatabase(): Promise<void> {
    if (!this.isConnected) return;

    // 1. Users
    if (this.users.length > 0 && this.usersCol) {
      await this.usersCol.insertMany([...this.users]);
    }
    // 2. Students
    if (this.students.length > 0 && this.studentsCol) {
      await this.studentsCol.insertMany([...this.students]);
    }
    // 3. Teachers
    if (this.teachers.length > 0 && this.teachersCol) {
      await this.teachersCol.insertMany([...this.teachers]);
    }
    // 4. Attendance
    if (this.attendance.length > 0 && this.attendanceCol) {
      await this.attendanceCol.insertMany([...this.attendance]);
    }
    // 5. Fee Transactions
    if (this.feeTransactions.length > 0 && this.feeTransactionsCol) {
      await this.feeTransactionsCol.insertMany([...this.feeTransactions]);
    }
    // 6. Notices
    if (this.notices.length > 0 && this.noticesCol) {
      await this.noticesCol.insertMany([...this.notices]);
    }
    // 7. Gallery
    if (this.gallery.length > 0 && this.galleryCol) {
      await this.galleryCol.insertMany([...this.gallery]);
    }
    // 8. Site Content
    if (this.siteContentCol) {
      await this.siteContentCol.updateOne(
        { _id: 'global_site_content' },
        { $set: { _id: 'global_site_content', content: this.siteContent } },
        { upsert: true }
      );
    }
    // 9. WhatsApp Logs
    if (this.whatsAppLogs.length > 0 && this.whatsAppLogsCol) {
      await this.whatsAppLogsCol.insertMany([...this.whatsAppLogs]);
    }
    // 10. System Settings
    if (this.settingsCol) {
      await this.settingsCol.updateOne(
        { _id: 'admin_settings' },
        {
          $set: {
            _id: 'admin_settings',
            adminSecurityQuestion: this.adminSecurityQuestion,
            adminSecurityAnswer: this.adminSecurityAnswer,
            impersonationLogs: this.impersonationLogs,
          },
        },
        { upsert: true }
      );
    }
  }

  /**
   * Loads persisted data from MongoDB into in-memory arrays.
   */
  private async loadMongoDataIntoMemory(): Promise<void> {
    if (!this.isConnected) return;

    try {
      if (this.usersCol) {
        this.users = (await this.usersCol.find({}, { projection: { _id: 0 } }).toArray()) as UserAccount[];
      }
      if (this.studentsCol) {
        this.students = (await this.studentsCol.find({}, { projection: { _id: 0 } }).toArray()) as Student[];
      }
      if (this.teachersCol) {
        this.teachers = (await this.teachersCol.find({}, { projection: { _id: 0 } }).toArray()) as Teacher[];
      }
      if (this.attendanceCol) {
        this.attendance = (await this.attendanceCol.find({}, { projection: { _id: 0 } }).toArray()) as AttendanceRecord[];
      }
      if (this.feeTransactionsCol) {
        this.feeTransactions = (await this.feeTransactionsCol
          .find({}, { projection: { _id: 0 } })
          .sort({ id: -1 })
          .toArray()) as FeeTransaction[];
      }
      if (this.noticesCol) {
        this.notices = (await this.noticesCol
          .find({}, { projection: { _id: 0 } })
          .sort({ date: -1 })
          .toArray()) as Notice[];
      }
      if (this.galleryCol) {
        this.gallery = (await this.galleryCol.find({}, { projection: { _id: 0 } }).toArray()) as GalleryItem[];
      }
      if (this.whatsAppLogsCol) {
        this.whatsAppLogs = (await this.whatsAppLogsCol
          .find({}, { projection: { _id: 0 } })
          .sort({ timestamp: -1 })
          .toArray()) as WhatsAppLog[];
      }
      if (this.siteContentCol) {
        const doc = await this.siteContentCol.findOne({ _id: 'global_site_content' });
        if (doc && doc.content) {
          this.siteContent = doc.content;
          if (!this.siteContent.school?.email || this.siteContent.school.email === 'contact@sapublicschool.edu.in') {
            this.siteContent.school = {
              ...this.siteContent.school,
              email: 'sapublicschool21@gmail.com',
            };
            await this.siteContentCol.updateOne(
              { _id: 'global_site_content' },
              { $set: { 'content.school.email': 'sapublicschool21@gmail.com' } }
            );
          }
          if (!this.siteContent.school?.logoUrl || this.siteContent.school.logoUrl.includes('postimg.cc/sBLgnd51')) {
            this.siteContent.school = {
              ...this.siteContent.school,
              logoUrl: 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg',
            };
            await this.siteContentCol.updateOne(
              { _id: 'global_site_content' },
              { $set: { 'content.school.logoUrl': 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg' } }
            );
          }
          if (
            !this.siteContent.principal?.name ||
            this.siteContent.principal.name === 'Sri R.K. Sharma' ||
            this.siteContent.principal.photoUrl?.includes('unsplash') ||
            this.siteContent.principal.photoUrl?.includes('postimg.cc/wtNbyDxM')
          ) {
            this.siteContent.principal = {
              ...this.siteContent.principal,
              name: 'Mr. Rajesh Kumar Srivastav',
              designation: 'Director of school',
              qualification: '',
              photoUrl: 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg',
            };
            await this.siteContentCol.updateOne(
              { _id: 'global_site_content' },
              {
                $set: {
                  'content.principal.name': 'Mr. Rajesh Kumar Srivastav',
                  'content.principal.designation': 'Director of school',
                  'content.principal.qualification': '',
                  'content.principal.photoUrl':
                    'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg',
                },
              }
            );
          }
        } else {
          await this.siteContentCol.updateOne(
            { _id: 'global_site_content' },
            { $set: { _id: 'global_site_content', content: this.siteContent } },
            { upsert: true }
          );
        }
      }
      if (this.settingsCol) {
        const settingsDoc = await this.settingsCol.findOne({ _id: 'admin_settings' });
        if (settingsDoc) {
          if (settingsDoc.adminSecurityQuestion) {
            this.adminSecurityQuestion = settingsDoc.adminSecurityQuestion;
          }
          if (settingsDoc.adminSecurityAnswer) {
            this.adminSecurityAnswer = settingsDoc.adminSecurityAnswer;
          }
          if (Array.isArray(settingsDoc.impersonationLogs)) {
            this.impersonationLogs = settingsDoc.impersonationLogs;
          }
        }
      }
    } catch (e: any) {
      console.error('[MongoDB Error] Error loading collections into memory:', e.message);
    }
  }

  // ==========================================
  // PERSISTENCE HELPER METHODS (ASYNC + SYNC)
  // ==========================================

  async ensureAdminAccount(): Promise<void> {
    const { username: adminUsername, password: adminPassword } = getAdminCredentials();
    const adminUser = this.users.find(
      (u) => u.role === 'admin' || u.username.toLowerCase() === adminUsername.toLowerCase()
    );
    const expectedPasswordHash = hashPassword(adminPassword);

    if (!adminUser) {
      const newAdmin: UserAccount = {
        id: 'user_admin_1',
        username: adminUsername,
        passwordHash: expectedPasswordHash,
        name: 'Principal / School Administrator',
        role: 'admin',
        phone: '+91 9415754349',
        securityQuestion: this.adminSecurityQuestion,
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      this.users.unshift(newAdmin);

      if (this.isConnected && this.usersCol) {
        await this.usersCol.updateOne(
          { username: adminUsername },
          { $set: newAdmin },
          { upsert: true }
        );
      }
      console.log(`[SAPS ERP System] Initialized Admin account (username: ${adminUsername}) from secret / env config`);
    } else {
      adminUser.username = adminUsername;
      adminUser.role = 'admin';
      adminUser.phone = '+91 9415754349';
      // If secret ADMIN_PASSWORD is provided or no password set, update hash
      if (process.env.ADMIN_PASSWORD || !adminUser.passwordHash) {
        adminUser.passwordHash = expectedPasswordHash;
      }
      if (!adminUser.securityQuestion) {
        adminUser.securityQuestion = this.adminSecurityQuestion;
      }

      if (this.isConnected && this.usersCol) {
        await this.usersCol.updateOne(
          { id: adminUser.id },
          {
            $set: {
              username: adminUsername,
              ...(process.env.ADMIN_PASSWORD ? { passwordHash: expectedPasswordHash } : {}),
              role: 'admin',
              phone: '+91 9415754349',
              securityQuestion: adminUser.securityQuestion,
            },
          }
        );
      }
    }
  }

  private ensureAdminAccountInMemory() {
    const { username: adminUsername, password: adminPassword } = getAdminCredentials();
    const adminUser = this.users.find(
      (u) => u.role === 'admin' || u.username.toLowerCase() === adminUsername.toLowerCase()
    );
    const expectedPasswordHash = hashPassword(adminPassword);
    if (!adminUser) {
      this.users.unshift({
        id: 'user_admin_1',
        username: adminUsername,
        passwordHash: expectedPasswordHash,
        name: 'Principal / School Administrator',
        role: 'admin',
        phone: '+91 9415754349',
        securityQuestion: this.adminSecurityQuestion,
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
    } else {
      adminUser.username = adminUsername;
      if (process.env.ADMIN_PASSWORD) {
        adminUser.passwordHash = expectedPasswordHash;
      }
      adminUser.role = 'admin';
      adminUser.phone = '+91 9415754349';
    }
  }

  // --- USER PERSISTENCE ---
  async saveUser(user: UserAccount): Promise<void> {
    const idx = this.users.findIndex((u) => u.id === user.id || u.username === user.username);
    if (idx >= 0) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }

    if (this.isConnected && this.usersCol) {
      await this.usersCol.updateOne(
        { id: user.id },
        { $set: user },
        { upsert: true }
      );
    }
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const user = this.users.find((u) => u.id === userId || u.username === userId || u.studentId === userId || u.teacherId === userId);
    if (!user) return false;

    user.passwordHash = newPasswordHash;
    user.mustChangePassword = false;

    if (this.isConnected && this.usersCol) {
      await this.usersCol.updateOne(
        { id: user.id },
        { $set: { passwordHash: newPasswordHash, mustChangePassword: false } }
      );
    }
    return true;
  }

  // --- STUDENT PERSISTENCE ---
  async createStudent(student: Student, userAccount: UserAccount): Promise<void> {
    this.students.push(student);
    this.users.push(userAccount);

    if (this.isConnected) {
      if (this.studentsCol) {
        await this.studentsCol.insertOne(student as any);
      }
      if (this.usersCol) {
        await this.usersCol.insertOne(userAccount as any);
      }
    }
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    const index = this.students.findIndex((s) => s.id === id || s.studentId === id);
    if (index === -1) return null;

    const current = this.students[index];
    const updatedTotal = updates.feesTotal !== undefined ? Number(updates.feesTotal) : current.feesTotal;
    const updatedPaid = updates.feesPaid !== undefined ? Number(updates.feesPaid) : current.feesPaid;
    const updatedDue = Math.max(0, updatedTotal - updatedPaid);

    const updated: Student = {
      ...current,
      ...updates,
      feesTotal: updatedTotal,
      feesPaid: updatedPaid,
      feesDue: updatedDue,
      paymentStatus: updatedDue === 0 ? 'paid' : updatedPaid > 0 ? 'partial' : 'due',
    };

    this.students[index] = updated;

    if (this.isConnected && this.studentsCol) {
      await this.studentsCol.updateOne(
        { $or: [{ id: current.id }, { studentId: current.studentId }] },
        { $set: updated }
      );
    }
    return updated;
  }

  async deleteStudent(id: string): Promise<boolean> {
    const index = this.students.findIndex((s) => s.id === id || s.studentId === id);
    if (index === -1) return false;

    const removed = this.students.splice(index, 1)[0];
    this.users = this.users.filter((u) => u.studentId !== removed.studentId);

    if (this.isConnected) {
      if (this.studentsCol) {
        await this.studentsCol.deleteOne({ $or: [{ id: removed.id }, { studentId: removed.studentId }] });
      }
      if (this.usersCol) {
        await this.usersCol.deleteOne({ studentId: removed.studentId });
      }
    }
    return true;
  }

  async bulkCreateStudents(newStudents: Student[], newUsers: UserAccount[]): Promise<void> {
    this.students.push(...newStudents);
    this.users.push(...newUsers);

    if (this.isConnected) {
      if (this.studentsCol && newStudents.length > 0) {
        await this.studentsCol.insertMany(newStudents as any[]);
      }
      if (this.usersCol && newUsers.length > 0) {
        await this.usersCol.insertMany(newUsers as any[]);
      }
    }
  }

  // --- TEACHER PERSISTENCE ---
  async createTeacher(teacher: Teacher, userAccount: UserAccount): Promise<void> {
    this.teachers.push(teacher);
    this.users.push(userAccount);

    if (this.isConnected) {
      if (this.teachersCol) {
        await this.teachersCol.insertOne(teacher as any);
      }
      if (this.usersCol) {
        await this.usersCol.insertOne(userAccount as any);
      }
    }
  }

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
    const index = this.teachers.findIndex((t) => t.id === id || t.teacherId === id);
    if (index === -1) return null;

    this.teachers[index] = { ...this.teachers[index], ...updates };
    const updated = this.teachers[index];

    // Update user record
    const user = this.users.find((u) => u.teacherId === updated.teacherId);
    if (user) {
      user.name = updated.name;
      user.assignedClass = updated.assignedClass;
      user.assignedSection = updated.assignedSection;
      if (updated.phone) user.phone = updated.phone;

      if (this.isConnected && this.usersCol) {
        await this.usersCol.updateOne(
          { teacherId: updated.teacherId },
          { $set: { name: user.name, assignedClass: user.assignedClass, assignedSection: user.assignedSection, phone: user.phone } }
        );
      }
    }

    if (this.isConnected && this.teachersCol) {
      await this.teachersCol.updateOne(
        { $or: [{ id: updated.id }, { teacherId: updated.teacherId }] },
        { $set: updated }
      );
    }
    return updated;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const index = this.teachers.findIndex((t) => t.id === id || t.teacherId === id);
    if (index === -1) return false;

    const removed = this.teachers.splice(index, 1)[0];
    this.users = this.users.filter((u) => u.teacherId !== removed.teacherId);

    if (this.isConnected) {
      if (this.teachersCol) {
        await this.teachersCol.deleteOne({ $or: [{ id: removed.id }, { teacherId: removed.teacherId }] });
      }
      if (this.usersCol) {
        await this.usersCol.deleteOne({ teacherId: removed.teacherId });
      }
    }
    return true;
  }

  // --- ATTENDANCE PERSISTENCE ---
  async saveAttendance(
    reqClass: string,
    section: string,
    date: string,
    records: AttendanceRecord[]
  ): Promise<void> {
    // Remove existing records for this class, section, and date
    this.attendance = this.attendance.filter(
      (a) => !(a.date === date && a.class === String(reqClass) && a.section.toUpperCase() === String(section).toUpperCase())
    );

    this.attendance.push(...records);

    if (this.isConnected && this.attendanceCol) {
      await this.attendanceCol.deleteMany({
        date,
        class: String(reqClass),
        section: String(section).toUpperCase(),
      });
      if (records.length > 0) {
        await this.attendanceCol.insertMany(records as any[]);
      }
    }
  }

  // --- FEES PERSISTENCE ---
  async collectFee(tx: FeeTransaction, updatedStudent: Student): Promise<void> {
    this.feeTransactions.unshift(tx);

    const sIdx = this.students.findIndex((s) => s.studentId === updatedStudent.studentId || s.id === updatedStudent.id);
    if (sIdx >= 0) {
      this.students[sIdx] = updatedStudent;
    }

    if (this.isConnected) {
      if (this.feeTransactionsCol) {
        await this.feeTransactionsCol.insertOne(tx as any);
      }
      if (this.studentsCol) {
        await this.studentsCol.updateOne(
          { studentId: updatedStudent.studentId },
          { $set: updatedStudent }
        );
      }
    }
  }

  // --- NOTICES PERSISTENCE ---
  async createNotice(notice: Notice): Promise<void> {
    this.notices.unshift(notice);

    if (this.isConnected && this.noticesCol) {
      await this.noticesCol.insertOne(notice as any);
    }
  }

  async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice | null> {
    const idx = this.notices.findIndex((n) => n.id === id);
    if (idx === -1) return null;

    this.notices[idx] = { ...this.notices[idx], ...updates };
    const updated = this.notices[idx];

    if (this.isConnected && this.noticesCol) {
      await this.noticesCol.updateOne({ id }, { $set: updated });
    }
    return updated;
  }

  async deleteNotice(id: string): Promise<boolean> {
    const idx = this.notices.findIndex((n) => n.id === id);
    if (idx === -1) return false;

    this.notices.splice(idx, 1);

    if (this.isConnected && this.noticesCol) {
      await this.noticesCol.deleteOne({ id });
    }
    return true;
  }

  // --- GALLERY PERSISTENCE ---
  async createGalleryItem(item: GalleryItem): Promise<void> {
    this.gallery.unshift(item);

    if (this.isConnected && this.galleryCol) {
      await this.galleryCol.insertOne(item as any);
    }
  }

  async updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
    const idx = this.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return null;

    this.gallery[idx] = { ...this.gallery[idx], ...updates };
    const updated = this.gallery[idx];

    if (this.isConnected && this.galleryCol) {
      await this.galleryCol.updateOne({ id }, { $set: updated });
    }
    return updated;
  }

  async deleteGalleryItem(id: string): Promise<boolean> {
    const idx = this.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return false;

    this.gallery.splice(idx, 1);

    if (this.isConnected && this.galleryCol) {
      await this.galleryCol.deleteOne({ id });
    }
    return true;
  }

  // --- SITE CONTENT CMS PERSISTENCE ---
  async updateSiteContent(updates: Partial<SiteContent>): Promise<SiteContent> {
    if (updates.school) {
      const schoolUpdates = { ...updates.school };
      if (schoolUpdates.logoUrl && schoolUpdates.logoUrl.includes('postimg.cc/sBLgnd51')) {
        schoolUpdates.logoUrl = 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg';
      }
      this.siteContent.school = { ...this.siteContent.school, ...schoolUpdates };
    }
    if (updates.principal) {
      const pUpdates = { ...updates.principal };
      if (pUpdates.photoUrl && pUpdates.photoUrl.includes('postimg.cc/wtNbyDxM')) {
        pUpdates.photoUrl = 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg';
      }
      this.siteContent.principal = { ...this.siteContent.principal, ...pUpdates };
    }
    if (updates.home) {
      this.siteContent.home = { ...this.siteContent.home, ...updates.home };
    }
    if (updates.about) {
      this.siteContent.about = { ...this.siteContent.about, ...updates.about };
    }
    if (updates.facilities && Array.isArray(updates.facilities)) {
      this.siteContent.facilities = updates.facilities;
    }
    if (updates.gallery) {
      this.siteContent.gallery = { ...this.siteContent.gallery, ...updates.gallery };
    }

    if (this.isConnected && this.siteContentCol) {
      await this.siteContentCol.updateOne(
        { _id: 'global_site_content' },
        { $set: { _id: 'global_site_content', content: this.siteContent } },
        { upsert: true }
      );
    }
    return this.siteContent;
  }

  // --- WHATSAPP LOGS PERSISTENCE ---
  async addWhatsAppLog(log: WhatsAppLog): Promise<void> {
    this.whatsAppLogs.unshift(log);

    if (this.isConnected && this.whatsAppLogsCol) {
      await this.whatsAppLogsCol.insertOne(log as any);
    }
  }

  // --- SYSTEM SETTINGS & IMPERSONATION PERSISTENCE ---
  async saveSecurityQuestion(question: string, answer: string): Promise<void> {
    this.adminSecurityQuestion = question;
    this.adminSecurityAnswer = answer;

    const adminUser = this.users.find((u) => u.role === 'admin');
    if (adminUser) {
      adminUser.securityQuestion = question;
      if (this.isConnected && this.usersCol) {
        await this.usersCol.updateOne({ id: adminUser.id }, { $set: { securityQuestion: question } });
      }
    }

    if (this.isConnected && this.settingsCol) {
      await this.settingsCol.updateOne(
        { _id: 'admin_settings' },
        { $set: { adminSecurityQuestion: question, adminSecurityAnswer: answer } },
        { upsert: true }
      );
    }
  }

  async addImpersonationLog(logEntry: any): Promise<void> {
    this.impersonationLogs.unshift(logEntry);

    if (this.isConnected && this.settingsCol) {
      await this.settingsCol.updateOne(
        { _id: 'admin_settings' },
        { $push: { impersonationLogs: { $each: [logEntry], $position: 0, $slice: 100 } } as any },
        { upsert: true }
      );
    }
  }

  // ==========================================
  // INITIAL SEED DATA DEFINITIONS
  // ==========================================
  seedInitialData() {
    const { username: adminUsername, password: adminPassword } = getAdminCredentials();
    // 1. Initial Users (Admin, Teachers, Students)
    this.users = [
      {
        id: 'user_admin_1',
        username: adminUsername,
        passwordHash: hashPassword(adminPassword),
        name: 'Principal / School Administrator',
        role: 'admin',
        phone: '+91 9415754349',
        securityQuestion: this.adminSecurityQuestion,
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'user_teacher_1',
        username: 't_msharma',
        passwordHash: hashPassword('teacher123'),
        name: 'Mrs. Meenakshi Sharma',
        role: 'teacher',
        phone: '+91 98390 11223',
        assignedClass: '10',
        assignedSection: 'A',
        teacherId: 'T-101',
        fatherName: 'Sri Kailash Nath Sharma',
        dob: '1988-06-15',
      },
      {
        id: 'user_teacher_2',
        username: 't_averma',
        passwordHash: hashPassword('teacher123'),
        name: 'Mr. Arvind Verma',
        role: 'teacher',
        phone: '+91 98391 22334',
        assignedClass: '9',
        assignedSection: 'A',
        teacherId: 'T-102',
        fatherName: 'Sri Ram Das Verma',
        dob: '1985-09-20',
      },
      {
        id: 'user_teacher_3',
        username: 't_spandey',
        passwordHash: hashPassword('teacher123'),
        name: 'Mrs. Sunita Pandey',
        role: 'teacher',
        phone: '+91 98392 33445',
        assignedClass: '8',
        assignedSection: 'A',
        teacherId: 'T-103',
        fatherName: 'Sri Hari Shankar Pandey',
        dob: '1990-12-10',
      },
      {
        id: 'user_student_1',
        username: 's_saps1001',
        passwordHash: hashPassword('student123'),
        name: 'Aarav Kumar Mishra',
        role: 'student',
        studentId: 'SAPS-2025-1001',
        assignedClass: '10',
        assignedSection: 'A',
        fatherName: 'Sri Ramesh Mishra',
        dob: '2010-04-15',
      },
      {
        id: 'user_student_2',
        username: 's_saps1002',
        passwordHash: hashPassword('student123'),
        name: 'Ananya Gupta',
        role: 'student',
        studentId: 'SAPS-2025-1002',
        assignedClass: '10',
        assignedSection: 'A',
        fatherName: 'Sri Deepak Gupta',
        dob: '2010-08-22',
      },
      {
        id: 'user_student_3',
        username: 's_saps9001',
        passwordHash: hashPassword('student123'),
        name: 'Rohan Srivastava',
        role: 'student',
        studentId: 'SAPS-2025-9001',
        assignedClass: '9',
        assignedSection: 'A',
        fatherName: 'Sri Manoj Srivastava',
        dob: '2011-01-18',
      },
    ];

    // 2. Initial Teachers
    this.teachers = [
      {
        id: 'teacher_1',
        teacherId: 'T-101',
        name: 'Mrs. Meenakshi Sharma',
        email: 'meenakshi.s@sapublicschool.edu.in',
        phone: '+91 98390 11223',
        qualification: 'M.Sc. (Maths), B.Ed (Gold Medalist)',
        assignedClass: '10',
        assignedSection: 'A',
        subjectSpecialization: 'Mathematics & Science',
        joiningDate: '2019-07-15',
        photoUrl:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        bio: 'Senior Mathematics educator with 12+ years of experience specializing in high-school conceptual math and board examinations.',
      },
      {
        id: 'teacher_2',
        teacherId: 'T-102',
        name: 'Mr. Arvind Verma',
        email: 'arvind.v@sapublicschool.edu.in',
        phone: '+91 98391 22334',
        qualification: 'M.A. (English), B.Ed',
        assignedClass: '9',
        assignedSection: 'A',
        subjectSpecialization: 'English Literature & Grammar',
        joiningDate: '2020-04-10',
        photoUrl:
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
        bio: 'Passionate language instructor focusing on spoken English, phonetic fluency, and creative writing skills.',
      },
      {
        id: 'teacher_3',
        teacherId: 'T-103',
        name: 'Mrs. Sunita Pandey',
        email: 'sunita.p@sapublicschool.edu.in',
        phone: '+91 98392 33445',
        qualification: 'M.A. (Hindi & Sanskrit), B.Ed',
        assignedClass: '8',
        assignedSection: 'A',
        subjectSpecialization: 'Hindi Literature & Sanskrit',
        joiningDate: '2018-08-01',
        photoUrl:
          'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
        bio: 'Dedicated scholar of traditional Hindi literature, Vedic Sanskrit shlokas, and cultural character building.',
      },
      {
        id: 'teacher_4',
        teacherId: 'T-104',
        name: 'Mr. Rajeshwar Tiwari',
        email: 'rajeshwar.t@sapublicschool.edu.in',
        phone: '+91 98393 44556',
        qualification: 'M.Sc. (Physics), B.Ed',
        assignedClass: '11',
        assignedSection: 'A',
        subjectSpecialization: 'Physics & General Science',
        joiningDate: '2021-06-20',
        photoUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        bio: 'Physics enthusiast leading experimental laboratory sessions and conceptual foundation building for science streams.',
      },
      {
        id: 'teacher_5',
        teacherId: 'T-105',
        name: 'Dr. Vivek Kumar Singh',
        email: 'vivek.s@sapublicschool.edu.in',
        phone: '+91 98394 55667',
        qualification: 'Ph.D., M.Sc. (Chemistry), B.Ed',
        assignedClass: '12',
        assignedSection: 'A',
        subjectSpecialization: 'Chemistry & Environmental Studies',
        joiningDate: '2022-03-15',
        photoUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        bio: 'Expert science mentor fostering experimental curiosity, chemical lab safety, and environmental awareness.',
      },
      {
        id: 'teacher_6',
        teacherId: 'T-106',
        name: 'Ms. Priyanka Mishra',
        email: 'priyanka.m@sapublicschool.edu.in',
        phone: '+91 98395 66778',
        qualification: 'MCA, B.Ed',
        assignedClass: '7',
        assignedSection: 'A',
        subjectSpecialization: 'Computer Applications & IT',
        joiningDate: '2023-07-01',
        photoUrl:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        bio: 'IT specialist training young minds in fundamental programming, digital literacy, and educational software tools.',
      },
    ];

    // 3. Initial Students (~20 students covering Class 10-A, 9-A, 8-A)
    this.students = [
      // Class 10-A
      {
        id: 'std_1001',
        studentId: 'SAPS-2025-1001',
        name: 'Aarav Kumar Mishra',
        rollNo: '01',
        class: '10',
        section: 'A',
        fatherName: 'Sri Rajesh Mishra',
        motherName: 'Smt. Geeta Mishra',
        parentWhatsApp: '+91 98380 91234',
        address: 'House 42, Civil Lines, Near Mandir, Varanasi',
        dob: '2009-04-12',
        feesTotal: 18000,
        feesPaid: 18000,
        feesDue: 0,
        lastPaymentDate: '2025-08-10',
        paymentStatus: 'paid',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_1002',
        studentId: 'SAPS-2025-1002',
        name: 'Ananya Gupta',
        rollNo: '02',
        class: '10',
        section: 'A',
        fatherName: 'Sri Mahesh Gupta',
        motherName: 'Smt. Seema Gupta',
        parentWhatsApp: '+91 98380 92345',
        address: 'Flat 12B, Ashoka Heights, Varanasi',
        dob: '2009-07-25',
        feesTotal: 18000,
        feesPaid: 12000,
        feesDue: 6000,
        lastPaymentDate: '2025-07-15',
        paymentStatus: 'partial',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_1003',
        studentId: 'SAPS-2025-1003',
        name: 'Divyansh Singh',
        rollNo: '03',
        class: '10',
        section: 'A',
        fatherName: 'Sri Surendra Singh',
        motherName: 'Smt. Kamlesh Singh',
        parentWhatsApp: '+91 98380 93456',
        address: 'Village Shivpur, Post Phulpur',
        dob: '2009-02-18',
        feesTotal: 18000,
        feesPaid: 18000,
        feesDue: 0,
        lastPaymentDate: '2025-08-05',
        paymentStatus: 'paid',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_1004',
        studentId: 'SAPS-2025-1004',
        name: 'Pooja Yadav',
        rollNo: '04',
        class: '10',
        section: 'A',
        fatherName: 'Sri Ram Milan Yadav',
        motherName: 'Smt. Urmila Yadav',
        parentWhatsApp: '+91 98380 94567',
        address: 'B-14, Pandeypur Colony',
        dob: '2009-11-04',
        feesTotal: 18000,
        feesPaid: 9000,
        feesDue: 9000,
        lastPaymentDate: '2025-05-20',
        paymentStatus: 'partial',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_1005',
        studentId: 'SAPS-2025-1005',
        name: 'Prateek Tripathi',
        rollNo: '05',
        class: '10',
        section: 'A',
        fatherName: 'Sri Anand Tripathi',
        motherName: 'Smt. Shanti Tripathi',
        parentWhatsApp: '+91 98380 95678',
        address: 'G-2, Mahmoorganj',
        dob: '2009-08-19',
        feesTotal: 18000,
        feesPaid: 18000,
        feesDue: 0,
        lastPaymentDate: '2025-08-12',
        paymentStatus: 'paid',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_1006',
        studentId: 'SAPS-2025-1006',
        name: 'Sneha Pandey',
        rollNo: '06',
        class: '10',
        section: 'A',
        fatherName: 'Sri Bipin Pandey',
        motherName: 'Smt. Anita Pandey',
        parentWhatsApp: '+91 98380 96789',
        address: 'Plot 88, Cantt Road',
        dob: '2009-01-30',
        feesTotal: 18000,
        feesPaid: 6000,
        feesDue: 12000,
        lastPaymentDate: '2025-04-10',
        paymentStatus: 'partial',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_1007',
        studentId: 'SAPS-2025-1007',
        name: 'Vikas Kumar Chaurasia',
        rollNo: '07',
        class: '10',
        section: 'A',
        fatherName: 'Sri Harishankar Chaurasia',
        motherName: 'Smt. Manju Devi',
        parentWhatsApp: '+91 98380 97890',
        address: 'Near Railway Crossing, Manduadih',
        dob: '2009-09-14',
        feesTotal: 18000,
        feesPaid: 18000,
        feesDue: 0,
        lastPaymentDate: '2025-08-01',
        paymentStatus: 'paid',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_1008',
        studentId: 'SAPS-2025-1008',
        name: 'Riya Jaiswal',
        rollNo: '08',
        class: '10',
        section: 'A',
        fatherName: 'Sri Santosh Jaiswal',
        motherName: 'Smt. Kavita Jaiswal',
        parentWhatsApp: '+91 98380 98901',
        address: 'Bhelupur Bazar',
        dob: '2009-05-09',
        feesTotal: 18000,
        feesPaid: 0,
        feesDue: 18000,
        lastPaymentDate: undefined,
        paymentStatus: 'due',
        createdAt: '2025-04-01',
      },

      // Class 9-A
      {
        id: 'std_9001',
        studentId: 'SAPS-2025-9001',
        name: 'Rohan Srivastava',
        rollNo: '01',
        class: '9',
        section: 'A',
        fatherName: 'Sri Ashok Srivastava',
        motherName: 'Smt. Poonam Srivastava',
        parentWhatsApp: '+91 98380 81122',
        address: 'Sector 4, Awas Vikas Colony',
        dob: '2010-06-15',
        feesTotal: 16000,
        feesPaid: 16000,
        feesDue: 0,
        lastPaymentDate: '2025-08-05',
        paymentStatus: 'paid',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_9002',
        studentId: 'SAPS-2025-9002',
        name: 'Kavya Singh',
        rollNo: '02',
        class: '9',
        section: 'A',
        fatherName: 'Sri Dharmendra Singh',
        motherName: 'Smt. Rekha Singh',
        parentWhatsApp: '+91 98380 82233',
        address: 'Lanka Crossing, Varanasi',
        dob: '2010-03-21',
        feesTotal: 16000,
        feesPaid: 10000,
        feesDue: 6000,
        lastPaymentDate: '2025-07-20',
        paymentStatus: 'partial',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_9003',
        studentId: 'SAPS-2025-9003',
        name: 'Aditya Raj Pandey',
        rollNo: '03',
        class: '9',
        section: 'A',
        fatherName: 'Sri Ved Prakash Pandey',
        motherName: 'Smt. Saraswati Pandey',
        parentWhatsApp: '+91 98380 83344',
        address: 'Kabir Chaura',
        dob: '2010-10-11',
        feesTotal: 16000,
        feesPaid: 16000,
        feesDue: 0,
        lastPaymentDate: '2025-08-11',
        paymentStatus: 'paid',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_9004',
        studentId: 'SAPS-2025-9004',
        name: 'Shreya Maurya',
        rollNo: '04',
        class: '9',
        section: 'A',
        fatherName: 'Sri Lallan Maurya',
        motherName: 'Smt. Bindu Maurya',
        parentWhatsApp: '+91 98380 84455',
        address: 'Chitaipur Road',
        dob: '2010-12-05',
        feesTotal: 16000,
        feesPaid: 8000,
        feesDue: 8000,
        lastPaymentDate: '2025-06-15',
        paymentStatus: 'partial',
        createdAt: '2025-04-01',
      },

      // Class 8-A
      {
        id: 'std_8001',
        studentId: 'SAPS-2025-8001',
        name: 'Ayush Patel',
        rollNo: '01',
        class: '8',
        section: 'A',
        fatherName: 'Sri Ramu Patel',
        motherName: 'Smt. Sunita Patel',
        parentWhatsApp: '+91 98380 71100',
        address: 'Rathyatra, Varanasi',
        dob: '2011-04-04',
        feesTotal: 14000,
        feesPaid: 14000,
        feesDue: 0,
        lastPaymentDate: '2025-08-01',
        paymentStatus: 'paid',
        createdAt: '2025-04-01',
      },
      {
        id: 'std_8002',
        studentId: 'SAPS-2025-8002',
        name: 'Megha Dubey',
        rollNo: '02',
        class: '8',
        section: 'A',
        fatherName: 'Sri Radheshyam Dubey',
        motherName: 'Smt. Malti Dubey',
        parentWhatsApp: '+91 98380 72200',
        address: 'Sigra Road',
        dob: '2011-09-18',
        feesTotal: 14000,
        feesPaid: 7000,
        feesDue: 7000,
        lastPaymentDate: '2025-06-01',
        paymentStatus: 'partial',
        createdAt: '2025-04-01',
      },
    ];

    // 4. Create user accounts for each student automatically
    this.students.forEach((s) => {
      const username = `s_${s.studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      if (!this.users.some((u) => u.username === username)) {
        this.users.push({
          id: `user_${s.id}`,
          username,
          passwordHash: hashPassword('student123'),
          name: s.name,
          role: 'student',
          studentId: s.studentId,
          assignedClass: s.class,
          assignedSection: s.section,
          fatherName: s.fatherName,
          dob: s.dob || '2010-01-01',
        });
      }
    });

    // 5. Seed Attendance Records
    this.generateHistoricalAttendance();

    // 6. Seed Fee Transactions
    this.feeTransactions = [
      {
        id: 'fee_tx_101',
        receiptNo: 'REC-2025-08-019',
        studentId: 'SAPS-2025-1001',
        studentName: 'Aarav Kumar Mishra',
        class: '10',
        section: 'A',
        rollNo: '01',
        amount: 6000,
        paymentDate: '2025-08-10',
        paymentMode: 'UPI',
        paidBy: 'Sri Rajesh Mishra (Father)',
        receivedBy: 'Accounts Office (Admin)',
        remarks: 'Term 2 Tuition + Transport Fee',
      },
      {
        id: 'fee_tx_102',
        receiptNo: 'REC-2025-07-044',
        studentId: 'SAPS-2025-1002',
        studentName: 'Ananya Gupta',
        class: '10',
        section: 'A',
        rollNo: '02',
        amount: 6000,
        paymentDate: '2025-07-15',
        paymentMode: 'Cash',
        paidBy: 'Sri Mahesh Gupta',
        receivedBy: 'Accounts Office (Admin)',
        remarks: 'Term 1 Balance Clearance',
      },
      {
        id: 'fee_tx_103',
        receiptNo: 'REC-2025-08-011',
        studentId: 'SAPS-2025-9001',
        studentName: 'Rohan Srivastava',
        class: '9',
        section: 'A',
        rollNo: '01',
        amount: 8000,
        paymentDate: '2025-08-05',
        paymentMode: 'Bank Transfer',
        paidBy: 'Sri Ashok Srivastava',
        receivedBy: 'Accounts Office (Admin)',
        remarks: 'Mid-term fee installment',
      },
    ];

    // 7. Seed Public Notices & Latest News
    this.notices = [
      {
        id: 'not_1',
        title: 'UP Board Class 10 & 12 Pre-Board Examination Schedule 2025-26',
        content:
          'All students of Class 10 and 12 are hereby notified that the UP Board format Pre-Board examinations will commence from 15th September. Detailed subject-wise datesheet has been pinned in class noticeboards and downloadable below.',
        date: '2025-08-18',
        category: 'Exam',
        targetRole: 'all',
        isPinned: true,
        author: 'Exam Cell / Principal',
      },
      {
        id: 'not_2',
        title: 'Independence Day & Annual Cultural Function Felicitation',
        content:
          'Hearty congratulations to all students and class teachers who participated in the 79th Independence Day patriotic presentations. Merit certificates will be distributed during Saturday morning assembly.',
        date: '2025-08-16',
        category: 'Academic',
        targetRole: 'all',
        isPinned: true,
        author: 'Cultural Committee',
      },
      {
        id: 'not_3',
        title: 'School Van & Transport Route Optimization Update',
        content:
          'To ensure child safety and timely arrival, school van routes 3, 5, and 7 have been updated with new pickup timings starting from Monday. Parents are requested to coordinate with designated van drivers.',
        date: '2025-08-12',
        category: 'General',
        targetRole: 'all',
        author: 'Transport In-charge',
      },
      {
        id: 'not_4',
        title: 'Term 2 Fee Submission Deadline & Counter Timings',
        content:
          'Parents are gently reminded that the last date for Term 2 fee payment without late fine is 31st August 2025. Fee counter operates Monday to Saturday, 8:00 AM to 2:00 PM. Online UPI & Net Banking also accepted.',
        date: '2025-08-05',
        category: 'Academic',
        targetRole: 'all',
        author: 'Accounts Office',
      },
      {
        id: 'not_5',
        title: 'Raksha Bandhan & Janmashtami Holiday Notice',
        content:
          'The school will remain closed on the auspicious occasions of Raksha Bandhan and Shri Krishna Janmashtami. Regular academic classes will resume promptly on the subsequent working day.',
        date: '2025-08-02',
        category: 'Holiday',
        targetRole: 'all',
        author: 'Administration',
      },
    ];

    // 8. Seed Photo Gallery
    this.gallery = [
      {
        id: 'gal_1',
        title: 'Main Academic Campus & Morning Assembly',
        category: 'Campus',
        imageUrl:
          'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
        date: 'August 2025',
        description: 'Disciplined morning assembly fostering values of Swami Adgadanand Ji Maharaj.',
      },
      {
        id: 'gal_2',
        title: 'Smart Classrooms with Qualified Faculty',
        category: 'Classrooms',
        imageUrl:
          'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
        date: 'July 2025',
        description: 'Interactive concept learning with experienced class teachers.',
      },
      {
        id: 'gal_3',
        title: 'Safe GPS-Enabled School Transport Van Fleet',
        category: 'Transport',
        imageUrl:
          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
        date: 'August 2025',
        description: 'Reliable school van transportation facility covering city and suburban routes.',
      },
      {
        id: 'gal_4',
        title: 'Science & Computer Technology Laboratory',
        category: 'Campus',
        imageUrl:
          'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
        date: 'June 2025',
        description: 'Hands-on practical experiments for UP Board science curriculum.',
      },
      {
        id: 'gal_5',
        title: 'Annual Sports Meet & Yoga Training',
        category: 'Sports',
        imageUrl:
          'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
        date: 'January 2025',
        description: 'Physical fitness, track events, and holistic personality development.',
      },
      {
        id: 'gal_6',
        title: 'Independence Day Cultural Celebrations',
        category: 'Events',
        imageUrl:
          'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80',
        date: 'August 2025',
        description: 'Patriotic drama, dance, and speech presentations by students.',
      },
    ];

    // 9. Initial WhatsApp Logs
    this.whatsAppLogs = [
      {
        id: 'WA-LOG-101',
        timestamp: '2025-08-20T09:15:22.000Z',
        studentName: 'Sneha Pandey',
        parentPhone: '+91 98380 96789',
        classInfo: '10-A',
        date: '2025-08-20',
        message:
          'Dear Parent, your child Sneha Pandey of Class 10-A was marked ABSENT on 2025-08-20. - S.A. Public School',
        status: 'simulated',
        metaMessageId: 'sim_wamid_00192',
      },
      {
        id: 'WA-LOG-102',
        timestamp: '2025-08-19T09:12:05.000Z',
        studentName: 'Pooja Yadav',
        parentPhone: '+91 98380 94567',
        classInfo: '10-A',
        date: '2025-08-19',
        message:
          'Dear Parent, your child Pooja Yadav of Class 10-A was marked ABSENT on 2025-08-19. - S.A. Public School',
        status: 'simulated',
        metaMessageId: 'sim_wamid_00191',
      },
    ];
  }

  // Helper to generate rich realistic attendance for multiple months
  generateHistoricalAttendance() {
    const dates: string[] = [];

    // Helper: generate dates for a given year & month (excluding Sundays)
    const addMonthDates = (year: number, month: number, daysCount: number) => {
      for (let d = 1; d <= daysCount; d++) {
        const dateObj = new Date(year, month - 1, d);
        if (dateObj.getDay() !== 0) {
          // 0 is Sunday
          const mm = String(month).padStart(2, '0');
          const dd = String(d).padStart(2, '0');
          dates.push(`${year}-${mm}-${dd}`);
        }
      }
    };

    // April 2025 (24 working days)
    addMonthDates(2025, 4, 30);
    // May 2025 (15 working days before summer break)
    addMonthDates(2025, 5, 20);
    // July 2025 (26 working days)
    addMonthDates(2025, 7, 31);
    // August 2025 (up to 21st)
    addMonthDates(2025, 8, 21);

    const class10Students = this.students.filter((s) => s.class === '10');
    const class9Students = this.students.filter((s) => s.class === '9');

    dates.forEach((d) => {
      // Class 10 Attendance
      class10Students.forEach((student, idx) => {
        const dayNum = parseInt(d.split('-')[2], 10);
        let status: 'present' | 'absent' | 'late' = 'present';

        if (
          (idx === 3 && dayNum % 5 === 0) ||
          (idx === 5 && dayNum % 4 === 0) ||
          (idx === 7 && dayNum % 3 === 0)
        ) {
          status = 'absent';
        } else if (idx === 1 && dayNum === 14) {
          status = 'absent';
        } else if (dayNum === 18 && (idx === 0 || idx === 2)) {
          status = 'present';
        }

        this.attendance.push({
          id: `att_${d}_${student.id}`,
          date: d,
          studentId: student.studentId,
          studentName: student.name,
          class: student.class,
          section: student.section,
          rollNo: student.rollNo,
          status,
          markedBy: 'Mrs. Meenakshi Sharma',
          whatsappAlertSent: status === 'absent',
          timestamp: `${d}T09:10:00.000Z`,
        });
      });

      // Class 9 Attendance
      class9Students.forEach((student, idx) => {
        const dayNum = parseInt(d.split('-')[2], 10);
        let status: 'present' | 'absent' = 'present';
        if (idx === 3 && dayNum % 6 === 0) {
          status = 'absent';
        }

        this.attendance.push({
          id: `att_${d}_${student.id}`,
          date: d,
          studentId: student.studentId,
          studentName: student.name,
          class: student.class,
          section: student.section,
          rollNo: student.rollNo,
          status,
          markedBy: 'Mr. Arvind Verma',
          whatsappAlertSent: status === 'absent',
          timestamp: `${d}T09:12:00.000Z`,
        });
      });
    });
  }
}

export const db = new DataStore();

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatar?: string;
  assignedClass?: string;
  assignedSection?: string;
  studentId?: string;
  teacherId?: string;
  mustChangePassword?: boolean;
  securityQuestion?: string;
  fatherName?: string;
  dob?: string;
}

export interface ImpersonationLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  targetRole: UserRole;
}

export interface LoginSlip {
  id: string;
  role: UserRole;
  name: string;
  class?: string;
  section?: string;
  rollNo?: string;
  studentId?: string;
  teacherId?: string;
  username: string;
  defaultPassword: string;
  fatherName?: string;
  dob?: string;
  parentWhatsApp?: string;
  phone?: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. "SAPS-2025-101"
  name: string;
  rollNo: string;
  class: string; // e.g. "10", "9", "8"
  section: string; // e.g. "A", "B"
  fatherName: string;
  motherName?: string;
  parentWhatsApp: string; // e.g. "+919876543210"
  address?: string;
  dob?: string;
  feesTotal: number;
  feesPaid: number;
  feesDue: number;
  lastPaymentDate?: string;
  paymentStatus: 'paid' | 'partial' | 'due';
  photoUrl?: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  assignedClass: string;
  assignedSection: string;
  subjectSpecialization: string; // e.g., "Mathematics & Science", "English Literature"
  joiningDate: string;
  photoUrl?: string;
  bio?: string;
}

export interface PrincipalInfo {
  name: string;
  designation: string;
  qualification: string;
  photoUrl: string;
  welcomeHeadline: string;
  welcomeMessage: string;
  deskMessageP1: string;
  deskMessageP2: string;
}

export interface SchoolIdentity {
  name: string;
  shortName: string;
  tagline: string;
  motto: string;
  mottoTranslation: string;
  logoUrl?: string; // Optional custom uploaded logo; if empty, renders custom SVG SchoolLogo
  phone: string;
  supportPhone: string;
  email: string;
  address: string;
  helpSpanText: string; // e.g. "24hr"
  academicLevels: string; // e.g. "Classes 1st to 12th"
  mapEmbedUrl: string;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  statStudents: string;
  statPassRate: string;
  statTeachers: string;
  statVans: string;
  admissionBannerTitle: string;
  admissionBannerSubtitle: string;
}

export interface AboutContent {
  pageTitle: string;
  pageSubtitle: string;
  legacyTitle: string;
  legacyP1: string;
  legacyP2: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionText: string;
}

export interface FacilityItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  points: string[];
  iconType?: string; // 'teacher' | 'van' | 'lab' | 'library' | 'sports' | 'general'
}

export interface GalleryContent {
  moreMediaUrl?: string; // URL to WhatsApp Channel, Telegram Channel, etc.
  bannerTitle?: string;
  bannerSubtitle?: string;
  buttonText?: string;
}

export interface SiteContent {
  school: SchoolIdentity;
  principal: PrincipalInfo;
  home: HomeContent;
  about: AboutContent;
  facilities: FacilityItem[];
  gallery?: GalleryContent;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'leave';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  rollNo: string;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
  whatsappAlertSent: boolean;
  whatsappAlertTime?: string;
  timestamp: string;
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  rollNo: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  paidBy: string;
  receivedBy: string;
  remarks?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Academic' | 'Holiday' | 'Exam' | 'General' | 'Admission';
  targetRole: 'all' | 'students' | 'teachers';
  isPinned?: boolean;
  author: string;
}

export interface WhatsAppLog {
  id: string;
  timestamp: string;
  studentName: string;
  parentPhone: string;
  classInfo: string;
  date: string;
  message: string;
  status: 'sent' | 'simulated' | 'failed';
  metaMessageId?: string;
  error?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Campus' | 'Events' | 'Classrooms' | 'Sports' | 'Transport';
  imageUrl: string;
  date: string;
  description: string;
}

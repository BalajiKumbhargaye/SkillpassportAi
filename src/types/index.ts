export type UserRole = 'student' | 'recruiter' | 'training_institute' | 'placement_cell';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface StudentSkill {
  name: string;
  level: SkillLevel;
  verified?: boolean;
}

export interface StudentProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface StudentCertification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface ResumeEvidenceSummary {
  lastUpdatedAt: string;
  evidenceScore: number;
  verifiedClaims: string[];
  missingClaims: string[];
  evidenceSources: string[];
  notes: string[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  collegeName: string;
  department: string;
  rollNumber: string;
  graduationYear: number;
  cgpa: number;
  skills: StudentSkill[];
  projects: StudentProject[];
  certifications: StudentCertification[];
  careerInterests: string[];
  resumeUrl?: string;
  resumeEvidence?: ResumeEvidenceSummary;
  bio?: string;
}

export interface JobOpening {
  id: string;
  recruiterId: string;
  recruiterName: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  departmentAllowed: string[]; // e.g. ['Computer Science', 'Information Technology', 'All']
  location: string;
  type: 'Full-time' | 'Internship' | 'Part-time';
  workplaceType: 'On-site' | 'Remote' | 'Hybrid';
  salaryPackage: string; // e.g. "12 - 16 LPA" or "₹40,000 / month"
  minCgpa: number;
  requiredSkills: string[];
  preferredSkills?: string[];
  description: string;
  responsibilities: string[];
  qualifications: string[];
  deadline: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'offered'
  | 'rejected';

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  studentCgpa: number;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  readinessScore: number;
  appliedAt: string;
  interviewDate?: string;
  feedbackNotes?: string;
}

export interface Course {
  id: string;
  instituteId: string;
  providerName: string;
  title: string;
  description: string;
  skillsCovered: string[];
  targetJobRoles: string[];
  durationWeeks: number;
  durationHours: number;
  fee: number; // 0 for free
  isCertified: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  enrollUrl: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface SkillGapAnalysis {
  jobId: string;
  jobTitle: string;
  companyName: string;
  overallScore: number; // 0 - 100
  matchedSkills: { name: string; studentLevel: SkillLevel }[];
  partialSkills: { name: string; studentLevel: SkillLevel; requiredLevel?: string; reason: string }[];
  missingSkills: string[];
  academicEligibility: {
    cgpaMet: boolean;
    studentCgpa: number;
    requiredCgpa: number;
    departmentMet: boolean;
    studentDepartment: string;
    allowedDepartments: string[];
  };
  scoreBreakdown: {
    skillsMatchPercentage: number;
    academicEligibilityScore: number;
    projectBonusScore: number;
  };
  recommendedCourses: Course[];
  keyStrengths: string[];
  growthAdvice: string[];
  isPrivate: boolean; // default true for student privacy
}

export interface PlacementAnalytics {
  totalStudents: number;
  placedStudents: number;
  placementRate: number;
  averagePackageLpa: number;
  highestPackageLpa: number;
  totalJobOpenings: number;
  totalApplications: number;
  topDemandedSkills: { skill: string; demandCount: number }[];
  commonSkillGaps: { skill: string; gapCount: number; percentage: number }[];
  departmentStats: {
    department: string;
    total: number;
    placed: number;
    avgCgpa: number;
    avgReadiness: number;
  }[];
  applicationFunnel: {
    stage: string;
    count: number;
  }[];
}

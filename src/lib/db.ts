'use client';

import {
  User,
  StudentProfile,
  JobOpening,
  Course,
  JobApplication,
  PlacementAnalytics,
  SkillGapAnalysis,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_JOBS,
  INITIAL_COURSES,
  INITIAL_APPLICATIONS,
} from './mock-data';

const STORAGE_KEYS = {
  USERS: 'skillpassport_users',
  STUDENTS: 'skillpassport_students',
  JOBS: 'skillpassport_jobs',
  COURSES: 'skillpassport_courses',
  APPLICATIONS: 'skillpassport_applications',
  REPORTS: 'skillpassport_reports',
};

// Safe localStorage helper
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch storage event for reactive tabs
    window.dispatchEvent(new Event('skillpassport_data_updated'));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Data Store APIs
export const db = {
  // Reset all data to defaults
  resetToDefaults: () => {
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setStored(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    setStored(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    setStored(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    setStored(STORAGE_KEYS.REPORTS, []);
    return true;
  },

  // USERS
  getUsers: (): User[] => getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  getUserById: (id: string): User | undefined => {
    const users = db.getUsers();
    return users.find((u) => u.id === id);
  },
  getUserByEmail: (email: string): User | undefined => {
    const users = db.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  saveUser: (user: User): User => {
    const users = db.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setStored(STORAGE_KEYS.USERS, users);
    return user;
  },

  // STUDENTS
  getStudents: (): StudentProfile[] => getStored<StudentProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  getStudentByUserId: (userId: string): StudentProfile | undefined => {
    const students = db.getStudents();
    return students.find((s) => s.userId === userId);
  },
  saveStudentProfile: (profile: StudentProfile): StudentProfile => {
    const students = db.getStudents();
    const index = students.findIndex((s) => s.id === profile.id || s.userId === profile.userId);
    if (index >= 0) {
      students[index] = profile;
    } else {
      students.push(profile);
    }
    setStored(STORAGE_KEYS.STUDENTS, students);
    return profile;
  },

  // JOBS
  getJobs: (): JobOpening[] => getStored<JobOpening[]>(STORAGE_KEYS.JOBS, INITIAL_JOBS),
  getJobById: (id: string): JobOpening | undefined => {
    const jobs = db.getJobs();
    return jobs.find((j) => j.id === id);
  },
  getJobsByRecruiter: (recruiterId: string): JobOpening[] => {
    const jobs = db.getJobs();
    return jobs.filter((j) => j.recruiterId === recruiterId);
  },
  saveJob: (job: JobOpening): JobOpening => {
    const jobs = db.getJobs();
    const index = jobs.findIndex((j) => j.id === job.id);
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.unshift(job);
    }
    setStored(STORAGE_KEYS.JOBS, jobs);
    return job;
  },
  deleteJob: (id: string): boolean => {
    const jobs = db.getJobs().filter((j) => j.id !== id);
    setStored(STORAGE_KEYS.JOBS, jobs);
    return true;
  },

  // APPLICATIONS
  getApplications: (): JobApplication[] =>
    getStored<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS),
  getApplicationsByStudent: (studentId: string): JobApplication[] => {
    return db.getApplications().filter((a) => a.studentId === studentId);
  },
  getApplicationsByJob: (jobId: string): JobApplication[] => {
    return db.getApplications().filter((a) => a.jobId === jobId);
  },
  hasStudentApplied: (studentId: string, jobId: string): boolean => {
    return db.getApplications().some((a) => a.studentId === studentId && a.jobId === jobId);
  },
  createApplication: (app: JobApplication): JobApplication => {
    const apps = db.getApplications();
    const exists = apps.some((a) => a.studentId === app.studentId && a.jobId === app.jobId);
    if (exists) {
      throw new Error('You have already applied for this opening.');
    }
    apps.unshift(app);
    setStored(STORAGE_KEYS.APPLICATIONS, apps);
    return app;
  },
  updateApplicationStatus: (
    appId: string,
    status: JobApplication['status'],
    notes?: string,
    interviewDate?: string
  ): JobApplication | null => {
    const apps = db.getApplications();
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) return null;

    apps[index] = {
      ...apps[index],
      status,
      feedbackNotes: notes ?? apps[index].feedbackNotes,
      interviewDate: interviewDate ?? apps[index].interviewDate,
    };
    setStored(STORAGE_KEYS.APPLICATIONS, apps);
    return apps[index];
  },

  // COURSES
  getCourses: (): Course[] => getStored<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES),
  getCourseById: (id: string): Course | undefined => {
    return db.getCourses().find((c) => c.id === id);
  },
  getCoursesByInstitute: (instituteId: string): Course[] => {
    return db.getCourses().filter((c) => c.instituteId === instituteId);
  },
  saveCourse: (course: Course): Course => {
    const courses = db.getCourses();
    const index = courses.findIndex((c) => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.unshift(course);
    }
    setStored(STORAGE_KEYS.COURSES, courses);
    return course;
  },
  deleteCourse: (id: string): boolean => {
    const courses = db.getCourses().filter((c) => c.id !== id);
    setStored(STORAGE_KEYS.COURSES, courses);
    return true;
  },

  // SKILL GAP REPORTS (Private to student)
  saveReport: (report: SkillGapAnalysis & { studentId: string; timestamp: string }): void => {
    const reports = getStored<(SkillGapAnalysis & { studentId: string; timestamp: string })[]>(
      STORAGE_KEYS.REPORTS,
      []
    );
    const existingIndex = reports.findIndex(
      (r) => r.studentId === report.studentId && r.jobId === report.jobId
    );
    if (existingIndex >= 0) {
      reports[existingIndex] = report;
    } else {
      reports.unshift(report);
    }
    setStored(STORAGE_KEYS.REPORTS, reports);
  },
  getStudentReport: (
    studentId: string,
    jobId: string
  ): (SkillGapAnalysis & { studentId: string; timestamp: string }) | undefined => {
    const reports = getStored<(SkillGapAnalysis & { studentId: string; timestamp: string })[]>(
      STORAGE_KEYS.REPORTS,
      []
    );
    // Student can only access their own report
    return reports.find((r) => r.studentId === studentId && r.jobId === jobId);
  },

  // PLACEMENT ANALYTICS (Real-time aggregated metrics)
  getPlacementAnalytics: (): PlacementAnalytics => {
    const students = db.getStudents();
    const jobs = db.getJobs();
    const applications = db.getApplications();

    const placedStudentsSet = new Set(
      applications.filter((a) => a.status === 'offered').map((a) => a.studentId)
    );
    const placedStudents = placedStudentsSet.size;
    const totalStudents = Math.max(students.length, 1);
    const placementRate = Math.round((placedStudents / totalStudents) * 100);

    // Skills demanded by recruiters
    const skillCounts: Record<string, number> = {};
    jobs.forEach((j) => {
      j.requiredSkills.forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const topDemandedSkills = Object.entries(skillCounts)
      .map(([skill, demandCount]) => ({ skill, demandCount }))
      .sort((a, b) => b.demandCount - a.demandCount)
      .slice(0, 7);

    // Common skill gaps across all students
    const studentKnownSkills = new Set(
      students.flatMap((s) => s.skills.map((sk) => sk.name.toLowerCase()))
    );
    const gapMap: Record<string, number> = {};
    jobs.forEach((j) => {
      j.requiredSkills.forEach((req) => {
        const lowerReq = req.toLowerCase();
        // How many students lack this skill?
        let lackingCount = 0;
        students.forEach((s) => {
          const hasSkill = s.skills.some((sk) => sk.name.toLowerCase() === lowerReq);
          if (!hasSkill) lackingCount++;
        });
        gapMap[req] = (gapMap[req] || 0) + lackingCount;
      });
    });

    const commonSkillGaps = Object.entries(gapMap)
      .map(([skill, gapCount]) => ({
        skill,
        gapCount,
        percentage: Math.round((gapCount / (totalStudents * Math.max(jobs.length, 1))) * 100),
      }))
      .sort((a, b) => b.gapCount - a.gapCount)
      .slice(0, 6);

    // Department Stats
    const deptMap: Record<string, { total: number; placed: number; cgpas: number[]; readinessList: number[] }> =
      {};
    students.forEach((s) => {
      if (!deptMap[s.department]) {
        deptMap[s.department] = { total: 0, placed: 0, cgpas: [], readinessList: [] };
      }
      deptMap[s.department].total += 1;
      deptMap[s.department].cgpas.push(s.cgpa);

      if (placedStudentsSet.has(s.userId)) {
        deptMap[s.department].placed += 1;
      }
    });

    // Populate average readiness from applications
    applications.forEach((a) => {
      if (deptMap[a.studentDepartment]) {
        deptMap[a.studentDepartment].readinessList.push(a.readinessScore);
      }
    });

    const departmentStats = Object.entries(deptMap).map(([department, data]) => ({
      department,
      total: data.total,
      placed: data.placed,
      avgCgpa:
        data.cgpas.length > 0
          ? Number((data.cgpas.reduce((a, b) => a + b, 0) / data.cgpas.length).toFixed(2))
          : 0,
      avgReadiness:
        data.readinessList.length > 0
          ? Math.round(data.readinessList.reduce((a, b) => a + b, 0) / data.readinessList.length)
          : 78,
    }));

    // Funnel stats
    const funnelStages = [
      { stage: 'Applied', count: applications.length },
      {
        stage: 'Under Review',
        count: applications.filter((a) => a.status === 'under_review').length,
      },
      {
        stage: 'Shortlisted',
        count: applications.filter((a) => a.status === 'shortlisted').length,
      },
      {
        stage: 'Interviews',
        count: applications.filter((a) => a.status === 'interview_scheduled').length,
      },
      { stage: 'Job Offers', count: applications.filter((a) => a.status === 'offered').length },
    ];

    return {
      totalStudents: students.length,
      placedStudents,
      placementRate,
      averagePackageLpa: 14.2,
      highestPackageLpa: 22.0,
      totalJobOpenings: jobs.length,
      totalApplications: applications.length,
      topDemandedSkills,
      commonSkillGaps,
      departmentStats,
      applicationFunnel: funnelStages,
    };
  },
};

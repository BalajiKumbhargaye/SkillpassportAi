'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { JobOpening, JobApplication, Course } from '@/types';
import { JobCard } from '@/components/JobCard';
import { CourseCard } from '@/components/CourseCard';
import { StudentProfileModal } from '@/components/StudentProfileModal';
import {
  GraduationCap,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  Edit3,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  FolderGit2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const { user, studentProfile, refreshUserData } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const loadData = () => {
    setJobs(db.getJobs());
    if (user) {
      setApplications(db.getApplicationsByStudent(user.id));
    }
    setCourses(db.getCourses());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('skillpassport_data_updated', loadData);
    return () => window.removeEventListener('skillpassport_data_updated', loadData);
  }, [user]);

  if (!studentProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto">
          <GraduationCap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">Student Passport Not Loaded</h3>
          <p className="text-xs text-slate-400 mt-2">
            Switch your role to Student using the top bar or sign in as a student to explore your personalized dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const activeApplications = applications.filter((a) => a.status !== 'rejected');
  const interviews = applications.filter((a) => a.status === 'interview_scheduled');
  const offers = applications.filter((a) => a.status === 'offered');
  const avgReadiness =
    applications.length > 0
      ? Math.round(applications.reduce((acc, a) => acc + a.readinessScore, 0) / applications.length)
      : 84;

  const statusColors: Record<JobApplication['status'], string> = {
    applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    shortlisted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    interview_scheduled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    offered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Student Passport Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Student Avatar */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xl shrink-0">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={studentProfile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-8 h-8 text-blue-400" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-white">{studentProfile.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Skill Passport Active
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{studentProfile.department}</span>
                <span>•</span>
                <span>{studentProfile.collegeName}</span>
                <span>•</span>
                <span>Roll No: {studentProfile.rollNumber}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">CGPA {studentProfile.cgpa.toFixed(2)}</span>
                <span>•</span>
                <span>Batch of {studentProfile.graduationYear}</span>
              </p>

              {/* Bio */}
              {studentProfile.bio && (
                <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
                  {studentProfile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Quick Edit Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Skill Passport</span>
            </button>
          </div>
        </div>

        {/* Verified Skills Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Verified Skills ({studentProfile.skills.length}):
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {studentProfile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-1.5"
              >
                <span>{skill.name}</span>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                  {skill.level}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Skills Registered
            </span>
            <p className="text-2xl font-bold text-white mt-1">{studentProfile.skills.length}</p>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">
              {studentProfile.skills.filter((s) => s.verified).length} verified
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Active Applications
            </span>
            <p className="text-2xl font-bold text-white mt-1">{activeApplications.length}</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              {applications.length} submitted in total
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Interviews & Offers
            </span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {interviews.length + offers.length}
            </p>
            <span className="text-[11px] text-emerald-400/80 mt-1 inline-block">
              {offers.length > 0 ? `${offers.length} Offer Letter Received!` : 'Active in selection rounds'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Avg Readiness Match
            </span>
            <p className="text-2xl font-bold text-blue-400 mt-1">{avgReadiness}%</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Across target campus openings
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tracked Applications Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Application Tracker ({applications.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status monitoring of your campus job applications.
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Explore More Openings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Role & Company</th>
                  <th className="py-3 px-4 font-semibold">Readiness Score</th>
                  <th className="py-3 px-4 font-semibold">Application Status</th>
                  <th className="py-3 px-4 font-semibold">Applied On</th>
                  <th className="py-3 px-4 font-semibold">Notes / Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{app.jobTitle}</p>
                      <p className="text-[11px] text-slate-400">{app.companyName}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        {app.readinessScore}% Match
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${
                          statusColors[app.status]
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {app.interviewDate ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Interview: {new Date(app.interviewDate).toLocaleString()}
                        </span>
                      ) : app.feedbackNotes ? (
                        <span className="text-slate-300 italic">{app.feedbackNotes}</span>
                      ) : (
                        <span className="text-slate-500">Under review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800">
            <p className="text-xs text-slate-400">
              You haven&apos;t applied to any job openings yet. Run a skill-gap analysis and apply below!
            </p>
          </div>
        )}
      </div>

      {/* Recommended Jobs & Skill-Gap Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recommended Campus Openings with Live Skill Matching
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click &quot;Skill-Gap Analysis&quot; on any role to see private matched, missing, and partial skill breakdowns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.slice(0, 6).map((job) => (
            <JobCard key={job.id} job={job} onRefresh={loadData} />
          ))}
        </div>
      </div>

      {/* Upskilling Recommendations Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Upskilling Courses Tailored to In-Demand Campus Skills
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Accredited courses published by training institutes to eliminate your skill gaps.
            </p>
          </div>
          <Link
            href="/courses"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}

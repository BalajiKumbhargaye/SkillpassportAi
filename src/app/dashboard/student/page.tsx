'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { extractResumeText, buildResumePassport } from '@/lib/resume-parser';
import { JobCard } from '@/components/JobCard';
import { CourseCard } from '@/components/CourseCard';
import { StudentProfileModal } from '@/components/StudentProfileModal';
import { JobApplication } from '@/types';
import {
  Briefcase,
  TrendingUp,
  Clock,
  Sparkles,
  GraduationCap,
  Edit3,
  Calendar,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const { user, studentProfile, updateStudentProfile, quickDemoLogin } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeStatus, setResumeStatus] = useState('');
  const [, setRefreshTick] = useState(0);

  const jobs = db.getJobs();
  const applications = user ? db.getApplicationsByStudent(user.id) : [];
  const courses = db.getCourses();
  const handleRefresh = () => setRefreshTick((tick) => tick + 1);

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const jobText = [
      job.title,
      job.companyName,
      job.description,
      job.location,
      job.requiredSkills.join(' '),
      job.preferredSkills?.join(' ') ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return jobText.includes(term);
  });

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !studentProfile) return;

    try {
      setIsParsingResume(true);
      setResumeStatus('Analyzing resume and validating claims against evidence...');

      const resumeText = await extractResumeText(file);
      const passport = buildResumePassport(resumeText, studentProfile);

      updateStudentProfile({
        ...studentProfile,
        skills: passport.skills,
        projects: passport.projects,
        certifications: passport.certifications,
        careerInterests: passport.careerInterests,
        bio: passport.bio,
        resumeUrl: file.name,
        resumeEvidence: passport.resumeEvidence,
      });

      setResumeStatus(
        `Resume processed successfully. ${passport.resumeEvidence.verifiedClaims.length} skills verified with ${passport.resumeEvidence.evidenceScore}% evidence confidence.`
      );
      handleRefresh();
    } catch (error) {
      console.error('Resume upload failed:', error);
      setResumeStatus('Unable to parse that resume. Please upload a PDF, DOCX, or text resume.');
    } finally {
      setIsParsingResume(false);
      event.target.value = '';
    }
  };

  useEffect(() => {
    const handleDataUpdated = () => {
      setRefreshTick((tick) => tick + 1);
    };

    window.addEventListener('skillpassport_data_updated', handleDataUpdated);
    return () => window.removeEventListener('skillpassport_data_updated', handleDataUpdated);
  }, []);

  if (!studentProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 max-w-md mx-auto space-y-4 shadow-sm">
          <GraduationCap className="w-12 h-12 text-[#6366F1] mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-[#312E81]">Student Passport View</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              You are currently logged in with a {user?.role ? user.role.replace('_', ' ') : 'non-student'} account. Switch to the Student persona to view verified skill records, match against campus drives, and generate your passport.
            </p>
          </div>
          <button
            onClick={() => quickDemoLogin('student')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>Switch to Student Persona</span>
          </button>
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
    applied: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    shortlisted: 'bg-violet-50 text-violet-700 border-violet-200',
    interview_scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
    offered: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Student Passport Card */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Student Avatar */}
            <div className="relative w-20 h-20 rounded-2xl bg-[#312E81] p-0.5 shadow-sm shrink-0">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={studentProfile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-8 h-8 text-[#6366F1]" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-[#312E81]">{studentProfile.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-[#8B5CF6] border border-violet-200 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Skill Passport Active
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{studentProfile.department}</span>
                <span>•</span>
                <span>{studentProfile.collegeName}</span>
                <span>•</span>
                <span>Roll No: {studentProfile.rollNumber}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">CGPA {studentProfile.cgpa.toFixed(2)}</span>
                <span>•</span>
                <span>Batch of {studentProfile.graduationYear}</span>
              </p>

              {/* Bio */}
              {studentProfile.bio && (
                <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {studentProfile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Quick Edit & Share Action */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={`/passport/${studentProfile.userId}`}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4 text-[#6366F1]" />
              <span>Public Passport</span>
            </Link>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Skill Passport</span>
            </button>
          </div>
        </div>

        {/* Verified Skills Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6366F1]" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Verified Skills ({studentProfile.skills.length}):
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {studentProfile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-1.5"
              >
                <span>{skill.name}</span>
                <span className="text-[10px] text-[#6366F1] bg-indigo-50 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">
                  {skill.level}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Skills Registered
            </span>
            <p className="text-2xl font-bold text-[#312E81] mt-1">{studentProfile.skills.length}</p>
            <span className="text-[11px] text-emerald-700 mt-1 inline-block font-medium">
              {studentProfile.skills.filter((s) => s.verified).length} verified
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Active Applications
            </span>
            <p className="text-2xl font-bold text-[#312E81] mt-1">{activeApplications.length}</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              {applications.length} submitted in total
            </span>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 text-[#8B5CF6] border border-violet-100">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Interviews & Offers
            </span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {interviews.length + offers.length}
            </p>
            <span className="text-[11px] text-emerald-700 mt-1 inline-block font-medium">
              {offers.length > 0 ? `${offers.length} Offer Letter Received!` : 'Active in selection rounds'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Avg Readiness Match
            </span>
            <p className="text-2xl font-bold text-[#6366F1] mt-1">{avgReadiness}%</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Across target campus openings
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Resume Upload & Evidence Validation */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8B5CF6]" />
              Resume-to-SkillPassport AI Generator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a resume to auto-generate your skill passport by validating claims against projects, links, and certificates.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-[#8B5CF6] hover:bg-violet-100 transition-colors shadow-xs">
            <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleResumeUpload} />
            {isParsingResume ? 'Analyzing...' : 'Upload Resume'}
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Evidence Confidence</p>
            <p className="mt-2 text-3xl font-black text-[#312E81]">
              {studentProfile.resumeEvidence?.evidenceScore ?? 82}
              <span className="text-lg text-slate-400">%</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Verified Claims</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {studentProfile.resumeEvidence?.verifiedClaims.length ?? studentProfile.skills.filter((s) => s.verified).length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Needs Evidence</p>
            <p className="mt-2 text-3xl font-black text-amber-600">
              {studentProfile.resumeEvidence?.missingClaims.length ?? 0}
            </p>
          </div>
        </div>

        {resumeStatus ? (
          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            {resumeStatus.includes('successfully') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span>{resumeStatus}</span>
          </div>
        ) : null}
      </div>

      {/* Tracked Applications Section */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6366F1]" />
              Application Tracker ({applications.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status monitoring of your campus job applications.
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1"
          >
            <span>Explore More Openings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Readiness Score</th>
                  <th className="py-3 px-4">Application Status</th>
                  <th className="py-3 px-4">Applied On</th>
                  <th className="py-3 px-4">Notes / Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{app.jobTitle}</p>
                      <p className="text-[11px] text-slate-500">{app.companyName}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-200 font-bold">
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
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {app.interviewDate ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Interview: {new Date(app.interviewDate).toLocaleString()}
                        </span>
                      ) : app.feedbackNotes ? (
                        <span className="text-slate-600 italic">{app.feedbackNotes}</span>
                      ) : (
                        <span className="text-slate-400">Under review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">
              You haven&apos;t applied to any job openings yet. Run a skill-gap analysis and apply below!
            </p>
          </div>
        )}
      </div>

      {/* Recommended Jobs & Skill-Gap Analysis */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              Recommended Campus Openings with Live Skill Matching
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Search roles like &quot;Java Developer&quot; or &quot;Data Engineer&quot; to compare them against your current SkillPassport.
            </p>
          </div>

          <label className="relative block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search jobs by role, skill, or company"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none shadow-xs"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.length > 0 ? (
            filteredJobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} onRefresh={handleRefresh} />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No jobs match your search. Try a broader role like &quot;Java&quot;, &quot;Data&quot;, or &quot;Frontend&quot;.
            </div>
          )}
        </div>
      </div>

      {/* Upskilling Recommendations Section */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#8B5CF6]" />
              Upskilling Courses Tailored to In-Demand Campus Skills
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accredited courses published by training institutes to eliminate your skill gaps.
            </p>
          </div>
          <Link
            href="/courses"
            className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1"
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
        onSaved={handleRefresh}
      />
    </div>
  );
}

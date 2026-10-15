'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { JobOpening } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { analyzeSkillGap } from '@/lib/skill-matcher';
import { db } from '@/lib/db';
import { SkillGapModal } from './SkillGapModal';
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Users,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobCardProps {
  job: JobOpening;
  onRefresh?: () => void;
}

const createApplicationId = () =>
  `app-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

export const JobCard: React.FC<JobCardProps> = ({ job, onRefresh }) => {
  const { user, studentProfile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [applying, setApplying] = useState(false);

  const isStudent = user?.role === 'student' && studentProfile;
  const hasApplied = isStudent ? db.hasStudentApplied(studentProfile.userId, job.id) : false;
  const jobApplications = db.getApplicationsByJob(job.id);

  // Calculate quick readiness preview if user is student
  let readinessPreview = null;
  if (isStudent && studentProfile) {
    const analysis = analyzeSkillGap(studentProfile, job, []);
    readinessPreview = analysis.overallScore;
  }

  const handleQuickApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isStudent || !studentProfile) return;
    setApplying(true);
    try {
      db.createApplication({
        id: createApplicationId(),
        jobId: job.id,
        studentId: studentProfile.userId,
        studentName: studentProfile.fullName,
        studentEmail: studentProfile.email,
        studentDepartment: studentProfile.department,
        studentCgpa: studentProfile.cgpa,
        jobTitle: job.title,
        companyName: job.companyName,
        status: 'applied',
        readinessScore: readinessPreview || 75,
        appliedAt: new Date().toISOString(),
      });
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error applying';
      alert(message);
    } finally {
      setApplying(false);
    }
  };

  const canApply = readinessPreview === null ? true : readinessPreview >= 70;

  const getReadinessBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-indigo-50 text-[#6366F1] border-indigo-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <>
      <div className="group rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {job.companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-base text-[#312E81] group-hover:text-[#6366F1] transition-colors line-clamp-1">
                  {job.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{job.companyName}</p>
              </div>
            </div>

            {/* Dynamic Readiness Score Badge for Student */}
            {readinessPreview !== null && (
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getReadinessBadge(
                  readinessPreview
                )}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>{readinessPreview}% Match</span>
              </div>
            )}
          </div>

          {/* Metadata Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <Briefcase className="w-3.5 h-3.5 text-violet-500" />
              {job.type} ({job.workplaceType})
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <IndianRupee className="w-3.5 h-3.5" />
              {job.salaryPackage}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              Min CGPA {job.minCgpa}
            </span>
          </div>

          {/* Description preview */}
          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">{job.description}</p>

          {/* Required Skills Chips */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills.slice(0, 5).map((skill, idx) => {
                const hasSkill =
                  isStudent &&
                  studentProfile?.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase());
                return (
                  <span
                    key={idx}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                      hasSkill
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {skill} {hasSkill && '✓'}
                  </span>
                );
              })}
              {job.requiredSkills.length > 5 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                  +{job.requiredSkills.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Expanded Details Section */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs animate-fade-in">
              <div>
                <p className="font-bold text-slate-700">Allowed Disciplines:</p>
                <p className="text-slate-500 mt-0.5">{job.departmentAllowed.join(', ')}</p>
              </div>

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <p className="font-bold text-slate-700">Responsibilities:</p>
                  <ul className="mt-1 list-disc list-inside text-slate-500 space-y-0.5">
                    {job.responsibilities.slice(0, 3).map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.qualifications && job.qualifications.length > 0 && (
                <div>
                  <p className="font-bold text-slate-700">Qualifications:</p>
                  <ul className="mt-1 list-disc list-inside text-slate-500 space-y-0.5">
                    {job.qualifications.slice(0, 2).map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2">
            {/* Toggle Details Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1 transition-colors border border-slate-200"
            >
              <span>{showDetails ? 'Hide' : 'Details'}</span>
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Student Actions */}
            {isStudent && (
              <>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#8B5CF6] border border-violet-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Skill-Gap</span>
                </button>

                {hasApplied ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Applied
                  </span>
                ) : canApply ? (
                  <button
                    onClick={handleQuickApply}
                    disabled={applying}
                    className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{applying ? 'Applying...' : 'Apply'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upskill</span>
                  </button>
                )}
              </>
            )}

            {/* Recruiter Action */}
            {user?.role === 'recruiter' && (
              <Link
                href="/dashboard/recruiter"
                className="px-3 py-1.5 rounded-xl bg-[#312E81] hover:bg-indigo-950 text-white text-xs font-bold shadow-xs shadow-indigo-950/20 transition-all flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{jobApplications.length} Applicants</span>
              </Link>
            )}

            {/* Placement Cell Action */}
            {user?.role === 'placement_cell' && (
              <Link
                href="/dashboard/placement"
                className="px-3 py-1.5 rounded-xl bg-[#312E81] hover:bg-indigo-950 text-white text-xs font-bold shadow-xs shadow-indigo-950/20 transition-all flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{jobApplications.length} Applied</span>
              </Link>
            )}

            {/* Training Institute Action */}
            {user?.role === 'training_institute' && (
              <Link
                href="/dashboard/training"
                className="px-3 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Map Course</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis Modal */}
      {isStudent && studentProfile && (
        <SkillGapModal
          job={job}
          student={studentProfile}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onApplied={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
};

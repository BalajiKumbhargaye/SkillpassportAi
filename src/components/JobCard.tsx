'use client';

import React, { useState } from 'react';
import { JobOpening, StudentProfile } from '@/types';
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
  ArrowUpRight,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobCardProps {
  job: JobOpening;
  onRefresh?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onRefresh }) => {
  const { user, studentProfile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  const isStudent = user?.role === 'student' && studentProfile;
  const hasApplied = isStudent ? db.hasStudentApplied(studentProfile.userId, job.id) : false;

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
        id: `app-${Date.now()}`,
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
    } catch (err: any) {
      alert(err.message || 'Error applying');
    } finally {
      setApplying(false);
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  return (
    <>
      <div className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 hover:shadow-xl hover:shadow-blue-950/20 transition-all p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0">
                {job.companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-base text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {job.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium">{job.companyName}</p>
              </div>
            </div>

            {/* Dynamic Readiness Score Badge for Student */}
            {readinessPreview !== null && (
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getReadinessColor(
                  readinessPreview
                )}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{readinessPreview}% Match</span>
              </div>
            )}
          </div>

          {/* Metadata Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              {job.type} ({job.workplaceType})
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              <IndianRupee className="w-3.5 h-3.5" />
              {job.salaryPackage}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              Min CGPA {job.minCgpa}
            </span>
          </div>

          {/* Description preview */}
          <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>

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
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
                    }`}
                  >
                    {skill} {hasSkill && '✓'}
                  </span>
                );
              })}
              {job.requiredSkills.length > 5 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  +{job.requiredSkills.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2">
            {isStudent && (
              <button
                onClick={() => setModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Skill-Gap Analysis</span>
              </button>
            )}

            {isStudent && (
              hasApplied ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Applied
                </span>
              ) : (
                <button
                  onClick={handleQuickApply}
                  disabled={applying}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{applying ? 'Applying...' : 'Quick Apply'}</span>
                </button>
              )
            )}

            {!isStudent && (
              <button
                onClick={() => setModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
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

'use client';

import React, { useState } from 'react';
import { JobOpening, StudentProfile, SkillGapAnalysis } from '@/types';
import { analyzeSkillGap } from '@/lib/skill-matcher';
import { db } from '@/lib/db';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Send,
  Building2,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SkillGapModalProps {
  job: JobOpening;
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export const SkillGapModal: React.FC<SkillGapModalProps> = ({
  job,
  student,
  isOpen,
  onClose,
  onApplied,
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'courses' | 'breakdown'>('skills');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(() => db.hasStudentApplied(student.userId, job.id));

  if (!isOpen) return null;

  const courses = db.getCourses();
  const analysis: SkillGapAnalysis = analyzeSkillGap(student, job, courses);

  const handleApply = () => {
    setApplying(true);
    try {
      db.createApplication({
        id: `app-${Date.now()}`,
        jobId: job.id,
        studentId: student.userId,
        studentName: student.fullName,
        studentEmail: student.email,
        studentDepartment: student.department,
        studentCgpa: student.cgpa,
        jobTitle: job.title,
        companyName: job.companyName,
        status: 'applied',
        readinessScore: analysis.overallScore,
        appliedAt: new Date().toISOString(),
      });

      // Save private report for student record
      db.saveReport({
        ...analysis,
        studentId: student.userId,
        timestamp: new Date().toISOString(),
      });

      setHasApplied(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (onApplied) onApplied();
    } catch (err: any) {
      alert(err.message || 'Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  const scoreColor =
    analysis.overallScore >= 80
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : analysis.overallScore >= 60
      ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
      : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

  const scoreBadge =
    analysis.overallScore >= 80
      ? { label: 'Strong Fit', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
      : analysis.overallScore >= 60
      ? { label: 'Good Potential', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
      : { label: 'Upskilling Recommended', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{job.title}</h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${scoreBadge.color}`}>
                  {scoreBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{job.companyName}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.salaryPackage}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Callout Banner */}
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 px-6 py-2.5 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Private Skill-Gap Analysis:</strong> This comprehensive diagnosis is strictly private to your student
              passport. Recruiters cannot see your missing skill logs.
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Score & Eligibility Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Readiness Gauge */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Explainable Readiness Score
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{analysis.overallScore}</span>
                  <span className="text-lg text-slate-500 font-semibold">/ 100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      analysis.overallScore >= 80
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : analysis.overallScore >= 60
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-400'
                        : 'bg-gradient-to-r from-amber-500 to-orange-400'
                    }`}
                    style={{ width: `${analysis.overallScore}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                  <span>Skills: {analysis.scoreBreakdown.skillsMatchPercentage}%</span>
                  <span>Acad: +{analysis.scoreBreakdown.academicEligibilityScore}</span>
                  <span>Projects: +{analysis.scoreBreakdown.projectBonusScore}</span>
                </div>
              </div>
            </div>

            {/* Academic Eligibility */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                Academic Eligibility
              </span>
              <div className="mt-2.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CGPA Requirement:</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      analysis.academicEligibility.cgpaMet ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {analysis.academicEligibility.cgpaMet ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {student.cgpa} / {job.minCgpa} Min
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Eligible Branch:</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      analysis.academicEligibility.departmentMet ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {analysis.academicEligibility.departmentMet ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {student.department}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Graduation Year:</span>
                  <span className="text-slate-200 font-semibold">{student.graduationYear} (Eligible)</span>
                </div>
              </div>
            </div>

            {/* Skills Status Counts */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Skill Stack Overview
              </span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-lg font-bold text-emerald-400">{analysis.matchedSkills.length}</p>
                  <p className="text-[10px] text-emerald-300/80">Matched</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-lg font-bold text-amber-400">{analysis.partialSkills.length}</p>
                  <p className="text-[10px] text-amber-300/80">Partial</p>
                </div>
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                  <p className="text-lg font-bold text-rose-400">{analysis.missingSkills.length}</p>
                  <p className="text-[10px] text-rose-300/80">Missing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 space-x-4">
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'skills'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Detailed Skill Comparison ({job.requiredSkills.length} Required)
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Targeted Courses to Bridge Gap ({analysis.recommendedCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'breakdown'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Score Formula & Strategic Advice
            </button>
          </div>

          {/* TAB 1: Skill Comparison */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {/* Matched Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Direct Matches ({analysis.matchedSkills.length})
                </h4>
                {analysis.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchedSkills.map((s, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2"
                      >
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-200">
                          {s.studentLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No direct skill matches detected.</p>
                )}
              </div>

              {/* Partial Skills */}
              {analysis.partialSkills.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
                    <AlertTriangle className="w-4 h-4" />
                    Partially Demonstrated ({analysis.partialSkills.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.partialSkills.map((ps, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-amber-300">{ps.name}</span>
                          <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">
                            Current: {ps.studentLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-300/80">{ps.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2.5">
                  <XCircle className="w-4 h-4" />
                  Missing Skills to Acquire ({analysis.missingSkills.length})
                </h4>
                {analysis.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2"
                      >
                        <span className="font-semibold">{skill}</span>
                        <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-200">
                          Gap
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-medium">
                    Awesome! You already cover 100% of the core required skills.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Recommended Courses */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                These courses from certified training institutes teach the exact skills you are missing for this
                role:
              </p>

              {analysis.recommendedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.recommendedCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>{c.providerName}</span>
                          <span className="text-emerald-400 font-semibold">
                            {c.fee === 0 ? 'Free' : `₹${c.fee}`}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white leading-snug">{c.title}</h5>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {c.skillsCovered.map((s, idx) => {
                            const isMissing = analysis.missingSkills.includes(s);
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  isMissing
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {s} {isMissing && '★ Gap solved'}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{c.durationWeeks} weeks ({c.durationHours} hrs)</span>
                        <a
                          href={c.enrollUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <span>Enroll Now</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800">
                  <p className="text-sm text-slate-400">
                    No urgent courses needed for this role. Your skills already match the primary requirements!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Formula & Advice */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  Transparent Job-Readiness Scoring Engine
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Our matching algorithm is explainable and multi-dimensional. Scores are never a black box:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-blue-400">Core Skill Match (60%)</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Direct matches receive 100% weight, while beginner proficiency on advanced requirements receives 50% partial credit.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-emerald-400">Academic Criteria (20%)</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Meets minimum CGPA cutoff ({job.minCgpa}) and college branch alignment ({student.department}).
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-purple-400">Portfolio & Projects (20%)</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hands-on verified technical projects utilizing the required technologies provide bonus readiness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths & Growth Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                  <h5 className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Strengths Highlighted
                  </h5>
                  <ul className="space-y-1.5 text-slate-300">
                    {analysis.keyStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs">
                  <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Strategic Growth Recommendations
                  </h5>
                  <ul className="space-y-1.5 text-slate-300">
                    {analysis.growthAdvice.map((a, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close Analysis
          </button>

          <div className="flex items-center gap-3">
            {hasApplied ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Application Submitted
              </span>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{applying ? 'Submitting...' : 'Apply for Opening'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

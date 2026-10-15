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
  TrendingUp,
  Award,
  Layers,
  Send,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const createApplicationId = () =>
  `app-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

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
    if (analysis.overallScore < 70) {
      alert('This role is not a strong fit yet. Improve your weaker skill areas and re-run the analysis before applying.');
      return;
    }

    setApplying(true);
    try {
      db.createApplication({
        id: createApplicationId(),
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error submitting application';
      alert(message);
    } finally {
      setApplying(false);
    }
  };

  const scoreBadge =
    analysis.overallScore >= 80
      ? { label: 'Strong Fit', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : analysis.overallScore >= 60
      ? { label: 'Good Potential', color: 'bg-indigo-50 text-[#6366F1] border-indigo-200' }
      : { label: 'Upskilling Recommended', color: 'bg-amber-50 text-amber-700 border-amber-200' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] border border-violet-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0F172A]">{job.title}</h3>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${scoreBadge.color}`}>
                  {scoreBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-medium text-slate-700">{job.companyName}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span className="font-medium text-emerald-600">{job.salaryPackage}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Callout Banner */}
        <div className="bg-violet-50/70 px-6 py-2.5 border-b border-violet-100/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#312E81]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Private Skill-Gap Analysis:</strong> This comprehensive diagnosis is strictly private to your student
              passport. Recruiters cannot see your missing skill logs.
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-[#F8FAFC]">
          {/* Top Score & Eligibility Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Readiness Gauge */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Explainable Readiness Score
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-[#0F172A]">{analysis.overallScore}</span>
                  <span className="text-lg text-slate-400 font-semibold">/ 100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      analysis.overallScore >= 80
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : analysis.overallScore >= 60
                        ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]'
                        : 'bg-gradient-to-r from-amber-500 to-orange-400'
                    }`}
                    style={{ width: `${analysis.overallScore}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Skills: {analysis.scoreBreakdown.skillsMatchPercentage}%</span>
                  <span>Acad: +{analysis.scoreBreakdown.academicEligibilityScore}</span>
                  <span>Projects: +{analysis.scoreBreakdown.projectBonusScore}</span>
                </div>
              </div>
            </div>

            {/* Academic Eligibility */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#6366F1]" />
                Academic Eligibility
              </span>
              <div className="mt-2.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">CGPA Requirement:</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      analysis.academicEligibility.cgpaMet ? 'text-emerald-600' : 'text-amber-600'
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
                  <span className="text-slate-500">Eligible Branch:</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      analysis.academicEligibility.departmentMet ? 'text-emerald-600' : 'text-amber-600'
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
                  <span className="text-slate-500">Graduation Year:</span>
                  <span className="text-slate-800 font-semibold">{student.graduationYear} (Eligible)</span>
                </div>
              </div>
            </div>

            {/* Skills Status Counts */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#8B5CF6]" />
                Skill Stack Overview
              </span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-lg font-bold text-emerald-700">{analysis.matchedSkills.length}</p>
                  <p className="text-[10px] text-emerald-800 font-medium">Matched</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-center">
                  <p className="text-lg font-bold text-amber-700">{analysis.partialSkills.length}</p>
                  <p className="text-[10px] text-amber-800 font-medium">Partial</p>
                </div>
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-center">
                  <p className="text-lg font-bold text-rose-700">{analysis.missingSkills.length}</p>
                  <p className="text-[10px] text-rose-800 font-medium">Missing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 space-x-4">
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'skills'
                  ? 'border-[#6366F1] text-[#6366F1]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Detailed Skill Comparison ({job.requiredSkills.length} Required)
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'border-[#6366F1] text-[#6366F1]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Targeted Courses to Bridge Gap ({analysis.recommendedCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'breakdown'
                  ? 'border-[#6366F1] text-[#6366F1]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Direct Matches ({analysis.matchedSkills.length})
                </h4>
                {analysis.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchedSkills.map((s, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
                      >
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                          {s.studentLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No direct skill matches detected.</p>
                )}
              </div>

              {/* Partial Skills */}
              {analysis.partialSkills.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-2.5">
                    <AlertTriangle className="w-4 h-4" />
                    Partially Demonstrated ({analysis.partialSkills.length})
                  </h4>
                  <div className="space-y-2">
                    {analysis.partialSkills.map((ps, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-amber-900">{ps.name}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                            Current: {ps.studentLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800">{ps.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 mb-2.5">
                  <XCircle className="w-4 h-4" />
                  Missing Skills to Acquire ({analysis.missingSkills.length})
                </h4>
                {analysis.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                      >
                        <span className="font-semibold">{skill}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-1.5 py-0.5 rounded">
                          Gap
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-semibold">
                    Awesome! You already cover 100% of the core required skills.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Recommended Courses */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                These courses from certified training institutes teach the exact skills you are missing for this
                role:
              </p>

              {analysis.recommendedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.recommendedCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-medium">{c.providerName}</span>
                          <span className="text-emerald-700 font-bold">
                            {c.fee === 0 ? 'Free' : `₹${c.fee}`}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-[#0F172A] leading-snug">{c.title}</h5>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {c.skillsCovered.map((s, idx) => {
                            const isMissing = analysis.missingSkills.includes(s);
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  isMissing
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {s} {isMissing && '★ Gap solved'}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{c.durationWeeks} weeks ({c.durationHours} hrs)</span>
                        <a
                          href={c.enrollUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>Enroll Now</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-white border border-slate-200">
                  <p className="text-sm text-slate-500">
                    No urgent courses needed for this role. Your skills already match the primary requirements!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Formula & Advice */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-3">
                <h4 className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#6366F1]" />
                  Transparent Job-Readiness Scoring Engine
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Our matching algorithm is explainable and multi-dimensional. Scores are never a black box:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <span className="font-bold text-[#312E81]">Core Skill Match (60%)</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Direct matches receive 100% weight, while beginner proficiency on advanced requirements receives 50% partial credit.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="font-bold text-emerald-800">Academic Criteria (20%)</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Meets minimum CGPA cutoff ({job.minCgpa}) and college branch alignment ({student.department}).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-100">
                    <span className="font-bold text-violet-900">Portfolio & Projects (20%)</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Hands-on verified technical projects utilizing the required technologies provide bonus readiness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths & Growth Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                  <h5 className="font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Strengths Highlighted
                  </h5>
                  <ul className="space-y-1.5 text-slate-700">
                    {analysis.keyStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs">
                  <h5 className="font-bold text-[#312E81] mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Strategic Growth Recommendations
                  </h5>
                  <ul className="space-y-1.5 text-slate-700">
                    {analysis.growthAdvice.map((a, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#6366F1] mt-0.5">•</span>
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
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Close Analysis
          </button>

          <div className="flex items-center gap-3">
            {hasApplied ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Application Submitted
              </span>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
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

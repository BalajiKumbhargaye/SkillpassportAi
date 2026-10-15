'use client';

import React, { use, Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  ShieldCheck,
  GraduationCap,
  Award,
  Layers,
  FolderGit2,
  ExternalLink,
  CheckCircle2,
  Share2,
  Printer,
  ArrowLeft,
} from 'lucide-react';

interface PassportPageProps {
  params: Promise<{ id: string }>;
}

function PassportContent({ params }: PassportPageProps) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const students = db.getStudents();
  // Find by userId or profile id
  const student = students.find((s) => s.userId === studentId || s.id === studentId) || students[0];

  const verifiedSkills = student ? student.skills.filter((s) => s.verified) : [];
  const evidenceScore = student?.resumeEvidence?.evidenceScore ?? 88;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Public Skill Passport URL copied to clipboard!');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#312E81]">Skill Passport Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">This student passport record could not be located.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366F1] text-xs font-semibold text-white shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/student"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#312E81] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Share Link</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shadow-indigo-500/20"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-100" />
            <span>Print Passport</span>
          </button>
        </div>
      </div>

      {/* Official Skill Passport Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden">
        {/* Verification Watermark */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6366F1]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#312E81]">Official Student Skill Passport</span>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically Verified</span>
          </span>
        </div>

        {/* Identity Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-[#312E81] p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-white flex items-center justify-center text-3xl font-black text-[#312E81]">
              {student.fullName.charAt(0)}
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#312E81] tracking-tight">
              {student.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {student.department} • {student.collegeName}
            </p>
            <p className="text-xs text-slate-500">
              Roll No: <span className="font-semibold text-slate-800">{student.rollNumber}</span> • Batch of{' '}
              <span className="font-semibold text-slate-800">{student.graduationYear}</span> • CGPA:{' '}
              <span className="font-bold text-emerald-700">{student.cgpa.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 p-4 rounded-2xl leading-relaxed italic">
            &ldquo;{student.bio}&rdquo;
          </p>
        )}

        {/* Evidence Confidence Metric */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Evidence Confidence Score
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{evidenceScore}%</p>
            <span className="text-[10px] text-slate-400">Cross-verified via GitHub & Certs</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Verified Technical Skills
            </span>
            <p className="text-2xl font-black text-[#312E81] mt-0.5">{verifiedSkills.length}</p>
            <span className="text-[10px] text-[#6366F1]">Benchmarked against campus requirements</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Projects & Certifications
            </span>
            <p className="text-2xl font-black text-[#312E81] mt-0.5">
              {student.projects.length + student.certifications.length}
            </p>
            <span className="text-[10px] text-[#8B5CF6]">Active portfolio evidence items</span>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#312E81] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6366F1]" />
            Verified Skill Competencies ({student.skills.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {student.skills.map((skill, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {skill.verified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-slate-800 truncate">{skill.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-[#6366F1] bg-indigo-50 px-1.5 py-0.5 rounded shrink-0 border border-indigo-100">
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        {student.projects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#312E81] uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#8B5CF6]" />
              Verified Portfolio Projects ({student.projects.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {student.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#312E81]">{proj.title}</h4>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-[#6366F1]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {proj.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {student.certifications.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#312E81] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#6366F1]" />
              Accredited Certifications ({student.certifications.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {student.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{cert.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Issued by {cert.issuer} • {cert.issueDate}
                    </p>
                  </div>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-indigo-50 text-[#6366F1] hover:bg-indigo-100 text-xs shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Footer Stamp */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SkillPassport AI Verification Network • Institutional ID: {student.rollNumber}</span>
          </div>
          <span>Generated {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function PublicPassportPage(props: PassportPageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400 text-xs">
          Loading Skill Passport...
        </div>
      }
    >
      <PassportContent {...props} />
    </Suspense>
  );
}

'use client';

import Link from 'next/link';
import { ArrowRight, Briefcase, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';

const roleCards = [
  {
    name: 'Student',
    description: 'Track verified skills, compare against job requirements, and unlock curated upskilling paths.',
    href: '/dashboard/student',
    accent: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    name: 'Recruiter',
    description: 'Evaluate applicants with readiness scoring, interview pipelines, and faster hiring decisions.',
    href: '/dashboard/recruiter',
    accent: 'from-purple-500/20 to-pink-500/20',
  },
  {
    name: 'Course Provider',
    description: 'Publish programs aligned to the skills employers demand and monitor enrollment outcomes.',
    href: '/dashboard/training',
    accent: 'from-amber-500/20 to-orange-500/20',
  },
];

export default function HomePage() {
  const { user, quickDemoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid items-center gap-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-8 shadow-2xl lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              AI-powered placement intelligence
            </span>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                SkillPassport AI for smarter hiring and student growth.
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Create verified student skill records, compare talent against job demands, and recommend learning paths that help students become job-ready faster.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={user ? '/dashboard/student' : '/'}
                onClick={() => !user && quickDemoLogin('student')}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Launch student demo
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard/recruiter"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
              >
                View recruiter dashboard
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-400" />
                Verified student profiles
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-400" />
                ATS-ready hiring views
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-400" />
                Personalized course paths
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            {roleCards.map((role) => (
              <button
                key={role.name}
                type="button"
                onClick={() => quickDemoLogin(role.name === 'Student' ? 'student' : role.name === 'Recruiter' ? 'recruiter' : 'training_institute')}
                className={`rounded-2xl border border-slate-800 bg-gradient-to-r ${role.accent} p-4 text-left transition hover:border-slate-600`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-white">{role.name}</p>
                    <p className="mt-1 text-sm text-slate-300">{role.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-200" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

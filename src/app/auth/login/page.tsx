'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'student' as UserRole,
    title: 'Student Demo',
    email: 'student@skillpassport.ai',
    name: 'Aarav Sharma',
    icon: GraduationCap,
  },
  {
    role: 'recruiter' as UserRole,
    title: 'Recruiter Demo',
    email: 'recruiter@nextgen.com',
    name: 'Sarah Jenkins',
    icon: Building2,
  },
  {
    role: 'training_institute' as UserRole,
    title: 'Course Provider Demo',
    email: 'courses@cloudmaster.edu',
    name: 'Prof. David Roy',
    icon: BookOpen,
  },
  {
    role: 'placement_cell' as UserRole,
    title: 'Placement Officer Demo',
    email: 'tpo@college.edu',
    name: 'Dr. R. K. Verma',
    icon: BarChart3,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case 'student':
        router.push('/dashboard/student');
        break;
      case 'recruiter':
        router.push('/dashboard/recruiter');
        break;
      case 'training_institute':
        router.push('/dashboard/training');
        break;
      case 'placement_cell':
        router.push('/dashboard/placement');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const demoMatch = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
      redirectByRole(demoMatch?.role || 'student');
    } else {
      setError(res.message || 'Login failed. Please check credentials or use one-click demo login.');
    }
  };

  const handleDemoClick = (account: typeof DEMO_ACCOUNTS[0]) => {
    quickDemoLogin(account.role);
    redirectByRole(account.role);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#312E81] items-center justify-center shadow-md shadow-indigo-950/20 text-white">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#312E81] tracking-tight">Sign in to SkillPassport AI</h1>
          <p className="text-xs text-slate-500">
            Access your verified skill passport, recruiter pipeline, or institutional analytics.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu or name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-xs shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant One-Click Demo Logins */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Or sign in with 1-Click Demo Personas:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleDemoClick(acc)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-[#6366F1] group-hover:text-[#312E81]" />
                      <span className="text-[11px] font-bold text-slate-800 leading-tight truncate">
                        {acc.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{acc.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/auth/register" className="text-[#6366F1] hover:text-[#4F46E5] font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Compass,
  ArrowRight,
  User,
  Mail,
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

const ROLES: { id: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    description: 'Track verified skill passport & apply to placement drives',
  },
  {
    id: 'recruiter',
    label: 'Recruiter',
    icon: Building2,
    description: 'Post jobs & review student applicants by readiness score',
  },
  {
    id: 'training_institute',
    label: 'Course Provider',
    icon: BookOpen,
    description: 'Publish upskilling programs aligned to employer skill gaps',
  },
  {
    id: 'placement_cell',
    label: 'Placement Cell',
    icon: BarChart3,
    description: 'Manage campus placement drives & institutional analytics',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState('Computer Science');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await register(name, email, role, department);
    setLoading(false);

    if (res.success) {
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
    } else {
      setError(res.message || 'Registration failed. An account with this email may already exist.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#312E81] items-center justify-center shadow-md shadow-indigo-950/20 text-white">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#312E81] tracking-tight">Create your SkillPassport Account</h1>
          <p className="text-xs text-slate-500">
            Join the verified college placement and skill-gap intelligence platform.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma or Dr. R. K. Verma"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Official Email *</label>
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

            {/* Role Selection */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Select Your Role *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const selected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selected
                          ? 'bg-indigo-50/70 border-[#6366F1] text-[#312E81] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${selected ? 'text-[#6366F1]' : 'text-slate-400'}`} />
                        <span className="font-bold text-xs">{r.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        {r.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Department (If Student) */}
            {role === 'student' && (
              <div className="animate-fade-in">
                <label className="block text-slate-700 font-semibold mb-1.5">Department / Discipline</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-xs shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#6366F1] hover:text-[#4F46E5] font-semibold">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

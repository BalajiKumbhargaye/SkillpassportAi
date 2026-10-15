'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface InterfaceOption {
  role: UserRole;
  title: string;
  tag: string;
  description: string;
  features: string[];
  demoEmail: string;
  demoName: string;
  color: {
    border: string;
    badge: string;
    btnPrimary: string;
    btnSecondary: string;
    iconBg: string;
    iconColor: string;
    topBarBg: string;
  };
}

const INTERFACE_OPTIONS: InterfaceOption[] = [
  {
    role: 'student',
    title: 'Student',
    tag: 'Learners & Graduates',
    description:
      'Build your verified skill passport, parse resumes with AI evidence validation, and match readiness against campus drives.',
    features: [
      'Verified digital skill passport',
      'AI resume-to-passport extraction',
      'Readiness scoring & gap analysis',
    ],
    demoEmail: 'student@skillpassport.ai',
    demoName: 'Aarav Sharma',
    color: {
      border: 'hover:border-indigo-300',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      btnPrimary: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs shadow-indigo-500/20',
      btnSecondary: 'border-indigo-200 hover:bg-indigo-50/60 text-[#6366F1]',
      iconBg: 'bg-indigo-50 border border-indigo-100',
      iconColor: 'text-[#6366F1]',
      topBarBg: 'bg-gradient-to-r from-indigo-50 to-white',
    },
  },
  {
    role: 'recruiter',
    title: 'Recruiter',
    tag: 'Corporate Hiring Teams',
    description:
      'Post campus job openings, evaluate applicants with candidate readiness scoring, and manage multi-stage interview pipelines.',
    features: [
      'ATS applicant screening & scoring',
      'Campus placement drive publisher',
      'Technical interview scheduler',
    ],
    demoEmail: 'recruiter@nextgen.com',
    demoName: 'Sarah Jenkins',
    color: {
      border: 'hover:border-violet-300',
      badge: 'bg-violet-50 text-violet-700 border-violet-200',
      btnPrimary: 'bg-[#312E81] hover:bg-indigo-950 text-white shadow-xs shadow-indigo-950/20',
      btnSecondary: 'border-slate-200 hover:bg-violet-50/60 text-[#312E81]',
      iconBg: 'bg-violet-50 border border-violet-100',
      iconColor: 'text-[#8B5CF6]',
      topBarBg: 'bg-gradient-to-r from-violet-50 to-white',
    },
  },
  {
    role: 'training_institute',
    title: 'Course Provider',
    tag: 'Academies & Educators',
    description:
      'Map curricula to high-demand skills required by employers, publish certified courses, and track student cohort enrollment.',
    features: [
      'Skill deficit curriculum builder',
      'Upskilling program publisher',
      'Direct cohort demand metrics',
    ],
    demoEmail: 'courses@cloudmaster.edu',
    demoName: 'Prof. David Roy',
    color: {
      border: 'hover:border-purple-300',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      btnPrimary: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs shadow-indigo-500/20',
      btnSecondary: 'border-purple-200 hover:bg-purple-50/60 text-purple-700',
      iconBg: 'bg-purple-50 border border-purple-100',
      iconColor: 'text-purple-600',
      topBarBg: 'bg-gradient-to-r from-purple-50 to-white',
    },
  },
  {
    role: 'placement_cell',
    title: 'Placement Cell (TPO)',
    tag: 'Colleges & Universities',
    description:
      'Monitor college placement rates, benchmark department readiness, screen students by CGPA, and export campus drive reports.',
    features: [
      'Real-time institutional analytics',
      'Batch candidate screener (CGPA/branch)',
      'Exportable drive reports (CSV)',
    ],
    demoEmail: 'tpo@college.edu',
    demoName: 'Dr. R. K. Verma',
    color: {
      border: 'hover:border-emerald-300',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btnPrimary: 'bg-[#312E81] hover:bg-indigo-950 text-white shadow-xs shadow-indigo-950/20',
      btnSecondary: 'border-emerald-200 hover:bg-emerald-50/60 text-emerald-700',
      iconBg: 'bg-emerald-50 border border-emerald-100',
      iconColor: 'text-emerald-600',
      topBarBg: 'bg-gradient-to-r from-emerald-50 to-white',
    },
  },
];

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'student':
      return GraduationCap;
    case 'recruiter':
      return Building2;
    case 'training_institute':
      return BookOpen;
    case 'placement_cell':
      return BarChart3;
    default:
      return GraduationCap;
  }
};

export default function HomePage() {
  const router = useRouter();
  const { login, register } = useAuth();

  // Modal Auth State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [department, setDepartment] = useState('Computer Science');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getDashboardHref = (role: UserRole) => {
    switch (role) {
      case 'student':
        return '/dashboard/student';
      case 'recruiter':
        return '/dashboard/recruiter';
      case 'training_institute':
        return '/dashboard/training';
      case 'placement_cell':
        return '/dashboard/placement';
    }
  };

  const handleOpenAuth = (role: UserRole, mode: 'signin' | 'signup') => {
    const config = INTERFACE_OPTIONS.find((opt) => opt.role === role);
    setSelectedRole(role);
    setAuthMode(mode);
    setEmail(mode === 'signin' ? config?.demoEmail || '' : '');
    setName(mode === 'signin' ? config?.demoName || '' : '');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'signin') {
        const res = await login(email, password);
        if (res.success) {
          router.push(getDashboardHref(selectedRole));
        } else {
          setError(res.message || 'Login failed. Please check your credentials.');
        }
      } else {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        const res = await register(name, email, selectedRole, department);
        if (res.success) {
          router.push(getDashboardHref(selectedRole));
        } else {
          setError(res.message || 'Registration failed. An account with this email may already exist.');
        }
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const activeConfig = INTERFACE_OPTIONS.find((opt) => opt.role === selectedRole) || INTERFACE_OPTIONS[0];
  const ActiveIcon = getRoleIcon(selectedRole);

  return (
    <div className="min-h-[90vh] bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-12">
        {/* Landing Page Focus Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-indigo-700 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-[#6366F1]" />
            AI-Powered Career & Placement Ecosystem
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#312E81]">
            Select Your Dedicated Portal
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Choose your role below to access tailored dashboards, verified skill passports, and campus placement tools.
          </p>
        </div>

        {/* The 4 Interface Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INTERFACE_OPTIONS.map((item) => {
            const Icon = getRoleIcon(item.role);

            return (
              <div
                key={item.role}
                className={`relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl ${item.color.border} transition-all duration-300 flex flex-col justify-between space-y-6 group`}
              >
                <div className="space-y-4">
                  {/* Top Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl ${item.color.iconBg} flex items-center justify-center ${item.color.iconColor} shadow-xs`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${item.color.badge}`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-xl font-bold text-[#312E81] group-hover:text-[#6366F1] transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Key Highlights Checklist */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {item.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.color.iconColor}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authentication Action Buttons */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAuth(item.role, 'signin')}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 ${item.color.btnPrimary}`}
                    >
                      <span>Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAuth(item.role, 'signup')}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 bg-white ${item.color.btnSecondary}`}
                    >
                      <span>Sign Up</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Authentication Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className={`p-6 ${activeConfig.color.topBarBg} border-b border-slate-200 relative`}>
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-xl bg-white text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl ${activeConfig.color.iconBg} flex items-center justify-center ${activeConfig.color.iconColor} shadow-xs`}
                >
                  <ActiveIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#312E81]">
                    {activeConfig.title} Authentication
                  </h3>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${activeConfig.color.badge}`}>
                    {activeConfig.tag}
                  </span>
                </div>
              </div>

              {/* Sign In vs Sign Up Tabs */}
              <div className="mt-5 grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setEmail(activeConfig.demoEmail);
                    setError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    authMode === 'signin'
                      ? 'bg-white text-[#312E81] shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setEmail('');
                    setError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    authMode === 'signup'
                      ? 'bg-white text-[#312E81] shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitAuth} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name (Sign Up only) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {selectedRole === 'student' ? 'Student Email' : 'Work Email'} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.edu"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                    required
                  />
                </div>
              </div>

              {/* Department (If Student Sign Up) */}
              {authMode === 'signup' && selectedRole === 'student' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 ${activeConfig.color.btnPrimary}`}
              >
                <span>
                  {loading
                    ? 'Authenticating...'
                    : authMode === 'signin'
                    ? `Sign In to ${activeConfig.title} Portal`
                    : `Create ${activeConfig.title} Account`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

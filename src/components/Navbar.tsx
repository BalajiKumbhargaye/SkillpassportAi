'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Compass,
  Briefcase,
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
  Database,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasSupabase = isSupabaseConfigured();

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string; badge: string }> = {
    student: {
      label: 'Student',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    recruiter: {
      label: 'Recruiter',
      icon: Building2,
      color: 'from-purple-500 to-pink-600',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    training_institute: {
      label: 'Course Provider',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    placement_cell: {
      label: 'Placement Cell',
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  };

  const currentRole = user?.role || 'student';
  const roleConfig = roleLabels[currentRole];
  const RoleIcon = roleConfig.icon;

  const getDashboardHref = () => {
    switch (user?.role) {
      case 'student':
        return '/dashboard/student';
      case 'recruiter':
        return '/dashboard/recruiter';
      case 'training_institute':
        return '/dashboard/training';
      case 'placement_cell':
        return '/dashboard/placement';
      default:
        return '/dashboard/student';
    }
  };

  const navLinks = [
    { href: getDashboardHref(), label: 'Dashboard', icon: Layers },
    { href: '/jobs', label: 'Job Openings', icon: Briefcase },
    { href: '/courses', label: 'Courses & Upskilling', icon: BookOpen },
    {
      href: '/dashboard/placement',
      label: 'Placement Cell',
      icon: BarChart3,
      special: true,
      restricted: currentRole !== 'placement_cell',
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      {/* Top micro-bar for Quick Role Switcher */}
      <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-950/40 border-b border-slate-800/40 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="font-medium text-slate-300">Quick Persona Switcher:</span>
            <span className="hidden sm:inline text-slate-500">Test platform across all 4 roles instantly:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {(['student', 'recruiter', 'training_institute', 'placement_cell'] as UserRole[]).map((r) => {
              const active = currentRole === r;
              return (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-400'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-slate-500'}`} />
                  {roleLabels[r].label}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400">
              {hasSupabase ? 'Supabase Connected' : 'Persistent Storage Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">SkillPassport</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">College Placement & Skill-Gap Platform</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.special && link.restricted && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                      TPO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: User Status & Dropdown */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-all text-left"
                >
                  <div className="relative">
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs border border-slate-700">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleConfig.badge}`}
                    >
                      {roleConfig.label}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl glass-dropdown p-2 z-50 text-slate-200"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-semibold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <RoleIcon className="w-3 h-3 text-blue-400" />
                        <span className="text-[11px] text-blue-400 font-medium capitalize">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={getDashboardHref()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>My Dashboard</span>
                    </Link>

                    <div className="my-1 border-t border-slate-800/80" />

                    <div className="px-3 py-1.5">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Switch Role Persona
                      </p>
                      <div className="mt-1.5 grid grid-cols-2 gap-1">
                        {(['student', 'recruiter', 'training_institute', 'placement_cell'] as UserRole[]).map(
                          (r) => (
                            <button
                              key={r}
                              onClick={() => {
                                switchRole(r);
                                setDropdownOpen(false);
                              }}
                              className={`text-[11px] text-left px-2 py-1.5 rounded transition-colors ${
                                currentRole === r
                                  ? 'bg-blue-600/20 text-blue-300 font-semibold'
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              {roleLabels[r].label}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="my-1 border-t border-slate-800/80" />

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/30"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

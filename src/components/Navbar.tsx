'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
  Compass,
  Briefcase,
  GraduationCap,
  Building2,
  BookOpen,
  BarChart3,
  LogOut,
  ChevronDown,
  Layers,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; icon: LucideIcon; badge: string }> = {
    student: {
      label: 'Student',
      icon: GraduationCap,
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    recruiter: {
      label: 'Recruiter',
      icon: Building2,
      badge: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    training_institute: {
      label: 'Course Provider',
      icon: BookOpen,
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    placement_cell: {
      label: 'Placement Cell',
      icon: BarChart3,
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  const currentRole = user?.role || 'student';
  const roleConfig = roleLabels[currentRole];
  const RoleIcon = roleConfig.icon;

  const getDashboardHrefForRole = (role: UserRole) => {
    switch (role) {
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

  // Role-tailored navigation items
  const getNavLinks = () => {
    switch (currentRole) {
      case 'student':
        return [
          { href: '/dashboard/student', label: 'My Dashboard', icon: Layers },
          { href: '/jobs', label: 'Campus Drives', icon: Briefcase },
          { href: '/courses', label: 'Upskilling Hub', icon: BookOpen },
          { href: `/passport/${user?.id || 'user-student-1'}`, label: 'My Passport', icon: ShieldCheck },
        ];
      case 'recruiter':
        return [
          { href: '/dashboard/recruiter', label: 'ATS Dashboard', icon: Building2 },
          { href: '/jobs', label: 'Campus Openings', icon: Briefcase },
          { href: '/dashboard/placement', label: 'College Analytics', icon: BarChart3 },
        ];
      case 'training_institute':
        return [
          { href: '/dashboard/training', label: 'Academy Dashboard', icon: BookOpen },
          { href: '/courses', label: 'Course Catalog', icon: Layers },
          { href: '/jobs', label: 'Skill Gap Intelligence', icon: Briefcase },
        ];
      case 'placement_cell':
        return [
          { href: '/dashboard/placement', label: 'TPO Intelligence', icon: BarChart3 },
          { href: '/jobs', label: 'Active Drives', icon: Briefcase },
          { href: '/courses', label: 'Partner Courses', icon: BookOpen },
        ];
      default:
        return [
          { href: '/dashboard/student', label: 'Dashboard', icon: Layers },
          { href: '/jobs', label: 'Job Openings', icon: Briefcase },
          { href: '/courses', label: 'Courses', icon: BookOpen },
        ];
    }
  };

  const isLandingPage = !pathname || pathname === '/' || pathname === '';
  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#312E81] flex items-center justify-center text-white shadow-sm shadow-indigo-900/20 group-hover:bg-[#6366F1] transition-colors">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-[#312E81] tracking-tight">SkillPassport</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-violet-100 text-[#8B5CF6] border border-violet-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-none">Career & Placement Intelligence Platform</p>
            </div>
          </Link>

          {/* Nav links (Hidden on Landing Page) */}
          {!isLandingPage && (
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-indigo-50 text-[#6366F1] font-semibold border border-indigo-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-[#312E81] hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#6366F1]' : 'text-slate-500'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action: User Status & Dropdown (Hidden on Landing Page) */}
          {!isLandingPage && (
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/90 transition-all text-left shadow-xs"
                  >
                    <div className="relative">
                      {/* User Avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#312E81] flex items-center justify-center text-white font-semibold text-xs border border-indigo-200">
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                      <span
                        className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleConfig.badge}`}
                      >
                        {roleConfig.label}
                      </span>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-slate-800"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <RoleIcon className="w-3 h-3 text-[#6366F1]" />
                          <span className="text-[11px] text-[#6366F1] font-medium capitalize">
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={getDashboardHrefForRole(currentRole)}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-indigo-50 text-slate-700 hover:text-[#312E81] transition-colors"
                      >
                        <Layers className="w-4 h-4 text-[#6366F1]" />
                        <span>My Dashboard</span>
                      </Link>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
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
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#312E81] hover:bg-slate-100 border border-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#6366F1] hover:bg-[#4F46E5] shadow-xs shadow-indigo-500/20"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && !isLandingPage && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-indigo-50 hover:text-[#312E81]"
              >
                <Icon className="w-4 h-4 text-[#6366F1]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

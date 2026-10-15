'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass } from 'lucide-react';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    switch (user.role) {
      case 'student':
        router.replace('/dashboard/student');
        break;
      case 'recruiter':
        router.replace('/dashboard/recruiter');
        break;
      case 'training_institute':
        router.replace('/dashboard/training');
        break;
      case 'placement_cell':
        router.replace('/dashboard/placement');
        break;
      default:
        router.replace('/dashboard/student');
        break;
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 animate-pulse mb-4">
        <Compass className="w-6 h-6 animate-spin" />
      </div>
      <h2 className="text-base font-bold text-[#0F172A]">Directing to your personalized dashboard...</h2>
      <p className="text-xs text-slate-500 mt-1">Preparing workspace for your user role.</p>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { CreateCourseModal } from '@/components/CreateCourseModal';
import { CourseCard } from '@/components/CourseCard';
import {
  BookOpen,
  Plus,
  TrendingUp,
  Award,
  Users,
  Sparkles,
  Trash2,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function TrainingDashboardPage() {
  const { user, switchRole } = useAuth();
  const [, setRefreshTick] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleDataUpdated = () => {
      setRefreshTick((tick) => tick + 1);
    };
    window.addEventListener('skillpassport_data_updated', handleDataUpdated);
    return () => window.removeEventListener('skillpassport_data_updated', handleDataUpdated);
  }, []);

  const courses = db.getCourses();
  const analytics = db.getPlacementAnalytics();
  const students = db.getStudents();

  // Filter courses by search
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.providerName.toLowerCase().includes(q) ||
        c.skillsCovered.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [courses, searchQuery]);

  // Aggregate stats
  const totalCourses = courses.length;
  const certifiedCourses = courses.filter((c) => c.isCertified).length;
  const allSkillsCovered = Array.from(new Set(courses.flatMap((c) => c.skillsCovered)));
  const avgRating =
    courses.length > 0
      ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
      : '4.8';

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to remove this training program?')) {
      db.deleteCourse(courseId);
      setRefreshTick((tick) => tick + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Role Banner Notification if not logged in as training_institute */}
      {user?.role !== 'training_institute' && (
        <div className="rounded-2xl p-4 bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-indigo-900 text-xs">
            <Sparkles className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
            <span>
              You are previewing the Course Provider Portal. Switch to <strong>Course Provider</strong> role to test creating and managing courses.
            </span>
          </div>
          <button
            onClick={() => switchRole('training_institute')}
            className="px-3.5 py-1.5 rounded-lg bg-[#312E81] hover:bg-indigo-950 text-white text-xs font-semibold shrink-0"
          >
            Switch to Course Provider
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#312E81] shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#312E81]">Course Provider & Upskilling Academy</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-[#8B5CF6] border border-violet-200 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Curriculum Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Publish industry-vetted courses mapped directly to recruiter skill gaps and evaluate student cohort reach.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Program</span>
        </button>
      </div>

      {/* Provider KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Published Courses
            </span>
            <p className="text-3xl font-black text-[#312E81] mt-1">{totalCourses}</p>
            <span className="text-[11px] text-[#6366F1] mt-1 inline-block font-medium">
              {certifiedCourses} with verified credential
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Skills Covered
            </span>
            <p className="text-3xl font-black text-[#312E81] mt-1">{allSkillsCovered.length}</p>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-block">In-demand tech stacks</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Student Cohort Pool
            </span>
            <p className="text-3xl font-black text-[#312E81] mt-1">{students.length}</p>
            <span className="text-[11px] text-[#8B5CF6] font-medium mt-1 inline-block">Potential learners</span>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 text-[#8B5CF6] border border-violet-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Average Rating
            </span>
            <p className="text-3xl font-black text-amber-600 mt-1">{avgRating} / 5.0</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">From verified learners</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Campus Skill Gap Intelligence */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            Recruiter Demand vs. Student Gap Opportunities
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            These skills are actively required by campus recruiters, but students lack verification. Create courses to bridge these exact gaps:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {analytics.commonSkillGaps.map((gap) => (
            <div
              key={gap.skill}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{gap.skill}</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                    {gap.percentage}% Gap
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {gap.gapCount} students currently seeking training in this area.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="mt-3 w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] border border-indigo-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Launch {gap.skill} Program</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Course Catalog Management */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#312E81] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#6366F1]" />
              Manage Active Course Programs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and manage curricula published to students and placement cells.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your programs..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
            />
          </div>
        </div>

        {/* Grid of Courses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="relative group">
              <CourseCard course={course} />
              <button
                onClick={() => handleDeleteCourse(course.id)}
                title="Delete Course"
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No courses found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => setRefreshTick((tick) => tick + 1)}
      />
    </div>
  );
}

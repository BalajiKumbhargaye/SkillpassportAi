'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { CourseCard } from '@/components/CourseCard';
import { CreateCourseModal } from '@/components/CreateCourseModal';
import {
  BookOpen,
  Search,
  Sparkles,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export default function CoursesPage() {
  const { user, studentProfile } = useAuth();
  const [, setRefreshTick] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [onlyCertified, setOnlyCertified] = useState<boolean>(false);

  useEffect(() => {
    const handleDataUpdated = () => {
      setRefreshTick((tick) => tick + 1);
    };
    window.addEventListener('skillpassport_data_updated', handleDataUpdated);
    return () => window.removeEventListener('skillpassport_data_updated', handleDataUpdated);
  }, []);

  const courses = db.getCourses();

  // Determine skills that the logged-in student lacks (to highlight them in the catalog)
  const studentMissingSkills = useMemo(() => {
    if (!studentProfile) return [];
    const studentSkillsLower = studentProfile.skills.map((s) => s.name.toLowerCase());
    const jobs = db.getJobs();
    const demandedSkills = Array.from(new Set(jobs.flatMap((j) => j.requiredSkills)));
    return demandedSkills.filter((req) => !studentSkillsLower.includes(req.toLowerCase()));
  }, [studentProfile]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        course.title.toLowerCase().includes(q) ||
        course.providerName.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.skillsCovered.some((s) => s.toLowerCase().includes(q));

      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      const matchesPricing =
        selectedPricing === 'all' ||
        (selectedPricing === 'free' && course.fee === 0) ||
        (selectedPricing === 'paid' && course.fee > 0);

      const matchesCertified = !onlyCertified || course.isCertified;

      return matchesSearch && matchesLevel && matchesPricing && matchesCertified;
    });
  }, [courses, searchQuery, selectedLevel, selectedPricing, onlyCertified]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#312E81] shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#312E81]">Courses & Upskilling Hub</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-[#8B5CF6] border border-violet-200 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Industry Certified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fast-track your readiness score with certified programs mapped directly to campus recruitment requirements.
            </p>
          </div>
        </div>

        {user?.role === 'training_institute' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Course</span>
          </button>
        )}
      </div>

      {/* Student Personal Upskilling Hint */}
      {studentProfile && studentMissingSkills.length > 0 && (
        <div className="rounded-2xl p-4 bg-violet-50 border border-violet-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-800 text-xs">
            <Sparkles className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
            <span>
              Targeted for you: Courses teaching{' '}
              <strong className="text-[#312E81]">
                {studentMissingSkills.slice(0, 3).join(', ')}
              </strong>{' '}
              will directly increase your placement readiness score!
            </span>
          </div>
          <span className="text-[11px] text-[#8B5CF6] font-semibold px-2.5 py-1 rounded-full bg-white border border-violet-200 shrink-0 shadow-xs">
            Highlighted Below
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, instructor, skill..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
            />
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Price Filter */}
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free Courses Only</option>
            <option value="paid">Premium Certification Programs</option>
          </select>

          {/* Checkbox for Verified Certificate */}
          <label className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyCertified}
              onChange={(e) => setOnlyCertified(e.target.checked)}
              className="rounded bg-white border-slate-300 text-[#6366F1] focus:ring-0"
            />
            <span>Verified Certificate Only</span>
          </label>
        </div>

        {/* Count and Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-[#312E81]">{filteredCourses.length}</strong> upskilling courses
          </span>
          {(searchQuery || selectedLevel !== 'all' || selectedPricing !== 'all' || onlyCertified) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
                setSelectedPricing('all');
                setOnlyCertified(false);
              }}
              className="text-[#6366F1] hover:text-[#4F46E5] font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            highlightSkills={studentMissingSkills}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs shadow-xs">
          No upskilling courses match your active search filters.
        </div>
      )}

      {/* Create Course Modal for Training Providers */}
      <CreateCourseModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => setRefreshTick((tick) => tick + 1)}
      />
    </div>
  );
}

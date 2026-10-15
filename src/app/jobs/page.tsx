'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { JobCard } from '@/components/JobCard';
import { CreateJobModal } from '@/components/CreateJobModal';
import {
  Briefcase,
  Search,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function JobsExplorerPage() {
  const { user } = useAuth();
  const [, setRefreshTick] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  useEffect(() => {
    const handleDataUpdated = () => {
      setRefreshTick((tick) => tick + 1);
    };
    window.addEventListener('skillpassport_data_updated', handleDataUpdated);
    return () => window.removeEventListener('skillpassport_data_updated', handleDataUpdated);
  }, []);

  const jobs = db.getJobs();

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      j.departmentAllowed.forEach((d) => set.add(d));
    });
    return Array.from(set);
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(q));

      const matchesType = selectedType === 'all' || job.type === selectedType;
      const matchesWorkplace = selectedWorkplace === 'all' || job.workplaceType === selectedWorkplace;
      const matchesDept =
        selectedDept === 'all' ||
        job.departmentAllowed.includes('All') ||
        job.departmentAllowed.includes(selectedDept);

      return matchesSearch && matchesType && matchesWorkplace && matchesDept;
    });
  }, [jobs, searchQuery, selectedType, selectedWorkplace, selectedDept]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#312E81] shrink-0">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#312E81]">Campus Job Openings & Placement Drives</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-[#8B5CF6] border border-violet-200 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Opportunities
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Explore campus recruitment openings, test your readiness match score, and uncover skill gaps before applying.
            </p>
          </div>
        </div>

        {user?.role === 'recruiter' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Opening</span>
          </button>
        )}
      </div>

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
              placeholder="Search title, tech stack, company..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs"
            />
          </div>

          {/* Job Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
          >
            <option value="all">All Employment Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Part-time">Part-time</option>
          </select>

          {/* Workplace Type Filter */}
          <select
            value={selectedWorkplace}
            onChange={(e) => setSelectedWorkplace(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
          >
            <option value="all">All Workplace Modes</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
          >
            <option value="all">All Eligible Branches</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count & Active Tag Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Found <strong className="text-[#312E81]">{filteredJobs.length}</strong> active opportunities
          </span>
          {(searchQuery || selectedType !== 'all' || selectedWorkplace !== 'all' || selectedDept !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedWorkplace('all');
                setSelectedDept('all');
              }}
              className="text-[#6366F1] hover:text-[#4F46E5] font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onRefresh={() => setRefreshTick((tick) => tick + 1)}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs shadow-xs">
          No campus job openings match your active filter criteria. Try adjusting your search keywords.
        </div>
      )}

      {/* Modal for Recruiter */}
      <CreateJobModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => setRefreshTick((tick) => tick + 1)}
      />
    </div>
  );
}

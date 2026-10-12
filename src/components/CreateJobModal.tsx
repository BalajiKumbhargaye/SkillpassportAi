'use client';

import React, { useState } from 'react';
import { JobOpening } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { X, Plus, Briefcase } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('NextGen Cloud Inc.');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [type, setType] = useState<JobOpening['type']>('Full-time');
  const [workplaceType, setWorkplaceType] = useState<JobOpening['workplaceType']>('Hybrid');
  const [salaryPackage, setSalaryPackage] = useState('14 - 18 LPA');
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [departmentAllowed, setDepartmentAllowed] = useState('Computer Science, Information Technology, Data Science & AI');
  const [requiredSkills, setRequiredSkills] = useState('React, Next.js, TypeScript, SQL, Docker');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !requiredSkills) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const newJob: JobOpening = {
      id: `job-${Date.now()}`,
      recruiterId: user?.id || 'recruiter-default',
      recruiterName: user?.name || 'Recruitment Team',
      companyName,
      companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
      title,
      departmentAllowed: departmentAllowed.split(',').map((d) => d.trim()),
      location,
      type,
      workplaceType,
      salaryPackage,
      minCgpa,
      requiredSkills: requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      preferredSkills: [],
      description,
      responsibilities: [
        'Design and deploy production-grade software features',
        'Participate in architecture reviews and sprint planning',
      ],
      qualifications: [`B.Tech / B.E with minimum ${minCgpa} CGPA`],
      deadline,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    db.saveJob(newJob);
    if (onCreated) onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Post New Job Opening</h3>
              <p className="text-xs text-slate-400">
                Define the requirements to enable automatic student skill-gap analysis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Associate Cloud Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Job Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as JobOpening['type'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Workplace Mode</label>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value as JobOpening['workplaceType'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Compensation / Package</label>
              <input
                type="text"
                value={salaryPackage}
                onChange={(e) => setSalaryPackage(e.target.value)}
                placeholder="e.g. 12 - 16 LPA"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={minCgpa}
                onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Deadline Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Required Skills (Comma separated) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Python, Machine Learning, SQL, Docker, Git"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              The matching algorithm will benchmark student skills against this list.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Eligible Departments (Comma separated)
            </label>
            <input
              type="text"
              value={departmentAllowed}
              onChange={(e) => setDepartmentAllowed(e.target.value)}
              placeholder="e.g. Computer Science, Information Technology, All"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Job Description & Responsibilities *</label>
            <textarea
              rows={4}
              required
              placeholder="Detailed overview of the role and technical challenges..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer inside form */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Opening</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { X, BookOpen, Plus } from 'lucide-react';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState(user?.name || 'Academy Partner');
  const [description, setDescription] = useState('');
  const [skillsCovered, setSkillsCovered] = useState('Docker, Kubernetes, CI/CD');
  const [targetJobRoles, setTargetJobRoles] = useState('DevOps Engineer, Cloud Architect');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [fee, setFee] = useState(0);
  const [isCertified, setIsCertified] = useState(true);
  const [level, setLevel] = useState<Course['level']>('Intermediate');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !skillsCovered) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      instituteId: user?.id || 'institute-default',
      providerName,
      title,
      description,
      skillsCovered: skillsCovered
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      targetJobRoles: targetJobRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
      durationWeeks,
      durationHours: Math.max(1, durationWeeks * 6),
      fee,
      isCertified,
      level,
      enrollUrl: '#enroll',
      rating: 4.9,
      reviewCount: 45,
      createdAt: new Date().toISOString(),
    };

    db.saveCourse(newCourse);
    if (onCreated) onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#312E81]">Publish Training Program</h3>
              <p className="text-xs text-slate-500">
                Map courses to specific high-demand skills to bridge student gaps.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Course Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Production Microservices with Go"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Provider / Institute Name *</label>
              <input
                type="text"
                required
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fee (₹, 0 for Free)</label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min="1"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Difficulty Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Course['level'])}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Skills Covered (Comma separated) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Docker, Kubernetes, CI/CD, Helm"
              value={skillsCovered}
              onChange={(e) => setSkillsCovered(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Target Job Roles (Comma separated)
            </label>
            <input
              type="text"
              value={targetJobRoles}
              onChange={(e) => setTargetJobRoles(e.target.value)}
              placeholder="e.g. DevOps Engineer, Cloud SRE, Platform Specialist"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Curriculum Summary *</label>
            <textarea
              rows={3}
              required
              placeholder="Comprehensive syllabus overview, hands-on lab details, capstone project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCertified"
              checked={isCertified}
              onChange={(e) => setIsCertified(e.target.checked)}
              className="rounded bg-white border-slate-300 text-[#6366F1] focus:ring-0"
            />
            <label htmlFor="isCertified" className="text-slate-700 font-medium cursor-pointer">
              Includes Verified Digital Certificate of Completion
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold shadow-xs shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Program</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

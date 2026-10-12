'use client';

import React, { useState } from 'react';
import { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { X, BookOpen, Plus, Award } from 'lucide-react';

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
  const [durationHours, setDurationHours] = useState(24);
  const [fee, setFee] = useState(0);
  const [isCertified, setIsCertified] = useState(true);
  const [level, setLevel] = useState<Course['level']>('Intermediate');
  const [enrollUrl, setEnrollUrl] = useState('#enroll');

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
      durationHours,
      fee,
      isCertified,
      level,
      enrollUrl,
      rating: 4.9,
      reviewCount: 45,
      createdAt: new Date().toISOString(),
    };

    db.saveCourse(newCourse);
    if (onCreated) onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Publish Training Program</h3>
              <p className="text-xs text-slate-400">
                Map courses to specific high-demand skills to bridge student gaps.
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
              <label className="block text-slate-300 font-semibold mb-1">Course Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Production Microservices with Go"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Provider / Institute Name *</label>
              <input
                type="text"
                required
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fee (₹, 0 for Free)</label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min="1"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Difficulty Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Skills Covered (Comma separated) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Docker, Kubernetes, Linux, AWS, Git"
              value={skillsCovered}
              onChange={(e) => setSkillsCovered(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              These skills will automatically link to student skill-gap recommendations.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Job Roles</label>
            <input
              type="text"
              value={targetJobRoles}
              onChange={(e) => setTargetJobRoles(e.target.value)}
              placeholder="e.g. Cloud DevOps Engineer, Full Stack Developer"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Course Description *</label>
            <textarea
              rows={3}
              required
              placeholder="What hands-on skills, assignments, and outcomes are covered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="certified"
              checked={isCertified}
              onChange={(e) => setIsCertified(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
            />
            <label htmlFor="certified" className="text-slate-300 font-medium cursor-pointer">
              Includes Verified Completion Certificate
            </label>
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
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

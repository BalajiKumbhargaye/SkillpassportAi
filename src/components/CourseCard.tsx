'use client';

import React, { useState } from 'react';
import { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Clock, Star, Award, ExternalLink, Layers, CheckCircle2, Send } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  highlightSkills?: string[];
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, highlightSkills = [] }) => {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [recommended, setRecommended] = useState(false);

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    setEnrolled(true);
    alert(`Successfully enrolled in "${course.title}". Your curriculum progress has been linked to your Skill Passport!`);
  };

  const handleRecommend = (e: React.MouseEvent) => {
    e.preventDefault();
    setRecommended(true);
    alert(`Course "${course.title}" has been recommended to all students missing ${course.skillsCovered.slice(0, 2).join(', ')}.`);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-[#8B5CF6] uppercase tracking-wider">
              {course.providerName}
            </span>
            <h4 className="font-bold text-base text-[#312E81] mt-1 line-clamp-1">{course.title}</h4>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
            {course.fee === 0 ? 'Free Course' : `₹${course.fee.toLocaleString()}`}
          </div>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{course.description}</p>

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            {course.durationWeeks} Wks ({course.durationHours} hrs)
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-violet-500" />
            {course.level}
          </span>
          {course.isCertified && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <Award className="w-3.5 h-3.5" />
              Verified Certificate
            </span>
          )}
        </div>

        {/* Skills covered */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Skills You Will Master
          </p>
          <div className="flex flex-wrap gap-1.5">
            {course.skillsCovered.map((skill, idx) => {
              const isHighlighted = highlightSkills.some(
                (h) => h.toLowerCase() === skill.toLowerCase()
              );
              return (
                <span
                  key={idx}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                    isHighlighted
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* Target Job Roles */}
        {course.targetJobRoles.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-medium text-slate-500">
              Prepares for: <span className="text-slate-700 font-semibold">{course.targetJobRoles.join(', ')}</span>
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{course.rating.toFixed(1)}</span>
          <span className="text-slate-400 text-[11px]">({course.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'placement_cell' ? (
            <button
              onClick={handleRecommend}
              disabled={recommended}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{recommended ? 'Recommended to Batch' : 'Recommend'}</span>
            </button>
          ) : user?.role === 'training_institute' ? (
            <span className="text-[11px] text-indigo-700 font-semibold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Verified Academy</span>
            </span>
          ) : enrolled ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enrolled
            </span>
          ) : (
            <button
              onClick={handleEnroll}
              className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Enroll & Upskill</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

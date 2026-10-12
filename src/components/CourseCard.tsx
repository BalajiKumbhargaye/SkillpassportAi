'use client';

import React from 'react';
import { Course } from '@/types';
import { BookOpen, Clock, Star, Award, ExternalLink, IndianRupee, Layers } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  highlightSkills?: string[];
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, highlightSkills = [] }) => {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 hover:shadow-xl hover:shadow-purple-950/20 transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
              {course.providerName}
            </span>
            <h4 className="font-bold text-base text-white mt-1 line-clamp-1">{course.title}</h4>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
            {course.fee === 0 ? 'Free Course' : `₹${course.fee.toLocaleString()}`}
          </div>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {course.durationWeeks} Weeks ({course.durationHours} hrs)
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            {course.level}
          </span>
          {course.isCertified && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
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
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
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
            <p className="text-[11px] font-medium text-slate-400">
              Prepares for: <span className="text-slate-300">{course.targetJobRoles.join(', ')}</span>
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{course.rating.toFixed(1)}</span>
          <span className="text-slate-400 text-[11px]">({course.reviewCount})</span>
        </div>

        <a
          href={course.enrollUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
        >
          <span>Start Learning</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

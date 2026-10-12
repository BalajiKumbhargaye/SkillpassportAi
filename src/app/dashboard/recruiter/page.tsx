'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { JobApplication } from '@/types';
import { CreateJobModal } from '@/components/CreateJobModal';
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  Plus,
  Search,
  Trash2,
  IndianRupee,
  MapPin,
  Award,
} from 'lucide-react';

export default function RecruiterDashboardPage() {
  const [, setRefreshTick] = useState(0);
  const jobs = db.getJobs();
  const applications = db.getApplications();
  const handleRefresh = () => setRefreshTick((tick) => tick + 1);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [interviewDateInput, setInterviewDateInput] = useState('');

  useEffect(() => {
    const handleDataUpdated = () => {
      setRefreshTick((tick) => tick + 1);
    };

    window.addEventListener('skillpassport_data_updated', handleDataUpdated);
    return () => window.removeEventListener('skillpassport_data_updated', handleDataUpdated);
  }, []);

  const handleStatusChange = (appId: string, newStatus: JobApplication['status']) => {
    db.updateApplicationStatus(appId, newStatus);
    setRefreshTick((tick) => tick + 1);
  };

  const handleSaveInterviewSchedule = (appId: string) => {
    db.updateApplicationStatus(
      appId,
      'interview_scheduled',
      feedbackInput || 'Technical Interview Round scheduled',
      interviewDateInput || new Date(Date.now() + 86400000 * 3).toISOString()
    );
    setEditingAppId(null);
    setFeedbackInput('');
    setInterviewDateInput('');
    setRefreshTick((tick) => tick + 1);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to remove this job opening?')) {
      db.deleteJob(jobId);
      setRefreshTick((tick) => tick + 1);
    }
  };

  // Filtered applicants
  const filteredApplications = applications.filter((app) => {
    const matchesJob = selectedJobId === 'all' || app.jobId === selectedJobId;
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesJob && matchesSearch;
  });

  // Metrics
  const totalApplicants = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const interviewCount = applications.filter((a) => a.status === 'interview_scheduled').length;
  const offersCount = applications.filter((a) => a.status === 'offered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Recruitment & ATS Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
                Corporate Recruiter
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Publish job criteria, benchmark student readiness, and manage campus interview pipelines.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opening</span>
        </button>
      </div>

      {/* Recruiter Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Active Job Postings
            </span>
            <p className="text-2xl font-bold text-white mt-1">{jobs.length}</p>
            <span className="text-[11px] text-purple-400 mt-1 inline-block">Campus hiring drives</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Applicants
            </span>
            <p className="text-2xl font-bold text-white mt-1">{totalApplicants}</p>
            <span className="text-[11px] text-blue-400 mt-1 inline-block">Registered students</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Interview Pipeline
            </span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{interviewCount}</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              {shortlistedCount} shortlisted
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Job Offers Released
            </span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{offersCount}</p>
            <span className="text-[11px] text-amber-400/80 mt-1 inline-block">Selected students</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Applicant Tracking System (ATS) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Applicant Tracking System ({filteredApplications.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review applicant qualifications, verify readiness scores, and update hiring stages.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates or branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Job Openings</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applications Table */}
        {filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Candidate</th>
                  <th className="py-3 px-4 font-semibold">Role Applied</th>
                  <th className="py-3 px-4 font-semibold">Department & CGPA</th>
                  <th className="py-3 px-4 font-semibold">Job Readiness</th>
                  <th className="py-3 px-4 font-semibold">Hiring Stage Status</th>
                  <th className="py-3 px-4 font-semibold">Actions / Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{app.studentName}</p>
                      <p className="text-[11px] text-slate-400">{app.studentEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {app.jobTitle}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-300">{app.studentDepartment}</p>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        CGPA: {app.studentCgpa}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                            app.readinessScore >= 80
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : app.readinessScore >= 60
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {app.readinessScore}% Match
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value as JobApplication['status'])
                        }
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="applied">Applied</option>
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="offered">Job Offered</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      {editingAppId === app.id ? (
                        <div className="space-y-2 p-2 rounded-xl bg-slate-950 border border-slate-800 min-w-[200px]">
                          <input
                            type="datetime-local"
                            value={interviewDateInput}
                            onChange={(e) => setInterviewDateInput(e.target.value)}
                            className="w-full px-2 py-1 text-[11px] rounded bg-slate-900 border border-slate-700 text-white"
                          />
                          <input
                            type="text"
                            placeholder="Recruiter notes..."
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            className="w-full px-2 py-1 text-[11px] rounded bg-slate-900 border border-slate-700 text-white"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setEditingAppId(null)}
                              className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveInterviewSchedule(app.id)}
                              className="px-2 py-0.5 text-[10px] bg-purple-600 hover:bg-purple-500 text-white font-bold rounded"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingAppId(app.id);
                              setFeedbackInput(app.feedbackNotes || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3 text-purple-400" />
                            <span>Schedule / Notes</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800">
            <p className="text-xs text-slate-400">No applicants found matching this filter.</p>
          </div>
        )}
      </div>

      {/* Posted Job Openings Management */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              Manage Job Postings ({jobs.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit requirement criteria or close fulfilled recruitment positions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const jobApplicants = applications.filter((a) => a.jobId === job.id);
            return (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{job.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{job.companyName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {job.salaryPackage}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Target Skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {jobApplicants.length} Candidates Applied
                  </span>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleRefresh}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  Sparkles,
} from 'lucide-react';

export default function RecruiterDashboardPage() {
  const { user, switchRole } = useAuth();
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
      {/* Role Banner Notification if not logged in as recruiter */}
      {user?.role !== 'recruiter' && (
        <div className="rounded-2xl p-4 bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-indigo-900 text-xs">
            <Sparkles className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
            <span>
              You are previewing the Corporate Recruiter & ATS Portal. Switch to <strong>Corporate Recruiter</strong> role to manage campus drives and candidates.
            </span>
          </div>
          <button
            onClick={() => switchRole('recruiter')}
            className="px-3.5 py-1.5 rounded-lg bg-[#312E81] hover:bg-indigo-950 text-white text-xs font-semibold shrink-0"
          >
            Switch to Recruiter
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#312E81] shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#312E81]">Recruitment & ATS Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-[#8B5CF6] border border-violet-200 text-xs font-semibold">
                Corporate Recruiter
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Publish job criteria, benchmark student readiness, and manage campus interview pipelines.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opening</span>
        </button>
      </div>

      {/* Recruiter Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Active Job Postings
            </span>
            <p className="text-2xl font-bold text-[#312E81] mt-1">{jobs.length}</p>
            <span className="text-[11px] text-[#6366F1] mt-1 inline-block font-medium">Campus hiring drives</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-100">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Total Applicants
            </span>
            <p className="text-2xl font-bold text-[#312E81] mt-1">{totalApplicants}</p>
            <span className="text-[11px] text-[#8B5CF6] mt-1 inline-block font-medium">Registered students</span>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 text-[#8B5CF6] border border-violet-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Interview Pipeline
            </span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{interviewCount}</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              {shortlistedCount} shortlisted
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Job Offers Released
            </span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{offersCount}</p>
            <span className="text-[11px] text-amber-700 mt-1 inline-block font-medium">Selected students</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Applicant Tracking System (ATS) */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6366F1]" />
              Applicant Tracking System ({filteredApplications.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review applicant qualifications, verify readiness scores, and update hiring stages.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates or branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs"
              />
            </div>

            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs font-medium"
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
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Role Applied</th>
                  <th className="py-3 px-4">Department & CGPA</th>
                  <th className="py-3 px-4">Job Readiness</th>
                  <th className="py-3 px-4">Hiring Stage Status</th>
                  <th className="py-3 px-4">Actions / Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{app.studentName}</p>
                      <p className="text-[11px] text-slate-500">{app.studentEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {app.jobTitle}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-700">{app.studentDepartment}</p>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        CGPA: {app.studentCgpa}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                            app.readinessScore >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : app.readinessScore >= 60
                              ? 'bg-indigo-50 text-[#6366F1] border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                        className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#6366F1] font-medium"
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
                        <div className="space-y-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-md min-w-[200px]">
                          <input
                            type="datetime-local"
                            value={interviewDateInput}
                            onChange={(e) => setInterviewDateInput(e.target.value)}
                            className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-200 text-slate-800"
                          />
                          <input
                            type="text"
                            placeholder="Recruiter notes..."
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-200 text-slate-800"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setEditingAppId(null)}
                              className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveInterviewSchedule(app.id)}
                              className="px-2.5 py-0.5 text-[10px] bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold rounded"
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
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 border border-slate-200"
                          >
                            <Calendar className="w-3 h-3 text-[#6366F1]" />
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
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">No applicants found matching this filter.</p>
          </div>
        )}
      </div>

      {/* Posted Job Openings Management */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#6366F1]" />
              Manage Job Postings ({jobs.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
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
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-[#312E81] text-sm line-clamp-1">{job.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{job.companyName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {job.salaryPackage}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Target Skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {jobApplicants.length} Candidates Applied
                  </span>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

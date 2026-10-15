'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { StudentProfile } from '@/types';
import { StudentProfileModal } from '@/components/StudentProfileModal';
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  Award,
  AlertCircle,
  Download,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function PlacementDashboardPage() {
  const { user, switchRole } = useAuth();
  const [, setRefreshTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [minCgpaFilter, setMinCgpaFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleDataUpdated = () => {
      setRefreshTick((tick) => tick + 1);
    };
    window.addEventListener('skillpassport_data_updated', handleDataUpdated);
    return () => window.removeEventListener('skillpassport_data_updated', handleDataUpdated);
  }, []);

  const analytics = db.getPlacementAnalytics();
  const students = db.getStudents();
  const jobs = db.getJobs();
  const applications = db.getApplications();

  // Create lookup for student application status
  const studentStatusMap = useMemo(() => {
    const map = new Map<string, { status: string; company?: string; package?: string }>();
    applications.forEach((app) => {
      const existing = map.get(app.studentId);
      if (app.status === 'offered') {
        map.set(app.studentId, { status: 'Offered', company: app.companyName });
      } else if (app.status === 'interview_scheduled' && (!existing || existing.status !== 'Offered')) {
        map.set(app.studentId, { status: 'Interviewing', company: app.companyName });
      } else if (!existing) {
        map.set(app.studentId, { status: 'In Process', company: app.companyName });
      }
    });
    return map;
  }, [applications]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.department));
    return Array.from(set);
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.skills.some((sk) => sk.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = selectedDept === 'all' || s.department === selectedDept;
      const matchesCgpa = s.cgpa >= minCgpaFilter;

      const appStatus = studentStatusMap.get(s.userId)?.status || 'Not Applied';
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'offered' && appStatus === 'Offered') ||
        (statusFilter === 'interviewing' && appStatus === 'Interviewing') ||
        (statusFilter === 'unplaced' && appStatus !== 'Offered');

      return matchesSearch && matchesDept && matchesCgpa && matchesStatus;
    });
  }, [students, searchQuery, selectedDept, minCgpaFilter, statusFilter, studentStatusMap]);

  // Export placement CSV
  const handleExportCSV = () => {
    const headers = [
      'Roll Number',
      'Student Name',
      'Email',
      'Department',
      'CGPA',
      'Graduation Year',
      'Verified Skills Count',
      'Placement Status',
      'Company Placed',
    ];

    const rows = filteredStudents.map((s) => {
      const info = studentStatusMap.get(s.userId);
      const verifiedCount = s.skills.filter((sk) => sk.verified).length;
      return [
        `"${s.rollNumber}"`,
        `"${s.fullName}"`,
        `"${s.email}"`,
        `"${s.department}"`,
        s.cgpa.toFixed(2),
        s.graduationYear,
        verifiedCount,
        `"${info?.status || 'Active Candidate'}"`,
        `"${info?.company || 'N/A'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Campus_Placement_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBroadcastNotice = () => {
    const topGap = analytics.commonSkillGaps[0]?.skill || 'Cloud/DevOps';
    setNoticeMessage(
      `Broadcast dispatched to ${filteredStudents.length} students: "Special Upskilling Drive for ${topGap} is now available under Courses & Upskilling."`
    );
    setTimeout(() => setNoticeMessage(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Role Banner Notification if not logged in as placement_cell */}
      {user?.role !== 'placement_cell' && (
        <div className="rounded-2xl p-4 bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-indigo-900 text-xs">
            <Sparkles className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
            <span>
              You are previewing the Placement Cell & TPO Portal. Switch to the <strong>Placement Cell</strong> role for the full experience.
            </span>
          </div>
          <button
            onClick={() => switchRole('placement_cell')}
            className="px-3.5 py-1.5 rounded-lg bg-[#312E81] hover:bg-indigo-950 text-white text-xs font-semibold shrink-0"
          >
            Switch to Placement Officer
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#312E81] shrink-0">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[#312E81]">Placement Cell & TPO Intelligence</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-[#8B5CF6] border border-violet-200 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Institutional Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time placement rates, recruiter demand analytics, cohort skill deficits, and student registry.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-[#6366F1]" />
            <span>Export CSV Report</span>
          </button>
          <button
            onClick={handleBroadcastNotice}
            className="px-4 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-xs shadow-indigo-500/20 flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast Notice</span>
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Placement Rate
            </span>
            <p className="text-3xl font-black text-emerald-600 mt-1">{analytics.placementRate}%</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              {analytics.placedStudents} of {analytics.totalStudents} placed
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Average CTC
            </span>
            <p className="text-3xl font-black text-[#312E81] mt-1">₹{analytics.averagePackageLpa} LPA</p>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-block">
              Highest: ₹{analytics.highestPackageLpa} LPA
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-100">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Active Campus Drives
            </span>
            <p className="text-3xl font-black text-[#312E81] mt-1">{jobs.length}</p>
            <span className="text-[11px] text-[#8B5CF6] font-medium mt-1 inline-block">
              {applications.length} applications logged
            </span>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 text-[#8B5CF6] border border-violet-100">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Total Cohort
            </span>
            <p className="text-3xl font-black text-[#312E81] mt-1">{students.length}</p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">Batch of 2026 registered</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Section (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Placement Comparison */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#6366F1]" />
                Department Placement & Readiness
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Average readiness score vs. placed students per discipline</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="avgReadiness" name="Avg Readiness %" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="placed" name="Placed Students" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campus Recruitment Funnel */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8B5CF6]" />
                Recruitment Pipeline Funnel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Application progression from applied to final job offer</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.applicationFunnel.map((stage) => {
              const maxCount = Math.max(...analytics.applicationFunnel.map((s) => s.count), 1);
              const percentage = Math.round((stage.count / maxCount) * 100);

              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{stage.stage}</span>
                    <span className="text-[#312E81] font-bold">{stage.count} students</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full bg-[#6366F1] transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recruiter Demand vs Student Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Demanded Skills */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              Highest Demanded Skills by Employers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Extracted from active campus job descriptions</p>
          </div>

          <div className="space-y-2.5">
            {analytics.topDemandedSkills.map((item, idx) => (
              <div
                key={item.skill}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#6366F1] border border-indigo-100 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{item.skill}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-200 text-[11px] font-bold">
                  {item.demandCount} Openings
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Common Cohort Skill Gaps */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#312E81] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Critical Cohort Skill Gaps
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Skills demanded by recruiters that students lack the most</p>
          </div>

          <div className="space-y-2.5">
            {analytics.commonSkillGaps.map((item) => (
              <div
                key={item.skill}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">{item.skill}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.gapCount} students need upskilling</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                    {item.percentage}% Deficit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Registry & Batch Screener */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#312E81] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6366F1]" />
              Candidate Registry & Screening
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter eligible students by CGPA cutoff, department, verified skills, and placement status.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, roll no, skill..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 shadow-xs"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* CGPA Threshold */}
          <select
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
          >
            <option value={0}>All CGPA Scores</option>
            <option value={7.0}>Min CGPA: 7.0+</option>
            <option value={7.5}>Min CGPA: 7.5+</option>
            <option value={8.0}>Min CGPA: 8.0+</option>
            <option value={8.5}>Min CGPA: 8.5+</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
          >
            <option value="all">All Placement Statuses</option>
            <option value="offered">Placed / Offered</option>
            <option value="interviewing">Interviewing</option>
            <option value="unplaced">Seeking Placement</option>
          </select>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department & Roll</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Verified Skills</th>
                <th className="py-3 px-4">Placement Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const statusInfo = studentStatusMap.get(student.userId);
                  const isOffered = statusInfo?.status === 'Offered';
                  const isInterviewing = statusInfo?.status === 'Interviewing';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#312E81] flex items-center justify-center text-white font-bold text-[10px]">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <p>{student.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-800 font-medium">{student.department}</p>
                        <p className="text-[10px] text-slate-400">{student.rollNumber}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            student.cgpa >= 8.5
                              ? 'text-emerald-700'
                              : student.cgpa >= 7.5
                              ? 'text-[#6366F1]'
                              : 'text-amber-700'
                          }`}
                        >
                          {student.cgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {student.skills.slice(0, 3).map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700"
                            >
                              {sk.name}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{student.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isOffered ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            Offered ({statusInfo?.company})
                          </span>
                        ) : isInterviewing ? (
                          <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-bold">
                            Interviewing ({statusInfo?.company})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                            Seeking Placement
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setProfileModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] border border-indigo-200 text-[11px] font-semibold transition-colors"
                        >
                          View Passport
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No students match the selected screening criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal for inspection */}
      {selectedStudent && (
        <StudentProfileModal
          isOpen={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}

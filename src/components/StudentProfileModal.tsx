'use client';

import React, { useState } from 'react';
import { StudentProfile, StudentSkill, SkillLevel, StudentProject, StudentCertification } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { studentProfile, updateStudentProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'basics' | 'skills' | 'projects' | 'certifications'>('basics');
  const [formData, setFormData] = useState<StudentProfile>(() => {
    return (
      studentProfile || {
        id: 'temp',
        userId: 'temp',
        fullName: '',
        email: '',
        collegeName: 'National Institute of Technology',
        department: 'Computer Science',
        rollNumber: '',
        graduationYear: 2026,
        cgpa: 8.0,
        skills: [],
        projects: [],
        certifications: [],
        careerInterests: ['Full Stack Developer'],
        bio: '',
      }
    );
  });

  // State for adding a new skill
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');

  // State for adding a new project
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTechs, setNewProjectTechs] = useState('');

  // State for adding a new certification
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    updateStudentProfile(formData);
    if (onSaved) onSaved();
    onClose();
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = formData.skills.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (exists) {
      alert('Skill already added!');
      return;
    }

    const updatedSkills: StudentSkill[] = [
      ...formData.skills,
      { name: newSkillName.trim(), level: newSkillLevel, verified: true },
    ];
    setFormData({ ...formData, skills: updatedSkills });
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s.name !== skillName),
    });
  };

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return;
    const project: StudentProject = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim(),
      technologies: newProjectTechs
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    setFormData({
      ...formData,
      projects: [...formData.projects, project],
    });
    setNewProjectTitle('');
    setNewProjectDesc('');
    setNewProjectTechs('');
  };

  const handleRemoveProject = (id: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((p) => p.id !== id),
    });
  };

  const handleAddCert = () => {
    if (!newCertTitle.trim()) return;
    const cert: StudentCertification = {
      id: `cert-${Date.now()}`,
      title: newCertTitle.trim(),
      issuer: newCertIssuer.trim() || 'Verified Provider',
      issueDate: new Date().toISOString().split('T')[0],
    };
    setFormData({
      ...formData,
      certifications: [...formData.certifications, cert],
    });
    setNewCertTitle('');
    setNewCertIssuer('');
  };

  const handleRemoveCert = (id: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#6366F1] border border-indigo-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#312E81]">Edit Student Skill Passport</h3>
              <p className="text-xs text-slate-500">
                Update your academic profile and verified skill stack to refresh match scores.
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

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 space-x-4">
          <button
            onClick={() => setActiveTab('basics')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'basics'
                ? 'border-[#6366F1] text-[#312E81] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Academics & Bio
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'skills'
                ? 'border-[#6366F1] text-[#312E81] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Skills ({formData.skills.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'projects'
                ? 'border-[#6366F1] text-[#312E81] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Projects ({formData.projects.length})
          </button>
          <button
            onClick={() => setActiveTab('certifications')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'certifications'
                ? 'border-[#6366F1] text-[#312E81] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            Certifications ({formData.certifications.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">College / University</label>
                  <input
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current CGPA (out of 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2026 })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bio / Professional Headline</label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share a short summary of your technical interests..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
                />
              </div>
            </div>
          )}

          {/* SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {/* Add Skill Form */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-semibold text-slate-700">Add New Skill to Passport</p>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Docker, TypeScript, PyTorch, GraphQL..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                    className="px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-[#6366F1] shadow-xs font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs shadow-indigo-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Current Skills List */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Verified Skills in Passport ({formData.skills.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{skill.name}</span>
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-[#6366F1] border border-indigo-100 font-semibold">
                          {skill.level}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {/* Add Project Form */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <p className="font-semibold text-slate-700">Add Technical Project</p>
                <div>
                  <input
                    type="text"
                    placeholder="Project Title (e.g. Distributed Cache Engine)"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Short description of technical architecture & impact..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Technologies comma separated (e.g. Go, Redis, Docker)"
                    value={newProjectTechs}
                    onChange={(e) => setNewProjectTechs(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                  <button
                    onClick={handleAddProject}
                    className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs shadow-indigo-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>
              </div>

              {/* Existing Projects */}
              <div className="space-y-2">
                {formData.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-[#312E81]">{proj.title}</h5>
                      <p className="text-slate-600 mt-0.5">{proj.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {proj.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProject(proj.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <p className="font-semibold text-slate-700">Add Industry Certification</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Certificate Title (e.g. AWS Certified Solutions Architect)"
                    value={newCertTitle}
                    onChange={(e) => setNewCertTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                  <input
                    type="text"
                    placeholder="Issuing Authority (e.g. Amazon Web Services)"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] shadow-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddCert}
                    className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs shadow-indigo-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Certificate</span>
                  </button>
                </div>
              </div>

              {/* Existing Certifications */}
              <div className="space-y-2">
                {formData.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-[#312E81]">{cert.title}</h5>
                      <p className="text-[11px] text-slate-500">Issued by {cert.issuer}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveCert(cert.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors font-medium text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-xs shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save & Update Passport</span>
          </button>
        </div>
      </div>
    </div>
  );
};

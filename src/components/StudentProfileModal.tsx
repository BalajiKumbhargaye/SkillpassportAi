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
  CheckCircle2,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edit Student Skill Passport</h3>
              <p className="text-xs text-slate-400">
                Update your academic profile and verified skill stack to refresh match scores.
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

        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 space-x-4">
          <button
            onClick={() => setActiveTab('basics')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'basics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Academics & Bio
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'skills'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Skills ({formData.skills.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Projects ({formData.projects.length})
          </button>
          <button
            onClick={() => setActiveTab('certifications')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'certifications'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">College / University</label>
                  <input
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
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
                  <label className="block text-slate-300 font-semibold mb-1">Current CGPA (out of 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2026 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bio / Professional Headline</label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share a short summary of your technical interests..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {/* Add Skill Form */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-300">Add New Skill to Passport</p>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Docker, TypeScript, PyTorch, GraphQL..."
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Current Skills List */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Verified Skills in Passport ({formData.skills.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{skill.name}</span>
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {skill.level}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
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
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <p className="font-semibold text-slate-300">Add Technical Project</p>
                <div>
                  <input
                    type="text"
                    placeholder="Project Title (e.g. Distributed Cache Engine)"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Short description of technical architecture & impact..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Technologies comma separated (e.g. Go, Redis, Docker)"
                    value={newProjectTechs}
                    onChange={(e) => setNewProjectTechs(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddProject}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors shrink-0"
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
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-white">{proj.title}</h5>
                      <p className="text-slate-400 mt-0.5">{proj.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {proj.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProject(proj.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
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
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <p className="font-semibold text-slate-300">Add Industry Certification</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Certificate Title (e.g. AWS Certified Solutions Architect)"
                    value={newCertTitle}
                    onChange={(e) => setNewCertTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Issuer (e.g. Amazon Web Services, Google Cloud)"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleAddCert}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Certification</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.certifications.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-white">{c.title}</h5>
                      <p className="text-slate-400 text-[11px]">{c.issuer} • Issued {c.issueDate}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveCert(c.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
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
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Skill Passport</span>
          </button>
        </div>
      </div>
    </div>
  );
};

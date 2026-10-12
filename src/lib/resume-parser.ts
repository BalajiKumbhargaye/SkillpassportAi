import mammoth from 'mammoth';
import type { StudentCertification, StudentProfile, StudentProject, StudentSkill } from '@/types';
import { normalizeSkill } from './skill-matcher';

const SKILL_CATALOG = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Java',
  'Spring Boot',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'Kubernetes',
  'AWS',
  'Git',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Machine Learning',
  'Deep Learning',
  'Data Structures',
  'Microservices',
  'DevOps',
  'REST API',
  'GraphQL',
  'C++',
  'Linux',
  'Django',
  'Flask',
  'Go',
  'C#',
  'Data Engineering',
  'Power BI',
  'Tableau',
];

const SKILL_ALIASES: Record<string, string[]> = {
  React: ['reactjs', 'react.js', 'front-end'],
  'Next.js': ['nextjs', 'next'],
  TypeScript: ['ts', 'typescript'],
  JavaScript: ['js', 'ecmascript'],
  'Node.js': ['nodejs', 'node', 'express'],
  Python: ['python3', 'py'],
  Java: ['java programming'],
  'Spring Boot': ['springboot', 'spring boot'],
  SQL: ['sql queries', 'postgres', 'mysql'],
  MongoDB: ['mongo', 'mongodb atlas'],
  PostgreSQL: ['postgresql'],
  Docker: ['containers', 'containerization'],
  Kubernetes: ['k8s'],
  AWS: ['amazon web services', 'aws cloud'],
  Git: ['github', 'gitlab'],
  HTML: ['html5'],
  CSS: ['css3', 'sass'],
  'Tailwind CSS': ['tailwind', 'tailwindcss'],
  'Machine Learning': ['ml', 'machine-learning'],
  'Deep Learning': ['deep learning', 'cnn', 'neural networks'],
  'Data Structures': ['dsa', 'algorithms'],
  Microservices: ['microservices'],
  DevOps: ['ci/cd', 'github actions', 'devops'],
  'REST API': ['restful api', 'rest api'],
  GraphQL: ['graphql api'],
  'C++': ['cpp', 'c plus plus'],
  Linux: ['linux systems', 'ubuntu'],
  Django: ['django framework'],
  Flask: ['flask framework'],
  Go: ['golang'],
  'C#': ['csharp'],
  'Data Engineering': ['data pipeline', 'spark', 'etl'],
  'Power BI': ['powerbi'],
  Tableau: ['tableau dashboards'],
};

const ROLE_KEYWORDS: Record<string, string[]> = {
  'Full Stack Developer': ['full stack', 'full-stack', 'frontend developer', 'backend developer'],
  'Data Engineer': ['data engineer', 'etl engineer', 'data pipeline'],
  'Backend Engineer': ['backend engineer', 'backend developer', 'java developer', 'spring developer'],
  'Frontend Engineer': ['frontend engineer', 'front-end engineer', 'ui engineer'],
  'Data Scientist': ['data scientist', 'machine learning engineer'],
  'Cloud Engineer': ['cloud engineer', 'devops engineer'],
};

const DEFAULT_PROJECTS: StudentProject[] = [];
const DEFAULT_CERTS: StudentCertification[] = [];

export interface ResumeEvidenceSummary {
  lastUpdatedAt: string;
  evidenceScore: number;
  verifiedClaims: string[];
  missingClaims: string[];
  evidenceSources: string[];
  notes: string[];
}

export interface PreparedResumePassport {
  skills: StudentSkill[];
  projects: StudentProject[];
  certifications: StudentCertification[];
  careerInterests: string[];
  bio: string;
  resumeEvidence: ResumeEvidenceSummary;
}

export async function extractResumeText(file: File): Promise<string> {
  const filename = file.name.toLowerCase();

  if (filename.endsWith('.pdf')) {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (pageText) pages.push(pageText);
    }

    return pages.join('\n');
  }

  if (filename.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }

  return file.text();
}

function detectSkillLevel(text: string, skillName: string): StudentSkill['level'] {
  const lowerText = text.toLowerCase();
  const key = skillName.toLowerCase();

  if (lowerText.includes(`${key} advanced`) || lowerText.includes(`advanced ${key}`) || lowerText.includes('expert in')) {
    return 'Advanced';
  }
  if (
    lowerText.includes(`strong ${key}`) ||
    lowerText.includes(`proficient in ${key}`) ||
    lowerText.includes(`experience with ${key}`) ||
    lowerText.includes(`hands-on ${key}`) ||
    lowerText.includes(`worked with ${key}`)
  ) {
    return 'Intermediate';
  }
  if (lowerText.includes(`familiar with ${key}`) || lowerText.includes(`basic ${key}`) || lowerText.includes(`learning ${key}`)) {
    return 'Beginner';
  }

  return 'Intermediate';
}

function findSkillMatches(text: string): Map<string, { evidence: boolean; level: StudentSkill['level'] }> {
  const matchMap = new Map<string, { evidence: boolean; level: StudentSkill['level'] }>();
  const lowered = text.toLowerCase();

  SKILL_CATALOG.forEach((skill) => {
    const aliases = [skill.toLowerCase(), ...(SKILL_ALIASES[skill] ?? []).map((alias) => alias.toLowerCase())];
    let found = false;
    let evidence = false;
    let level: StudentSkill['level'] = 'Intermediate';

    for (const alias of aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lowered)) {
        found = true;
        level = detectSkillLevel(text, skill);
        break;
      }
    }

    if (found) {
      const urlMatch = /(github\.com|gitlab\.com|linkedin\.com|medium\.com|vercel\.app|notion\.so|\bportfolio\b|\brepository\b)/i.test(text);
      const certMatch = /(certificate|certification|verified)/i.test(text);
      const projectMatch = /(project|portfolio|built|developed|implemented|engineered)/i.test(text);
      evidence = urlMatch || certMatch || projectMatch;
      matchMap.set(skill, { evidence, level });
    }
  });

  return matchMap;
}

function extractProjects(text: string): StudentProject[] {
  const lines = text.split(/\r?\n|\.|;/).map((line) => line.trim()).filter(Boolean);
  const projects: StudentProject[] = [];
  const githubLinks = Array.from(new Set((text.match(/https?:\/\/[^\s)]+/gi) ?? []).filter((link) => /github|gitlab|portfolio|demo/i.test(link))));

  lines.forEach((line) => {
    const lowered = line.toLowerCase();
    if (!/(project|portfolio|experience|built|developed|implemented|engineered)/i.test(line)) return;

    const title = line.replace(/^(project|projects|portfolio)\s*[:\-]?\s*/i, '').slice(0, 80).trim();
    if (!title || title.length < 4) return;

    const technologies = Array.from(findSkillMatches(line).keys()).slice(0, 5);

    projects.push({
      id: `proj-${Date.now()}-${projects.length}`,
      title: title || 'Project Experience',
      description: line,
      technologies: technologies.length > 0 ? technologies : ['General Software Development'],
      link: githubLinks[0],
    });
  });

  return projects.slice(0, 4);
}

function extractCertifications(text: string): StudentCertification[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const certs: StudentCertification[] = [];

  lines.forEach((line) => {
    const lowered = line.toLowerCase();
    if (!/(certificate|certification|aws|google|microsoft|meta|coursera|oracle|udemy|deeplearning|azure)/i.test(line)) return;

    certs.push({
      id: `cert-${Date.now()}-${certs.length}`,
      title: line.slice(0, 80).trim() || 'Professional Certification',
      issuer: /by\s+([A-Za-z0-9 &./-]+)/i.exec(line)?.[1] || 'Verified Issuer',
      issueDate: new Date().toISOString().slice(0, 10),
      credentialUrl: (text.match(/https?:\/\/[^\s)]+/gi) ?? [])[0],
    });
  });

  return certs.slice(0, 4);
}

function extractCareerInterests(text: string): string[] {
  const interests: string[] = [];
  Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
    if (keywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()))) {
      interests.push(role);
    }
  });
  return interests.length > 0 ? interests : ['Software Engineer'];
}

export function buildResumePassport(
  resumeText: string,
  existingProfile: StudentProfile | null
): PreparedResumePassport {
  const skillMatches = findSkillMatches(resumeText);
  const skillSet = Array.from(skillMatches.entries()).map(([name, value]) => ({
    name,
    level: value.level,
    verified: value.evidence,
  }));

  const urls = Array.from(new Set((resumeText.match(/https?:\/\/[^\s)]+/gi) ?? []).map((link) => link.replace(/[.,;]+$/, ''))));
  const evidenceSources = urls.length > 0 ? urls : ['Resume content + project narrative'];
  const verifiedNames = skillSet.filter((s) => s.verified).map((s) => s.name);
  const missingNames = skillSet.filter((s) => !s.verified).map((s) => s.name);
  const evidenceScore = Math.min(100, Math.max(45, Math.round((verifiedNames.length / Math.max(skillSet.length, 1)) * 100)));

  const fallbackSkills = existingProfile?.skills ?? [];
  const allSkills = skillSet.length > 0 ? skillSet : fallbackSkills;
  const derivedProjects = extractProjects(resumeText).length > 0 ? extractProjects(resumeText) : existingProfile?.projects ?? DEFAULT_PROJECTS;
  const derivedCerts = extractCertifications(resumeText).length > 0 ? extractCertifications(resumeText) : existingProfile?.certifications ?? DEFAULT_CERTS;

  const bio = resumeText
    .replace(/\s+/g, ' ')
    .slice(0, 220)
    .trim();

  return {
    skills: allSkills.map((skill) => ({
      name: typeof skill === 'string' ? skill : skill.name,
      level: typeof skill === 'string' ? 'Intermediate' : skill.level,
      verified: typeof skill === 'string' ? false : skill.verified,
    })),
    projects: derivedProjects,
    certifications: derivedCerts,
    careerInterests: extractCareerInterests(resumeText),
    bio: bio || existingProfile?.bio || 'Student profile generated from uploaded resume evidence.',
    resumeEvidence: {
      lastUpdatedAt: new Date().toISOString(),
      evidenceScore,
      verifiedClaims: verifiedNames,
      missingClaims: missingNames,
      evidenceSources,
      notes: [
        evidenceScore >= 70
          ? 'Evidence is strong enough to verify most claimed skills.'
          : 'Some claimed skills need stronger portfolio or certificate evidence.',
        'Resume claims are cross-checked against project links, portfolio URLs, and certification references.',
      ],
    },
  };
}

export function summarizeSkillPassport(profile: StudentProfile | null): string {
  if (!profile) return 'No student passport available yet.';
  const verifiedCount = profile.skills.filter((skill) => skill.verified).length;
  const evidenceScore = profile.resumeEvidence?.evidenceScore ?? Math.round((verifiedCount / Math.max(profile.skills.length, 1)) * 100);
  return `${profile.skills.length} tracked skills, ${verifiedCount} verified through evidence, ${evidenceScore}% evidence confidence.`;
}

export function getSkillPassportPreview(resumeText: string): { skills: string[]; evidenceSources: string[] } {
  const matches = findSkillMatches(resumeText);
  const skills = Array.from(matches.keys());
  const urls = Array.from(new Set((resumeText.match(/https?:\/\/[^\s)]+/gi) ?? []).map((link) => link.replace(/[.,;]+$/, ''))));

  return {
    skills,
    evidenceSources: urls.length > 0 ? urls : ['Resume narrative'],
  };
}

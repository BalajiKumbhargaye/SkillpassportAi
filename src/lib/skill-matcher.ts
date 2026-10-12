import { StudentProfile, JobOpening, Course, SkillGapAnalysis, SkillLevel } from '@/types';

// Map of canonical skill names and their aliases
const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ['js', 'ecmascript', 'es6', 'vanilla js'],
  typescript: ['ts'],
  react: ['react.js', 'reactjs', 'react framework'],
  'next.js': ['nextjs', 'next'],
  'node.js': ['nodejs', 'node', 'express', 'express.js'],
  python: ['py', 'python3'],
  'machine learning': ['ml', 'scikit-learn', 'deep learning', 'pytorch', 'tensorflow'],
  sql: ['mysql', 'postgresql', 'postgres', 'sqlite', 'rdbms'],
  mongodb: ['mongo', 'nosql', 'documentdb'],
  docker: ['containerization', 'containers'],
  kubernetes: ['k8s', 'container orchestration'],
  aws: ['amazon web services', 'cloud computing', 's3', 'ec2'],
  git: ['github', 'version control', 'gitlab'],
  java: ['spring', 'springboot', 'spring boot', 'core java'],
  'c++': ['cpp', 'c plus plus'],
  html: ['html5'],
  css: ['css3', 'tailwind', 'tailwindcss', 'sass', 'scss'],
  figma: ['ui/ux', 'user interface design', 'prototyping'],
  'data structures': ['dsa', 'algorithms', 'data structures and algorithms'],
  graphql: ['apollo', 'graphql api'],
  'rest api': ['restful api', 'api design', 'rest APIs'],
  devops: ['ci/cd', 'github actions', 'jenkins', 'automation'],
};

// Normalize a skill string for comparison
export function normalizeSkill(skill: string): string {
  const cleaned = skill.toLowerCase().trim().replace(/[\-_]/g, ' ');
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (cleaned === canonical || aliases.includes(cleaned)) {
      return canonical;
    }
  }
  return cleaned;
}

// Check if two skills are considered equivalent or related
export function areSkillsMatching(skillA: string, skillB: string): { match: boolean; related: boolean } {
  const normA = normalizeSkill(skillA);
  const normB = normalizeSkill(skillB);

  if (normA === normB) {
    return { match: true, related: false };
  }

  // Check substring or word inclusion
  if (normA.includes(normB) || normB.includes(normA)) {
    return { match: true, related: true };
  }

  // Check alias overlap
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    const list = [canonical, ...aliases];
    if (list.includes(normA) && list.includes(normB)) {
      return { match: true, related: false };
    }
  }

  return { match: false, related: false };
}

// Core rule-based matching engine
export function analyzeSkillGap(
  student: StudentProfile,
  job: JobOpening,
  coursesCatalog: Course[] = []
): SkillGapAnalysis {
  const matchedSkills: { name: string; studentLevel: SkillLevel }[] = [];
  const partialSkills: { name: string; studentLevel: SkillLevel; requiredLevel?: string; reason: string }[] = [];
  const missingSkills: string[] = [];

  const studentSkillsMap = new Map<string, SkillLevel>();
  student.skills.forEach((s) => {
    studentSkillsMap.set(normalizeSkill(s.name), s.level);
  });

  job.requiredSkills.forEach((reqSkill) => {
    const normReq = normalizeSkill(reqSkill);
    let found = false;

    // Check direct or alias match
    for (const [studentNormSkill, level] of studentSkillsMap.entries()) {
      const matchResult = areSkillsMatching(studentNormSkill, normReq);
      if (matchResult.match) {
        found = true;
        if (level === 'Beginner') {
          // If student is beginner for a core requirement, classify as partial match
          partialSkills.push({
            name: reqSkill,
            studentLevel: level,
            requiredLevel: 'Intermediate/Advanced',
            reason: 'You have foundational knowledge, but production projects typically expect Intermediate+ proficiency.',
          });
        } else {
          matchedSkills.push({
            name: reqSkill,
            studentLevel: level,
          });
        }
        break;
      }
    }

    if (!found) {
      missingSkills.push(reqSkill);
    }
  });

  // Academic Eligibility
  const cgpaMet = student.cgpa >= job.minCgpa;
  const isDeptAllowed =
    job.departmentAllowed.includes('All') ||
    job.departmentAllowed.some((dept) => dept.toLowerCase() === student.department.toLowerCase());

  // Component 1: Skill Score (60 max)
  const totalRequired = Math.max(job.requiredSkills.length, 1);
  const matchedPoints = matchedSkills.length * 1.0;
  const partialPoints = partialSkills.length * 0.5;
  const skillRatio = (matchedPoints + partialPoints) / totalRequired;
  const skillsMatchScore = Math.min(Math.round(skillRatio * 60), 60);
  const skillsMatchPercentage = Math.round(skillRatio * 100);

  // Component 2: Academic Eligibility (20 max)
  let academicScore = 0;
  if (cgpaMet) academicScore += 12;
  else {
    // Pro-rated if close
    const diff = job.minCgpa - student.cgpa;
    if (diff <= 0.5) academicScore += 7;
  }
  if (isDeptAllowed) academicScore += 8;

  // Component 3: Project Experience Bonus (20 max)
  let projectBonus = 0;
  if (student.projects && student.projects.length > 0) {
    const projectTechs = student.projects.flatMap((p) => p.technologies.map(normalizeSkill));
    const relevantProjects = job.requiredSkills.filter((req) =>
      projectTechs.some((pt) => areSkillsMatching(pt, req).match)
    );
    // Base bonus for having projects + bonus for relevant projects
    projectBonus = Math.min(6 + relevantProjects.length * 5, 20);
  }

  // Final Overall Score (0 - 100)
  const overallScore = Math.min(100, Math.max(10, skillsMatchScore + academicScore + projectBonus));

  // Course Recommendations for missing or partial skills
  const skillsToLearn = [...missingSkills, ...partialSkills.map((p) => p.name)];
  const recommendedCourses = coursesCatalog
    .map((course) => {
      const coversCount = course.skillsCovered.filter((cs) =>
        skillsToLearn.some((sl) => areSkillsMatching(cs, sl).match)
      ).length;
      return { course, coversCount };
    })
    .filter((item) => item.coversCount > 0)
    .sort((a, b) => b.coversCount - a.coversCount || b.course.rating - a.course.rating)
    .map((item) => item.course)
    .slice(0, 4);

  // Key Strengths
  const keyStrengths: string[] = [];
  if (matchedSkills.length > 0) {
    keyStrengths.push(
      `Strong match in core stack: ${matchedSkills.slice(0, 3).map((s) => `${s.name} (${s.studentLevel})`).join(', ')}`
    );
  }
  if (cgpaMet) {
    keyStrengths.push(`Meets minimum academic threshold (CGPA ${student.cgpa.toFixed(2)} ≥ ${job.minCgpa})`);
  }
  if (student.projects.length >= 2) {
    keyStrengths.push(`Demonstrated hands-on experience with ${student.projects.length} relevant technical projects`);
  }

  // Growth Advice
  const growthAdvice: string[] = [];
  if (missingSkills.length > 0) {
    growthAdvice.push(`Focus on acquiring priority skills: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  if (partialSkills.length > 0) {
    growthAdvice.push(
      `Upgrade proficiency from Beginner to Intermediate for: ${partialSkills.map((p) => p.name).join(', ')} via practical projects`
    );
  }
  if (!cgpaMet) {
    growthAdvice.push(
      `Academic CGPA is slightly below preferred cutoff (${student.cgpa} vs ${job.minCgpa}); compensate by highlighting strong portfolio & certifications.`
    );
  }

  return {
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.companyName,
    overallScore,
    matchedSkills,
    partialSkills,
    missingSkills,
    academicEligibility: {
      cgpaMet,
      studentCgpa: student.cgpa,
      requiredCgpa: job.minCgpa,
      departmentMet: isDeptAllowed,
      studentDepartment: student.department,
      allowedDepartments: job.departmentAllowed,
    },
    scoreBreakdown: {
      skillsMatchPercentage,
      academicEligibilityScore: academicScore,
      projectBonusScore: projectBonus,
    },
    recommendedCourses,
    keyStrengths,
    growthAdvice,
    isPrivate: true,
  };
}

-- ====================================================================
-- SKILLPASSPORT AI: COLLEGE PLACEMENT & SKILL-GAP ANALYSIS PLATFORM
-- PostgreSQL Database Schema & Row-Level Security (RLS)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles Enum
CREATE TYPE user_role AS ENUM ('student', 'recruiter', 'training_institute', 'placement_cell');
CREATE TYPE app_status AS ENUM ('applied', 'under_review', 'shortlisted', 'interview_scheduled', 'offered', 'rejected');
CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');

-- 3. Profiles Table (extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college_name TEXT NOT NULL DEFAULT 'Engineering & Technology Institute',
  department TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  graduation_year INT NOT NULL,
  cgpa NUMERIC(4, 2) NOT NULL DEFAULT 7.5,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { name: string, level: string, verified: boolean }
  projects JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { id, title, description, technologies: string[], link }
  certifications JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { id, title, issuer, issueDate, credentialUrl }
  career_interests TEXT[] NOT NULL DEFAULT '{}',
  resume_url TEXT,
  bio TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recruiter_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  title TEXT NOT NULL,
  department_allowed TEXT[] NOT NULL DEFAULT '{"All"}',
  location TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Full-time',
  workplace_type TEXT NOT NULL DEFAULT 'On-site',
  salary_package TEXT NOT NULL,
  min_cgpa NUMERIC(4, 2) NOT NULL DEFAULT 6.0,
  required_skills TEXT[] NOT NULL,
  preferred_skills TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  deadline DATE NOT NULL,
  status job_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_department TEXT NOT NULL,
  student_cgpa NUMERIC(4, 2) NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  status app_status NOT NULL DEFAULT 'applied',
  readiness_score INT NOT NULL DEFAULT 50,
  interview_date TIMESTAMPTZ,
  feedback_notes TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, student_id)
);

-- 7. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills_covered TEXT[] NOT NULL,
  target_job_roles TEXT[] NOT NULL,
  duration_weeks INT NOT NULL DEFAULT 4,
  duration_hours INT NOT NULL DEFAULT 20,
  fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_certified BOOLEAN NOT NULL DEFAULT true,
  level TEXT NOT NULL DEFAULT 'Intermediate',
  enroll_url TEXT NOT NULL DEFAULT '#',
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.8,
  review_count INT NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Skill Gap Reports (Private to Student)
CREATE TABLE IF NOT EXISTS public.skill_gap_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  overall_score INT NOT NULL,
  matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  partial_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_skills TEXT[] NOT NULL DEFAULT '{}',
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_private BOOLEAN NOT NULL DEFAULT true, -- STRICT PRIVACY: Private to student
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gap_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, User can update own profile
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Student Profiles: Student can manage own profile; Placement cell can view all students
CREATE POLICY "Students can manage own student profile" 
  ON public.student_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Placement cell can view all student profiles"
  ON public.student_profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'placement_cell'));

-- Jobs: Everyone can view active jobs; Recruiters manage own jobs; Placement cell views all
CREATE POLICY "Active jobs viewable by authenticated users" 
  ON public.jobs FOR SELECT USING (status = 'active' OR auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert and manage their jobs" 
  ON public.jobs FOR ALL USING (auth.uid() = recruiter_id);

-- Applications:
-- Students can view their own applications
CREATE POLICY "Students can view and create their applications" 
  ON public.applications FOR ALL USING (auth.uid() = student_id);

-- Recruiters can view and update applications for jobs they posted
CREATE POLICY "Recruiters can view applications for their jobs" 
  ON public.applications FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()));

-- Placement cell can view all applications for analytics
CREATE POLICY "Placement cell can view all applications"
  ON public.applications FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'placement_cell'));

-- Courses: Everyone can view courses; Institutes can manage their courses
CREATE POLICY "Courses viewable by everyone" 
  ON public.courses FOR SELECT USING (true);

CREATE POLICY "Institutes can manage their courses" 
  ON public.courses FOR ALL USING (auth.uid() = institute_id);

-- Skill Gap Reports: STRICT PRIVACY!
-- Only the student who generated the report can read it!
CREATE POLICY "Skill gap reports are strictly private to student" 
  ON public.skill_gap_reports FOR ALL USING (auth.uid() = student_id);

-- ==============================================================================
-- KILIKORO PROTOCOL - SUPABASE DATABASE INITIALIZATION SCHEMA
-- Paste this into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wgcgkbftotnkkeyurttb/sql/new
-- ==============================================================================

-- 1. Profiles Table (Students & Employers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_role TEXT NOT NULL CHECK (user_role IN ('student', 'employer')),
  full_name TEXT NOT NULL,
  email TEXT,
  university TEXT,
  nacos_id TEXT UNIQUE,
  github_username TEXT,
  bmoni_wallet_address TEXT,
  bmoni_card_number TEXT,
  bmoni_card_cvv TEXT,
  bmoni_balance_usdc NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Candidate Audits Table
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_url TEXT NOT NULL,
  nacos_id TEXT,
  score INTEGER NOT NULL,
  security_status TEXT NOT NULL,
  production_readiness TEXT NOT NULL,
  error_handling_rating TEXT NOT NULL,
  summary TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  hygiene_flags JSONB DEFAULT '[]'::jsonb,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Milestone Contracts (Public Bounties & Private Direct Hires)
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('public', 'private')),
  sponsor TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_usdc NUMERIC(10, 2) NOT NULL,
  student_id TEXT,
  status TEXT NOT NULL DEFAULT 'Escrow Locked',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BMONI Settlements & Payouts Table
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash TEXT UNIQUE NOT NULL,
  attestation_id TEXT NOT NULL,
  contract_id TEXT,
  student_id TEXT NOT NULL,
  amount_usdc NUMERIC(10, 2) NOT NULL,
  latency_ms INTEGER DEFAULT 1800,
  status TEXT DEFAULT 'Settled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) with Public Read/Write for Anon Keys
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access via API
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Audits" ON public.audits FOR SELECT USING (true);
CREATE POLICY "Public Insert Audits" ON public.audits FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Contracts" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Public Insert Contracts" ON public.contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Contracts" ON public.contracts FOR UPDATE USING (true);

CREATE POLICY "Public Read Settlements" ON public.settlements FOR SELECT USING (true);
CREATE POLICY "Public Insert Settlements" ON public.settlements FOR INSERT WITH CHECK (true);


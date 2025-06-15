-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  meta_access_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Management
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  status TEXT CHECK(status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  objective TEXT NOT NULL,
  industry TEXT NOT NULL,
  target_audience TEXT,
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  
  -- Meta API Integration
  meta_campaign_id TEXT,
  meta_adset_id TEXT,
  meta_ad_id TEXT,
  meta_form_id TEXT,
  
  -- AI Generated Content
  ai_generated_content TEXT, -- JSON
  selected_content TEXT,     -- JSON
  
  -- Campaign Configuration
  targeting_config TEXT,     -- JSON Meta targeting parameters
  creative_config TEXT,      -- JSON creative settings
  
  -- Performance Metrics
  leads_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lead Management (Meta B2B Fields)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id),
  
  -- Meta Lead Form Fields
  email TEXT,
  phone TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  job_title TEXT,
  
  -- B2B Specific Fields
  company_size TEXT,
  industry TEXT,
  annual_revenue TEXT,
  years_of_experience TEXT,
  decision_maker_role TEXT,
  budget_range TEXT,
  timeline TEXT,
  
  -- Meta System Fields
  meta_lead_id TEXT UNIQUE,
  meta_form_id TEXT,
  meta_ad_id TEXT,
  meta_campaign_id TEXT,
  
  -- Enrichment & Scoring
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT CHECK(lead_status IN ('new', 'contacted', 'qualified', 'converted', 'lost')) DEFAULT 'new',
  
  -- Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Notes and Activities
  notes TEXT,
  last_contact_at DATETIME,
  next_follow_up DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Content & Assets
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id),
  content_type TEXT CHECK(content_type IN ('headline', 'description', 'email_subject', 'email_body', 'image_prompt', 'image_url')) NOT NULL,
  content TEXT NOT NULL,
  ai_provider TEXT CHECK(ai_provider IN ('cloudflare', 'openai', 'anthropic')) NOT NULL,
  model_used TEXT,
  prompt_used TEXT,
  performance_score DECIMAL(3,2), -- A/B testing results
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lead Activities/Touch Points
CREATE TABLE IF NOT EXISTS lead_activities (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES leads(id),
  activity_type TEXT CHECK(activity_type IN ('email_sent', 'email_opened', 'email_clicked', 'form_submitted', 'call_made', 'meeting_scheduled', 'demo_requested')) NOT NULL,
  activity_data TEXT, -- JSON
  performed_by TEXT, -- user_id or 'system'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_meta_lead_id ON leads(meta_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_ai_content_campaign_id ON ai_generated_content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
-- Seed data for B2B Lead Generation Platform

-- Insert demo user
INSERT OR IGNORE INTO users (id, email, name, company, created_at) VALUES 
('demo-user-id', 'demo@company.com', 'Demo User', 'Demo Company', CURRENT_TIMESTAMP);

-- Insert demo campaigns
INSERT OR IGNORE INTO campaigns (
  id, user_id, name, status, objective, industry, target_audience, budget, spent,
  leads_count, converted_count, ctr, conversion_rate, created_at, updated_at
) VALUES 
(
  'campaign-1', 'demo-user-id', 'Tech Leaders Q4 Outreach', 'active', 'lead_generation', 
  'technology', 'CTOs, IT Directors', 5000.00, 3200.00, 145, 23, 3.2, 15.9, 
  '2024-11-15 10:00:00', CURRENT_TIMESTAMP
),
(
  'campaign-2', 'demo-user-id', 'Healthcare Decision Makers', 'paused', 'brand_awareness', 
  'healthcare', 'Medical Directors, Hospital Administrators', 3000.00, 1800.00, 89, 12, 2.8, 13.5, 
  '2024-11-10 14:30:00', CURRENT_TIMESTAMP
),
(
  'campaign-3', 'demo-user-id', 'Financial Services CTO', 'active', 'conversions', 
  'finance', 'CTOs, Technology Leaders', 8000.00, 6200.00, 234, 45, 4.1, 19.2, 
  '2024-11-05 09:15:00', CURRENT_TIMESTAMP
),
(
  'campaign-4', 'demo-user-id', 'Manufacturing Leads', 'draft', 'lead_generation', 
  'manufacturing', 'Operations Directors, Plant Managers', 4500.00, 0.00, 0, 0, 0.0, 0.0, 
  '2024-11-20 16:45:00', CURRENT_TIMESTAMP
),
(
  'campaign-5', 'demo-user-id', 'SaaS Enterprise Outreach', 'active', 'lead_generation', 
  'technology', 'Enterprise Decision Makers', 6000.00, 4100.00, 167, 31, 3.8, 18.6, 
  '2024-11-08 11:20:00', CURRENT_TIMESTAMP
),
(
  'campaign-6', 'demo-user-id', 'Retail Innovation Campaign', 'active', 'brand_awareness', 
  'retail', 'Retail Technology Leaders', 3500.00, 2800.00, 98, 16, 2.9, 16.3, 
  '2024-11-12 13:10:00', CURRENT_TIMESTAMP
);

-- Insert demo leads
INSERT OR IGNORE INTO leads (
  id, campaign_id, email, phone, full_name, first_name, last_name, company_name, job_title,
  company_size, industry, annual_revenue, lead_score, lead_status, meta_lead_id, created_at
) VALUES 
-- Campaign 1 leads
(
  'lead-1', 'campaign-1', 'sarah.johnson@techcorp.com', '+1-555-0123', 'Sarah Johnson', 'Sarah', 'Johnson',
  'TechCorp', 'Chief Technology Officer', '201-1000 employees', 'Technology', '$50M-100M', 95, 'new', 
  'meta_lead_12345', '2024-11-21 10:30:00'
),
(
  'lead-2', 'campaign-1', 'm.chen@innovatelabs.com', '+1-555-0124', 'Mike Chen', 'Mike', 'Chen',
  'InnovateLabs', 'IT Director', '51-200 employees', 'Technology', '$10M-50M', 78, 'contacted', 
  'meta_lead_12346', '2024-11-21 09:15:00'
),
(
  'lead-3', 'campaign-1', 'david.brown@startuptech.com', '+1-555-0128', 'David Brown', 'David', 'Brown',
  'StartupTech', 'Technical Lead', '11-50 employees', 'Technology', '$1M-10M', 65, 'contacted', 
  'meta_lead_12350', '2024-11-21 08:45:00'
),
-- Campaign 3 leads
(
  'lead-4', 'campaign-3', 'lisa.davis@datasys.com', '+1-555-0125', 'Lisa Davis', 'Lisa', 'Davis',
  'DataSystems', 'VP Engineering', '1000+ employees', 'Technology', '$100M+', 85, 'qualified', 
  'meta_lead_12347', '2024-11-20 14:45:00'
),
(
  'lead-5', 'campaign-3', 'maria.garcia@fintech.com', '+1-555-0127', 'Maria Garcia', 'Maria', 'Garcia',
  'FinTech Innovations', 'CTO', '51-200 employees', 'Finance', '$25M-50M', 90, 'converted', 
  'meta_lead_12349', '2024-11-19 16:30:00'
),
(
  'lead-6', 'campaign-3', 'james.wilson@banktech.com', '+1-555-0131', 'James Wilson', 'James', 'Wilson',
  'BankTech Solutions', 'Head of Technology', '201-1000 employees', 'Finance', '$100M+', 88, 'qualified', 
  'meta_lead_12353', '2024-11-20 11:15:00'
),
-- Campaign 5 leads
(
  'lead-7', 'campaign-5', 'robert.kim@enterprise.com', '+1-555-0126', 'Robert Kim', 'Robert', 'Kim',
  'Enterprise Solutions', 'Director of Technology', '201-1000 employees', 'Technology', '$50M-100M', 72, 'new', 
  'meta_lead_12348', '2024-11-21 11:20:00'
),
(
  'lead-8', 'campaign-5', 'amanda.white@cloudtech.com', '+1-555-0132', 'Amanda White', 'Amanda', 'White',
  'CloudTech Corp', 'VP of Engineering', '1000+ employees', 'Technology', '$500M+', 92, 'qualified', 
  'meta_lead_12354', '2024-11-21 14:30:00'
),
-- Campaign 6 leads
(
  'lead-9', 'campaign-6', 'jennifer.white@retailcorp.com', '+1-555-0129', 'Jennifer White', 'Jennifer', 'White',
  'RetailCorp', 'Head of Digital Innovation', '1000+ employees', 'Retail', '$500M+', 88, 'qualified', 
  'meta_lead_12351', '2024-11-20 13:15:00'
),
-- Campaign 2 leads
(
  'lead-10', 'campaign-2', 'dr.michael.jones@healthsys.com', '+1-555-0130', 'Dr. Michael Jones', 'Michael', 'Jones',
  'HealthSystems', 'Medical Director', '201-1000 employees', 'Healthcare', '$100M+', 82, 'new', 
  'meta_lead_12352', '2024-11-21 12:00:00'
),
(
  'lead-11', 'campaign-2', 'susan.taylor@medtech.com', '+1-555-0133', 'Susan Taylor', 'Susan', 'Taylor',
  'MedTech Innovations', 'VP of Operations', '51-200 employees', 'Healthcare', '$25M-50M', 75, 'contacted', 
  'meta_lead_12355', '2024-11-20 16:45:00'
);

-- Insert AI generated content examples
INSERT OR IGNORE INTO ai_generated_content (
  id, campaign_id, content_type, content, ai_provider, model_used, is_active, created_at
) VALUES 
-- Campaign 1 content
(
  'content-1', 'campaign-1', 'headline', 'Transform Your Tech Infrastructure with AI-Powered Solutions', 'openai', 'gpt-4', true, CURRENT_TIMESTAMP
),
(
  'content-2', 'campaign-1', 'headline', 'Unlock Enterprise Growth with Cutting-Edge Technology Platform', 'anthropic', 'claude-3-sonnet', true, CURRENT_TIMESTAMP
),
(
  'content-3', 'campaign-1', 'description', 'Drive digital transformation and accelerate innovation with our enterprise-grade technology platform designed specifically for forward-thinking CTOs and IT leaders.', 'cloudflare', 'llama-2-7b', true, CURRENT_TIMESTAMP
),
-- Campaign 3 content
(
  'content-4', 'campaign-3', 'headline', 'Secure Financial Technology Solutions for Modern Enterprises', 'openai', 'gpt-4', true, CURRENT_TIMESTAMP
),
(
  'content-5', 'campaign-3', 'description', 'Revolutionize your financial operations with bank-grade security and enterprise scalability. Trusted by leading financial institutions worldwide.', 'anthropic', 'claude-3-sonnet', true, CURRENT_TIMESTAMP
),
-- Campaign 5 content
(
  'content-6', 'campaign-5', 'email_subject', 'Quick question about [Company]\'s enterprise technology stack', 'anthropic', 'claude-3-sonnet', true, CURRENT_TIMESTAMP
),
(
  'content-7', 'campaign-5', 'email_body', 'Hi [First Name],\n\nI noticed [Company] has been expanding rapidly in the [Industry] space. Many similar companies have been exploring ways to streamline their technology infrastructure to support this growth.\n\nOur platform has helped companies like yours reduce operational overhead by 40% while improving scalability. Would you be interested in a brief 15-minute call to discuss how this might apply to [Company]?\n\nBest regards,\n[Your Name]', 'openai', 'gpt-4', true, CURRENT_TIMESTAMP
),
-- Campaign 6 content
(
  'content-8', 'campaign-6', 'headline', 'Modernize Retail Operations with Smart Technology Solutions', 'cloudflare', 'llama-2-7b', true, CURRENT_TIMESTAMP
),
(
  'content-9', 'campaign-6', 'description', 'Transform customer experience and operational efficiency with AI-powered retail solutions. Join leading retailers already seeing 25% revenue growth.', 'openai', 'gpt-4', true, CURRENT_TIMESTAMP
);

-- Insert lead activities
INSERT OR IGNORE INTO lead_activities (
  id, lead_id, activity_type, activity_data, performed_by, created_at
) VALUES 
-- Lead 1 activities
(
  'activity-1', 'lead-1', 'form_submitted', '{"form_id": "meta_form_123", "source": "Meta Lead Ad", "campaign": "Tech Leaders Q4"}', 'system', '2024-11-21 10:30:00'
),
-- Lead 2 activities
(
  'activity-2', 'lead-2', 'form_submitted', '{"form_id": "meta_form_123", "source": "Meta Lead Ad"}', 'system', '2024-11-21 09:15:00'
),
(
  'activity-3', 'lead-2', 'email_sent', '{"subject": "Welcome to our platform", "template": "welcome_email"}', 'system', '2024-11-21 09:16:00'
),
(
  'activity-4', 'lead-2', 'email_opened', '{"email_id": "email_123", "opened_at": "2024-11-21 09:45:00"}', 'system', '2024-11-21 09:45:00'
),
-- Lead 4 activities
(
  'activity-5', 'lead-4', 'form_submitted', '{"form_id": "meta_form_456", "source": "Meta Lead Ad"}', 'system', '2024-11-20 14:45:00'
),
(
  'activity-6', 'lead-4', 'call_made', '{"duration": "15 minutes", "outcome": "interested", "next_steps": "demo_scheduled"}', 'demo-user-id', '2024-11-20 15:30:00'
),
-- Lead 5 activities (converted)
(
  'activity-7', 'lead-5', 'form_submitted', '{"form_id": "meta_form_456", "source": "Meta Lead Ad"}', 'system', '2024-11-19 16:30:00'
),
(
  'activity-8', 'lead-5', 'demo_requested', '{"demo_type": "technical", "preferred_date": "2024-11-25"}', 'system', '2024-11-19 16:35:00'
),
(
  'activity-9', 'lead-5', 'call_made', '{"duration": "45 minutes", "outcome": "converted", "deal_value": "50000"}', 'demo-user-id', '2024-11-20 10:00:00'
),
-- Lead 9 activities
(
  'activity-10', 'lead-9', 'form_submitted', '{"form_id": "meta_form_789", "source": "Meta Lead Ad"}', 'system', '2024-11-20 13:15:00'
),
(
  'activity-11', 'lead-9', 'meeting_scheduled', '{"meeting_date": "2024-11-22 14:00:00", "meeting_type": "discovery_call"}', 'demo-user-id', '2024-11-20 13:20:00'
),
-- Lead 8 activities
(
  'activity-12', 'lead-8', 'form_submitted', '{"form_id": "meta_form_101", "source": "Meta Lead Ad"}', 'system', '2024-11-21 14:30:00'
),
(
  'activity-13', 'lead-8', 'email_sent', '{"subject": "Enterprise solutions demo", "template": "enterprise_demo"}', 'system', '2024-11-21 14:35:00'
);

-- Update campaign lead counts to match actual leads
UPDATE campaigns SET 
  leads_count = (SELECT COUNT(*) FROM leads WHERE leads.campaign_id = campaigns.id),
  converted_count = (SELECT COUNT(*) FROM leads WHERE leads.campaign_id = campaigns.id AND leads.lead_status = 'converted')
WHERE id IN ('campaign-1', 'campaign-2', 'campaign-3', 'campaign-4', 'campaign-5', 'campaign-6');
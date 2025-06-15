import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';

// Types
interface Env {
  DB: D1Database;
  AI: any;
  META_ACCESS_TOKEN: string;
  META_AD_ACCOUNT_ID: string;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
  ASSETS: Fetcher;
}

interface Campaign {
  id: string;
  user_id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  objective: string;
  industry: string;
  target_audience: string;
  budget: number;
  spent: number;
  meta_campaign_id?: string;
  leads_count: number;
  converted_count: number;
  ctr: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: string;
  campaign_id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  company_name?: string;
  job_title?: string;
  company_size?: string;
  industry?: string;
  annual_revenue?: string;
  lead_score: number;
  lead_status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  meta_lead_id?: string;
  created_at: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: (origin) => origin,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Utility functions
function generateId(): string {
  return crypto.randomUUID();
}

async function calculateLeadScore(lead: any): Promise<number> {
  let score = 50; // Base score
  
  // Company size scoring
  if (lead.company_size === '1000+ employees') score += 30;
  else if (lead.company_size === '201-1000 employees') score += 20;
  else if (lead.company_size === '51-200 employees') score += 10;
  
  // Revenue scoring
  if (lead.annual_revenue === '$100M+') score += 25;
  else if (lead.annual_revenue === '$50M-100M') score += 20;
  else if (lead.annual_revenue === '$10M-50M') score += 15;
  
  // Job title scoring
  if (lead.job_title?.toLowerCase().includes('cto') || 
      lead.job_title?.toLowerCase().includes('vp') ||
      lead.job_title?.toLowerCase().includes('director')) {
    score += 15;
  }
  
  return Math.min(100, Math.max(0, score));
}

// Authentication routes
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  
  // Simple auth for demo - replace with proper auth
  if (email && password) {
    const user = {
      id: generateId(),
      email,
      name: 'Demo User',
      company: 'Demo Company'
    };
    
    const token = 'demo-token-' + Date.now(); // Simplified - use proper JWT signing
    
    return c.json({ success: true, user, token });
  }
  
  return c.json({ error: 'Invalid credentials' }, 401);
});

// Campaign routes
app.get('/api/campaigns', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM campaigns 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind('demo-user-id').all();
    
    return c.json(results || []);
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch campaigns' }, 500);
  }
});

app.post('/api/campaigns', async (c) => {
  try {
    const campaignData = await c.req.json();
    const id = generateId();
    
    await c.env.DB.prepare(`
      INSERT INTO campaigns (
        id, user_id, name, objective, industry, target_audience, budget, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
    `).bind(
      id,
      'demo-user-id',
      campaignData.name,
      campaignData.objective,
      campaignData.industry,
      campaignData.targetAudience,
      campaignData.budget
    ).run();
    
    const campaign = await c.env.DB.prepare('SELECT * FROM campaigns WHERE id = ?').bind(id).first();
    return c.json(campaign);
  } catch (error) {
    console.error('Campaign creation error:', error);
    return c.json({ error: 'Failed to create campaign' }, 500);
  }
});

app.get('/api/campaigns/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const campaign = await c.env.DB.prepare('SELECT * FROM campaigns WHERE id = ?').bind(id).first();
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }
    
    return c.json(campaign);
  } catch (error) {
    return c.json({ error: 'Failed to fetch campaign' }, 500);
  }
});

// AI Content Generation
app.post('/api/ai/generate/headlines', async (c) => {
  try {
    const { industry, targetAudience, objective } = await c.req.json();
    
    const prompt = `Create 3 compelling B2B ad headlines for ${industry} companies targeting ${targetAudience} with the objective of ${objective}. Make them professional and conversion-focused. Return only the headlines, one per line.`;
    
    let headlines = [];
    
    try {
      // Try Cloudflare AI first
      const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [{ role: 'user', content: prompt }]
      });
      headlines = response.response.split('\n').filter(h => h.trim()).slice(0, 3);
    } catch (cfError) {
      console.log('Cloudflare AI failed, trying OpenAI:', cfError);
      
      // Fallback to OpenAI
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200
        })
      });
      
      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json();
        headlines = openaiData.choices[0].message.content.split('\n').filter(h => h.trim()).slice(0, 3);
      } else {
        // Fallback headlines
        headlines = [
          `Transform Your ${industry} Operations with AI-Powered Solutions`,
          `Accelerate ${industry} Growth with Advanced Technology Platform`,
          `Drive ${industry} Innovation: Join Leading Companies Using Our Platform`
        ];
      }
    }
    
    return c.json({ headlines });
  } catch (error) {
    console.error('AI generation error:', error);
    return c.json({ error: 'Failed to generate headlines' }, 500);
  }
});

app.post('/api/ai/generate/descriptions', async (c) => {
  try {
    const { industry, targetAudience, objective } = await c.req.json();
    
    const descriptions = [
      `Transform your ${industry} operations with cutting-edge solutions designed for ${targetAudience}. Drive growth and efficiency with our proven platform.`,
      `Join leading ${industry} companies who trust our platform to achieve their ${objective} goals. See measurable results in 30 days.`,
      `Unlock your ${industry} potential with AI-powered tools built specifically for ${targetAudience}. Start your transformation today.`
    ];
    
    return c.json({ descriptions });
  } catch (error) {
    return c.json({ error: 'Failed to generate descriptions' }, 500);
  }
});

app.post('/api/ai/generate/images', async (c) => {
  try {
    // Return professional stock images for demo
    const images = [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop'
    ];
    
    return c.json({ images });
  } catch (error) {
    return c.json({ error: 'Failed to generate images' }, 500);
  }
});

// Lead Management
app.get('/api/campaigns/:id/leads', async (c) => {
  try {
    const campaignId = c.req.param('id');
    
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM leads 
      WHERE campaign_id = ? 
      ORDER BY created_at DESC
    `).bind(campaignId).all();
    
    return c.json(results || []);
  } catch (error) {
    return c.json({ error: 'Failed to fetch leads' }, 500);
  }
});

app.put('/api/leads/:id/status', async (c) => {
  try {
    const leadId = c.req.param('id');
    const { status } = await c.req.json();
    
    await c.env.DB.prepare(`
      UPDATE leads 
      SET lead_status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(status, leadId).run();
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to update lead status' }, 500);
  }
});

// Meta Integration
app.post('/api/meta/campaigns/create', async (c) => {
  try {
    const { campaignId, campaignData } = await c.req.json();
    
    // Create campaign in Meta
    const metaResponse = await fetch(`https://graph.facebook.com/v18.0/act_${c.env.META_AD_ACCOUNT_ID}/campaigns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: campaignData.name,
        objective: 'LEAD_GENERATION',
        status: 'PAUSED',
        special_ad_categories: ['EMPLOYMENT']
      })
    });
    
    const metaCampaign = await metaResponse.json();
    
    if (metaCampaign.id) {
      // Update campaign with Meta ID
      await c.env.DB.prepare(
        'UPDATE campaigns SET meta_campaign_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(metaCampaign.id, campaignId).run();
      
      return c.json({ success: true, meta_campaign_id: metaCampaign.id });
    } else {
      return c.json({ error: 'Failed to create Meta campaign', details: metaCampaign }, 400);
    }
  } catch (error) {
    return c.json({ error: 'Meta API error', details: error.message }, 500);
  }
});

// Meta Webhook Handler
app.post('/api/meta/webhooks/leads', async (c) => {
  try {
    const webhookData = await c.req.json();
    
    if (webhookData.object === 'page' && webhookData.entry?.[0]?.changes?.[0]?.value?.leadgen_id) {
      const leadgenId = webhookData.entry[0].changes[0].value.leadgen_id;
      
      // Fetch lead details from Meta
      const leadResponse = await fetch(`https://graph.facebook.com/v18.0/${leadgenId}`, {
        headers: {
          'Authorization': `Bearer ${c.env.META_ACCESS_TOKEN}`
        }
      });
      
      const leadDetails = await leadResponse.json();
      
      // Extract field data
      const fieldData: any = {};
      leadDetails.field_data?.forEach((field: any) => {
        fieldData[field.name] = field.values?.[0] || null;
      });
      
      // Calculate lead score
      const leadScore = await calculateLeadScore(fieldData);
      
      // Find campaign by Meta ad ID
      const campaign = await c.env.DB.prepare(
        'SELECT id FROM campaigns WHERE meta_ad_id = ?'
      ).bind(leadDetails.ad_id).first();
      
      if (campaign) {
        // Store lead in database
        const leadId = generateId();
        await c.env.DB.prepare(`
          INSERT INTO leads (
            id, campaign_id, meta_lead_id, meta_form_id, meta_ad_id,
            email, phone, full_name, first_name, last_name, company_name, job_title,
            company_size, industry, annual_revenue, lead_score, lead_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
        `).bind(
          leadId,
          campaign.id,
          leadgenId,
          leadDetails.form_id,
          leadDetails.ad_id,
          fieldData.email,
          fieldData.phone,
          fieldData.full_name,
          fieldData.first_name,
          fieldData.last_name,
          fieldData.company_name,
          fieldData.job_title,
          fieldData.company_size,
          fieldData.industry,
          fieldData.annual_revenue,
          leadScore
        ).run();
        
        // Update campaign lead count
        await c.env.DB.prepare(`
          UPDATE campaigns 
          SET leads_count = leads_count + 1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(campaign.id).run();
      }
    }
    
    return c.text('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    return c.text('OK'); // Always return OK to Meta
  }
});

// Webhook verification for Meta
app.get('/api/meta/webhooks/leads', async (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');
  
  if (mode === 'subscribe' && token === 'your-verify-token') {
    return c.text(challenge);
  }
  
  return c.text('Forbidden', 403);
});

// Dashboard stats
app.get('/api/dashboard/stats', async (c) => {
  try {
    const [campaignsResult, leadsResult, spentResult] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as count, status FROM campaigns WHERE user_id = ? GROUP BY status').bind('demo-user-id').all(),
      c.env.DB.prepare('SELECT COUNT(*) as count, lead_status FROM leads WHERE campaign_id IN (SELECT id FROM campaigns WHERE user_id = ?) GROUP BY lead_status').bind('demo-user-id').all(),
      c.env.DB.prepare('SELECT SUM(spent) as total FROM campaigns WHERE user_id = ?').bind('demo-user-id').first()
    ]);
    
    return c.json({
      campaigns: campaignsResult.results || [],
      leads: leadsResult.results || [],
      totalSpent: spentResult?.total || 0
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
  }
});

// Serve static assets
app.get('*', serveStatic({
  root: './',
  manifest: undefined,
}));

export default app;
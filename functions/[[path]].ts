import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

interface Env {
  DB: D1Database;
  AI: any;
  META_ACCESS_TOKEN: string;
  META_AD_ACCOUNT_ID: string;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// Helper function
function generateId(): string {
  return crypto.randomUUID();
}

// API Routes
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
        id, user_id, name, objective, industry, target_audience, budget, status, 
        leads_count, converted_count, spent, ctr, conversion_rate, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 0, 0, 0, 0, 0, datetime('now'), datetime('now'))
    `).bind(
      id,
      'demo-user-id',
      campaignData.name,
      campaignData.objective,
      campaignData.industry,
      campaignData.targetAudience,
      parseInt(campaignData.budget) || 0
    ).run();
    
    const campaign = await c.env.DB.prepare('SELECT * FROM campaigns WHERE id = ?').bind(id).first();
    return c.json(campaign);
  } catch (error) {
    console.error('Campaign creation error:', error);
    return c.json({ error: 'Failed to create campaign' }, 500);
  }
});

app.get('/api/campaigns/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const campaign = await c.env.DB.prepare('SELECT * FROM campaigns WHERE id = ?').bind(id).first();
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }
    return c.json(campaign);
  } catch (error) {
    return c.json({ error: 'Database error' }, 500);
  }
});

app.get('/api/campaigns/:id/leads', async (c) => {
  const id = c.req.param('id');
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM leads WHERE campaign_id = ? ORDER BY created_at DESC
    `).bind(id).all();
    return c.json(results || []);
  } catch (error) {
    return c.json({ error: 'Database error' }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (email && password) {
      const user = {
        id: generateId(),
        email,
        name: 'Demo User',
        company: 'Demo Company'
      };
      
      const token = 'demo-token-' + Date.now();
      
      return c.json({ success: true, user, token });
    }
    
    return c.json({ error: 'Invalid credentials' }, 401);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// AI Generation Routes (stub implementations)
app.post('/api/ai/generate/headlines', async (c) => {
  const { industry, targetAudience, objective } = await c.req.json();
  
  return c.json({
    headlines: [
      `Transform Your ${industry} Business with AI-Powered Lead Generation`,
      `Unlock Hidden Revenue: Advanced ${industry} Marketing Automation`,
      `Scale Your ${industry} Sales with Intelligent Lead Scoring`,
      `${targetAudience}: Accelerate Growth with Smart B2B Solutions`
    ]
  });
});

app.post('/api/ai/generate/descriptions', async (c) => {
  const { industry, targetAudience, objective } = await c.req.json();
  
  return c.json({
    descriptions: [
      `Drive qualified ${industry} leads and accelerate your sales cycle with our AI-powered B2B marketing platform designed for ${targetAudience}.`,
      `Leverage advanced analytics and machine learning to identify high-value ${industry} prospects and optimize your marketing spend for maximum ROI.`,
      `Transform your ${industry} lead generation strategy with intelligent automation that learns and adapts to your industry's unique patterns.`,
      `Connect with ${targetAudience} more effectively using data-driven insights and personalized outreach campaigns.`
    ]
  });
});

app.post('/api/ai/generate/images', async (c) => {
  return c.json({
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop", 
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop"
    ]
  });
});

// Handle all other routes (React Router frontend)
app.get('*', async (c) => {
  // Let React Router handle frontend routes
  return c.env.ASSETS.fetch(c.req.raw);
});

// Export the handler for Cloudflare Pages Functions
export const onRequest = handle(app);

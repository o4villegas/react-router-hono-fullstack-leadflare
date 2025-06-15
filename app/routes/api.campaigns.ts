import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

interface Env {
  DB: D1Database;
  AI: any;
  META_ACCESS_TOKEN: string;
  META_AD_ACCOUNT_ID: string;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
}

function generateId(): string {
  return crypto.randomUUID();
}

// GET /api/campaigns
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as Env;
  
  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM campaigns 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind('demo-user-id').all();
    
    return Response.json(results || []);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

// POST /api/campaigns
export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env as Env;
  
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const campaignData = await request.json();
    const id = generateId();
    
    await env.DB.prepare(`
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
    
    const campaign = await env.DB.prepare('SELECT * FROM campaigns WHERE id = ?').bind(id).first();
    return Response.json(campaign);
  } catch (error) {
    console.error('Campaign creation error:', error);
    return Response.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

import type { ActionFunctionArgs } from "react-router";

function generateId(): string {
  return crypto.randomUUID();
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, password } = await request.json();
    
    // Simple auth for demo - replace with proper auth
    if (email && password) {
      const user = {
        id: generateId(),
        email,
        name: 'Demo User',
        company: 'Demo Company'
      };
      
      const token = 'demo-token-' + Date.now(); // Simplified - use proper JWT signing
      
      return Response.json({ success: true, user, token });
    }
    
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}

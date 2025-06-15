import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Frontend routes
  index("routes/_index.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("campaign-wizard", "routes/campaign-wizard.tsx"),
  route("campaign/:id", "routes/campaign.$id.tsx"),
  
  // API routes (handled by Hono in the Worker)
  route("api/campaigns", "routes/api.campaigns.ts"),
  route("api/campaigns/:id", "routes/api.campaigns.ts"),
  route("api/campaigns/:id/leads", "routes/api.campaigns.ts"),
  route("api/auth/login", "routes/api.auth.login.ts"),
] satisfies RouteConfig;

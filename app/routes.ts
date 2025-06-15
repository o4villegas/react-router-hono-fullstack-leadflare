import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Frontend routes only - API routes handled by Hono
  index("routes/_index.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("campaign-wizard", "routes/campaign-wizard.tsx"),
  route("campaign/:id", "routes/campaign.$id.tsx"),
] satisfies RouteConfig;

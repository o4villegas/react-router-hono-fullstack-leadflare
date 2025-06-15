import { redirect } from "react-router";
import type { Route } from "./+types/_index";

export function loader({ request }: Route.LoaderArgs) {
  // Redirect home page to dashboard
  return redirect("/dashboard");
}
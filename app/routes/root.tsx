import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { Bell, Settings } from "lucide-react";

import "./app.css";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "MarketingAI - B2B Lead Generation Platform" },
    { name: "description", content: "AI-powered B2B marketing automation and lead management with Meta integration" },
  ];
};

export async function loader({ context }: Route.LoaderArgs) {
  return {
    user: {
      name: "Demo User",
      company: "Demo Company"
    }
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-900">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-green-400">MarketingAI</h1>
              </div>
              <div className="ml-10 flex items-baseline space-x-8">
                <a 
                  href="/dashboard" 
                  className="text-green-400 bg-green-500/20 px-3 py-2 text-sm font-medium rounded-md"
                >
                  Dashboard
                </a>
                <a 
                  href="/analytics" 
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Analytics
                </a>
                <a 
                  href="/templates" 
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Templates
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 hidden md:block">
                {user.name} @ {user.company}
              </div>
              <button className="p-2 text-gray-400 hover:text-green-400">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-green-400">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-400 mb-6">We're having trouble loading this page.</p>
        <a 
          href="/dashboard" 
          className="bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-400 font-medium"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
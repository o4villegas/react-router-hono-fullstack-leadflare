import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/campaign.$id";
import { 
  Users, 
  Mail, 
  Activity, 
  Clock, 
  Edit,
  Play,
  Pause,
  TrendingUp,
  DollarSign,
  Target,
  MoreHorizontal
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  objective: string;
  industry: string;
  target_audience: string;
  budget: number;
  spent: number;
  leads_count: number;
  converted_count: number;
  ctr: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  company_name?: string;
  job_title?: string;
  company_size?: string;
  annual_revenue?: string;
  lead_score: number;
  lead_status: string;
  created_at: string;
}

export async function loader({ params, context }: Route.LoaderArgs) {
  try {
    const [campaignResponse, leadsResponse] = await Promise.all([
      fetch(`${context.cloudflare.env.API_URL || ''}/api/campaigns/${params.id}`),
      fetch(`${context.cloudflare.env.API_URL || ''}/api/campaigns/${params.id}/leads`)
    ]);
    
    const campaign = campaignResponse.ok ? await campaignResponse.json() : null;
    const leads = leadsResponse.ok ? await leadsResponse.json() : [];
    
    if (!campaign) {
      throw new Response("Campaign not found", { status: 404 });
    }
    
    return { campaign, leads };
  } catch (error) {
    throw new Response("Campaign not found", { status: 404 });
  }
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Active' },
    paused: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Paused' },
    draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Draft' },
    completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Completed' }
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

export default function CampaignDetail() {
  const { campaign, leads } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to="/dashboard"
            className="text-green-400 hover:text-green-300 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <StatusBadge status={campaign.status} />
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">{campaign.industry}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">Created {new Date(campaign.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 font-medium flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>AI Outreach</span>
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Total Leads</h3>
              <p className="text-3xl font-bold text-white">{campaign.leads_count}</p>
              <p className="text-sm text-green-400 mt-2">↗ {leads.filter((l: Lead) => {
                const today = new Date();
                const leadDate = new Date(l.created_at);
                const diffTime = Math.abs(today.getTime() - leadDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length} this week</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Converted</h3>
              <p className="text-3xl font-bold text-green-400">{campaign.converted_count}</p>
              <p className="text-sm text-green-400 mt-2">↗ {leads.filter((l: Lead) => l.lead_status === 'converted').length} total</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Conversion Rate</h3>
              <p className="text-3xl font-bold text-green-400">{campaign.conversion_rate}%</p>
              <p className="text-sm text-green-400 mt-2">↗ Above average</p>
            </div>
            <Target className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Spent / Budget</h3>
              <p className="text-3xl font-bold text-white">${campaign.spent.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-2">of ${campaign.budget.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Lead Pipeline */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Users className="w-6 h-6 mr-2 text-green-400" />
                Lead Pipeline
                <span className="ml-3 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                  {leads.length} Total
                </span>
              </h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded border border-blue-500/30 hover:bg-blue-500/30">
                  Export CSV
                </button>
                <button className="px-3 py-1 bg-green-500 text-black text-sm rounded hover:bg-green-400 font-medium">
                  AI Score All
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {leads.map((lead: Lead) => (
                <div key={lead.id} className="p-4 bg-gray-700/30 border border-gray-600/50 rounded-lg hover:bg-gray-700/50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
                        <span className="text-green-400 font-semibold text-lg">
                          {lead.full_name ? lead.full_name.charAt(0) : 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-white">{lead.full_name || 'Unknown'}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${
                            lead.lead_score >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            lead.lead_score >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            Score: {lead.lead_score}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${
                            lead.lead_status === 'converted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            lead.lead_status === 'qualified' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            lead.lead_status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {lead.lead_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">
                          {lead.job_title} at {lead.company_name}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 mb-3">
                          <div>
                            <Mail className="w-3 h-3 inline mr-1" />
                            {lead.email || 'No email'}
                          </div>
                          <div>
                            <span className="font-medium">Company Size:</span> {lead.company_size || 'Unknown'}
                          </div>
                          <div>
                            📞 {lead.phone || 'No phone'}
                          </div>
                          <div>
                            <span className="font-medium">Revenue:</span> {lead.annual_revenue || 'Unknown'}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Created: {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30 hover:bg-blue-500/30">
                        View Profile
                      </button>
                      <button className="px-3 py-1 bg-green-500 text-black text-xs rounded hover:bg-green-400 font-medium">
                        AI Outreach
                      </button>
                      <button className="p-1 text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {leads.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No leads yet</h3>
                  <p className="text-gray-400">Leads will appear here once your campaign is active</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Campaign Settings */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Campaign Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Objective</label>
                <p className="text-white">{campaign.objective.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Target Audience</label>
                <p className="text-white">{campaign.target_audience}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Budget</label>
                <p className="text-white">${campaign.budget.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">CTR</label>
                <p className="text-white">{campaign.ctr}%</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {campaign.status === 'active' ? (
                <button className="w-full px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 flex items-center justify-center space-x-2">
                  <Pause className="w-4 h-4" />
                  <span>Pause Campaign</span>
                </button>
              ) : (
                <button className="w-full px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 font-medium flex items-center justify-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Activate Campaign</span>
                </button>
              )}
              
              <button className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Bulk Lead Actions</span>
              </button>
              
              <button className="w-full px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 flex items-center justify-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Campaign Not Found</h1>
        <p className="text-gray-400 mb-6">The campaign you're looking for doesn't exist or has been deleted.</p>
        <Link 
          to="/dashboard" 
          className="bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-400 font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
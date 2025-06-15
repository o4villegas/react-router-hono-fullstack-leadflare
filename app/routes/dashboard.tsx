import { useState, useEffect } from "react";
import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { 
  Users, 
  TrendingUp, 
  Search,
  Filter,
  Target,
  DollarSign,
  Activity,
  Grid3X3,
  List,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreHorizontal,
  Play,
  Pause
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

export async function loader({ context }: Route.LoaderArgs) {
  try {
    // Fetch campaigns from API
    const response = await fetch(`${context.cloudflare.env.API_URL || ''}/api/campaigns`);
    const campaigns = response.ok ? await response.json() : [];
    
    return {
      campaigns: campaigns || [],
      stats: {
        totalLeads: campaigns.reduce((sum: number, c: Campaign) => sum + c.leads_count, 0),
        totalConverted: campaigns.reduce((sum: number, c: Campaign) => sum + c.converted_count, 0),
        totalSpent: campaigns.reduce((sum: number, c: Campaign) => sum + c.spent, 0),
        activeCampaigns: campaigns.filter((c: Campaign) => c.status === 'active').length
      }
    };
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return {
      campaigns: [],
      stats: {
        totalLeads: 0,
        totalConverted: 0,
        totalSpent: 0,
        activeCampaigns: 0
      }
    };
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

const TrendIcon = ({ trend, growth }: { trend: string; growth: string }) => {
  if (trend === 'up') {
    return <ArrowUpRight className="w-4 h-4 text-green-400" />;
  } else if (trend === 'down') {
    return <ArrowDownRight className="w-4 h-4 text-red-400" />;
  }
  return <div className="w-4 h-4" />;
};

const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 hover:border-green-500/30 transition-all duration-200 group">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-start space-x-3 flex-1">
        <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate group-hover:text-green-400 transition-colors">{campaign.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-gray-400">{campaign.industry}</p>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <StatusBadge status={campaign.status} />
          </div>
        </div>
      </div>
      <button className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>
    </div>

    <div className="grid grid-cols-4 gap-3 mb-3">
      <div className="text-center">
        <p className="text-xl font-bold text-white">{campaign.leads_count}</p>
        <p className="text-xs text-gray-400">Leads</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-green-400">{campaign.converted_count}</p>
        <p className="text-xs text-gray-400">Converted</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-white">{campaign.conversion_rate}%</p>
        <p className="text-xs text-gray-400">CVR</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-white">${(campaign.spent/1000).toFixed(1)}k</p>
        <p className="text-xs text-gray-400">Spent</p>
      </div>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-400">ID: {campaign.id.slice(0, 8)}</span>
      </div>
      <div className="flex space-x-1">
        <Link 
          to={`/campaign/${campaign.id}`}
          className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30 border border-green-500/30"
        >
          Manage
        </Link>
        {campaign.status === 'active' ? (
          <button className="p-1 text-gray-400 hover:text-red-400">
            <Pause className="w-3 h-3" />
          </button>
        ) : (
          <button className="p-1 text-gray-400 hover:text-green-400">
            <Play className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { campaigns, stats } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaign Dashboard</h1>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-gray-400">AI-powered B2B marketing automation and lead management</p>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Meta Webhooks Active</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-400">AI Providers Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gray-800/50 border border-gray-700/50 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">Today:</span>
              <span className="text-white font-medium">+23 leads</span>
              <span className="text-green-400">+5 converted</span>
            </div>
          </div>
          <Link 
            to="/campaign-wizard"
            className="bg-green-500 text-black px-6 py-3 rounded-lg hover:bg-green-400 flex items-center space-x-2 font-medium shadow-lg shadow-green-500/25"
          >
            <Sparkles className="w-5 h-5" />
            <span>AI Campaign</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Leads</p>
              <p className="text-2xl font-bold text-white">{stats.totalLeads.toLocaleString()}</p>
              <p className="text-sm text-green-400 mt-1">↗ 12% vs last month</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Converted</p>
              <p className="text-2xl font-bold text-white">{stats.totalConverted}</p>
              <p className="text-sm text-green-400 mt-1">↗ 8% vs last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-white">${stats.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-red-400 mt-1">↗ 15% vs last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Campaigns</p>
              <p className="text-2xl font-bold text-white">{stats.activeCampaigns}</p>
              <p className="text-sm text-green-400 mt-1">of {campaigns.length} total</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-1 relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
          <button className="p-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 text-gray-400">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-sm text-gray-400">View:</span>
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredCampaigns.map((campaign: Campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Campaign</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Leads</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Converted</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Spend</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign: Campaign) => (
                <tr key={campaign.id} className="border-b border-gray-700/50 hover:bg-gray-800/30 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm group-hover:text-green-400 transition-colors">{campaign.name}</p>
                        <p className="text-xs text-gray-400">{campaign.industry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-white font-medium">{campaign.leads_count}</p>
                    <p className="text-xs text-gray-400">Total</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-green-400 font-medium">{campaign.converted_count}</p>
                    <p className="text-xs text-gray-400">{campaign.conversion_rate}%</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-white font-medium">${campaign.spent.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">of ${campaign.budget.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        to={`/campaign/${campaign.id}`}
                        className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30 border border-green-500/30"
                      >
                        Manage
                      </Link>
                      {campaign.status === 'active' ? (
                        <button className="p-1 text-gray-400 hover:text-red-400">
                          <Pause className="w-3 h-3" />
                        </button>
                      ) : (
                        <button className="p-1 text-gray-400 hover:text-green-400">
                          <Play className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12 bg-gray-800/30 border border-gray-700/50 rounded-lg">
          <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No campaigns found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
          <Link 
            to="/campaign-wizard"
            className="bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-400 font-medium"
          >
            Create Your First Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
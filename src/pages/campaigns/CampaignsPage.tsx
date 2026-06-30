import React, { useEffect, useState } from 'react';
import { Megaphone, CheckCircle2, XCircle, Search, Plus, RefreshCw, BarChart2, Zap } from 'lucide-react';
import { getCampaigns, approveCampaign, rejectCampaign } from '../../features/campaigns/campaigns.api';
import type { Campaign, ApprovalStatus, CampaignStatus } from '../../features/campaigns/campaigns.types';
import { trackInternalEvent } from '../../lib/analytics';
import { CampaignFormModal } from './CampaignFormModal';
import { CampaignDetailModal } from './CampaignDetailModal';

export const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getCampaigns({ search });
      setCampaigns(data.items);
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [search]);

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to approve this campaign?')) return;
    try {
      await approveCampaign(id);
      trackInternalEvent({ eventName: 'campaign_approved', feature: 'campaigns' });
      fetchCampaigns();
    } catch (error) {
      alert('Failed to approve campaign');
    }
  };

  const handleReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to reject this campaign?')) return;
    try {
      await rejectCampaign(id);
      trackInternalEvent({ eventName: 'campaign_rejected', feature: 'campaigns' });
      fetchCampaigns();
    } catch (error) {
      alert('Failed to reject campaign');
    }
  };

  const renderApprovalBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">Approved</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">Rejected</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">Pending Review</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">Draft</span>;
    }
  };

  const renderStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="flex items-center gap-1 text-xs font-medium text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Active</span>;
      case 'PAUSED':
        return <span className="flex items-center gap-1 text-xs font-medium text-orange-600"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Paused</span>;
      case 'COMPLETED':
        return <span className="flex items-center gap-1 text-xs font-medium text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Completed</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Cancelled</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Draft</span>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-indigo-600" />
              Command Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage marketing campaigns, track performance, and analyze VnSocial trends.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchCampaigns()}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex-none px-6 py-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content (Card View) */}
        <main className="flex-1 overflow-auto p-6">
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200">
              <Megaphone className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500">No campaigns found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                      {renderStatusBadge(campaign.status)}
                      {renderApprovalBadge(campaign.approvalStatus)}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{campaign.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 min-h-[40px]">{campaign.objective || 'No objective set'}</p>
                  </div>
                  
                  <div className="p-4 bg-slate-50 flex-1 flex flex-col justify-end">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-indigo-400" />
                        <span>Analysis</span>
                      </div>
                      {campaign.configJson?.vnsocialProjectId ? (
                        <span className="text-indigo-600 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          VnSocial Linked
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Linked</span>
                      )}
                    </div>

                    {campaign.approvalStatus === 'PENDING' && (
                      <div className="flex gap-2 mt-2 border-t border-slate-200 pt-3">
                        <button
                          onClick={(e) => handleApprove(e, campaign.id)}
                          className="flex-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={(e) => handleReject(e, campaign.id)}
                          className="flex-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <CampaignFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          fetchCampaigns();
        }}
      />
      
      {selectedCampaign && (
        <CampaignDetailModal 
          campaign={selectedCampaign} 
          onClose={() => setSelectedCampaign(null)} 
        />
      )}
    </div>
  );
};

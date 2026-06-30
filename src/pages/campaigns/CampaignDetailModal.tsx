import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Activity, BarChart2, Bot } from 'lucide-react';
import { getTrends } from '../../features/trends/trends.api';
import type { Campaign } from '../../features/campaigns/campaigns.types';
import type { TrendListItem } from '../../features/trends/trends.types';

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

export const CampaignDetailModal: React.FC<Props> = ({ campaign, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'VNSOCIAL_TRENDS' | 'AI_REPORT'>('OVERVIEW');
  const [trends, setTrends] = useState<TrendListItem[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const vnsocialProjectId = campaign.configJson?.vnsocialProjectId;

  useEffect(() => {
    if (activeTab === 'VNSOCIAL_TRENDS' && vnsocialProjectId) {
      loadTrendData(vnsocialProjectId);
    }
  }, [activeTab, vnsocialProjectId]);

  const loadTrendData = async (projectId: string) => {
    setLoadingTrends(true);
    try {
      const data = await getTrends({ projectId });
      setTrends(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTrends(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{campaign.name}</h2>
            <p className="text-sm text-slate-500 mt-1">Campaign Command Center</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'OVERVIEW' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'VNSOCIAL_TRENDS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setActiveTab('VNSOCIAL_TRENDS')}
          >
            <TrendingUp className="w-4 h-4" />
            VnSocial Trends
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'AI_REPORT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setActiveTab('AI_REPORT')}
          >
            <Bot className="w-4 h-4" />
            AI Report
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-2">Objective</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{campaign.objective || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">0</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Active Vouchers</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <Users className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">0</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Participants</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <BarChart2 className="w-8 h-8 text-purple-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">$0</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Revenue Impact</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'VNSOCIAL_TRENDS' && (
            <div className="space-y-6">
              {!vnsocialProjectId ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-900">No VnSocial Project Linked</h3>
                  <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                    Edit this campaign and link it to a VnSocial project to track social media trends and keywords.
                  </p>
                </div>
              ) : loadingTrends ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : trends.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Latest Trends from VnSocial
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trends.map((trend) => (
                      <div key={trend.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                              {trend.category || 'General'}
                            </span>
                            <span className={`text-xs font-medium ${trend.sentiment === 'POSITIVE' ? 'text-green-600' : trend.sentiment === 'NEGATIVE' ? 'text-red-600' : 'text-slate-500'}`}>
                              {trend.sentiment}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{trend.title}</h4>
                          <p className="text-slate-500 text-xs line-clamp-3">{trend.summary}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <span>{trend.source}</span>
                          <span>Score: {trend.score || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">No trends found for this project.</div>
              )}
            </div>
          )}

          {activeTab === 'AI_REPORT' && (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Bot className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Campaign AI Report</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Generate a comprehensive AI-powered report analyzing campaign performance, participant engagement, and social media sentiment.
              </p>
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2 mx-auto">
                <Bot className="w-5 h-5" />
                Generate AI Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

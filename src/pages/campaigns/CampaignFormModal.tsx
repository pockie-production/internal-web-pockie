import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createCampaign } from '../../features/campaigns/campaigns.api';
import { getVnSocialProjects } from '../../features/trends/trends.api';
import type { CreateCampaignDto } from '../../features/campaigns/campaigns.types';
import type { VnSocialProject } from '../../features/trends/trends.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CampaignFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateCampaignDto>({
    name: '',
    objective: '',
    configJson: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vnSocialProjects, setVnSocialProjects] = useState<VnSocialProject[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      getVnSocialProjects().then(res => setVnSocialProjects(res.items)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      await createCampaign(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
      <div className="w-[500px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Create New Campaign</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <form id="campaign-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Basic Info</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Objective</label>
                <textarea
                  rows={3}
                  placeholder="What is the goal of this campaign?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Integrations</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">VnSocial Project (Trend Tracking)</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  value={formData.configJson?.vnsocialProjectId || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    configJson: { ...formData.configJson, vnsocialProjectId: e.target.value || undefined }
                  })}
                >
                  <option value="">-- No Integration --</option>
                  {vnSocialProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Link to a VnSocial project to track hot keywords and posts related to this campaign.
                </p>
              </div>
            </div>
          </form>
        </div>

        <div className="flex-none p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="campaign-form"
            disabled={loading}
            className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

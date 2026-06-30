import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createMission } from '../../features/gamification/gamification.api';
import { trackInternalEvent } from '../../lib/analytics';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const MissionFormModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    missionType: 'DAILY',
    targetValue: 1,
    xpReward: 10,
    status: 'ACTIVE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMission(formData);
      trackInternalEvent({ eventName: 'mission_created', payload: { code: formData.code } });
      onSuccess();
    } catch (error) {
      console.error('Failed to create mission', error);
      alert('Failed to create mission. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Create Mission</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="mission-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mission Code</label>
              <input
                required
                type="text"
                placeholder="e.g. DAILY_LOGIN"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all uppercase"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Daily Login"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                placeholder="Describe the mission requirements..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Value</label>
                <input
                  required
                  type="number"
                  min="1"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.targetValue}
                  onChange={e => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">XP Reward</label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.xpReward}
                  onChange={e => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mission Type</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={formData.missionType}
                onChange={e => setFormData({ ...formData, missionType: e.target.value })}
              >
                <option value="DAILY">Daily Mission</option>
                <option value="WEEKLY">Weekly Mission</option>
                <option value="ONETIME">One-time Mission</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="mission-form"
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Mission'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createVoucher } from '../../features/vouchers/vouchers.api';
import type { CreateVoucherDto, VoucherClaimScope } from '../../features/vouchers/vouchers.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoucherFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateVoucherDto>({
    title: '',
    description: '',
    code: '',
    totalQuantity: undefined,
    requiresKyc: true,
    claimScope: 'PER_VERIFIED_IDENTITY',
    campaignKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      await createVoucher({
        ...formData,
        totalQuantity: formData.totalQuantity ? Number(formData.totalQuantity) : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
      <div className="w-[500px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Create New Voucher</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Basic Info</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.totalQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Anti-Fraud & Rules</h3>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresKyc"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={formData.requiresKyc}
                  onChange={(e) => setFormData({ ...formData, requiresKyc: e.target.checked })}
                />
                <label htmlFor="requiresKyc" className="text-sm text-slate-700 font-medium">
                  Require verified eKYC to claim
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Claim Scope</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  value={formData.claimScope}
                  onChange={(e) => setFormData({ ...formData, claimScope: e.target.value as VoucherClaimScope })}
                >
                  <option value="PER_ACCOUNT">1 per Account (Low Security)</option>
                  <option value="PER_VERIFIED_IDENTITY">1 per ID Card/Identity (High Security)</option>
                  <option value="PER_CAMPAIGN_IDENTITY">1 per Identity across Campaign (Anti-Spam)</option>
                </select>
              </div>

              {formData.claimScope === 'PER_CAMPAIGN_IDENTITY' && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <label className="block text-sm font-medium text-blue-900 mb-1">Campaign Key</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TET_2026"
                    className="w-full px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    value={formData.campaignKey}
                    onChange={(e) => setFormData({ ...formData, campaignKey: e.target.value })}
                  />
                  <p className="text-xs text-blue-700 mt-1">
                    Users can only claim 1 voucher across all vouchers sharing this Campaign Key.
                  </p>
                </div>
              )}
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
            form="voucher-form"
            disabled={loading}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
};

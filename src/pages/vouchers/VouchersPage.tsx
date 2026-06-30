import { useEffect, useState } from 'react';
import { Gift, CheckCircle2, XCircle, Search, Plus, Activity, RefreshCw } from 'lucide-react';
import { getVouchers, approveVoucher, rejectVoucher } from '../../features/vouchers/vouchers.api';
import type { Voucher, ApprovalStatus } from '../../features/vouchers/vouchers.types';
import { trackInternalEvent } from '../../lib/analytics';
import { VoucherFormModal } from './VoucherFormModal';

export const VouchersPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await getVouchers({ search });
      setVouchers(data.items);
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [search]);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this voucher?')) return;
    try {
      await approveVoucher(id);
      trackInternalEvent({ eventName: 'voucher_approved', feature: 'vouchers' });
      fetchVouchers();
    } catch (error) {
      alert('Failed to approve voucher');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this voucher?')) return;
    try {
      await rejectVoucher(id);
      trackInternalEvent({ eventName: 'voucher_rejected', feature: 'vouchers' });
      fetchVouchers();
    } catch (error) {
      alert('Failed to reject voucher');
    }
  };

  const renderStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejected</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending Review</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Draft</span>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Gift className="w-6 h-6 text-blue-600" />
              Vouchers Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create, review, and manage vouchers across campaigns.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchVouchers()}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Voucher
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex-none px-6 py-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vouchers by title..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Voucher Info</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Rules</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <Gift className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p>No vouchers found.</p>
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{voucher.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">{voucher.description}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {voucher.code || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="px-6 py-4">
                        {voucher.totalQuantity ? (
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-400" />
                            <span>{voucher.remainingQuantity} / {voucher.totalQuantity}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unlimited</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {voucher.requiresKyc && (
                            <span className="text-blue-600">eKYC Required</span>
                          )}
                          <span className="text-slate-600 capitalize">
                            {voucher.claimScope.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(voucher.approvalStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {voucher.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(voucher.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(voucher.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <VoucherFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          fetchVouchers();
        }}
      />
    </div>
  );
};

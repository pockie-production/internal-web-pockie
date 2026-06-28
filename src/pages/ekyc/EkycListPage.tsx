import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertCircle, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { getEkycSessions } from '../../features/ekyc/ekyc.api';
import type { EkycSessionListItem, EkycSessionStatus, EkycRiskLevel } from '../../features/ekyc/ekyc.types';

export const EkycListPage = () => {
  const [sessions, setSessions] = useState<EkycSessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EkycSessionStatus | ''>('');
  const [riskFilter, setRiskFilter] = useState<EkycRiskLevel | ''>('');
  
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await getEkycSessions({ search, status: statusFilter, riskLevel: riskFilter, limit: 50 });
      setSessions(res.items);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, riskFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
      case 'REVIEW_REQUIRED': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Review</span>;
      case 'RETRY_REQUIRED': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Retry</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> {status}</span>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW': return <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-medium border border-green-200">Low</span>;
      case 'MEDIUM': return <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-xs font-medium border border-yellow-200">Medium</span>;
      case 'HIGH': return <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs font-medium border border-orange-200">High</span>;
      case 'CRITICAL': return <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium border border-red-200 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Critical</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">eKYC Review Queue</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and review customer identity verification requests</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by email, phone, or name..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            className="py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="">All Statuses</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="RETRY_REQUIRED">Retry Required</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            className="py-2 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
          >
            <option value="">All Risks</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">AI Indicators</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    Loading sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No eKYC sessions found matching your criteria.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{session.user.fullName || 'N/A'}</div>
                      <div className="text-slate-500 text-xs">{session.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getRiskBadge(session.riskLevel)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        {session.warningCount > 0 && <span className="text-orange-600">⚠ {session.warningCount} OCR Warnings</span>}
                        {session.tamperingCount > 0 && <span className="text-red-600">🚫 {session.tamperingCount} Tampering Flags</span>}
                        {!session.warningCount && !session.tamperingCount && <span className="text-green-600">✓ Docs OK</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/ekyc-review/${session.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

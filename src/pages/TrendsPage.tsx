import React, { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, RadioTower, CheckCircle2, Send, Archive, XCircle, Search, X, Server, Activity, ArrowRight, PlayCircle, Loader2 } from 'lucide-react';
import {
  approveTrend,
  archiveTrend,
  deployTrend,
  getTrendDetail,
  getTrends,
  getVnSocialProjects,
  getVnSocialSyncJobs,
  rejectTrend,
  syncVnSocialProjectHotKeywords,
 
  syncVnSocialProjectPosts,
  syncVnSocialProjects,
} from '../features/trends/trends.api';
import type { TrendDetail, TrendListItem, TrendStatus, TrendsResponse, VnSocialProject } from '../features/trends/trends.types';
import { trackInternalEvent } from '../lib/analytics';

const statusOptions: Array<{ label: string; value: '' | TrendStatus }> = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Deployed', value: 'DEPLOYED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const sentimentOptions = [
  { label: 'All Sentiments', value: '' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
];

const StatCard = ({ title, value, icon: Icon, tone = 'slate' }: { title: string; value: number; icon: React.ElementType; tone?: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' }) => {
  const toneClass =
    tone === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
    tone === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
    tone === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
    tone === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' :
    tone === 'violet' ? 'bg-violet-50 text-violet-600 border-violet-100' :
    'bg-slate-50 text-slate-600 border-slate-100';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-slate-300">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`rounded-xl p-3 border ${toneClass} transition-colors group-hover:bg-white`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${toneClass.split(' ')[0]}`} />
    </div>
  );
};

export const TrendsPage: React.FC = () => {
  const [projects, setProjects] = useState<VnSocialProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [trends, setTrends] = useState<TrendListItem[]>([]);
  const [summary, setSummary] = useState<TrendsResponse['summary'] | null>(null);
  const [pagination, setPagination] = useState<TrendsResponse['pagination'] | null>(null);
  const [syncJobs, setSyncJobs] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [detail, setDetail] = useState<TrendDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | TrendStatus>('');
  const [sentiment, setSentiment] = useState('');
  const [page, setPage] = useState(1);

  // New states for redesign
  const [isSyncSidebarOpen, setIsSyncSidebarOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; kind: 'approve' | 'reject' | 'deploy' | 'archive' | null; trendId: string | null }>({ isOpen: false, kind: null, trendId: null });
  const [actionNote, setActionNote] = useState('');

  const loadMeta = async () => {
    const [projectRes, jobsRes] = await Promise.all([getVnSocialProjects(), getVnSocialSyncJobs()]);
    setProjects(projectRes.items);
    setSyncJobs(jobsRes.items);
  };

  const loadTrends = async (targetPage = page, source: 'initial' | 'filter' | 'refresh' | 'pagination' = 'initial') => {
    setLoading(true);
    try {
      const response = await getTrends({
        q: search || undefined,
        status: status || undefined,
        sentiment: sentiment || undefined,
        projectId: selectedProjectId || undefined,
        page: targetPage,
        pageSize: 20,
      });
      setTrends(response.items);
      setSummary(response.summary);
      setPagination(response.pagination);
      setPage(response.pagination.page);
      trackInternalEvent({
        eventName: 'trends_list_loaded',
        page: '/trends',
        feature: 'trends',
        payload: {
          source,
          itemCount: response.items.length,
          selectedProjectId: selectedProjectId || null,
          status: status || 'ALL',
          sentiment: sentiment || 'ALL',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async (source: 'initial' | 'filter' | 'refresh' | 'pagination' = 'refresh') => {
    await Promise.all([loadMeta(), loadTrends(1, source)]);
  };

  useEffect(() => {
    void refreshAll('initial');
  }, []);

  useEffect(() => {
    if (!projects.length && !selectedProjectId) return;
    void loadTrends(1, 'filter');
  }, [selectedProjectId, status, sentiment, search]);

  const runSync = async (key: string, runner: () => Promise<any>) => {
    try {
      setSyncing(key);
      await runner();
      await Promise.all([loadMeta(), loadTrends(1, 'refresh')]);
      trackInternalEvent({
        eventName: 'trends_sync_action',
        page: '/trends',
        feature: 'trends',
        payload: { key, selectedProjectId: selectedProjectId || null },
      });
    } finally {
      setSyncing(null);
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await getTrendDetail(id);
      setDetail(data);
      trackInternalEvent({
        eventName: 'trend_detail_opened',
        page: '/trends',
        feature: 'trends',
        payload: { trendId: id, status: data.status },
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const triggerAction = (kind: 'approve' | 'reject' | 'deploy' | 'archive', id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setActionModal({ isOpen: true, kind, trendId: id });
    setActionNote('');
  };

  const confirmAction = async () => {
    const { kind, trendId } = actionModal;
    if (!kind || !trendId) return;

    const note = actionNote.trim() || undefined;

    try {
      if (kind === 'approve') await approveTrend(trendId, note);
      if (kind === 'reject') await rejectTrend(trendId, note);
      if (kind === 'deploy') await deployTrend(trendId, note);
      if (kind === 'archive') await archiveTrend(trendId, note);

      if (detail?.id === trendId) {
        await openDetail(trendId);
      }
      await loadTrends(page, 'refresh');
      trackInternalEvent({
        eventName: 'trend_status_updated',
        page: '/trends',
        feature: 'trends',
        payload: { trendId, action: kind },
      });
    } finally {
      setActionModal({ isOpen: false, kind: null, trendId: null });
    }
  };

  const selectedProject = projects.find((item) => item.id === selectedProjectId) || null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 bg-slate-50/50 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trends Intelligence</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor VnSocial signals, curate trends, and deploy marketing insights.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsSyncSidebarOpen(true)}
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 shadow-sm focus:ring-2 focus:ring-slate-900/20"
          >
            <RadioTower className="mr-2 h-4 w-4 text-slate-300" />
            VnSocial Sync Hub
          </button>
          <button
            onClick={() => void refreshAll('refresh')}
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-slate-200"
          >
            <RefreshCw className="mr-2 h-4 w-4 text-slate-400" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Signals" value={summary?.total || 0} icon={TrendingUp} />
        <StatCard title="Pending Review" value={summary?.pending || 0} icon={Activity} tone="amber" />
        <StatCard title="Approved" value={summary?.approved || 0} icon={CheckCircle2} tone="emerald" />
        <StatCard title="Deployed" value={summary?.deployed || 0} icon={Send} tone="blue" />
        <StatCard title="Rejected" value={summary?.rejected || 0} icon={XCircle} tone="rose" />
        <StatCard title="Archived" value={summary?.archived || 0} icon={Archive} tone="violet" />
      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
              trackInternalEvent({
                eventName: 'trends_search',
                page: '/trends',
                feature: 'trends',
                payload: { search: searchInput.trim() || null },
              });
            }}
            className="relative flex-1 w-full"
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, summary, or source..."
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </form>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div className="flex w-full sm:w-auto gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as '' | TrendStatus)}
              className="flex-1 rounded-xl border-none bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {statusOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="flex-1 rounded-xl border-none bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {sentimentOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm whitespace-nowrap">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold w-1/3">Trend Summary</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Sentiment</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 w-3/4 rounded bg-slate-200 mb-2" /><div className="h-3 w-1/2 rounded bg-slate-100" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                      <td className="px-6 py-5"><div className="h-6 w-16 rounded-full bg-slate-200" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-8 rounded bg-slate-200" /></td>
                      <td className="px-6 py-5"><div className="h-6 w-20 rounded-full bg-slate-200" /></td>
                      <td className="px-6 py-5"><div className="h-8 w-24 rounded-lg bg-slate-200" /></td>
                    </tr>
                  ))
                ) : trends.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">No trends found</h3>
                      <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or sync new data.</p>
                    </td>
                  </tr>
                ) : trends.map((trend) => (
                  <tr 
                    key={trend.id} 
                    onClick={() => void openDetail(trend.id)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-semibold text-slate-900 truncate">{trend.title}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{trend.summary || 'No summary available for this item'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 font-medium">{trend.project?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400 mt-1">{trend.sourceChannel || trend.source}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${trend.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' : trend.sentiment === 'negative' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}`}>
                        {trend.sentiment || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{trend.score ?? '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${trend.status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' : trend.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : trend.status === 'DEPLOYED' ? 'bg-blue-50 text-blue-700 border-blue-200' : trend.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${trend.status === 'PENDING_REVIEW' ? 'bg-amber-500' : trend.status === 'APPROVED' ? 'bg-emerald-500' : trend.status === 'DEPLOYED' ? 'bg-blue-500' : trend.status === 'REJECTED' ? 'bg-rose-500' : 'bg-slate-500'}`}></span>
                        {trend.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        {trend.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              onClick={(e) => triggerAction('approve', trend.id, e)}
                              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Approve
                            </button>
                            <button
                              onClick={(e) => triggerAction('reject', trend.id, e)}
                              className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {trend.status === 'APPROVED' && (
                          <button
                            onClick={(e) => triggerAction('deploy', trend.id, e)}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Deploy
                          </button>
                        )}
                        <ArrowRight className="h-4 w-4 text-slate-300 ml-2" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 text-sm text-slate-600">
            <div className="font-medium">{pagination ? `Page ${pagination.page} of ${pagination.totalPages} (${pagination.totalItems} records)` : 'No records'}</div>
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination || pagination.page <= 1 || loading}
                onClick={() => void loadTrends(Math.max(1, page - 1), 'pagination')}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={!pagination || pagination.page >= pagination.totalPages || loading}
                onClick={() => void loadTrends(page + 1, 'pagination')}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Sidebar Modal */}
      {isSyncSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsSyncSidebarOpen(false)} />
          <aside className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Server className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">VnSocial Sync Hub</h2>
              </div>
              <button onClick={() => setIsSyncSidebarOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
              {/* Project Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-wide text-slate-900 uppercase">Projects</h3>
                  <button
                    onClick={() => void runSync('sync-projects', syncVnSocialProjects)}
                    disabled={syncing !== null}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {syncing === 'sync-projects' ? 'Syncing...' : 'Refresh List'}
                  </button>
                </div>
                <div className="space-y-3">
                  {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <p className="text-sm text-slate-500">No cached projects.</p>
                      <button onClick={() => void runSync('sync-projects', syncVnSocialProjects)} className="mt-3 text-sm font-medium text-blue-600">Sync from VnSocial</button>
                    </div>
                  ) : projects.map((project) => {
                    const active = project.id === selectedProjectId;
                    const hasSignals = project.stats.posts > 0 || project.stats.hotKeywords > 0;
                    return (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className={`w-full group rounded-2xl border p-4 text-left transition-all ${active ? 'border-blue-500 bg-white shadow-[0_0_0_1px_rgba(59,130,246,1)]' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-bold ${active ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-700'}`}>{project.name}</p>
                            <p className="mt-1 text-[11px] text-slate-500 uppercase tracking-wider">{project.type} • {project.sourceName || 'Mixed'}</p>
                          </div>
                          {active && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{project.stats.trends} trends</span>
                          <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${hasSignals ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            {hasSignals ? 'Live Data' : 'Empty'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Extraction */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-wide text-slate-900 uppercase">Run Extraction</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={!selectedProject || syncing !== null}
                    onClick={() => selectedProject && void runSync('sync-posts', () => syncVnSocialProjectPosts(selectedProject.id))}
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50"
                  >
                    <PlayCircle className="mb-2 h-6 w-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Sync Posts</span>
                  </button>
                  <button
                    disabled={!selectedProject || syncing !== null}
                    onClick={() => selectedProject && void runSync('sync-hot-keywords', () => syncVnSocialProjectHotKeywords(selectedProject.id))}
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50"
                  >
                    <TrendingUp className="mb-2 h-6 w-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Hot Keywords</span>
                  </button>
                </div>
              </div>

              {/* Recent Jobs */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-wide text-slate-900 uppercase">Recent Jobs</h3>
                <div className="space-y-2">
                  {syncJobs.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent activity.</p>
                  ) : syncJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="rounded-xl bg-white p-3 border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{job.jobType}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{new Date(job.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${job.status === 'SUCCESS' ? 'text-emerald-600 bg-emerald-50' : job.status === 'FAILED' ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'}`}>
                          {job.status}
                        </span>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">+{job.pulledCount} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Trend Detail Slide-over */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity" onClick={() => setDetail(null)} />
          <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-lg px-8 py-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Trend Insights</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 leading-tight">{detail.title}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{detail.project?.name || 'Unknown project'} • {detail.origin || 'N/A'}</p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 ml-4"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="font-medium text-sm">Analyzing trend data...</p>
              </div>
            ) : (
              <div className="p-8 space-y-8 flex-1">
                {/* AI Summary */}
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">AI Summary</h3>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-inner">
                    <p className="text-sm leading-relaxed text-slate-700">{detail.summary || 'No summary available.'}</p>
                  </div>
                </section>

                {/* Metrics Grid */}
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sentiment</p>
                      <p className={`mt-2 font-bold text-lg capitalize ${detail.sentiment === 'positive' ? 'text-emerald-600' : detail.sentiment === 'negative' ? 'text-rose-600' : 'text-slate-700'}`}>{detail.sentiment || 'unknown'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</p>
                      <p className="mt-2 font-bold text-lg text-slate-900">{detail.score ?? '-'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                      <p className="mt-2 font-bold text-sm text-slate-900 break-words">{detail.status}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source</p>
                      <p className="mt-2 font-bold text-sm text-slate-900 truncate">{detail.sourceChannel || detail.source}</p>
                    </div>
                  </div>
                </section>

                {/* Review Notes */}
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Review History</h3>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-700 italic">"{detail.reviewNote || 'No review note left yet.'}"</p>
                    {detail.deployedAt && (
                      <p className="mt-3 text-xs font-semibold text-slate-500">🚀 Deployed on {new Date(detail.deployedAt).toLocaleString('vi-VN')}</p>
                    )}
                  </div>
                </section>

                {/* Raw JSON */}
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Raw Signal Payload</h3>
                  <pre className="overflow-x-auto rounded-2xl bg-[#0f172a] p-5 text-xs leading-6 text-slate-300 shadow-inner font-mono">
                    {JSON.stringify(detail.rawJson, null, 2)}
                  </pre>
                </section>
              </div>
            )}
            
            {/* Sticky Action Footer */}
            {!detailLoading && detail && (
              <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur-xl p-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-3">
                    {detail.status === 'PENDING_REVIEW' && (
                      <>
                        <button onClick={() => triggerAction('approve', detail.id)} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-sm shadow-emerald-200">Approve</button>
                        <button onClick={() => triggerAction('reject', detail.id)} className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 shadow-sm shadow-rose-200">Reject</button>
                      </>
                    )}
                    {detail.status === 'APPROVED' && (
                      <button onClick={() => triggerAction('deploy', detail.id)} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-sm shadow-blue-200">Deploy to Campaign</button>
                    )}
                  </div>
                  <button onClick={() => triggerAction('archive', detail.id)} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm">Archive</button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Action Note Modal (Replaces window.prompt) */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setActionModal({ isOpen: false, kind: null, trendId: null })} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 capitalize">
              {actionModal.kind} Trend
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {actionModal.kind === 'reject' 
                ? 'Please provide a reason for rejecting this trend. This helps improve the AI filter.' 
                : 'Add an optional note or context for this action.'}
            </p>
            
            <div className="mt-5">
              <textarea
                autoFocus
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={actionModal.kind === 'reject' ? 'Reason for rejection (mandatory)...' : 'Optional notes...'}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 min-h-[120px] resize-none"
              />
            </div>
            
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setActionModal({ isOpen: false, kind: null, trendId: null })}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={actionModal.kind === 'reject' && !actionNote.trim()}
                onClick={() => void confirmAction()}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition shadow-sm
                  ${actionModal.kind === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                    actionModal.kind === 'reject' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 disabled:bg-rose-300' :
                    actionModal.kind === 'deploy' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                    'bg-slate-800 hover:bg-slate-900'}
                `}
              >
                Confirm {actionModal.kind}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

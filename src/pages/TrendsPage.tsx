import React, { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, RadioTower, CheckCircle2, Send, Archive, XCircle, Search, X } from 'lucide-react';
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
  syncVnSocialProjectHotPosts,
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
    tone === 'blue' ? 'bg-blue-50 text-blue-600' :
    tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
    tone === 'amber' ? 'bg-amber-50 text-amber-600' :
    tone === 'rose' ? 'bg-rose-50 text-rose-600' :
    tone === 'violet' ? 'bg-violet-50 text-violet-600' :
    'bg-slate-50 text-slate-600';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
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

  const runDecision = async (kind: 'approve' | 'reject' | 'deploy' | 'archive', id: string) => {
    const note = window.prompt(
      kind === 'reject' ? 'Lý do reject trend này?' : 'Ghi chú cho thao tác này (có thể bỏ trống):',
      '',
    ) || undefined;

    if (kind === 'approve') await approveTrend(id, note);
    if (kind === 'reject') await rejectTrend(id, note);
    if (kind === 'deploy') await deployTrend(id, note);
    if (kind === 'archive') await archiveTrend(id, note);

    if (detail?.id === id) {
      await openDetail(id);
    }
    await loadTrends(page, 'refresh');
    trackInternalEvent({
      eventName: 'trend_status_updated',
      page: '/trends',
      feature: 'trends',
      payload: { trendId: id, action: kind },
    });
  };

  const selectedProject = projects.find((item) => item.id === selectedProjectId) || null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trends</h1>
          <p className="mt-1 text-sm text-slate-500">Sync dữ liệu VnSocial, duyệt trend nội bộ và deploy các tín hiệu đáng dùng cho campaign.</p>
        </div>
        <button
          onClick={() => void refreshAll('refresh')}
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Trends" value={summary?.total || 0} icon={TrendingUp} />
        <StatCard title="Pending" value={summary?.pending || 0} icon={RadioTower} tone="amber" />
        <StatCard title="Approved" value={summary?.approved || 0} icon={CheckCircle2} tone="emerald" />
        <StatCard title="Deployed" value={summary?.deployed || 0} icon={Send} tone="blue" />
        <StatCard title="Rejected" value={summary?.rejected || 0} icon={XCircle} tone="rose" />
        <StatCard title="Archived" value={summary?.archived || 0} icon={Archive} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">VnSocial Control</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Projects & Sync</h2>
              </div>
              <button
                onClick={() => void runSync('sync-projects', syncVnSocialProjects)}
                disabled={syncing !== null}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {syncing === 'sync-projects' ? 'Syncing...' : 'Sync Projects'}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {projects.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Chưa có project cache. Hãy sync projects trước.</p>
              ) : projects.map((project) => {
                const active = project.id === selectedProjectId;
                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${active ? 'border-blue-500 bg-blue-50/70' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{project.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{project.type} • {project.sourceName || 'mixed sources'}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{project.stats.trends} trends</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
                      <div className="rounded-xl bg-white px-3 py-2">Posts: <span className="font-semibold text-slate-800">{project.stats.posts}</span></div>
                      <div className="rounded-xl bg-white px-3 py-2">Keywords: <span className="font-semibold text-slate-800">{project.stats.hotKeywords}</span></div>
                      <div className="rounded-xl bg-white px-3 py-2">Hot posts: <span className="font-semibold text-slate-800">{project.stats.hotPosts}</span></div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                disabled={!selectedProject || syncing !== null}
                onClick={() => selectedProject && void runSync('sync-posts', () => syncVnSocialProjectPosts(selectedProject.id))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {syncing === 'sync-posts' ? 'Syncing...' : 'Sync Posts'}
              </button>
              <button
                disabled={!selectedProject || syncing !== null}
                onClick={() => selectedProject && void runSync('sync-hot-keywords', () => syncVnSocialProjectHotKeywords(selectedProject.id))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {syncing === 'sync-hot-keywords' ? 'Syncing...' : 'Hot Keywords'}
              </button>
              <button
                disabled={!selectedProject || syncing !== null}
                onClick={() => selectedProject && void runSync('sync-hot-posts', () => syncVnSocialProjectHotPosts(selectedProject.id))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {syncing === 'sync-hot-posts' ? 'Syncing...' : 'Hot Posts'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Recent Sync Jobs</p>
            <div className="mt-4 space-y-3">
              {syncJobs.length === 0 ? (
                <p className="text-sm text-slate-500">Chưa có sync job nào.</p>
              ) : syncJobs.slice(0, 6).map((job) => (
                <div key={job.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{job.projectName || 'Global'} • {job.jobType}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(job.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${job.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : job.status === 'FAILED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">Pulled: {job.pulledCount}{job.errorMessage ? ` • ${job.errorMessage}` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row">
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
                className="relative flex-1"
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by title, summary, category..."
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </form>
              <div className="flex flex-wrap gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as '' | TrendStatus)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {statusOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
                </select>
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {sentimentOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Trend</th>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Sentiment</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Source</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500">Loading trends...</td></tr>
                  ) : trends.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500">No trends found for the current filters.</td></tr>
                  ) : trends.map((trend) => (
                    <tr key={trend.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <button onClick={() => void openDetail(trend.id)} className="text-left">
                          <div className="font-medium text-slate-900">{trend.title}</div>
                          <div className="mt-1 max-w-md truncate text-xs text-slate-500">{trend.summary || 'No summary'}</div>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{trend.project?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${trend.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700' : trend.sentiment === 'negative' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                          {trend.sentiment || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{trend.score ?? '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${trend.status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-700' : trend.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : trend.status === 'DEPLOYED' ? 'bg-blue-50 text-blue-700' : trend.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                          {trend.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{trend.sourceChannel || trend.source}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => void openDetail(trend.id)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
              <div>{pagination ? `Page ${pagination.page} / ${pagination.totalPages} • ${pagination.totalItems} trends` : 'No pagination data'}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination || pagination.page <= 1 || loading}
                  onClick={() => void loadTrends(Math.max(1, page - 1), 'pagination')}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={!pagination || pagination.page >= pagination.totalPages || loading}
                  onClick={() => void loadTrends(page + 1, 'pagination')}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/30 backdrop-blur-[1px]">
          <button className="flex-1 cursor-default" onClick={() => setDetail(null)} />
          <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Trend Detail</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{detail.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{detail.project?.name || 'Unknown project'} • {detail.origin || 'N/A'}</p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="px-6 py-16 text-center text-slate-500">Loading trend detail...</div>
            ) : (
              <div className="space-y-6 px-6 py-6">
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Signal Overview</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Summary</p>
                      <p className="mt-1 text-sm text-slate-700">{detail.summary || 'No summary available.'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Sentiment</p>
                        <p className="mt-2 font-semibold text-slate-900">{detail.sentiment || 'unknown'}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Score</p>
                        <p className="mt-2 font-semibold text-slate-900">{detail.score ?? '-'}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                        <p className="mt-2 font-semibold text-slate-900">{detail.status}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Source</p>
                        <p className="mt-2 font-semibold text-slate-900">{detail.sourceChannel || detail.source}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Review Notes</h3>
                  <p className="mt-2 text-sm text-slate-600">{detail.reviewNote || 'No review note yet.'}</p>
                  {detail.deployedAt && (
                    <p className="mt-2 text-xs text-slate-500">Deployed at {new Date(detail.deployedAt).toLocaleString('vi-VN')}</p>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Action Center</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => void runDecision('approve', detail.id)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">Approve</button>
                    <button onClick={() => void runDecision('reject', detail.id)} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700">Reject</button>
                    <button onClick={() => void runDecision('deploy', detail.id)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">Deploy</button>
                    <button onClick={() => void runDecision('archive', detail.id)} className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">Archive</button>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Raw Payload</h3>
                  <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                    {JSON.stringify(detail.rawJson, null, 2)}
                  </pre>
                </section>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

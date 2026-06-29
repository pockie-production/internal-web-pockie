import React, { useEffect, useRef, useState } from 'react';
import { Search, Filter, Users, ShieldCheck, Landmark, CircleUserRound, X, RefreshCw, Ban, CheckCircle2 } from 'lucide-react';
import { getUserDetail, getUsers, updateUserStatus } from '../features/users/users.api';
import type { InternalAccountType, KycStatus, UserDetail, UserListItem, UserStatus, UsersListResponse } from '../features/users/users.types';
import { trackInternalEvent } from '../lib/analytics';
import { useAuthStore } from '../store/authStore';

const accountTypeOptions: Array<{ label: string; value: '' | InternalAccountType }> = [
  { label: 'All Types', value: '' },
  { label: 'End User', value: 'end_user' },
  { label: 'Internal', value: 'internal' },
  { label: 'Bank', value: 'bank' },
];

const statusOptions: Array<{ label: string; value: '' | UserStatus }> = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Deleted', value: 'DELETED' },
];

const kycOptions: Array<{ label: string; value: '' | KycStatus }> = [
  { label: 'All KYC', value: '' },
  { label: 'Not Started', value: 'NOT_STARTED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Expired', value: 'EXPIRED' },
];

const formatAccountType = (value: InternalAccountType) => {
  if (value === 'end_user') return 'End User';
  if (value === 'internal') return 'Internal';
  return 'Bank';
};

const getStatusBadge = (status: UserStatus) => {
  if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'SUSPENDED') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getKycBadge = (status: KycStatus) => {
  if (status === 'VERIFIED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'PENDING') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (status === 'EXPIRED') return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-3 text-slate-500">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export const UsersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [summary, setSummary] = useState<UsersListResponse['summary'] | null>(null);
  const [pagination, setPagination] = useState<UsersListResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [accountType, setAccountType] = useState<'' | InternalAccountType>('');
  const [status, setStatus] = useState<'' | UserStatus>('');
  const [kycStatus, setKycStatus] = useState<'' | KycStatus>('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const hasInitializedFilters = useRef(false);

  const canUpdateStatus = !!user?.permissions?.includes('users.update_status');

  const loadUsers = async (targetPage = page, source: 'initial' | 'filter' | 'refresh' | 'pagination' = 'initial') => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers({
        q: search || undefined,
        accountType: accountType || undefined,
        status: status || undefined,
        kycStatus: kycStatus || undefined,
        page: targetPage,
        pageSize: 20,
      });

      setUsers(response.items);
      setSummary(response.summary);
      setPagination(response.pagination);
      setPage(response.pagination.page);

      trackInternalEvent({
        eventName: 'users_list_loaded',
        page: '/users',
        feature: 'users',
        payload: {
          source,
          page: response.pagination.page,
          itemCount: response.items.length,
          search: search || null,
          accountType: accountType || 'ALL',
          status: status || 'ALL',
          kycStatus: kycStatus || 'ALL',
        },
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      setSelectedUserId(id);
      const response = await getUserDetail(id);
      setDetail(response);
      trackInternalEvent({
        eventName: 'user_detail_opened',
        page: '/users',
        feature: 'users',
        payload: { userId: id, accountType: response.accountType, status: response.status },
      });
    } catch (err) {
      console.error('Failed to load user detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    trackInternalEvent({
      eventName: 'users_search',
      page: '/users',
      feature: 'users',
      payload: { search: searchInput.trim() || null },
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearch('');
    setAccountType('');
    setStatus('');
    setKycStatus('');
    setPage(1);
  };

  const handleStatusUpdate = async (target: UserDetail, nextStatus: UserStatus) => {
    try {
      setStatusSaving(true);
      const response = await updateUserStatus(target.id, nextStatus);
      setDetail(response.user);
      await loadUsers(page, 'refresh');
      trackInternalEvent({
        eventName: 'user_status_updated',
        page: '/users',
        feature: 'users',
        payload: { userId: target.id, previousStatus: target.status, nextStatus },
      });
    } catch (err) {
      console.error('Failed to update user status', err);
    } finally {
      setStatusSaving(false);
    }
  };

  useEffect(() => {
    loadUsers(1, 'initial');
  }, []);

  useEffect(() => {
    if (!hasInitializedFilters.current) {
      hasInitializedFilters.current = true;
      return;
    }
    loadUsers(1, 'filter');
  }, [search, accountType, status, kycStatus]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý toàn bộ tài khoản end-user, nội bộ và ngân hàng trên hệ thống.</p>
        </div>
        <button
          onClick={() => {
            trackInternalEvent({ eventName: 'users_refresh_click', page: '/users', feature: 'users' });
            void loadUsers(page, 'refresh');
          }}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Users" value={summary?.totalUsers || 0} icon={Users} />
        <StatCard title="Active" value={summary?.activeUsers || 0} icon={CheckCircle2} />
        <StatCard title="Suspended" value={summary?.suspendedUsers || 0} icon={Ban} />
        <StatCard title="Verified KYC" value={summary?.verifiedUsers || 0} icon={ShieldCheck} />
        <StatCard title="Internal Staff" value={summary?.internalUsers || 0} icon={CircleUserRound} />
        <StatCard title="Bank Users" value={summary?.bankUsers || 0} icon={Landmark} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by email, phone, name..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 pr-1 text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
            <select
              value={accountType}
              onChange={(e) => {
                const next = e.target.value as '' | InternalAccountType;
                setAccountType(next);
                setPage(1);
                trackInternalEvent({
                  eventName: 'users_filter_changed',
                  page: '/users',
                  feature: 'users',
                  payload: { filter: 'accountType', value: next || 'ALL' },
                });
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {accountTypeOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                const next = e.target.value as '' | UserStatus;
                setStatus(next);
                setPage(1);
                trackInternalEvent({
                  eventName: 'users_filter_changed',
                  page: '/users',
                  feature: 'users',
                  payload: { filter: 'status', value: next || 'ALL' },
                });
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {statusOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={kycStatus}
              onChange={(e) => {
                const next = e.target.value as '' | KycStatus;
                setKycStatus(next);
                setPage(1);
                trackInternalEvent({
                  eventName: 'users_filter_changed',
                  page: '/users',
                  feature: 'users',
                  payload: { filter: 'kycStatus', value: next || 'ALL' },
                });
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {kycOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="p-6 text-sm text-rose-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Roles</th>
                  <th className="px-6 py-4 font-medium">Organization</th>
                  <th className="px-6 py-4 font-medium">KYC</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
                      No users matched the current filters.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => void loadUserDetail(item.id)}
                          className="text-left"
                        >
                          <div className="font-medium text-slate-900">{item.displayName || item.fullName || item.email || 'Unnamed user'}</div>
                          <div className="mt-1 text-xs text-slate-500">{item.email || 'No email'}{item.phone ? ` • ${item.phone}` : ''}</div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {formatAccountType(item.accountType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{item.roles.join(', ') || 'No roles'}</td>
                      <td className="px-6 py-4 text-slate-600">{item.organization?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getKycBadge(item.kycStatus)}`}>
                          {item.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => void loadUserDetail(item.id)}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                          >
                            View
                          </button>
                          {canUpdateStatus && item.status !== 'DELETED' && (
                            <button
                              onClick={() => void loadUserDetail(item.id)}
                              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                            >
                              Status
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
          <div>
            {pagination ? `Page ${pagination.page} / ${pagination.totalPages} • ${pagination.totalItems} users` : 'No pagination data'}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination || pagination.page <= 1 || loading}
              onClick={() => {
                const nextPage = Math.max(1, page - 1);
                setPage(nextPage);
                void loadUsers(nextPage, 'pagination');
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={!pagination || pagination.page >= pagination.totalPages || loading}
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                void loadUsers(nextPage, 'pagination');
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedUserId && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/30 backdrop-blur-[1px]">
          <button
            className="flex-1 cursor-default"
            onClick={() => {
              setSelectedUserId(null);
              setDetail(null);
            }}
          />
          <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">User Detail</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {detail?.profile.displayName || detail?.profile.fullName || detail?.email || 'Loading...'}
                </h2>
                {detail && (
                  <p className="mt-1 text-sm text-slate-500">{formatAccountType(detail.accountType)} • {detail.authProvider}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setDetail(null);
                }}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading || !detail ? (
              <div className="px-6 py-16 text-center text-slate-500">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                Loading user detail...
              </div>
            ) : (
              <div className="space-y-6 px-6 py-6">
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Identity</h3>
                  <dl className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">Email</dt>
                      <dd className="mt-1 font-medium text-slate-800">{detail.email || 'No email'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">Phone</dt>
                      <dd className="mt-1 font-medium text-slate-800">{detail.phone || 'No phone'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">Created</dt>
                      <dd className="mt-1 font-medium text-slate-800">{new Date(detail.createdAt).toLocaleString('vi-VN')}</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Access</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {detail.roles.map((role) => (
                      <span key={role} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                        {role}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Account Status</p>
                      <p className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadge(detail.status)}`}>
                        {detail.status}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">KYC Status</p>
                      <p className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getKycBadge(detail.kycStatus)}`}>
                        {detail.kycStatus}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Permissions</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {detail.permissions.length ? detail.permissions.map((permission) => (
                        <span key={permission} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {permission}
                        </span>
                      )) : <span className="text-sm text-slate-500">No explicit permissions.</span>}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Organization</h3>
                  <div className="mt-4 space-y-3">
                    {detail.organizationMemberships.length ? detail.organizationMemberships.map((membership) => (
                      <div key={membership.organizationId} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="font-medium text-slate-900">{membership.organizationName}</p>
                        <p className="mt-1 text-xs text-slate-500">{membership.organizationType}{membership.title ? ` • ${membership.title}` : ''}</p>
                      </div>
                    )) : <p className="text-sm text-slate-500">User has not been assigned to any organization yet.</p>}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Activity Snapshot</h3>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-2xl font-semibold text-slate-900">{detail.stats.chatSessions}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Chat Sessions</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-2xl font-semibold text-slate-900">{detail.stats.ocrJobs}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">OCR Jobs</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-2xl font-semibold text-slate-900">{detail.stats.ekycSessions}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">eKYC Sessions</p>
                    </div>
                  </div>
                </section>

                {canUpdateStatus && detail.status !== 'DELETED' && (
                  <section className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Status Control</h3>
                    <p className="mt-2 text-sm text-slate-500">Khoá hoặc mở khoá tài khoản trực tiếp từ drawer này.</p>
                    <div className="mt-4 flex gap-3">
                      {detail.status !== 'ACTIVE' && (
                        <button
                          disabled={statusSaving}
                          onClick={() => void handleStatusUpdate(detail, 'ACTIVE')}
                          className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Activate
                        </button>
                      )}
                      {detail.status === 'ACTIVE' && (
                        <button
                          disabled={statusSaving}
                          onClick={() => void handleStatusUpdate(detail, 'SUSPENDED')}
                          className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend
                        </button>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getDashboardOverview, getEkycFunnel, getFeatureUsage, getSystemHealth } from '../features/dashboard/dashboard.api';
import type { DashboardOverview, EkycFunnel, FeatureUsage, SystemHealth } from '../features/dashboard/dashboard.types';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { SimpleLineChart } from '../features/dashboard/components/SimpleLineChart';
import { SimpleBarChart } from '../features/dashboard/components/SimpleBarChart';
import { ActionQueueCard } from '../features/dashboard/components/ActionQueueCard';
import { SystemHealthCard } from '../features/dashboard/components/SystemHealthCard';
import { trackInternalEvent } from '../lib/analytics';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [ekycFunnel, setEkycFunnel] = useState<EkycFunnel | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, funnelData, usageData, healthData] = await Promise.allSettled([
        getDashboardOverview(),
        getEkycFunnel(),
        getFeatureUsage(),
        getSystemHealth(),
      ]);

      if (overviewData.status === 'fulfilled') setOverview(overviewData.value);
      if (funnelData.status === 'fulfilled') setEkycFunnel(funnelData.value);
      if (usageData.status === 'fulfilled') setFeatureUsage(usageData.value);
      if (healthData.status === 'fulfilled') setSystemHealth(healthData.value);

      if (overviewData.status === 'rejected') {
        setError('Failed to load primary dashboard data.');
      } else {
        trackInternalEvent({
          eventName: 'internal_dashboard_loaded',
          page: '/dashboard',
          feature: 'internal_dashboard',
          payload: {
            metricsLoaded: Object.keys(overviewData.value.metrics).length,
            hasFunnel: funnelData.status === 'fulfilled',
            hasFeatureUsage: usageData.status === 'fulfilled',
            hasHealth: healthData.status === 'fulfilled',
          },
        });
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const displayName = user?.profile?.displayName || user?.profile?.fullName || user?.email || 'Admin';

  if (error && !overview) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm font-medium text-red-500 mb-2">Error loading dashboard</p>
          <p className="text-gray-500">{error}</p>
          <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pockie Internal Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Xin chào, {displayName}</p>
          {overview?.lastUpdatedAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last updated: {new Date(overview.lastUpdatedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            trackInternalEvent({
              eventName: 'dashboard_refresh_click',
              page: '/dashboard',
              feature: 'internal_dashboard',
            });
            void fetchDashboardData();
          }}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Users" metric={overview?.metrics.totalUsers} loading={loading} />
        <MetricCard title="New Users Today" metric={overview?.metrics.newUsersToday} loading={loading} />
        <MetricCard title="eKYC Verified" metric={overview?.metrics.ekycVerified} loading={loading} />
        <MetricCard title="eKYC Review Required" metric={overview?.metrics.ekycReviewRequired} loading={loading} />
        <MetricCard title="Chat Sessions Today" metric={overview?.metrics.chatSessionsToday} loading={loading} />
        <MetricCard title="OCR Jobs Today" metric={overview?.metrics.ocrJobsToday} loading={loading} />
        <MetricCard title="Pending Trends" metric={overview?.metrics.pendingTrends} loading={loading} />
        <MetricCard title="Active Vouchers" metric={overview?.metrics.activeVouchers} loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading && !overview ? (
             <div className="bg-white rounded-2xl h-[400px] animate-pulse border border-gray-100"></div>
          ) : (
            <SimpleLineChart
              title="User Growth (7 Days)"
              data={overview?.userGrowth || []}
              dataKey="users"
              nameKey="date"
            />
          )}
        </div>
        <div className="lg:col-span-1">
           {loading && !featureUsage ? (
             <div className="bg-white rounded-2xl h-[400px] animate-pulse border border-gray-100"></div>
          ) : (
             <SimpleBarChart
              title="Feature Usage"
              data={featureUsage?.features || []}
              dataKey="value"
              nameKey="label"
              fill="#10b981"
            />
          )}
        </div>
      </div>

      {/* eKYC Funnel (Full Width Chart) */}
      <div className="w-full">
         {loading && !ekycFunnel ? (
             <div className="bg-white rounded-2xl h-[400px] animate-pulse border border-gray-100"></div>
          ) : (
             <SimpleBarChart
              title="eKYC Conversion Funnel"
              data={ekycFunnel?.stages || []}
              dataKey="value"
              nameKey="label"
              fill="#6366f1"
            />
          )}
      </div>

      {/* Queues & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && !overview ? (
          <>
            <div className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
            <div className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
            <div className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
          </>
        ) : (
          <>
            <ActionQueueCard title="eKYC Review Queue" items={overview?.queues.ekycReview || []} />
            <ActionQueueCard title="Pending Trends" items={overview?.queues.pendingTrends || []} />
            <ActionQueueCard title="Expiring Vouchers" items={overview?.queues.expiringVouchers || []} />
            <ActionQueueCard title="Recent System Issues" items={overview?.queues.systemIssues || []} />
          </>
        )}
      </div>

      {/* System Health */}
      <div className="w-full">
         {loading && !systemHealth ? (
             <div className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100"></div>
          ) : (
            systemHealth && <SystemHealthCard data={systemHealth} />
          )}
      </div>
    </div>
  );
};

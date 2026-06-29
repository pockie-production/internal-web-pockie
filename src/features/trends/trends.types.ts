export type TrendStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'DEPLOYED' | 'ARCHIVED';

export interface VnSocialProject {
  id: string;
  externalProjectId: string | null;
  externalSourceId: string | null;
  name: string;
  type: string;
  status: string;
  sourceName: string | null;
  createdAt: string;
  updatedAt: string;
  stats: {
    posts: number;
    hotKeywords: number;
    hotPosts: number;
    trends: number;
  };
  lastSyncJobs: Array<{
    id: string;
    jobType: string;
    status: string;
    pulledCount: number;
    createdAt: string;
    finishedAt: string | null;
    errorMessage: string | null;
  }>;
}

export interface VnSocialProjectsResponse {
  items: VnSocialProject[];
}

export interface SyncJobsResponse {
  items: Array<{
    id: string;
    projectId: string | null;
    projectName: string | null;
    jobType: string;
    status: string;
    pulledCount: number;
    errorMessage: string | null;
    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
  }>;
}

export interface TrendListItem {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  sentiment: string | null;
  score: number | null;
  status: TrendStatus;
  source: string;
  sourceChannel: string | null;
  project: {
    id: string;
    name: string;
    type: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrendsResponse {
  items: TrendListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    total: number;
    pending: number;
    approved: number;
    deployed: number;
    rejected: number;
    archived: number;
  };
}

export interface TrendDetail {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  sentiment: string | null;
  score: number | null;
  status: TrendStatus;
  source: string;
  sourceChannel: string | null;
  origin: string | null;
  originRefId: string | null;
  reviewNote: string | null;
  deployedAt: string | null;
  project: {
    id: string;
    name: string;
    type: string;
  } | null;
  rawJson: any;
  createdAt: string;
  updatedAt: string;
}

export type InternalAccountType = 'end_user' | 'internal' | 'bank';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface UserListItem {
  id: string;
  fullName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  roles: string[];
  accountType: InternalAccountType;
  organization: {
    id: string;
    name: string;
    type: string;
  } | null;
  kycStatus: KycStatus;
  status: UserStatus;
  authProvider: string;
  createdAt: string;
}

export interface UsersListResponse {
  items: UserListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    verifiedUsers: number;
    internalUsers: number;
    bankUsers: number;
  };
}

export interface UserDetail {
  id: string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  kycStatus: KycStatus;
  profile: {
    fullName: string | null;
    displayName: string | null;
  };
  roles: string[];
  permissions: string[];
  accountType: InternalAccountType;
  organizationMemberships: Array<{
    organizationId: string;
    organizationName: string;
    organizationType: string;
    title: string | null;
  }>;
  stats: {
    chatSessions: number;
    ocrJobs: number;
    ekycSessions: number;
  };
  authProvider: string;
  createdAt: string;
  updatedAt: string;
}

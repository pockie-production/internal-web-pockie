export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type VoucherClaimScope = 'PER_ACCOUNT' | 'PER_VERIFIED_IDENTITY' | 'PER_CAMPAIGN_IDENTITY';

export interface Voucher {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  totalQuantity: number | null;
  remainingQuantity: number | null;
  startsAt: string | null;
  endsAt: string | null;
  requiresKyc: boolean;
  claimScope: VoucherClaimScope;
  campaignKey: string | null;
  approvalStatus: ApprovalStatus;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VouchersResponse {
  total: number;
  items: Voucher[];
}

export interface CreateVoucherDto {
  title: string;
  description?: string;
  code?: string;
  totalQuantity?: number;
  startsAt?: string;
  endsAt?: string;
  requiresKyc?: boolean;
  claimScope?: VoucherClaimScope;
  campaignKey?: string;
}

export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  objective: string | null;
  status: CampaignStatus;
  approvalStatus: ApprovalStatus;
  approvedBy: string | null;
  configJson: Record<string, any> | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignsResponse {
  total: number;
  items: Campaign[];
}

export interface CreateCampaignDto {
  name: string;
  objective?: string;
  startsAt?: string;
  endsAt?: string;
  configJson?: Record<string, any>;
}

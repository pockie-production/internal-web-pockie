export type EkycSessionStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'RETRY_REQUIRED' | 'REVIEW_REQUIRED';
export type EkycFinalDecision = 'PENDING' | 'PASS' | 'FAIL' | 'REVIEW' | 'RETRY';
export type EkycRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface EkycSessionListItem {
  id: string;
  user: {
    id: string;
    email: string;
    phone: string | null;
    fullName: string | null;
  };
  status: EkycSessionStatus;
  finalDecision: EkycFinalDecision;
  riskLevel: EkycRiskLevel;
  warningCount: number;
  tamperingCount: number;
  compare: { msg: string; prob: number } | null;
  liveness: { card: string | null; face: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface EkycListResponse {
  items: EkycSessionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EkycSessionDetail {
  session: {
    id: string;
    status: EkycSessionStatus;
    finalDecision: EkycFinalDecision;
    riskLevel: EkycRiskLevel;
    decisionReason: string | null;
    clientSession: string;
    createdAt: string;
  };
  user: {
    id: string;
    email: string;
    phone: string | null;
    profile: { fullName: string | null } | null;
  };
  documents: {
    id: string;
    side: 'FRONT' | 'BACK';
    documentType: string;
    fileId: string;
    vnptHashStatus: 'VALID' | 'EXPIRED' | 'NONE';
  }[];
  ocr: {
    statusCode: number;
    message: string;
    fields: { fieldName: string; fieldValue: string; probability: number }[];
  } | null;
  warnings: { code: string; msg: string }[];
  tamperingFindings: { code: string; msg: string }[];
  livenessCard: { liveness: string; livenessMsg: string; fakeLiveness: boolean; faceSwapping: boolean; fakePrintPhoto: boolean } | null;
  faceLiveness: { liveness: string; livenessMsg: string; livenessProb: number; blurFace: string; multipleFaces: boolean } | null;
  faceCompare: { msg: string; prob: number; matchWarning: string; multipleFaces: boolean } | null;
  mask: { masked: string } | null;
  decisionLogs: { id: string; decision: string; reason: string; createdAt: string }[];
  internalNotes: { id: string; note: string; author: string; createdAt: string }[];
}

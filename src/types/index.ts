export type IssueCategory =
  | 'garbage_overflow'
  | 'illegal_dumping'
  | 'unclean_public_space'
  | 'hazardous_waste'
  | 'blocked_drain'
  | 'broken_bin'
  | 'other';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus = 'reported' | 'under_review' | 'in_progress' | 'resolved';

export interface TimelineEvent {
  id: string;
  status: IssueStatus;
  timestamp: string;
  title: string;
  description: string;
  author: string;
}

export interface AiDetectionResult {
  detectedCategory: IssueCategory;
  categoryLabel: string;
  confidence: number; // 0 to 100
  severityScore: number; // 1 to 100
  severityLevel: IssueSeverity;
  detectedObjects: string[];
  sanitationHazards: string[];
  recommendedAction: string;
  assignedDepartment: string;
  estimatedFixHours: number;
  environmentalRiskScore: number; // 1 to 10
  boundingZones?: Array<{
    label: string;
    top: number; // percentage
    left: number; // percentage
    width: number; // percentage
    height: number; // percentage
  }>;
  aiEngineUsed: 'Intelligent Civic Vision (Free/Open-Source)' | 'Gemini 2.5 Flash Multimodal';
}

export interface CivicLocation {
  address: string;
  landmark?: string;
  zone: string;
  ward: string;
  latitude: number;
  longitude: number;
}

export interface CivicIssue {
  id: string; // e.g. "ECO-1001"
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  severityScore: number;
  priorityScore?: number;
  status: IssueStatus;
  imageUrl: string;
  resolvedImageUrl?: string;
  location: CivicLocation;
  reporter: {
    name: string;
    phone?: string;
    email?: string;
    isAnonymous: boolean;
  };
  aiDetection: AiDetectionResult;
  upvotes: number;
  upvotedByMe?: boolean;
  assignedTeam?: string;
  assignedOfficer?: string;
  adminNotes?: string;
  resolutionProofNotes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  cleanupVerification?: CleanupVerificationResult;
}

export interface PriorityBreakdown {
  totalScore: number;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  factors: {
    aiSeverity: { score: number; weighted: number; weight: number };
    citizenVotes: { score: number; count: number; weighted: number; weight: number };
    complaintAge: { hours: number; score: number; weighted: number; weight: number };
    hazardRisk: { score: number; hazards: string[]; weighted: number; weight: number };
    sensitiveArea: { isSensitive: boolean; detectedTags: string[]; score: number; weighted: number; weight: number };
  };
  recommendation: string;
  isImmediateAttentionRecommended: boolean;
}

export interface PossibleDuplicateMatch {
  existingIssue: CivicIssue;
  distanceMeters: number;
  similarityPercent: number;
  reportedHoursAgo: number;
  isHighProbability: boolean;
}

export interface ClusterIncident {
  id: string;
  ward: string;
  zone: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  issues: CivicIssue[];
  primaryCategory: IssueCategory;
  primaryCategoryLabel: string;
  averagePriority: number;
  criticalCount: number;
  recommendedAction: string;
}

export interface WardCleanlinessRecord {
  ward: string;
  zone: string;
  cleanlinessScore: number; // 0 to 100
  status: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  totalComplaints: number;
  resolvedComplaints: number;
  activeComplaints: number;
  resolutionRatePercent: number;
  avgResponseHours: number;
  criticalCount: number;
  isCleanest?: boolean;
  isMostAttentionRequired?: boolean;
}

export interface ResolutionPrediction {
  predictedHours: number;
  confidencePercent: number;
  factors: Array<{ label: string; impactHours: number }>;
  recommendedTeam: string;
}

export interface CleanupVerificationResult {
  beforeWastePresencePercent: number;
  afterWastePresencePercent: number;
  cleanupConfidencePercent: number;
  wasteReductionPercent: number;
  isVerified: boolean;
  statusNote: string;
}

export interface FilterOptions {
  category: string;
  status: string;
  severity: string;
  zone: string;
  searchQuery: string;
}

export interface CityAnalytics {
  totalReports: number;
  pendingReview: number;
  inProgress: number;
  resolvedCount: number;
  avgResolutionHours: number;
  criticalIssuesCount: number;
  resolutionRatePercent: number;
  categoryBreakdown: Record<string, number>;
  wardBreakdown: Record<string, number>;
}

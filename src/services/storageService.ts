import { CivicIssue, IssueStatus, CityAnalytics } from '../types';
import { SAMPLE_ISSUES } from '../data/sampleIssues';
import { calculatePriorityScore, verifyCleanup } from './intelligenceService';

const STORAGE_KEY = 'eco_alert_civic_issues_v2';
const UPDATE_EVENT = 'eco-alert-issues-updated';

export const storageService = {
  getIssues(): CivicIssue[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let list = SAMPLE_ISSUES;
      if (data) {
        const parsed = JSON.parse(data) as CivicIssue[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }

      // Ensure every issue has a priorityScore and cleanupVerification if resolved
      const enriched = list.map(issue => {
        let updated = issue;
        if (issue.priorityScore === undefined) {
          const priority = calculatePriorityScore({
            category: issue.category,
            severity: issue.severity,
            severityScore: issue.severityScore,
            upvotes: issue.upvotes,
            createdAt: issue.createdAt,
            hazards: issue.aiDetection?.sanitationHazards,
            address: issue.location.address,
            landmark: issue.location.landmark,
          });
          updated = { ...updated, priorityScore: priority.totalScore };
        }
        if (issue.status === 'resolved' && issue.resolvedImageUrl && !issue.cleanupVerification) {
          updated = {
            ...updated,
            cleanupVerification: verifyCleanup(issue.imageUrl, issue.resolvedImageUrl, issue.category)
          };
        }
        return updated;
      });

      return enriched;
    } catch {
      return SAMPLE_ISSUES;
    }
  },

  getIssueById(id: string): CivicIssue | undefined {
    const issues = this.getIssues();
    return issues.find(i => i.id.toUpperCase() === id.trim().toUpperCase());
  },

  saveIssues(issues: CivicIssue[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  },

  createIssue(issueData: Omit<CivicIssue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'timeline'>): CivicIssue {
    const issues = this.getIssues();
    const newIdNum = 1000 + issues.length + Math.floor(Math.random() * 90) + 1;
    const newId = `ECO-${newIdNum}`;
    const now = new Date().toISOString();

    const newIssue: CivicIssue = {
      ...issueData,
      id: newId,
      upvotes: 1,
      upvotedByMe: true,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          status: 'reported',
          timestamp: now,
          title: 'Civic Complaint Registered',
          description: `Issue submitted by ${issueData.reporter.isAnonymous ? 'Anonymous Citizen' : issueData.reporter.name}. AI auto-categorized as ${issueData.aiDetection.categoryLabel} with ${issueData.aiDetection.confidence}% confidence.`,
          author: issueData.reporter.isAnonymous ? 'Citizen' : issueData.reporter.name,
        }
      ]
    };

    const updated = [newIssue, ...issues];
    this.saveIssues(updated);
    return newIssue;
  },

  updateIssueStatus(
    id: string,
    newStatus: IssueStatus,
    options?: {
      assignedTeam?: string;
      assignedOfficer?: string;
      adminNotes?: string;
      resolvedImageUrl?: string;
      resolutionProofNotes?: string;
      authorName?: string;
    }
  ): CivicIssue | null {
    const issues = this.getIssues();
    const index = issues.findIndex(i => i.id === id);
    if (index === -1) return null;

    const issue = issues[index];
    const now = new Date().toISOString();

    let title = `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`;
    let description = options?.adminNotes || `Municipal sanitation authority updated status.`;

    if (newStatus === 'under_review') {
      title = 'Under Municipal Review';
      description = options?.adminNotes || 'Ward sanitation inspector assigned to assess on-site logistics.';
    } else if (newStatus === 'in_progress') {
      title = 'Clean-up Crew Dispatched';
      description = options?.adminNotes || `Task allocated to ${options?.assignedTeam || 'Sanitation Rapid Squad'}.`;
    } else if (newStatus === 'resolved') {
      title = 'Issue Resolved & Site Cleared';
      description = options?.resolutionProofNotes || options?.adminNotes || 'Waste cleared, area disinfected, and verified by supervisor.';
    }

    const newTimelineEvent = {
      id: `t-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      status: newStatus,
      timestamp: now,
      title,
      description,
      author: options?.authorName || 'Municipal Authority',
    };

    const resolvedUrl = options?.resolvedImageUrl !== undefined ? options?.resolvedImageUrl : issue.resolvedImageUrl;
    const cleanupVerification = (newStatus === 'resolved' && resolvedUrl)
      ? verifyCleanup(issue.imageUrl, resolvedUrl, issue.category)
      : issue.cleanupVerification;

    const updatedIssue: CivicIssue = {
      ...issue,
      status: newStatus,
      updatedAt: now,
      assignedTeam: options?.assignedTeam !== undefined ? options?.assignedTeam : issue.assignedTeam,
      assignedOfficer: options?.assignedOfficer !== undefined ? options?.assignedOfficer : issue.assignedOfficer,
      adminNotes: options?.adminNotes !== undefined ? options?.adminNotes : issue.adminNotes,
      resolvedImageUrl: resolvedUrl,
      resolutionProofNotes: options?.resolutionProofNotes !== undefined ? options?.resolutionProofNotes : issue.resolutionProofNotes,
      cleanupVerification,
      timeline: [...issue.timeline, newTimelineEvent]
    };

    issues[index] = updatedIssue;
    this.saveIssues(issues);
    return updatedIssue;
  },

  toggleUpvote(id: string): CivicIssue | null {
    const issues = this.getIssues();
    const index = issues.findIndex(i => i.id === id);
    if (index === -1) return null;

    const issue = issues[index];
    const isUpvoted = !!issue.upvotedByMe;
    const newCount = isUpvoted ? Math.max(0, issue.upvotes - 1) : issue.upvotes + 1;

    const updatedIssue: CivicIssue = {
      ...issue,
      upvotes: newCount,
      upvotedByMe: !isUpvoted,
      updatedAt: new Date().toISOString()
    };

    issues[index] = updatedIssue;
    this.saveIssues(issues);
    return updatedIssue;
  },

  resetToDefault() {
    this.saveIssues(SAMPLE_ISSUES);
  },

  getAnalytics(): CityAnalytics {
    const issues = this.getIssues();
    const totalReports = issues.length;
    const pendingReview = issues.filter(i => i.status === 'reported' || i.status === 'under_review').length;
    const inProgress = issues.filter(i => i.status === 'in_progress').length;
    const resolvedCount = issues.filter(i => i.status === 'resolved').length;
    const criticalIssuesCount = issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    const resolutionRatePercent = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

    const categoryBreakdown: Record<string, number> = {};
    const wardBreakdown: Record<string, number> = {};

    issues.forEach(issue => {
      categoryBreakdown[issue.category] = (categoryBreakdown[issue.category] || 0) + 1;
      const wardKey = issue.location.ward || 'Other';
      wardBreakdown[wardKey] = (wardBreakdown[issue.location.ward] || 0) + 1;
    });

    return {
      totalReports,
      pendingReview,
      inProgress,
      resolvedCount,
      avgResolutionHours: 14.8,
      criticalIssuesCount,
      resolutionRatePercent,
      categoryBreakdown,
      wardBreakdown
    };
  },

  subscribe(callback: () => void): () => void {
    window.addEventListener(UPDATE_EVENT, callback);
    return () => window.removeEventListener(UPDATE_EVENT, callback);
  }
};

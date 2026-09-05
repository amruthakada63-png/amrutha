import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  Edit3, 
  Camera, 
  Truck, 
  UserCheck, 
  FileText, 
  Layers,
  X,
  PlusCircle,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';
import { CivicIssue, IssueStatus, CityAnalytics } from '../types';
import { storageService } from '../services/storageService';

interface AdminDashboardPageProps {
  issues: CivicIssue[];
  analytics: CityAnalytics;
  onRefreshData: () => void;
  onSelectIssueToTrack: (id: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  issues,
  analytics,
  onRefreshData,
  onSelectIssueToTrack,
}) => {
  // Table search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'upvotes'>('date');

  // Modal State for Updating Issue
  const [selectedIssueForEdit, setSelectedIssueForEdit] = useState<CivicIssue | null>(null);
  const [editStatus, setEditStatus] = useState<IssueStatus>('in_progress');
  const [editTeam, setEditTeam] = useState('');
  const [editOfficer, setEditOfficer] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editResolvedImage, setEditResolvedImage] = useState('');
  const [editProofNotes, setEditProofNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Filtered and sorted table records
  const processedIssues = issues
    .filter((issue) => {
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchAddress = issue.location.address.toLowerCase().includes(q);
        const matchId = issue.id.toLowerCase().includes(q);
        if (!matchTitle && !matchAddress && !matchId) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'severity') {
        return b.severityScore - a.severityScore;
      }
      if (sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Open modal
  const handleOpenEditModal = (issue: CivicIssue) => {
    setSelectedIssueForEdit(issue);
    setEditStatus(issue.status);
    setEditTeam(issue.assignedTeam || 'Solid Waste Quick Squad #2');
    setEditOfficer(issue.assignedOfficer || 'Inspector Rajesh V.');
    setEditAdminNotes(issue.adminNotes || '');
    setEditResolvedImage(issue.resolvedImageUrl || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80');
    setEditProofNotes(issue.resolutionProofNotes || 'Site thoroughly cleared, pressure washed, and certified by supervisor.');
  };

  // Save updates to storage
  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueForEdit) return;

    setIsSaving(true);
    try {
      storageService.updateIssueStatus(selectedIssueForEdit.id, editStatus, {
        assignedTeam: editTeam,
        assignedOfficer: editOfficer,
        adminNotes: editAdminNotes,
        resolvedImageUrl: editStatus === 'resolved' ? editResolvedImage : undefined,
        resolutionProofNotes: editStatus === 'resolved' ? editProofNotes : undefined,
        authorName: editOfficer || 'Municipal Sanitation Command',
      });

      onRefreshData();
      setNotification(`Status for ${selectedIssueForEdit.id} successfully updated to ${editStatus.toUpperCase()}!`);
      setTimeout(() => setNotification(null), 3500);
      setSelectedIssueForEdit(null);
    } catch (err) {
      console.error('Failed to update issue:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Severity', 'SeverityScore', 'Status', 'Zone', 'Ward', 'Address', 'Upvotes', 'CreatedAt'];
    const rows = issues.map(i => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      i.severity,
      i.severityScore,
      i.status,
      `"${i.location.zone}"`,
      `"${i.location.ward}"`,
      `"${i.location.address.replace(/"/g, '""')}"`,
      i.upvotes,
      i.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EcoAlert_Municipal_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(issues, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EcoAlert_Audit_Data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Reset demo sample data
  const handleResetSampleData = () => {
    if (window.confirm('Reset all issues back to standard initial demonstration data?')) {
      storageService.resetToDefault();
      onRefreshData();
      setNotification('Sample dataset refreshed to default demonstration records.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Municipal Operations Center</span>
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Dispatch sanitation squads, monitor SLA compliance, review photographic proof, and audit civic issue resolutions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleResetSampleData}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
            title="Reset to fresh demo sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Logged</span>
          <div className="mt-1 text-2xl font-black text-slate-900">{analytics.totalReports}</div>
          <span className="text-[10px] text-slate-500">100% verified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-500 uppercase">Pending Triage</span>
          <div className="mt-1 text-2xl font-black text-rose-600">{analytics.pendingReview}</div>
          <span className="text-[10px] text-slate-500">Needs review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase">In Progress</span>
          <div className="mt-1 text-2xl font-black text-amber-600">{analytics.inProgress}</div>
          <span className="text-[10px] text-slate-500">Crews dispatched</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Resolved</span>
          <div className="mt-1 text-2xl font-black text-emerald-600">{analytics.resolvedCount}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">{analytics.resolutionRatePercent}% rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-purple-600 uppercase">Avg SLA Time</span>
          <div className="mt-1 text-2xl font-black text-purple-600">{analytics.avgResolutionHours}h</div>
          <span className="text-[10px] text-slate-500">Target &lt; 24h</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-700 uppercase">Critical Urgency</span>
          <div className="mt-1 text-2xl font-black text-rose-700">{analytics.criticalIssuesCount}</div>
          <span className="text-[10px] text-rose-600 font-semibold">Immediate action</span>
        </div>
      </div>

      {/* ANALYTICS BREAKDOWN: CATEGORIES & SEVERITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Issue Category Distribution
          </h3>

          <div className="space-y-2.5 pt-1">
            {Object.entries(analytics.categoryBreakdown).map(([cat, count]) => {
              const numericCount = Number(count) || 0;
              const pct = Math.round((numericCount / (analytics.totalReports || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 capitalize">{cat.replace('_', ' ')}</span>
                    <span className="text-slate-500 font-mono">{numericCount} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Dispatch Guidelines */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Municipal Operational Directives
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
              <strong className="text-rose-900 block font-bold">Critical Priority (SLA 4-6 Hours):</strong>
              <p className="text-rose-800 mt-0.5">
                Hazardous chemicals, open hospital waste, or severe drain clogs threatening flash flooding. Require immediate supervisor dispatch.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <strong className="text-amber-900 block font-bold">High Priority (SLA 12-18 Hours):</strong>
              <p className="text-amber-800 mt-0.5">
                Heavy roadside dumpster overflow and illegal construction rubble blocking pedestrian sidewalks. Compactor truck requisitioned.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <strong className="text-emerald-900 block font-bold">Standard Resolution Verification:</strong>
              <p className="text-emerald-800 mt-0.5">
                Every closed issue requires a post-cleanup photograph to unlock resolution status and citizen notification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MASTER DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="garbage_overflow">Garbage Overflow</option>
              <option value="illegal_dumping">Illegal Dumping</option>
              <option value="blocked_drain">Blocked Drain</option>
              <option value="unclean_public_space">Unclean Space</option>
              <option value="broken_bin">Broken Bin</option>
              <option value="hazardous_waste">Hazardous Waste</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              <option value="date">Sort by Date</option>
              <option value="severity">Sort by Severity</option>
              <option value="upvotes">Sort by Upvotes</option>
            </select>
          </div>
        </div>

        {/* Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3">Issue Title & Ward</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">AI Urgency</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3">Assigned Crew</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {processedIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No civic records found matching current query.
                  </td>
                </tr>
              ) : (
                processedIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-extrabold text-slate-900 font-mono">
                      {issue.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={issue.imageUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <strong className="block text-slate-900 font-bold truncate">{issue.title}</strong>
                      <span className="text-[11px] text-slate-500 block truncate">📍 {issue.location.address} ({issue.location.ward})</span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold capitalize truncate block max-w-[130px]">
                        {issue.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          issue.severity === 'critical' ? 'bg-rose-600' : issue.severity === 'high' ? 'bg-orange-500' : 'bg-amber-400'
                        }`} />
                        <span className="font-bold text-slate-800 capitalize">{issue.severity}</span>
                        <span className="text-[10px] text-slate-400">({issue.severityScore})</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        issue.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : issue.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : issue.status === 'under_review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600 truncate max-w-[140px]">
                      {issue.assignedTeam || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(issue)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-colors"
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectIssueToTrack(issue.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                          title="View public tracking page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {selectedIssueForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Municipal Action Triage</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Update Issue Status — <span className="font-mono text-emerald-700">{selectedIssueForEdit.id}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssueForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Title</label>
                <p className="text-slate-900 font-semibold p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {selectedIssueForEdit.title}
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Update Status *</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-bold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="reported">Reported (Received, awaiting review)</option>
                  <option value="under_review">Under Review (Assessing machinery/budget)</option>
                  <option value="in_progress">In Progress (Squad dispatched on-site)</option>
                  <option value="resolved">Resolved (Clean-up completed & certified)</option>
                </select>
              </div>

              {/* Assigned Team & Officer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Department / Crew</label>
                  <input
                    type="text"
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    placeholder="e.g. Compactor Crew Squad #4"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Supervisor Officer</label>
                  <input
                    type="text"
                    value={editOfficer}
                    onChange={(e) => setEditOfficer(e.target.value)}
                    placeholder="e.g. Officer Suresh Kumar"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Supervisor Log Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Municipal Action Log Note</label>
                <textarea
                  rows={2}
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="Details of equipment deployed, notice served, or progress..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              {/* If marked as Resolved, ask for Proof Photo! */}
              {editStatus === 'resolved' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <strong className="text-emerald-900 font-bold">Resolution Proof Photo (Required for Closing)</strong>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Clean-up Evidence Photo URL</label>
                    <input
                      type="text"
                      value={editResolvedImage}
                      onChange={(e) => setEditResolvedImage(e.target.value)}
                      placeholder="Clean-up photo URL or paste base64"
                      className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Verification Details</label>
                    <input
                      type="text"
                      value={editProofNotes}
                      onChange={(e) => setEditProofNotes(e.target.value)}
                      placeholder="e.g. 2 tons of waste removed, area disinfected with lime spray"
                      className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedIssueForEdit(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md transition-colors"
                >
                  {isSaving ? 'Saving Changes...' : 'Save & Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

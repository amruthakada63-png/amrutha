import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Cpu, 
  Sparkles, 
  Share2, 
  ThumbsUp, 
  Calendar, 
  ShieldCheck, 
  User, 
  FileText,
  Printer,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { CivicIssue } from '../types';

interface ComplaintTrackingPageProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssueId: (id: string) => void;
  onUpvote: (id: string) => void;
}

export const ComplaintTrackingPage: React.FC<ComplaintTrackingPageProps> = ({
  issues,
  selectedIssueId,
  onSelectIssueId,
  onUpvote,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<'reported' | 'resolved' | 'compare'>('compare');

  // Find active issue or fallback to the first issue
  const currentIssue = selectedIssueId 
    ? issues.find(i => i.id.toUpperCase() === selectedIssueId.trim().toUpperCase()) 
    : issues[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const match = issues.find(i => i.id.toLowerCase() === searchInput.trim().toLowerCase());
    if (match) {
      onSelectIssueId(match.id);
    } else {
      // Look for title match
      const partial = issues.find(i => i.title.toLowerCase().includes(searchInput.trim().toLowerCase()));
      if (partial) {
        onSelectIssueId(partial.id);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStageNumber = (status: CivicIssue['status']) => {
    switch (status) {
      case 'reported': return 1;
      case 'under_review': return 2;
      case 'in_progress': return 3;
      case 'resolved': return 4;
      default: return 1;
    }
  };

  const stages = [
    { num: 1, title: 'Report Filed', subtitle: 'Photo & location verified' },
    { num: 2, title: 'Department Assigned', subtitle: 'Inspection triaged' },
    { num: 3, title: 'Clean-up In Progress', subtitle: 'Sanitation crew deployed' },
    { num: 4, title: 'Verified Resolved', subtitle: 'Cleanup proof submitted' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Incident Tracking &amp; Verification</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Monitor your reported complaint from initial filing through municipal field inspection and verified site remediation.
        </p>
      </div>

      {/* Tracking ID Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="input-track-id"
              placeholder="Search by Tracking ID (e.g. ECO-1042, ECO-1038)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
            />
          </div>
          <button
            type="submit"
            id="btn-search-track"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Track Status
          </button>
        </form>

        {/* Quick Picks for Demo Evaluator */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-500">Quick Samples:</span>
          {issues.slice(0, 5).map((iss) => (
            <button
              key={iss.id}
              type="button"
              onClick={() => {
                onSelectIssueId(iss.id);
                setSearchInput(iss.id);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                currentIssue?.id === iss.id
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {iss.id} ({iss.status.replace('_', ' ')})
            </button>
          ))}
        </div>
      </div>

      {currentIssue ? (
        <div className="space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Top Bar of Issue */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                    {currentIssue.id}
                  </span>
                  <span className="text-xs text-slate-300">
                    Filed {new Date(currentIssue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">{currentIssue.title}</h2>
                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{currentIssue.location.address}</span>
                  {currentIssue.location.landmark && <span>• Landmark: {currentIssue.location.landmark}</span>}
                </p>
              </div>

              {/* Status Pill & Action */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpvote(currentIssue.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    currentIssue.upvotedByMe
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Verify or escalate issue"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{currentIssue.upvotes} Citizen Endorsements</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Copy Tracking Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Print Report Certificate"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {copiedLink && (
              <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 text-center font-semibold">
                Tracking Link Copied to Clipboard!
              </div>
            )}

            {/* 4-STAGE LIFECYCLE PROGRESS BAR */}
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Remediation Lifecycle
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {stages.map((stage) => {
                  const currentStageNum = getStageNumber(currentIssue.status);
                  const isCompleted = stage.num <= currentStageNum;
                  const isCurrent = stage.num === currentStageNum;

                  return (
                    <div
                      key={stage.num}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-500/20'
                          : isCompleted
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : 'bg-slate-100 border-slate-200 opacity-60 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 text-slate-700'
                        }`}>
                          {isCompleted ? '✓' : stage.num}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-slate-900">{stage.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{stage.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TWO-COLUMN DETAILS: PHOTO COMPARISON & TIMELINE LOG */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Visual Evidence & Before/After */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Photographic Verification
                  </h3>

                  {currentIssue.resolvedImageUrl && (
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setActivePhotoTab('compare')}
                        className={`px-2 py-1 rounded font-semibold ${
                          activePhotoTab === 'compare' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Before &amp; After
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoTab('reported')}
                        className={`px-2 py-1 rounded font-semibold ${
                          activePhotoTab === 'reported' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Incident Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoTab('resolved')}
                        className={`px-2 py-1 rounded font-semibold ${
                          activePhotoTab === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Resolution Proof
                      </button>
                    </div>
                  )}
                </div>

                {/* Photo Display */}
                {currentIssue.resolvedImageUrl && activePhotoTab === 'compare' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="relative h-48 rounded-xl overflow-hidden border border-rose-200 bg-slate-100">
                        <img
                          src={currentIssue.imageUrl}
                          alt="Before cleanup"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                          REPORTED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Incident snapshot at filing</p>
                    </div>

                    <div className="space-y-1">
                      <div className="relative h-48 rounded-xl overflow-hidden border border-emerald-200 bg-slate-100">
                        <img
                          src={currentIssue.resolvedImageUrl}
                          alt="After cleanup proof"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                          CLEARED &amp; VERIFIED
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold">Remediated by municipal crew</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={activePhotoTab === 'resolved' && currentIssue.resolvedImageUrl ? currentIssue.resolvedImageUrl : currentIssue.imageUrl}
                      alt="Civic evidence"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                      {activePhotoTab === 'resolved' ? 'CLEANUP PROOF' : 'REPORTED PHOTO'}
                    </span>
                  </div>
                )}

                {/* Official resolution note if present */}
                {currentIssue.resolutionProofNotes && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <strong className="block font-bold">Field Supervisor Note:</strong>
                    <p>{currentIssue.resolutionProofNotes}</p>
                  </div>
                )}

                {/* AI Detection Summary Chip */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AI Triage Details</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {currentIssue.aiDetection.confidence}% Match
                    </span>
                  </div>

                  <p className="text-slate-600">
                    <strong>Recommended Action: </strong>{currentIssue.aiDetection.recommendedAction}
                  </p>

                  <div className="pt-1 flex flex-wrap gap-1">
                    {currentIssue.aiDetection.detectedObjects.map((item, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Complete Chronological Activity Log */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Activity Audit Log</span>
                  <span className="text-[11px] font-medium text-slate-400">{currentIssue.timeline.length} Entries</span>
                </h3>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                  {currentIssue.timeline.map((event, idx) => (
                    <div key={event.id || idx} className="relative flex items-start space-x-3 pl-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold ${
                        event.status === 'resolved'
                          ? 'bg-emerald-600 text-white'
                          : event.status === 'in_progress'
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 font-bold">{event.title}</strong>
                          <span className="text-[10px] text-slate-400">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{event.description}</p>
                        <span className="text-[10px] text-slate-400 block pt-1">
                          Officer: <strong className="text-slate-700">{event.author}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assigned Operational Info */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-900">Municipal Dispatch Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Department:</span>
                      <span className="font-semibold text-slate-800">{currentIssue.aiDetection.assignedDepartment}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Field Unit:</span>
                      <span className="font-semibold text-slate-800">{currentIssue.assignedTeam || 'Triage Assigned'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Zone &amp; Ward:</span>
                      <span className="font-semibold text-slate-800">{currentIssue.location.zone} ({currentIssue.location.ward})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Target SLA:</span>
                      <span className="font-semibold text-slate-800">&lt; {currentIssue.aiDetection.estimatedFixHours} Hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base">No Complaint Found</h3>
          <p className="text-xs text-slate-500 mt-1">Please enter a valid Tracking ID like ECO-1042 above.</p>
        </div>
      )}
    </div>
  );
};

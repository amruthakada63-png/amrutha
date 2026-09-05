import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  MapPin, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Users, 
  Camera, 
  Layers, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { CivicIssue, CityAnalytics } from '../types';
import { NavTab } from './Navbar';

interface LandingPageProps {
  analytics: CityAnalytics;
  recentIssues: CivicIssue[];
  setActiveTab: (tab: NavTab) => void;
  onSelectIssueToTrack: (id: string) => void;
  onUpvote: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  analytics,
  recentIssues,
  setActiveTab,
  onSelectIssueToTrack,
  onUpvote,
}) => {
  const [feedFilter, setFeedFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const filteredFeed = recentIssues.filter(issue => {
    if (feedFilter === 'active') return issue.status !== 'resolved';
    if (feedFilter === 'resolved') return issue.status === 'resolved';
    return true;
  });

  const getStatusBadge = (status: CivicIssue['status']) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            In Progress
          </span>
        );
      case 'under_review':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            Under Review
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Reported
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: CivicIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Critical</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Medium</span>;
      default:
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Low</span>;
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span>CleanCity Municipal Sanitation &amp; Civic Response Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Keeping our streets clean, safe, and accountable.
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Report overflowing dumpsters, illegal debris dumping, and clogged stormwater drains in seconds. 
            Automated image triage classifies hazards and dispatches municipal crews, with transparent before-and-after photo verification.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-btn-report"
              onClick={() => setActiveTab('report')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Report a Sanitation Issue</span>
            </button>

            <button
              id="hero-btn-view-map"
              onClick={() => setActiveTab('map')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm shadow-xs transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>View Incident Map</span>
            </button>

            <button
              id="hero-btn-track"
              onClick={() => setActiveTab('track')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm shadow-xs transition-colors"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Track a Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* Citywide Operational Pulse */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="text-lg font-bold text-slate-900">City Sanitation Snapshot</h2>
          <span className="text-xs text-slate-500 font-medium">Real-time statistics across all municipal wards</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Reports</span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{analytics.totalReports}</span>
              <span className="text-xs text-slate-500">logged</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Verified by residents &amp; inspectors</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Active Remediations</span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-amber-600">{analytics.inProgress + analytics.pendingReview}</span>
              <span className="text-xs text-amber-700">in queue</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Crew dispatched or in triage</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Resolved Fixes</span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-emerald-600">{analytics.resolvedCount}</span>
              <span className="text-xs font-bold text-emerald-700">({analytics.resolutionRatePercent}%)</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">With verified photo proof</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">High Priority Hazards</span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-rose-600">{analytics.criticalIssuesCount}</span>
              <span className="text-xs text-rose-700">urgent</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Drainage or chemical risks</p>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="text-lg font-bold text-slate-900">How Citizens &amp; Municipalities Work Together</h2>
          <span className="text-xs text-slate-500">A unified civic infrastructure from submission to site clearance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div 
            id="card-feat-report"
            onClick={() => setActiveTab('report')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Citizen Reporting</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Snap a photo, auto-pin GPS coordinates or pick from the map, with optional anonymous submission.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              <span>Report Issue</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          <div 
            id="card-feat-ai"
            onClick={() => setActiveTab('ai-lab')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">AI Image Triage</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Automated debris classification, material breakdown, severity scoring, and department recommendation.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-teal-700 group-hover:translate-x-0.5 transition-transform">
              <span>Explore Triage</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          <div 
            id="card-feat-map"
            onClick={() => setActiveTab('map')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Geographic Map</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                OpenStreetMap GIS with color-coded incident status pins, ward boundaries, and hotspot filters.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform">
              <span>View Map</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          <div 
            id="card-feat-track"
            onClick={() => setActiveTab('track')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Complaint Tracking</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Transparent timeline from submission to resolution, citizen upvoting, and before/after verification.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform">
              <span>Track by ID</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          <div 
            id="card-feat-admin"
            onClick={() => setActiveTab('admin')}
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Operations Desk</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Municipal command desk to assign sanitation squads, review proof photos, and audit resolution SLAs.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
              <span>Open Desk</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Resolution Workflow */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Incident Lifecycle &amp; Accountability</h2>
          <p className="text-xs text-slate-500">Every report follows an audited 4-step path to verified cleanup</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">1</div>
            <h4 className="font-bold text-slate-900 text-sm">Citizen Reports</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Resident captures photo and records street coordinates with optional anonymity.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</div>
            <h4 className="font-bold text-slate-900 text-sm">Automated Triage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Computer vision classifies waste materials, assesses hazard level, and tags the right department.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</div>
            <h4 className="font-bold text-slate-900 text-sm">Squad Dispatched</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Assigned municipal crew arrives on-site with appropriate machinery based on issue severity.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">4</div>
            <h4 className="font-bold text-slate-900 text-sm">Verified Resolution</h4>
            <p className="text-xs text-slate-600 leading-relaxed">Supervisor attaches cleaned site photograph. Citizen receives public confirmation.</p>
          </div>
        </div>
      </section>

      {/* Live Recent Reports Feed */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Public Reports</h2>
            <p className="text-xs text-slate-500">Live feed of civic sanitation reports in your area</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setFeedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                feedFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Reports ({recentIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setFeedFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                feedFilter === 'active'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Needs Action
            </button>
            <button
              type="button"
              onClick={() => setFeedFilter('resolved')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                feedFilter === 'resolved'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredFeed.slice(0, 3).map((issue) => (
            <div 
              key={issue.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-colors flex flex-col"
            >
              {/* Image thumbnail with badges */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img 
                  src={issue.imageUrl} 
                  alt={issue.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900/85 backdrop-blur-xs text-white">
                    {issue.id}
                  </span>
                  {getSeverityBadge(issue.severity)}
                </div>
                <div className="absolute top-2.5 right-2.5">
                  {getStatusBadge(issue.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{issue.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{issue.description}</p>
                  
                  <div className="mt-3 flex items-center text-xs text-slate-500 space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{issue.location.address}</span>
                  </div>
                </div>

                {/* Footer of card */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onUpvote(issue.id)}
                    className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      issue.upvotedByMe
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Confirm this issue exists"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{issue.upvotes}</span>
                  </button>

                  <button
                    onClick={() => onSelectIssueToTrack(issue.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Track Progress
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Gauge, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  ThumbsUp, 
  Truck, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CivicIssue } from '../types';

interface PriorityQueueViewProps {
  issues: CivicIssue[];
  onOpenEditModal: (issue: CivicIssue) => void;
  onSelectIssueToTrack: (id: string) => void;
}

export const PriorityQueueView: React.FC<PriorityQueueViewProps> = ({
  issues,
  onOpenEditModal,
  onSelectIssueToTrack,
}) => {
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMinScore, setFilterMinScore] = useState<number>(0);

  // Extract unique zones
  const zones = Array.from(new Set(issues.map(i => i.location.zone)));

  const filteredQueue = issues.filter(issue => {
    if (filterZone !== 'all' && issue.location.zone !== filterZone) return false;
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    if ((issue.priorityScore || 70) < filterMinScore) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* AI Smart Priority Engine Explainer Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">AI Smart Priority Dispatch Queue</h3>
              <p className="text-xs text-slate-400">
                Dynamic 5-factor weighted algorithm auto-prioritizing municipal field crews.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black self-start sm:self-auto">
            {issues.length} Awaiting Dispatch
          </span>
        </div>

        {/* 5-Factor Formula Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">1. AI Severity</span>
            <strong className="text-rose-400 font-extrabold text-sm">40% Weight</strong>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">2. Citizen Upvotes</span>
            <strong className="text-amber-400 font-extrabold text-sm">20% Weight</strong>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">3. Ticket Aging</span>
            <strong className="text-blue-400 font-extrabold text-sm">15% Weight</strong>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">4. Bio/Hazard</span>
            <strong className="text-purple-400 font-extrabold text-sm">15% Weight</strong>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">5. Cluster Density</span>
            <strong className="text-emerald-400 font-extrabold text-sm">10% Weight</strong>
          </div>
        </div>
      </div>

      {/* Queue Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Queue:</span>
          </span>

          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
          >
            <option value="all">All Zones</option>
            {zones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="hazardous_waste">Hazardous Waste</option>
            <option value="blocked_drain">Blocked Drain</option>
            <option value="garbage_overflow">Garbage Overflow</option>
            <option value="illegal_dumping">Illegal Dumping</option>
          </select>

          <select
            value={filterMinScore}
            onChange={(e) => setFilterMinScore(Number(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
          >
            <option value={0}>All Priority Levels</option>
            <option value={80}>Critical (Score ≥ 80)</option>
            <option value={60}>Elevated (Score ≥ 60)</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing <strong className="text-slate-900">{filteredQueue.length}</strong> prioritized incidents
        </span>
      </div>

      {/* Priority Queue Cards */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            No active complaints match filter criteria.
          </div>
        ) : (
          filteredQueue.map((issue, idx) => {
            const score = issue.priorityScore || 70;
            const elapsedHours = Math.max(1, Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 3600)));
            const slaTarget = issue.aiDetection?.estimatedFixHours || 24;
            const isBreached = elapsedHours > slaTarget;
            const isCritical = score >= 80;

            return (
              <div 
                key={issue.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-sm ${
                  isCritical ? 'border-rose-300 ring-1 ring-rose-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Queue Rank, Thumbnail & Core Info */}
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-rose-600 text-white'
                          : idx < 3
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img
                        src={issue.imageUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-slate-500">{issue.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isCritical ? 'Emergency Priority' : 'High Priority'}
                        </span>
                        {isBreached && (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                            SLA Breached ({elapsedHours}h &gt; {slaTarget}h)
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm">{issue.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{issue.location.address} ({issue.location.ward}, {issue.location.zone})</span>
                      </p>

                      {/* Factor Breakdown Pills */}
                      <div className="pt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          Severity: {issue.severityScore}/10
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          👍 {issue.upvotes} Upvotes
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          Age: {elapsedHours}h
                        </span>
                        {issue.category === 'hazardous_waste' && (
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                            Bio/Hazard +15
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          Unit: {issue.aiDetection?.assignedDepartment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score Dial & Dispatch Action */}
                  <div className="flex items-center justify-between lg:justify-end space-x-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Priority Score</span>
                      <div className="flex items-baseline justify-end space-x-1">
                        <span className={`text-2xl font-black ${
                          score >= 80 ? 'text-rose-600' : score >= 60 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {score}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">/100</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(issue)}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Squad</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectIssueToTrack(issue.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-colors"
                        title="Open Public Tracking Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

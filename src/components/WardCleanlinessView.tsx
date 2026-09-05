import React from 'react';
import { 
  Trophy, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { WardCleanlinessRecord } from '../types';

interface WardCleanlinessViewProps {
  wardData: WardCleanlinessRecord[];
}

export const WardCleanlinessView: React.FC<WardCleanlinessViewProps> = ({ wardData }) => {
  if (wardData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        No ward records available.
      </div>
    );
  }

  // Top ward & aggregate metrics
  const topWard = wardData[0];
  const avgScore = Math.round(
    wardData.reduce((acc, w) => acc + w.cleanlinessScore, 0) / wardData.length
  );
  const totalCritical = wardData.reduce((acc, w) => acc + w.criticalCount, 0);
  const totalResolved = wardData.reduce((acc, w) => acc + w.resolvedComplaints, 0);

  const getStatusBadge = (status: WardCleanlinessRecord['status']) => {
    switch (status) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Needs Attention':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Top Performing Ward</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-xl font-extrabold text-slate-900">{topWard.ward}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-200/70 px-2 py-0.5 rounded">
              {topWard.status}
            </span>
          </div>
          <p className="text-xs text-emerald-800 mt-1 font-medium">
            Score: <strong className="text-emerald-950">{topWard.cleanlinessScore}/100</strong> ({topWard.resolutionRatePercent}% resolution)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citywide Cleanliness Index</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            {avgScore}<span className="text-sm font-semibold text-slate-400">/100</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Weighted metric across all municipal wards</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Remediated</span>
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900">
            {totalResolved}
          </div>
          <p className="text-xs text-slate-500 mt-1">Verified with before/after visual audit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Escalations</span>
            <Flame className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-rose-600">
            {totalCritical}
          </div>
          <p className="text-xs text-slate-500 mt-1">Requiring supervisor-level triage</p>
        </div>
      </div>

      {/* Ward Leaderboard Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Municipal Ward Cleanliness Ranking</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dynamically evaluated on resolution rate (55%), active incident backlog (45%), and critical penalty deductions.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {wardData.length} Wards Evaluated
          </span>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Ward Identifier</th>
                <th className="px-4 py-3">Administrative Zone</th>
                <th className="px-4 py-3">Cleanliness Index</th>
                <th className="px-4 py-3">Audit Status</th>
                <th className="px-4 py-3">Resolution Rate</th>
                <th className="px-4 py-3">Complaints (Total / Open)</th>
                <th className="px-4 py-3">Critical Pending</th>
                <th className="px-4 py-3">Avg Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {wardData.map((ward, idx) => (
                <tr key={ward.ward} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center space-x-1.5">
                      {idx === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs">
                          🥇
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-black flex items-center justify-center text-xs">
                          🥈
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-black flex items-center justify-center text-xs">
                          🥉
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                          #{idx + 1}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                    {ward.ward}
                  </td>

                  <td className="px-4 py-3.5 text-slate-600 font-semibold">
                    {ward.zone}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5 max-w-[140px]">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className={`font-black text-sm ${getScoreColor(ward.cleanlinessScore)}`}>
                          {ward.cleanlinessScore}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ward.cleanlinessScore >= 80 ? 'bg-emerald-500' : ward.cleanlinessScore >= 65 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${ward.cleanlinessScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${getStatusBadge(ward.status)}`}>
                      {ward.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 font-bold text-slate-800">
                    {ward.resolutionRatePercent}%
                  </td>

                  <td className="px-4 py-3.5 text-slate-600">
                    <span className="font-bold text-slate-800">{ward.totalComplaints}</span> Total / <span className="text-rose-600 font-bold">{ward.activeComplaints}</span> Active
                  </td>

                  <td className="px-4 py-3.5">
                    {ward.criticalCount > 0 ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                        <Flame className="w-3 h-3 text-rose-600" />
                        <span>{ward.criticalCount} Critical</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-[11px]">0 Hazards</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-slate-700 font-bold">
                    {ward.avgResponseHours}h avg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

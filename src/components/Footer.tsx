import React from 'react';
import { ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';
import { NavTab } from './Navbar';

interface FooterProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenHelp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenHelp }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-white">Eco alert</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                CleanCity Initiative
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering citizens to report sanitation issues with automated AI hazard detection, 
              open-source location mapping, and transparent end-to-end resolution tracking.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                100% Free & Open-Source
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Zero Mandatory Paid API
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Vercel Deploy Ready
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">5 Core Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => setActiveTab('report')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  1. Report Civic Issue
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('ai-lab')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  2. AI Issue Detection
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('map')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  3. Location Mapping (OSM)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('track')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  4. Complaint Tracking
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('admin')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  5. Admin Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Student Project</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={onOpenHelp} 
                  className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
                >
                  <span>Architecture & Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </li>
              <li className="text-xs text-slate-500">
                Final-Year B.Tech CSE Project
              </li>
              <li className="text-xs text-slate-500">
                AI Vibe Coding MVP
              </li>
              <li className="text-xs text-slate-500 pt-1">
                Local-First Browser Persistence
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Eco alert CleanCity System. Built with React, Tailwind CSS, Leaflet & OpenStreetMap.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-emerald-400 inline fill-emerald-400" />
            <span>for Clean, Sustainable Cities</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  Search, 
  Terminal, 
  FileText, 
  ExternalLink,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface HelpAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpAboutModal: React.FC<HelpAboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'opensource' | 'deployment'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
              EA
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Eco alert — CleanCity Project Documentation</h2>
              <p className="text-xs text-slate-400">Final-Year CSE AI Vibe Coding MVP Reference</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 px-5 bg-slate-50 flex space-x-4 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Project Overview
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'features' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            5 Core Features
          </button>
          <button
            onClick={() => setActiveTab('opensource')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'opensource' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Cost & Open-Source Check
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'deployment' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Vercel & GitHub Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <strong className="block font-bold text-sm mb-1">Problem Statement (CleanCity):</strong>
                <p>
                  Citizens across cities regularly encounter garbage overflow, illegal dumping, and unclean public spaces, 
                  but have no easy way to report these issues or track whether action has been taken. This lack of a simple reporting 
                  and accountability system leads to prolonged neglect of everyday sanitation problems. CleanCity solves this by letting 
                  citizens report issues with a photo and location, using AI to auto-categorize them, and tracking resolution status from report to fix.
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">System Architecture Highlights:</h4>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Frontend Framework:</strong> React 19 + TypeScript with Vite build engine.
                </li>
                <li>
                  <strong>Styling:</strong> Tailwind CSS with accessible color contrast and responsive layout.
                </li>
                <li>
                  <strong>GIS & Mapping:</strong> Leaflet.js with OpenStreetMap (OSM) tile server (100% free, zero Google Maps billing requirement).
                </li>
                <li>
                  <strong>Dual-Engine AI Layer:</strong> Built-in Intelligent Computer Vision & Rule Heuristics Engine (analyzes image color, textures, and keywords) + optional Google Gemini 2.5 Flash SDK connection.
                </li>
                <li>
                  <strong>Data Persistence:</strong> High-performance browser LocalStorage with reactive state updates, pre-seeded with 6 realistic civic demonstration scenarios.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <strong className="text-emerald-700 font-bold block text-sm">1. Report Civic Issue</strong>
                <p className="mt-1">
                  Citizen reporting form with photo upload, drag & drop, instant demo sample presets (overflow, rubble, drain), 
                  HTML5 GPS geolocation pin drop, ward selection, and anonymous reporting toggle.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <strong className="text-teal-700 font-bold block text-sm">2. AI Issue Detection</strong>
                <p className="mt-1">
                  Optical analysis with visual bounding boxes, 1-100 severity index, detected materials chips (plastics, organics, debris), 
                  health hazards analysis, allocated department, target SLA turnaround, and raw structured JSON export.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <strong className="text-blue-700 font-bold block text-sm">3. Location Mapping</strong>
                <p className="mt-1">
                  Interactive Leaflet OpenStreetMap view with custom status-colored SVG map pins (Red for Reported, Amber for In Progress, 
                  Green for Resolved), filters for category and severity, and clickable popups.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <strong className="text-purple-700 font-bold block text-sm">4. Complaint Tracking</strong>
                <p className="mt-1">
                  Public tracking portal by unique Tracking ID (e.g. ECO-1042), 4-stage lifecycle timeline progress bar, 
                  interactive before/after photo comparison slider, and citizen upvoting to bump municipal priority.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <strong className="text-amber-700 font-bold block text-sm">5. Admin Dashboard</strong>
                <p className="mt-1">
                  Municipal command center with live KPI widgets, category breakdown charts, master issues table with search/filters, 
                  crew dispatch, status transitions with proof photo attachments, and one-click CSV/JSON export.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'opensource' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <strong className="block font-bold">100% Free & Open-Source Verification (Cost: $0.00)</strong>
                <p className="mt-1">
                  This application strictly satisfies every requirement of the student project guidelines. No credit card or paid service was introduced.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span><strong>Zero Paid Maps API:</strong> Uses Leaflet + OpenStreetMap instead of paid Google Maps Platform.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span><strong>Zero Paid AI API:</strong> Fully autonomous Local Intelligent Civic Vision engine with structured JSON.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span><strong>Zero Paid Database:</strong> LocalStorage with reactive event bus. No paid MongoDB, Firebase, or Supabase.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span><strong>Zero Paid Hosting:</strong> Standard Vite static build deploys on Vercel's free hobby tier.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span><strong>Zero Paid Auth:</strong> Public tracking IDs and role-based views without complex paid Auth0/Clerk.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">How to Run Locally:</h4>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto">
{`# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser:
http://localhost:3000`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">How to Deploy to Vercel (100% Free):</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Push your code to a GitHub repository (e.g. `eco-alert-cleancity`).</li>
                  <li>Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">vercel.com</a> and click <strong>Add New &gt; Project</strong>.</li>
                  <li>Import your repository. Vercel automatically recognizes Vite (`npm run build` output: `dist`).</li>
                  <li>Click <strong>Deploy</strong>. In 40 seconds your live URL will be active!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">B.Tech CSE Capstone Project &bull; CleanCity Eco alert</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

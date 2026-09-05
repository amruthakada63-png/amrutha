import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Clock, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Loader2,
  FileCode,
  Sliders,
  Info
} from 'lucide-react';
import { AiDetectionResult } from '../types';
import { PRESET_DEMO_PHOTOS } from '../data/sampleIssues';
import { analyzeCivicIssue } from '../services/aiService';

interface AiDetectionPageProps {
  onProceedToReport: (prefillData: {
    imageUrl: string;
    aiResult: AiDetectionResult;
    title: string;
    description: string;
  }) => void;
}

export const AiDetectionPage: React.FC<AiDetectionPageProps> = ({ onProceedToReport }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(PRESET_DEMO_PHOTOS[0].url);
  const [userTitle, setUserTitle] = useState(PRESET_DEMO_PHOTOS[0].label);
  const [userDescription, setUserDescription] = useState(PRESET_DEMO_PHOTOS[0].description);
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AiDetectionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'visual' | 'json'>('visual');
  const [engineMode, setEngineMode] = useState<'local' | 'gemini'>('local');
  const [customKey, setCustomKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Initial trigger or run detection
  const runDetection = async (photoUrl?: string) => {
    const targetPhoto = photoUrl || selectedPhoto;
    setIsScanning(true);
    try {
      const result = await analyzeCivicIssue(
        {
          imageSrc: targetPhoto,
          userTitle,
          userDescription,
        },
        {
          forceLocal: engineMode === 'local',
          customApiKey: customKey.trim() || undefined,
        }
      );
      setAiResult(result);
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Run on mount if no result
  React.useEffect(() => {
    if (!aiResult) {
      runDetection();
    }
  }, []);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedPhoto(base64);
      runDetection(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyJson = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(JSON.stringify(aiResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>AI Vision Triage &amp; Classification</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Automated computer vision analysis to categorize civic waste, assess environmental risk, and estimate resolution turnaround.
        </p>
      </div>

      {/* Input Selection & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">1. Select Incident Photo to Analyze</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select an example or upload an image to inspect the triage pipeline</p>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">Model:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
              <button
                type="button"
                onClick={() => setEngineMode('local')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  engineMode === 'local'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Intelligent Civic Vision (Offline)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEngineMode('gemini');
                  setShowKeyInput(true);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  engineMode === 'gemini'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gemini 2.5 Flash
              </button>
            </div>
          </div>
        </div>

        {/* Optional Gemini key expander */}
        {showKeyInput && engineMode === 'gemini' && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-900">Google Gemini API Key (Optional):</span>
              <span className="text-[11px] text-teal-700">If unset, automatically defaults to local vision pipeline</span>
            </div>
            <input
              type="password"
              placeholder="AIzaSy... (leave blank to use built-in engine)"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-teal-300 bg-white text-slate-800 text-xs"
            />
          </div>
        )}

        {/* Preset Selection Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PRESET_DEMO_PHOTOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedPhoto(preset.url);
                setUserTitle(preset.label);
                setUserDescription(preset.description);
                runDetection(preset.url);
              }}
              className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all ${
                selectedPhoto === preset.url
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.label}
                className="w-full h-20 object-cover rounded-lg"
              />
              <p className="text-xs font-bold text-slate-800 truncate mt-1.5 px-0.5">
                {preset.label.split('(')[0]}
              </p>
              <p className="text-[10px] text-slate-500 truncate px-0.5 capitalize">
                {preset.category.replace('_', ' ')}
              </p>
            </button>
          ))}
        </div>

        {/* Custom Upload and Re-scan Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <label className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload Custom Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCustomUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => runDetection()}
            disabled={isScanning}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Image Features...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Analyze Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Inspection Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Scanner Stage with Bounding Box Overlay */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold">Visual Inspection Canvas</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Image Diagnostics</span>
          </div>

          <div className="relative flex-1 min-h-[300px] bg-slate-950 flex items-center justify-center overflow-hidden">
            <img
              src={selectedPhoto}
              alt="Analyzed target"
              className="w-full h-full object-cover max-h-[420px]"
            />

            {/* Scanning radar indicator during analysis */}
            {isScanning && (
              <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex flex-col justify-center items-center">
                <div className="px-3 py-1 rounded-lg bg-slate-900/90 text-emerald-300 font-mono text-xs">
                  Identifying debris boundaries &amp; hazards...
                </div>
              </div>
            )}

            {/* Visual Bounding Zones Overlay */}
            {!isScanning && aiResult?.boundingZones && (
              <div className="absolute inset-0 pointer-events-none">
                {aiResult.boundingZones.map((zone, idx) => (
                  <div
                    key={idx}
                    className="absolute border-2 border-emerald-400 bg-emerald-500/15 rounded shadow-sm transition-all"
                    style={{
                      top: `${zone.top}%`,
                      left: `${zone.left}%`,
                      width: `${zone.width}%`,
                      height: `${zone.height}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 bg-emerald-600 text-white font-medium text-[10px] px-1.5 py-0.2 rounded shadow-xs">
                      {zone.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engine indicator */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Model: <strong>{aiResult?.aiEngineUsed || 'Intelligent Civic Vision'}</strong></span>
            <span className="text-emerald-700 font-bold">{aiResult?.confidence || 95}% Match</span>
          </div>
        </div>

        {/* Right Column: Structured AI Response Output */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          {/* Output View Tabs */}
          <div className="border-b border-slate-200 p-3 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setActiveViewTab('visual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                  activeViewTab === 'visual'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>Diagnostic Summary</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('json')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                  activeViewTab === 'json'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-teal-700" />
                <span>Structured JSON</span>
              </button>
            </div>

            {activeViewTab === 'json' && (
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            {isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
                <p className="text-xs font-semibold text-slate-700">Analyzing waste composition and hazards...</p>
                <p className="text-[11px] text-slate-500">Checking texture features, material signatures, and safety risks</p>
              </div>
            ) : aiResult ? (
              activeViewTab === 'visual' ? (
                <div className="space-y-5">
                  {/* Category & Severity Hero */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Classification</span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{aiResult.categoryLabel}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Category ID: {aiResult.detectedCategory}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Severity Score</span>
                        <span className="text-xl font-extrabold text-rose-600">{aiResult.severityScore} / 100</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                        aiResult.severityLevel === 'critical'
                          ? 'bg-rose-600 text-white'
                          : aiResult.severityLevel === 'high'
                          ? 'bg-orange-500 text-white'
                          : 'bg-amber-500 text-slate-900'
                      }`}>
                        {aiResult.severityLevel}
                      </span>
                    </div>
                  </div>

                  {/* Detected Materials */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Identified Materials</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.detectedObjects.map((item, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Health Hazards */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sanitation &amp; Environmental Hazards</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {aiResult.sanitationHazards.map((hazard, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{hazard}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dispatch Protocol */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Assigned Department</span>
                      <strong className="text-slate-900 block mt-0.5">{aiResult.assignedDepartment}</strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Recommended Turnaround</span>
                      <strong className="text-slate-900 block mt-0.5">&lt; {aiResult.estimatedFixHours} Hours Target SLA</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <span className="font-bold">Remediation Directive: </span>
                    <span>{aiResult.recommendedAction}</span>
                  </div>
                </div>
              ) : (
                /* Raw JSON View */
                <div className="h-full flex flex-col">
                  <p className="text-xs text-slate-500 mb-2">
                    Standardized schema for municipal dispatch and civic integration:
                  </p>
                  <pre className="flex-1 p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed">
                    {JSON.stringify(aiResult, null, 2)}
                  </pre>
                </div>
              )
            ) : null}

            {/* Action Bar */}
            {aiResult && (
              <div className="pt-5 mt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Submit this classified incident directly to the city reporting system.
                </span>

                <button
                  type="button"
                  id="btn-ai-proceed-report"
                  onClick={() => {
                    onProceedToReport({
                      imageUrl: selectedPhoto,
                      aiResult,
                      title: `${aiResult.categoryLabel} Report`,
                      description: `Identified ${aiResult.detectedObjects.join(', ')}. Hazard: ${aiResult.sanitationHazards[0] || 'Sanitation issue'}.`,
                    });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>File Official Report with this Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

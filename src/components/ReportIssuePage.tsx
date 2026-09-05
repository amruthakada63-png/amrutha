import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  HelpCircle,
  RefreshCw,
  Navigation,
  X,
  Check,
  Info,
  AlertTriangle,
  Clock,
  ThumbsUp,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IssueCategory, IssueSeverity, AiDetectionResult, PossibleDuplicateMatch } from '../types';
import { PRESET_DEMO_PHOTOS, CITY_ZONES } from '../data/sampleIssues';
import { analyzeCivicIssue } from '../services/aiService';
import { storageService } from '../services/storageService';
import { 
  findDuplicateComplaints, 
  predictResolutionTime, 
  generateComplaintDescription 
} from '../services/intelligenceService';

interface ReportIssuePageProps {
  onIssueCreated: (newIssueId: string) => void;
  prefillData?: {
    imageUrl: string;
    aiResult?: AiDetectionResult;
    title?: string;
    description?: string;
  } | null;
  onSelectIssueToTrack?: (id: string) => void;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({ 
  onIssueCreated, 
  prefillData,
  onSelectIssueToTrack
}) => {
  // Form state
  const [title, setTitle] = useState(prefillData?.title || '');
  const [description, setDescription] = useState(prefillData?.description || '');
  const [category, setCategory] = useState<IssueCategory>(
    prefillData?.aiResult?.detectedCategory || 'garbage_overflow'
  );
  const [severity, setSeverity] = useState<IssueSeverity>(
    prefillData?.aiResult?.severityLevel || 'high'
  );
  const [imageSrc, setImageSrc] = useState<string>(
    prefillData?.imageUrl || PRESET_DEMO_PHOTOS[0].url
  );
  const [address, setAddress] = useState('Opposite Central Metro Station, MG Road');
  const [landmark, setLandmark] = useState('Near Pillar #142');
  const [zone, setZone] = useState('Zone 1 - Central Metro');
  const [ward, setWard] = useState('Ward 12');
  const [latitude, setLatitude] = useState<number>(12.9752);
  const [longitude, setLongitude] = useState<number>(77.5985);
  const [reporterName, setReporterName] = useState('Rahul Verma');
  const [reporterPhone, setReporterPhone] = useState('+91 98451 22334');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Duplicate complaint state
  const [duplicateMatch, setDuplicateMatch] = useState<PossibleDuplicateMatch | null>(null);
  const [dismissDuplicate, setDismissDuplicate] = useState(false);
  const [upvoteNotice, setUpvoteNotice] = useState<string | null>(null);

  // Drag & drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // AI detection state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiDetectionResult | null>(prefillData?.aiResult || null);

  // Effect to apply prefill if it arrives after mount
  useEffect(() => {
    if (prefillData) {
      if (prefillData.imageUrl) setImageSrc(prefillData.imageUrl);
      if (prefillData.title) setTitle(prefillData.title);
      if (prefillData.description) setDescription(prefillData.description);
      if (prefillData.aiResult) {
        setAiResult(prefillData.aiResult);
        setCategory(prefillData.aiResult.detectedCategory);
        setSeverity(prefillData.aiResult.severityLevel);
      }
    }
  }, [prefillData]);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSuccessMessage, setGeoSuccessMessage] = useState('');

  // Mini-map refs
  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize mini-map
  useEffect(() => {
    if (!miniMapRef.current || mapInstanceRef.current) return;

    const map = L.map(miniMapRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="background-color: #059669; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    const marker = L.marker([latitude, longitude], { icon: pinIcon, draggable: true }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag
    marker.on('dragend', (e) => {
      const latlng = e.target.getLatLng();
      setLatitude(Number(latlng.lat.toFixed(5)));
      setLongitude(Number(latlng.lng.toFixed(5)));
      setGeoSuccessMessage('Pin coordinates updated on map.');
    });

    // Handle click to set location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setLatitude(Number(lat.toFixed(5)));
      setLongitude(Number(lng.toFixed(5)));
      setGeoSuccessMessage('Pin coordinates set on map.');
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map marker when latitude/longitude change from outside
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Check for possible duplicate complaints whenever location, category, or title changes
  useEffect(() => {
    try {
      const existing = storageService.getIssues();
      const match = findDuplicateComplaints(
        {
          category,
          latitude,
          longitude,
          title,
          description,
        },
        existing
      );
      setDuplicateMatch(match);
    } catch (err) {
      console.warn('Duplicate detection check error:', err);
    }
  }, [category, latitude, longitude]);

  // AI Resolution Time Prediction
  const resolutionPrediction = useMemo(() => {
    return predictResolutionTime({
      category,
      severity,
      ward,
      hazards: aiResult?.sanitationHazards,
    });
  }, [category, severity, ward, aiResult]);

  // Handle AI Complaint Description Generator
  const handleAutoGenerateDescription = () => {
    const generated = generateComplaintDescription({
      category,
      categoryLabel: aiResult?.categoryLabel || category.replace('_', ' ').toUpperCase(),
      address,
      landmark,
      detectedObjects: aiResult?.detectedObjects,
      hazards: aiResult?.sanitationHazards,
    });
    setDescription(generated);
    if (!title || title.trim() === '') {
      setTitle(`${aiResult?.categoryLabel || category.replace('_', ' ').toUpperCase()} near ${landmark || address.split(',')[0]}`);
    }
  };

  // Support / Upvote existing duplicate complaint
  const handleSupportDuplicate = () => {
    if (!duplicateMatch) return;
    storageService.toggleUpvote(duplicateMatch.existingIssue.id);
    setUpvoteNotice(`Upvoted existing complaint ${duplicateMatch.existingIssue.id}! Thank you for endorsing civic resolution.`);
    setTimeout(() => {
      if (onSelectIssueToTrack) {
        onSelectIssueToTrack(duplicateMatch.existingIssue.id);
      }
    }, 1400);
  };

  // Run AI analysis
  const handleRunAiAnalysis = async (imgToAnalyze?: string) => {
    const currentImg = imgToAnalyze || imageSrc;
    if (!currentImg) return;

    setIsAnalyzing(true);
    setErrors(prev => ({ ...prev, ai: '' }));
    try {
      const result = await analyzeCivicIssue({
        imageSrc: currentImg,
        userTitle: title,
        userDescription: description,
      });

      setAiResult(result);

      // Auto-populate form fields from AI inference
      setCategory(result.detectedCategory);
      setSeverity(result.severityLevel);
      if (!title || title.trim() === '') {
        setTitle(`${result.categoryLabel} at ${zone.split(' - ')[1] || 'Site'}`);
      }
      if (!description || description.trim() === '') {
        setDescription(`Detected ${result.detectedObjects.join(', ')}. Environmental hazard: ${result.sanitationHazards[0] || 'Sanitation issue'}.`);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Image file loader helper
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file (PNG, JPG, WebP).' }));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image file size exceeds 12MB limit.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageSrc(base64);
      setErrors(prev => ({ ...prev, image: '' }));
      handleRunAiAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  // Image upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  // Preset demo photo click
  const handleSelectPresetPhoto = (preset: typeof PRESET_DEMO_PHOTOS[0]) => {
    setImageSrc(preset.url);
    setTitle(`${preset.label}`);
    setDescription(preset.description);
    setErrors(prev => ({ ...prev, image: '' }));
    handleRunAiAnalysis(preset.url);
  };

  // GPS Geolocation handler
  const handleGetCoordinates = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setGeoLoading(true);
    setGeoSuccessMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setLatitude(lat);
        setLongitude(lng);
        setGeoLoading(false);
        setGeoSuccessMessage('Current GPS location captured successfully.');
        setErrors(prev => ({ ...prev, location: '' }));
      },
      (error) => {
        console.warn('Geolocation fallback:', error.message);
        const jitterLat = 12.9700 + (Math.random() * 0.02 - 0.01);
        const jitterLng = 77.5900 + (Math.random() * 0.02 - 0.01);
        setLatitude(Number(jitterLat.toFixed(5)));
        setLongitude(Number(jitterLng.toFixed(5)));
        setGeoLoading(false);
        setGeoSuccessMessage('Approximate city location set.');
      },
      { timeout: 6000 }
    );
  };

  // Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Please provide an issue title.';
    }
    if (!description.trim() || description.length < 10) {
      newErrors.description = 'Please describe the issue in at least 10 characters.';
    }
    if (!address.trim()) {
      newErrors.address = 'Please specify the street address or location.';
    }
    if (!imageSrc) {
      newErrors.image = 'A photo is required for civic issue verification.';
    }
    if (!isAnonymous && !reporterName.trim()) {
      newErrors.reporterName = 'Please enter your name or check "Report Anonymously".';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const effectiveAiResult: AiDetectionResult = aiResult || {
      detectedCategory: category,
      categoryLabel: category.replace('_', ' ').toUpperCase(),
      confidence: 94,
      severityScore: severity === 'critical' ? 95 : severity === 'high' ? 80 : 55,
      severityLevel: severity,
      detectedObjects: ['Unsegregated Waste Pile', 'Discarded Packaging'],
      sanitationHazards: ['Odor emission', 'Vector breeding risk'],
      recommendedAction: 'Dispatch municipal sanitation crew for prompt site clearance.',
      assignedDepartment: 'Solid Waste Management Division',
      estimatedFixHours: 12,
      environmentalRiskScore: 7.5,
      aiEngineUsed: 'Intelligent Civic Vision',
    };

    try {
      const createdIssue = storageService.createIssue({
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        severityScore: effectiveAiResult.severityScore,
        status: 'reported',
        imageUrl: imageSrc,
        location: {
          address: address.trim(),
          landmark: landmark.trim() || undefined,
          zone,
          ward,
          latitude,
          longitude,
        },
        reporter: {
          name: isAnonymous ? 'Anonymous Citizen' : reporterName.trim(),
          phone: isAnonymous ? undefined : reporterPhone.trim() || undefined,
          isAnonymous,
        },
        aiDetection: effectiveAiResult,
      });

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe if confetti is blocked
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onIssueCreated(createdIssue.id);
      }, 700);

    } catch (err) {
      console.error('Failed to create civic issue:', err);
      setIsSubmitting(false);
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Sanitation Issue
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Submit photos and location details of garbage overflow, uncollected refuse, or blocked drains to alert municipal sanitation crews.
        </p>
      </div>

      {/* DUPLICATE COMPLAINT WARNING BANNER */}
      {duplicateMatch && !dismissDuplicate && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center space-x-2">
                  <span>Possible Duplicate Complaint Detected</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold border border-amber-300">
                    {duplicateMatch.similarityPercent}% Match
                  </span>
                </h3>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  A similar issue was reported <strong>{duplicateMatch.distanceMeters} meters away</strong> approximately <strong>{duplicateMatch.reportedHoursAgo} hours ago</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white/90 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {duplicateMatch.existingIssue.id}
                </span>
                <span className="font-semibold text-slate-900">{duplicateMatch.existingIssue.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{duplicateMatch.existingIssue.location.address}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onSelectIssueToTrack && (
                <button
                  type="button"
                  onClick={() => onSelectIssueToTrack(duplicateMatch.existingIssue.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  View Existing Complaint &rarr;
                </button>
              )}
              <button
                type="button"
                onClick={handleSupportDuplicate}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Support / Upvote ({duplicateMatch.existingIssue.upvotes})</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissDuplicate(true)}
                className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-amber-100/60 transition-colors"
              >
                Report Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {upvoteNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{upvoteNotice}</span>
        </div>
      )}

      {errors.form && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: PHOTO UPLOAD & PREVIEW */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Photo Evidence</span>
                <span className="text-rose-500 font-bold">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Take a photo or upload from your device. Clear photos help crews allocate the right equipment.
              </p>
            </div>

            {imageSrc && (
              <button
                type="button"
                id="btn-scan-ai"
                onClick={() => handleRunAiAnalysis()}
                disabled={isAnalyzing}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Run AI Triage</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Preset Example Incidents */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600">
              Sample incidents for immediate testing:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_DEMO_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPresetPhoto(preset)}
                  className={`relative rounded-lg overflow-hidden border text-left p-1 transition-all ${
                    imageSrc === preset.url
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-400 bg-slate-50'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-16 object-cover rounded"
                  />
                  <p className="text-[11px] font-semibold text-slate-800 truncate mt-1">
                    {preset.label.split('(')[0]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Preview & Drag & Drop Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Image Preview Box */}
            <div className="relative h-56 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
              {imageSrc ? (
                <>
                  <img
                    src={imageSrc}
                    alt="Sanitation issue preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageSrc('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {aiResult && (
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-xs text-white p-2 rounded-lg text-xs flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-emerald-400 font-bold">Auto-Triage: </span>
                        <span>{aiResult.categoryLabel}</span>
                      </div>
                      <span className="text-emerald-300 font-bold ml-2 shrink-0">{aiResult.confidence}% match</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <Camera className="w-8 h-8 mx-auto mb-1 stroke-1" />
                  <span className="text-xs">No image selected</span>
                </div>
              )}
            </div>

            {/* Upload Drag & Drop Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col justify-center border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                isDraggingOver 
                  ? 'border-emerald-600 bg-emerald-50/40' 
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Drag &amp; drop photo here</p>
              <p className="text-[11px] text-slate-500 mt-0.5">or choose a file from your device (JPG, PNG, WebP up to 12MB)</p>
              
              <label className="mt-3 inline-block">
                <span className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 shadow-xs text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                  Select File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {errors.image && (
                <p className="text-xs text-rose-600 mt-2 font-medium">{errors.image}</p>
              )}
            </div>
          </div>

          {/* AI Assessment Summary Banner */}
          {aiResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Automated Vision Triage
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  Estimated SLA: {aiResult.estimatedFixHours}h
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Identified Category</span>
                  <span className="font-bold text-slate-800">{aiResult.categoryLabel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Calculated Urgency</span>
                  <span className="font-bold text-rose-700">{aiResult.severityScore}/100 ({aiResult.severityLevel.toUpperCase()})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Recommended Dept</span>
                  <span className="font-bold text-slate-800 truncate block">{aiResult.assignedDepartment}</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[11px] font-semibold text-slate-600">Identified Materials: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {aiResult.detectedObjects.map((obj, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: ISSUE DETAILS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-emerald-700" />
            <span>Issue Details &amp; Category</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              >
                <option value="garbage_overflow">Garbage Dumpster Overflow</option>
                <option value="illegal_dumping">Illegal Construction &amp; Debris Dumping</option>
                <option value="unclean_public_space">Unclean Public Space / Litter</option>
                <option value="hazardous_waste">Hazardous Chemical &amp; Toxic Waste</option>
                <option value="blocked_drain">Blocked Stormwater Drain / Sewage</option>
                <option value="broken_bin">Damaged / Broken Municipal Bin</option>
                <option value="other">Other Civic Sanitation Issue</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reported Urgency <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              >
                <option value="critical">Critical (Immediate Hazard / Blocked Access)</option>
                <option value="high">High (Severe Smell / Vector Breeding)</option>
                <option value="medium">Medium (Litter / Damaged Bin)</option>
                <option value="low">Low (Minor debris / routine cleanup)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Title / Headline <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{title.length}/100</span>
            </div>
            <input
              id="input-title"
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Heavy garbage overflow obstructing sidewalk near school"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-auto-desc"
                  onClick={handleAutoGenerateDescription}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs"
                  title="Generate formal municipal complaint text using AI vision findings"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-Generate Description</span>
                </button>
                <span className="text-[11px] text-slate-400">{description.length}/500</span>
              </div>
            </div>
            <textarea
              id="textarea-description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, pedestrian obstruction, duration, or click 'Auto-Generate Description'..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 leading-relaxed"
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.description}</p>}
          </div>

          {/* AI Resolution Time Prediction & Hazard Risk Badge */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-600 font-semibold">AI Predicted Resolution:</span>
                <span className="font-extrabold text-slate-900">≈ {resolutionPrediction.predictedHours} Hours</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  {resolutionPrediction.confidencePercent}% Confidence
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Dispatch Squad: <strong className="text-slate-800">{resolutionPrediction.recommendedTeam}</strong>
              </span>
            </div>

            {(category === 'hazardous_waste' || (aiResult?.sanitationHazards && aiResult.sanitationHazards.length > 0)) && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-rose-950">🚨 Public Safety Warning Detected</strong>
                  <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                    Potential biological, toxic, or sharp refuse detected. Do not manually handle or clear this waste. Municipal sanitation hazardous response protocol is automatically flagged for this site.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: LOCATION & INTERACTIVE MINI-MAP */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Location &amp; Map Pin</span>
                <span className="text-rose-500 font-bold">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click anywhere on the map or drag the pin to mark the exact incident spot.
              </p>
            </div>

            <button
              type="button"
              id="btn-detect-gps"
              onClick={handleGetCoordinates}
              disabled={geoLoading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
            >
              {geoLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Use Device GPS</span>
                </>
              )}
            </button>
          </div>

          {geoSuccessMessage && (
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{geoSuccessMessage}</span>
            </div>
          )}

          {/* Interactive Mini-Map Container */}
          <div className="space-y-1">
            <div 
              ref={miniMapRef} 
              className="w-full h-52 rounded-xl border border-slate-200 overflow-hidden shadow-xs z-0"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Pin: {latitude} N, {longitude} E</span>
              <span>OpenStreetMap Engine</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Municipal Zone</label>
              <select
                value={zone}
                onChange={(e) => {
                  setZone(e.target.value);
                  const matched = CITY_ZONES.find(z => z.zone === e.target.value);
                  if (matched) setWard(matched.ward);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              >
                {CITY_ZONES.map(z => (
                  <option key={z.zone} value={z.zone}>{z.zone} ({z.name})</option>
                ))}
              </select>
            </div>

            {/* Ward */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ward</label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="Ward Number"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Address & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near 4th Cross Road, Indiranagar"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              />
              {errors.address && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nearest Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite City Hospital Gate 2"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: CITIZEN CONTACT & ANONYMITY */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Reporter Information</h2>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                id="check-anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Report Anonymously</span>
            </label>
          </div>

          {!isAnonymous ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                />
                {errors.reporterName && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.reporterName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="text"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              Your name and phone number will remain private. You will receive an incident tracking ID to monitor remediation progress anonymously.
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Reports are publicly visible on the city incident map to promote transparency.
          </p>

          <button
            type="submit"
            id="btn-submit-report"
            disabled={isSubmitting || isAnalyzing}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Filing Report...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Sanitation Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

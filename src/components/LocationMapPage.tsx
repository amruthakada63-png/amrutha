import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Filter, 
  Search, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  RotateCcw,
  Navigation,
  Flame,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { CivicIssue, IssueStatus, IssueCategory, IssueSeverity, ClusterIncident } from '../types';
import { detectComplaintClusters } from '../services/intelligenceService';

interface LocationMapPageProps {
  issues: CivicIssue[];
  onSelectIssueToTrack: (id: string) => void;
}

export const LocationMapPage: React.FC<LocationMapPageProps> = ({ issues, onSelectIssueToTrack }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const heatLayersRef = useRef<(L.Circle | L.Marker)[]>([]);

  // View mode
  const [viewMode, setViewMode] = useState<'pins' | 'heatmap'>('pins');
  const [sidebarTab, setSidebarTab] = useState<'list' | 'hotspots'>('list');

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;
      if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
      if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchAddress = issue.location.address.toLowerCase().includes(q);
        const matchId = issue.id.toLowerCase().includes(q);
        if (!matchTitle && !matchAddress && !matchId) return false;
      }
      return true;
    });
  }, [issues, selectedStatus, selectedCategory, selectedSeverity, searchQuery]);

  // Detected clusters for heatmap mode
  const detectedClusters = useMemo(() => {
    return detectComplaintClusters(filteredIssues);
  }, [filteredIssues]);

  // Custom DivIcon generator with high-contrast color-coding
  const createMarkerIcon = (status: IssueStatus, severity: IssueSeverity, isSelected: boolean) => {
    let bgColor = '#ef4444'; // Red for reported
    if (status === 'resolved') bgColor = '#10b981'; // Green
    else if (status === 'in_progress') bgColor = '#f59e0b'; // Amber
    else if (status === 'under_review') bgColor = '#3b82f6'; // Blue

    const size = isSelected ? 36 : 28;
    const pulse = severity === 'critical' && status !== 'resolved' ? 'animate-pulse' : '';

    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${bgColor};
          border: 2px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        " class="${pulse}">
          <div style="
            width: ${size * 0.4}px;
            height: ${size * 0.4}px;
            background-color: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered around metropolitan region (12.9716, 77.5946)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.6000],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    // Free OpenStreetMap Tiles (100% open-source, no API keys)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Markers and Heatmap Layers with filtered issues and viewMode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.keys(markersRef.current).forEach((id) => {
      const m = markersRef.current[id];
      if (m) m.remove();
    });
    markersRef.current = {};

    // Clear existing heat layers
    heatLayersRef.current.forEach((layer) => layer.remove());
    heatLayersRef.current = [];

    if (viewMode === 'pins') {
      // Standard Pin Mode
      filteredIssues.forEach((issue) => {
        const isSelected = activeIssueId === issue.id;
        const icon = createMarkerIcon(issue.status, issue.severity, isSelected);

        const marker = L.marker([issue.location.latitude, issue.location.longitude], { icon }).addTo(map);

        // Popup content with tracking trigger
        const statusLabel = issue.status.replace('_', ' ').toUpperCase();
        const popupHtml = `
          <div style="font-family: inherit; width: 220px; font-size: 12px; color: #1e293b;">
            <img src="${issue.imageUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 11px; background: #0f172a; color: white; padding: 2px 6px; border-radius: 4px;">${issue.id}</span>
              <span style="font-weight: 700; font-size: 10px; text-transform: uppercase; color: ${
                issue.status === 'resolved' ? '#059669' : issue.status === 'in_progress' ? '#d97706' : '#dc2626'
              }">${statusLabel}</span>
            </div>
            <strong style="display: block; margin-bottom: 2px; line-height: 1.3;">${issue.title}</strong>
            <p style="color: #64748b; font-size: 11px; margin: 4px 0 8px;">📍 ${issue.location.address}</p>
            <button id="popup-track-${issue.id}" style="
              width: 100%;
              background: #059669;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 6px 10px;
              font-size: 11px;
              font-weight: bold;
              cursor: pointer;
            ">Track Resolution Status &rarr;</button>
          </div>
        `;

        marker.bindPopup(popupHtml);

        marker.on('popupopen', () => {
          setActiveIssueId(issue.id);
          const btn = document.getElementById(`popup-track-${issue.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectIssueToTrack(issue.id);
            };
          }
        });

        markersRef.current[issue.id] = marker;
      });

      // If activeIssueId exists, pan to it
      if (activeIssueId && markersRef.current[activeIssueId]) {
        const activeMarker = markersRef.current[activeIssueId];
        map.setView(activeMarker.getLatLng(), 14, { animate: true });
        activeMarker.openPopup();
      }
    } else {
      // Heatmap Mode
      detectedClusters.forEach((cluster) => {
        let haloColor = '#f59e0b';
        let coreColor = '#ea580c';
        if (cluster.riskLevel === 'critical') {
          haloColor = '#ef4444';
          coreColor = '#b91c1c';
        } else if (cluster.riskLevel === 'high') {
          haloColor = '#f97316';
          coreColor = '#c2410c';
        } else if (cluster.riskLevel === 'low') {
          haloColor = '#10b981';
          coreColor = '#047857';
        }

        // Outer halo circle
        const outerCircle = L.circle([cluster.centroidLat, cluster.centroidLng], {
          radius: Math.max(cluster.radiusMeters * 1.3, 300),
          color: haloColor,
          fillColor: haloColor,
          fillOpacity: 0.25,
          weight: 1.5,
        }).addTo(map);

        // Core intensity circle
        const coreCircle = L.circle([cluster.centroidLat, cluster.centroidLng], {
          radius: Math.max(cluster.radiusMeters * 0.45, 120),
          color: coreColor,
          fillColor: coreColor,
          fillOpacity: 0.55,
          weight: 2,
        }).addTo(map);

        // Cluster center marker badge
        const badgeIcon = L.divIcon({
          className: 'cluster-hotspot-badge',
          html: `
            <div style="
              background: ${coreColor};
              color: white;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: inherit;
              font-weight: 900;
              font-size: 13px;
              cursor: pointer;
            ">
              <div style="font-size: 10px; line-height: 1;">🔥</div>
              <div style="line-height: 1;">${cluster.count}</div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const clusterMarker = L.marker([cluster.centroidLat, cluster.centroidLng], { icon: badgeIcon }).addTo(map);

        clusterMarker.bindPopup(`
          <div style="font-family: inherit; width: 220px; font-size: 12px; color: #1e293b;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="background: #dc2626; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 10px;">${cluster.riskLevel.toUpperCase()} HOTSPOT</span>
              <span style="font-weight: 700; color: #64748b;">${cluster.ward}</span>
            </div>
            <strong style="font-size: 13px; display: block; margin-bottom: 4px;">${cluster.count} Co-located Incidents</strong>
            <p style="color: #64748b; font-size: 11px; margin-bottom: 6px;">Area Radius: ~${cluster.radiusMeters}m | Avg Priority: ${cluster.avgPriorityScore}/100</p>
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; font-size: 11px; color: #334155;">
              Primary issue: <strong>${cluster.primaryCategory.replace('_', ' ').toUpperCase()}</strong>
            </div>
          </div>
        `);

        heatLayersRef.current.push(outerCircle, coreCircle, clusterMarker);
      });
    }
  }, [filteredIssues, activeIssueId, viewMode, detectedClusters]);

  // Handle focus issue from sidebar list
  const handleFocusIssue = (issue: CivicIssue) => {
    setActiveIssueId(issue.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([issue.location.latitude, issue.location.longitude], 15, { animate: true });
      const marker = markersRef.current[issue.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const resetMapView = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([12.9716, 77.6000], 12, { animate: true });
      setActiveIssueId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>City Incident Map &amp; Hotspots</span>
            {viewMode === 'heatmap' ? (
              <Flame className="w-6 h-6 text-rose-600 animate-pulse" />
            ) : (
              <MapPin className="w-6 h-6 text-emerald-600" />
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Geographic overview of active sanitation complaints, co-located incident hotspots, and verified resolutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              id="btn-view-pins"
              onClick={() => {
                setViewMode('pins');
                setSidebarTab('list');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'pins'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pins ({filteredIssues.length})</span>
            </button>
            <button
              type="button"
              id="btn-view-heatmap"
              onClick={() => {
                setViewMode('heatmap');
                setSidebarTab('hotspots');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'heatmap'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Heatmap ({detectedClusters.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={resetMapView}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Map</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search address, title, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 font-medium"
            >
              <option value="all">All Statuses ({issues.length})</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="garbage_overflow">Garbage Overflow</option>
              <option value="illegal_dumping">Illegal Dumping</option>
              <option value="blocked_drain">Blocked Drain</option>
              <option value="unclean_public_space">Unclean Public Space</option>
              <option value="broken_bin">Broken Bin</option>
              <option value="hazardous_waste">Hazardous Waste</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 font-medium"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Urgency</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          {viewMode === 'pins' ? (
            <>
              <span className="font-semibold text-slate-700">Map Pin Legend:</span>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-sm inline-block" />
                  <span>Reported</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm inline-block" />
                  <span>Under Review</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm inline-block" />
                  <span>In Progress</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm inline-block" />
                  <span>Resolved</span>
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="font-semibold text-rose-900 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Sanitation Heatmap Density Legend:</span>
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-xs inline-block" />
                  <span>Low (1-2)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs inline-block" />
                  <span>Moderate (3-4)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-xs inline-block" />
                  <span>High (5-7)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shadow-xs inline-block" />
                  <span className="font-bold text-rose-700">Critical Hotspot (8+)</span>
                </span>
              </div>
            </>
          )}

          <span className="font-medium text-slate-500">
            Showing {filteredIssues.length} of {issues.length} reports
          </span>
        </div>
      </div>

      {/* Map Layout: Interactive Leaflet Stage + Sidebar List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map Stage */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[540px] z-10"
            id="leaflet-civic-map"
          />
        </div>

        {/* Sidebar Issues & Hotspots Feed */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[540px] overflow-hidden">
          {/* Sidebar Tab Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSidebarTab('list')}
              className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors ${
                sidebarTab === 'list'
                  ? 'border-emerald-600 text-emerald-950 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Incidents ({filteredIssues.length})
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('hotspots')}
              className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors flex items-center justify-center space-x-1 ${
                sidebarTab === 'hotspots'
                  ? 'border-rose-600 text-rose-950 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Hotspots ({detectedClusters.length})</span>
            </button>
          </div>

          <div className="p-3 overflow-y-auto space-y-3 flex-1">
            {sidebarTab === 'hotspots' ? (
              detectedClusters.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Flame className="w-8 h-8 mx-auto mb-2 opacity-40 text-rose-500" />
                  <p>No high-density complaint clusters detected in current filters.</p>
                </div>
              ) : (
                detectedClusters.map((cluster, idx) => (
                  <div
                    key={cluster.id}
                    onClick={() => {
                      setActiveClusterId(cluster.id);
                      const map = mapInstanceRef.current;
                      if (map) {
                        map.setView([cluster.centroidLat, cluster.centroidLng], 15, { animate: true });
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      activeClusterId === cluster.id
                        ? 'border-rose-500 bg-rose-50/50 shadow-sm ring-1 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs">
                          {cluster.ward} Hotspot
                        </span>
                      </div>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                        cluster.riskLevel === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : cluster.riskLevel === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cluster.riskLevel} Urgency
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Incident Count</span>
                        <span className="font-bold text-slate-900">{cluster.count} Complaints</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Avg Priority Score</span>
                        <span className="font-bold text-rose-700">{cluster.avgPriorityScore}/100</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2">
                      Primary issue: <strong className="text-slate-900 capitalize">{cluster.primaryCategory.replace('_', ' ')}</strong>
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Radius ~{cluster.radiusMeters}m</span>
                      <span className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1">
                        <span>Fly to Hotspot &rarr;</span>
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No issues match current filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedCategory('all');
                    setSelectedSeverity('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-blue-600 font-semibold underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isSelected = activeIssueId === issue.id;
                return (
                  <div
                    key={issue.id}
                    onClick={() => handleFocusIssue(issue)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {issue.id}
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        issue.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : issue.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 line-clamp-1">{issue.title}</h4>
                    <p className="text-slate-500 text-[11px] truncate mt-1">📍 {issue.location.address}</p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {issue.location.ward}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssueToTrack(issue.id);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

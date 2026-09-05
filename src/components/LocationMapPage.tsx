import React, { useEffect, useRef, useState } from 'react';
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
  Navigation
} from 'lucide-react';
import { CivicIssue, IssueStatus, IssueCategory, IssueSeverity } from '../types';

interface LocationMapPageProps {
  issues: CivicIssue[];
  onSelectIssueToTrack: (id: string) => void;
}

export const LocationMapPage: React.FC<LocationMapPageProps> = ({ issues, onSelectIssueToTrack }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
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

  // Sync Markers with filtered issues
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.keys(markersRef.current).forEach((id) => {
      const m = markersRef.current[id];
      if (m) m.remove();
    });
    markersRef.current = {};

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
  }, [filteredIssues, activeIssueId]);

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
            <span>City Incident Map</span>
            <MapPin className="w-6 h-6 text-emerald-600" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Geographic overview of active sanitation complaints and verified resolutions across municipal wards.
          </p>
        </div>

        <button
          type="button"
          onClick={resetMapView}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Map View</span>
        </button>
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
          <span className="font-semibold">Map Pin Legend:</span>
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

        {/* Sidebar Issues Feed */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[540px]">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Matching Reports ({filteredIssues.length})
            </span>
            <span className="text-[11px] text-slate-500">Click to locate pin</span>
          </div>

          <div className="p-3 overflow-y-auto space-y-3 flex-1">
            {filteredIssues.length === 0 ? (
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

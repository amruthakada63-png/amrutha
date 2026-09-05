import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ReportIssuePage } from './components/ReportIssuePage';
import { AiDetectionPage } from './components/AiDetectionPage';
import { LocationMapPage } from './components/LocationMapPage';
import { ComplaintTrackingPage } from './components/ComplaintTrackingPage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { HelpAboutModal } from './components/HelpAboutModal';
import { storageService } from './services/storageService';
import { CivicIssue, CityAnalytics, AiDetectionResult } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [analytics, setAnalytics] = useState<CityAnalytics>({
    totalReports: 0,
    pendingReview: 0,
    inProgress: 0,
    resolvedCount: 0,
    avgResolutionHours: 14.8,
    criticalIssuesCount: 0,
    resolutionRatePercent: 0,
    categoryBreakdown: {},
    wardBreakdown: {},
  });
  const [selectedIssueIdToTrack, setSelectedIssueIdToTrack] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [prefillReportData, setPrefillReportData] = useState<{
    imageUrl: string;
    aiResult: AiDetectionResult;
    title: string;
    description: string;
  } | null>(null);

  // Sync data from storage
  const reloadData = () => {
    const loadedIssues = storageService.getIssues();
    setIssues(loadedIssues);
    setAnalytics(storageService.getAnalytics());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = storageService.subscribe(() => {
      reloadData();
    });
    return unsubscribe;
  }, []);

  // Handle tracking navigation
  const handleSelectIssueToTrack = (id: string) => {
    setSelectedIssueIdToTrack(id);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle upvoting
  const handleUpvote = (id: string) => {
    storageService.toggleUpvote(id);
    reloadData();
  };

  // Handle when a new issue is submitted
  const handleIssueCreated = (newId: string) => {
    reloadData();
    setPrefillReportData(null);
    setSelectedIssueIdToTrack(newId);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle proceeding from AI Lab to Report Form
  const handleProceedFromAiLab = (data: {
    imageUrl: string;
    aiResult: AiDetectionResult;
    title: string;
    description: string;
  }) => {
    setPrefillReportData(data);
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={analytics.pendingReview}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <LandingPage
            analytics={analytics}
            recentIssues={issues}
            setActiveTab={setActiveTab}
            onSelectIssueToTrack={handleSelectIssueToTrack}
            onUpvote={handleUpvote}
          />
        )}

        {activeTab === 'report' && (
          <ReportIssuePage 
            prefillData={prefillReportData}
            onIssueCreated={handleIssueCreated} 
          />
        )}

        {activeTab === 'ai-lab' && (
          <AiDetectionPage onProceedToReport={handleProceedFromAiLab} />
        )}

        {activeTab === 'map' && (
          <LocationMapPage
            issues={issues}
            onSelectIssueToTrack={handleSelectIssueToTrack}
          />
        )}

        {activeTab === 'track' && (
          <ComplaintTrackingPage
            issues={issues}
            selectedIssueId={selectedIssueIdToTrack}
            onSelectIssueId={(id) => setSelectedIssueIdToTrack(id)}
            onUpvote={handleUpvote}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardPage
            issues={issues}
            analytics={analytics}
            onRefreshData={reloadData}
            onSelectIssueToTrack={handleSelectIssueToTrack}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Project & Architecture Documentation Modal */}
      <HelpAboutModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

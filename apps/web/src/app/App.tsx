import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AuthModal } from '../components/AuthModal';

import { DashboardPage } from '../features/dashboard/DashboardPage';
import { JobsPage } from '../features/jobs/JobsPage';
import { JobDetailPage } from '../features/jobs/JobDetailPage';
import { CompaniesPage } from '../features/companies/CompaniesPage';
import { SkillsPage } from '../features/skills/SkillsPage';
import { SkillDetailPage } from '../features/skills/SkillDetailPage';
import { MarketPage } from '../features/market/MarketPage';
import { SalariesPage } from '../features/salaries/SalariesPage';
import { CareerGapsPage } from '../features/career/CareerGapsPage';
import { ResumePage } from '../features/resume/ResumePage';
import { RoadmapPage } from '../features/roadmap/RoadmapPage';
import { ApplicationsPage } from '../features/applications/ApplicationsPage';
import { AlertsPage } from '../features/alerts/AlertsPage';
import { AdminPage } from '../features/admin/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

export const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
              <Header onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
              <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:id" element={<JobDetailPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/skills" element={<SkillsPage />} />
                  <Route path="/skills/:id" element={<SkillDetailPage />} />
                  <Route path="/market" element={<MarketPage />} />
                  <Route path="/salaries" element={<SalariesPage />} />
                  <Route path="/career" element={<CareerGapsPage />} />
                  <Route path="/resume" element={<ResumePage />} />
                  <Route path="/roadmap" element={<RoadmapPage />} />
                  <Route path="/applications" element={<ApplicationsPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
            <AuthModal />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

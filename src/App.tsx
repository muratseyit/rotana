import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessCodeProvider, useAccessCode } from "@/contexts/AccessCodeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AccessCodeGate } from "@/components/AccessCodeGate";
import Index from "./pages/Index";

// Lazy load pages for better performance
const ComprehensiveAnalysisForm = lazy(() => import("./pages/ComprehensiveAnalysisForm"));
const Features = lazy(() => import("./pages/Features"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Partners = lazy(() => import("./pages/Partners"));
const AdminPartners = lazy(() => import("./pages/AdminPartners"));
const Admin = lazy(() => import("./pages/Admin"));
const TestUserJourney = lazy(() => import("./components/TestUserJourney").then(module => ({ default: module.TestUserJourney })));
const Pricing = lazy(() => import("./pages/Pricing"));
const GuestAnalysis = lazy(() => import("./pages/GuestAnalysis"));
const GuestResults = lazy(() => import("./pages/GuestResults"));
const ComprehensiveAnalysis = lazy(() => import("./pages/ComprehensiveAnalysis"));
const Dashboard = lazy(() => import("./components/Dashboard").then(module => ({ default: module.Dashboard })));

// Optimize React Query for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { hasAccess } = useAccessCode();

  if (!hasAccess) {
    return <AccessCodeGate />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/comprehensive-analysis-form" element={<ComprehensiveAnalysisForm />} />
          <Route path="/features" element={<Features />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/guest-analysis" element={<GuestAnalysis />} />
          <Route path="/guest-results" element={<GuestResults />} />
          <Route path="/comprehensive-analysis" element={<ComprehensiveAnalysis />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/partners" element={<AdminPartners />} />
          <Route path="/test" element={<TestUserJourney />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AccessCodeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AccessCodeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

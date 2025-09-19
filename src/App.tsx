import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Index from "./pages/Index";

// Lazy load pages for better performance
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Features = lazy(() => import("./pages/Features"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Partners = lazy(() => import("./pages/Partners"));
const AdminPartners = lazy(() => import("./pages/AdminPartners"));
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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/features" element={<Features />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/guest-analysis" element={<GuestAnalysis />} />
              <Route path="/guest-results" element={<GuestResults />} />
              <Route path="/comprehensive-analysis" element={<ComprehensiveAnalysis />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/partners" element={<AdminPartners />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

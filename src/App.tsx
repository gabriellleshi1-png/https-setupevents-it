import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import ScrollToTop from "./components/ScrollToTop";
import GlobalVideoBackground from "./components/GlobalVideoBackground";
import IubendaLoader from "./components/IubendaLoader";

const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const CorporateEvents = lazy(() => import("./pages/CorporateEvents"));
const BrandActivation = lazy(() => import("./pages/BrandActivation"));
const EventProductions = lazy(() => import("./pages/EventProductions"));
const HostessStaff = lazy(() => import("./pages/HostessStaff"));
const PublicRelations = lazy(() => import("./pages/PublicRelations"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const Contatti = lazy(() => import("./pages/Contatti"));
const PrenotaCall = lazy(() => import("./pages/PrenotaCall"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const CaseStudyDiesel = lazy(() => import("./pages/CaseStudyDiesel"));
const CaseStudyMediolanum = lazy(() => import("./pages/CaseStudyMediolanum"));
const CaseStudyDistretto12 = lazy(() => import("./pages/CaseStudyDistretto12"));
const CaseStudyColdiretti = lazy(() => import("./pages/CaseStudyColdiretti"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const ConditionalGlobalVideoBackground = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/contatti")) return null;
  return <GlobalVideoBackground />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <IubendaLoader />
        <ConditionalGlobalVideoBackground />
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/corporate-events" element={<CorporateEvents />} />
            <Route path="/brand-activation" element={<BrandActivation />} />
            <Route path="/event-productions" element={<EventProductions />} />
            <Route path="/hostess-staff" element={<HostessStaff />} />
            <Route path="/public-relations" element={<PublicRelations />} />
            <Route path="/termini-condizioni" element={<TermsConditions />} />
            <Route path="/contatti" element={<Contatti />} />
            <Route path="/prenota-call" element={<PrenotaCall />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/case-study/diesel" element={<CaseStudyDiesel />} />
            <Route path="/case-study/mediolanum" element={<CaseStudyMediolanum />} />
            <Route path="/case-study/distretto-12" element={<CaseStudyDistretto12 />} />
            <Route path="/case-study/coldiretti" element={<CaseStudyColdiretti />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

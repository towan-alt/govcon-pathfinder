import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Assessment from "./pages/Assessment.tsx";
import AssessmentReport from "./pages/AssessmentReport";
import Contact from "./pages/Contact.tsx";
import LegalPage from "./pages/LegalPage.tsx";
import Book from "./pages/Book.tsx";
import NaicsPage from "./pages/NaicsPage.tsx";
import Analytics from "./pages/Analytics.tsx";
import ConfirmEmail from "./pages/ConfirmEmail.tsx";
import Training from "./pages/Training.tsx";
import TrainingRegistered from "./pages/TrainingRegistered.tsx";
import TrainingWatch from "./pages/TrainingWatch.tsx";
import ReadinessReview from "./pages/ReadinessReview.tsx";
import ReadinessConfirmed from "./pages/ReadinessConfirmed.tsx";
import LaunchKit from "./pages/LaunchKit.tsx";
import LaunchKitConfirmed from "./pages/LaunchKitConfirmed.tsx";
import Portal from "./pages/Portal.tsx";
import VipEngagement from "./pages/VipEngagement.tsx";
import VipConfirmed from "./pages/VipConfirmed.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import SamGov from "./pages/SamGov.tsx";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();
import RouteSeo from "@/components/RouteSeo";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteSeo />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/report" element={<AssessmentReport />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<LegalPage pageKey="privacy" />} />
          <Route path="/terms" element={<LegalPage pageKey="terms" />} />
          <Route path="/accessibility" element={<LegalPage pageKey="accessibility" />} />
          <Route path="/disclaimer" element={<LegalPage pageKey="disclaimer" />} />
          <Route path="/book" element={<Book />} />
          <Route path="/naics" element={<NaicsPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/confirm" element={<ConfirmEmail />} />
          <Route path="/training" element={<Training />} />
          <Route path="/webinar" element={<Training />} />
          <Route path="/training/registered" element={<TrainingRegistered />} />
          <Route path="/training/watch" element={<TrainingWatch />} />
          <Route path="/readiness-review" element={<ReadinessReview />} />
          <Route path="/readiness-review/confirmed" element={<ReadinessConfirmed />} />
          <Route path="/launch-kit" element={<LaunchKit />} />
          <Route path="/launch-kit/confirmed" element={<LaunchKitConfirmed />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/vip-engagement" element={<VipEngagement />} />
          <Route path="/vip-engagement/confirmed" element={<VipConfirmed />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/samgov" element={<SamGov />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

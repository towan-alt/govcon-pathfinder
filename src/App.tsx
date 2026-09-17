import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Assessment from "./pages/Assessment.tsx";
import Contact from "./pages/Contact.tsx";
import LegalPage from "./pages/LegalPage.tsx";
import Book from "./pages/Book.tsx";
import NaicsPage from "./pages/NaicsPage.tsx";
import Analytics from "./pages/Analytics.tsx";
import Kit from "./pages/Kit.tsx";
import LaunchKit from "./pages/LaunchKit.tsx";
import KitConfirm from "./pages/KitConfirm.tsx";
import KitUpgrade from "./pages/KitUpgrade.tsx";
import CheckoutReturn from "./pages/CheckoutReturn.tsx";
import ConfirmEmail from "./pages/ConfirmEmail.tsx";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<LegalPage pageKey="privacy" />} />
          <Route path="/terms" element={<LegalPage pageKey="terms" />} />
          <Route path="/accessibility" element={<LegalPage pageKey="accessibility" />} />
          <Route path="/disclaimer" element={<LegalPage pageKey="disclaimer" />} />
          <Route path="/book" element={<Book />} />
          <Route path="/naics" element={<NaicsPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/kit" element={<Kit />} />
          <Route path="/launch-kit" element={<LaunchKit />} />
          <Route path="/kit/confirm" element={<KitConfirm />} />
          <Route path="/kit/upgrade" element={<KitUpgrade />} />
          <Route path="/checkout/return" element={<CheckoutReturn />} />
          <Route path="/confirm" element={<ConfirmEmail />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

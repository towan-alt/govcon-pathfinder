import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Book from "./pages/Book.tsx";
import NaicsPage from "./pages/NaicsPage.tsx";
import Analytics from "./pages/Analytics.tsx";
import Kit from "./pages/Kit.tsx";
import LaunchKit from "./pages/LaunchKit.tsx";
import KitConfirm from "./pages/KitConfirm.tsx";
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
          <Route path="/book" element={<Book />} />
          <Route path="/naics" element={<NaicsPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/kit" element={<Kit />} />
          <Route path="/launch-kit" element={<LaunchKit />} />
          <Route path="/kit/confirm" element={<KitConfirm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme";
import Index from "./pages/Index";
import LandingV2 from "./pages/LandingV2";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Classes from "./pages/Classes";
import Search from "./pages/Search";
import AdminPanel from "./pages/AdminPanel";
import Settings from "./pages/Settings";
import Verify from "./pages/Verify";
import Assessments from "./pages/Assessments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="examai-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/v2" element={<LandingV2 />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/assessments" element={<Assessments />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

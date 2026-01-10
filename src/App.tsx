import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme";
import { UsageProvider } from "@/contexts/UsageContext";
import { Suspense, lazy } from "react";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const LandingV2 = lazy(() => import("./pages/LandingV2"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Planner = lazy(() => import("./pages/Planner"));
const Classes = lazy(() => import("./pages/Classes"));
const Search = lazy(() => import("./pages/Search"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Settings = lazy(() => import("./pages/Settings"));
const Verify = lazy(() => import("./pages/Verify"));
const Assessments = lazy(() => import("./pages/Assessments"));
const Usage = lazy(() => import("./pages/Usage"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Help = lazy(() => import("./pages/Help"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="examai-theme">
      <UsageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/usage" element={<Usage />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/help" element={<Help />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </UsageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

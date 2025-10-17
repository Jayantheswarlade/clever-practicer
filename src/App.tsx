import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Setup from "./pages/Setup";
import Drill from "./pages/Drill";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex w-full min-h-screen">
          <Sidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Setup />} />
              <Route path="/drill" element={<Drill />} />
              <Route path="/results" element={<Results />} />
              {/* Placeholder routes for sidebar items */}
              <Route path="/about" element={<div className="p-8">About - Coming Soon</div>} />
              <Route path="/solver" element={<div className="p-8">AI Solver - Coming Soon</div>} />
              <Route path="/visualizer" element={<div className="p-8">AI STEM Visualizer - Coming Soon</div>} />
              <Route path="/notetaker" element={<div className="p-8">AI Notetaker - Coming Soon</div>} />
              <Route path="/history" element={<div className="p-8">History - Coming Soon</div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

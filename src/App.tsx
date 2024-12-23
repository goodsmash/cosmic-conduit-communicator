import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BlackHole from "./pages/BlackHole";
import Asteroid from "./pages/Asteroid";
import Timeline from "./components/Timeline";
import Chapters from "./pages/Chapters";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/black-hole" element={<BlackHole />} />
          <Route path="/asteroid" element={<Asteroid />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/chapters" element={<Chapters />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
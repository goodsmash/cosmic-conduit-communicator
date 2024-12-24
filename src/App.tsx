import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { GalaxySimulationLayout } from "@/components/layouts/GalaxySimulationLayout";
import Home from "@/pages/Home";
import Chapters from "@/pages/Chapters";
import GalaxyLibraryPage from "@/pages/GalaxyLibraryPage";
import AstronomicalDiscoveryPage from "@/pages/AstronomicalDiscoveryPage";
import SimulationExplorerPage from "@/pages/SimulationExplorerPage";
import ResearchJournalPage from "@/pages/ResearchJournalPage";
import DataSearchPage from "@/pages/DataSearchPage";
import OrbitalSimulation from "@/pages/simulations/OrbitalSimulation";
import StellarSimulation from "@/pages/simulations/StellarSimulation";
import GalaxySimulation from "@/pages/simulations/GalaxySimulation";
import AGNSimulation from "@/pages/simulations/AGNSimulation";
import GalaxyMergerSimulation from "@/pages/simulations/GalaxyMergerSimulation";
import PeculiarGalaxySimulation from "@/pages/simulations/PeculiarGalaxySimulation";
import UltraDiffuseGalaxySimulation from "@/pages/simulations/UltraDiffuseGalaxySimulation";
import RadioGalaxySimulation from "@/pages/simulations/RadioGalaxySimulation";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Router>
            <div className="relative min-h-screen bg-background">
              <Navigation />
              <GalaxySimulationLayout>
                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/chapters" element={<Chapters />} />
                  <Route path="/library" element={<GalaxyLibraryPage />} />
                  <Route path="/discover" element={<AstronomicalDiscoveryPage />} />
                  <Route path="/research" element={<ResearchJournalPage />} />
                  <Route path="/search" element={<DataSearchPage />} />
                  
                  {/* Simulation Routes */}
                  <Route path="/simulations" element={<SimulationExplorerPage />} />
                  <Route path="/simulations/orbital" element={<OrbitalSimulation />} />
                  <Route path="/simulations/stellar" element={<StellarSimulation />} />
                  <Route path="/simulations/formation" element={<GalaxySimulation />} />
                  <Route path="/simulations/agn" element={<AGNSimulation />} />
                  <Route path="/simulations/mergers" element={<GalaxyMergerSimulation />} />
                  <Route path="/simulations/peculiar" element={<PeculiarGalaxySimulation />} />
                  <Route path="/simulations/diffuse" element={<UltraDiffuseGalaxySimulation />} />
                  <Route path="/simulations/radio" element={<RadioGalaxySimulation />} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </GalaxySimulationLayout>
            </div>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
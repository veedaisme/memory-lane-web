import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NoteProvider } from "./context/NoteContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect, useState } from "react";
import { initializeAIService } from "./integrations/ai";
import Index from "./pages/Index";
import MapView from "./pages/MapView";
import GraphView from "./pages/GraphView";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize AI Service
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const [aiInitialized, setAiInitialized] = useState(false);

  useEffect(() => {
    // Initialize AI service on app startup
    const initAI = async () => {
      try {
        await initializeAIService();
        console.log("AI service initialized successfully");
        setAiInitialized(true);
      } catch (error) {
        console.error("Failed to initialize AI service:", error);
        // Still set to true so the app continues even if AI fails
        setAiInitialized(true);
      }
    };

    initAI();
  }, []);

  // Return children even if not initialized to avoid blocking the app
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NoteProvider>
          <AppInitializer>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/map" element={
                  <ProtectedRoute>
                    <MapView />
                  </ProtectedRoute>
                } />
                <Route path="/graph" element={
                  <ProtectedRoute>
                    <GraphView />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppInitializer>
        </NoteProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

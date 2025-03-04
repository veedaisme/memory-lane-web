
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NoteProvider } from "./context/NoteContext";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import MapView from "./pages/MapView";
import GraphView from "./pages/GraphView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NoteProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/graph" element={<GraphView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NoteProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

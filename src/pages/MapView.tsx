
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import ViewSelector from '@/components/ui/ViewSelector';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { MapPin, Info } from 'lucide-react';
import { Note, useNotes } from '@/context/NoteContext';
import MapComponent from '@/components/map/MapComponent';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const MapView = () => {
  const navigate = useNavigate();
  const { notes, loading } = useNotes();
  const { toast } = useToast();
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  
  // Check for token in localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);
  
  const viewOptions = [
    { label: 'Timeline', path: '/' },
    { label: 'Map', path: '/map' },
    { label: 'Graph', path: '/graph' }
  ];
  
  const handleCreateNote = () => {
    navigate('/editor');
  };
  
  const handleNoteClick = (note: Note) => {
    navigate(`/editor/${note.id}`);
  };
  
  const notesWithLocation = notes.filter(note => 
    note.location && note.location.latitude && note.location.longitude
  );
  
  const handleSubmitToken = () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a Mapbox token",
        variant: "destructive"
      });
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('mapbox_token', tokenInput);
    setMapboxToken(tokenInput);
    
    toast({
      title: "Token Saved",
      description: "Your Mapbox token has been saved",
    });
  };
  
  const renderMapContent = () => {
    if (loading) {
      return (
        <div className="glassmorphism p-8 rounded-lg mb-4 animate-fade-in text-center">
          <div className="flex justify-center mb-4">
            <MapPin size={40} className="text-memorylane-accent opacity-30" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Map</h2>
          <p className="text-memorylane-textSecondary">
            Retrieving your memories...
          </p>
        </div>
      );
    }
    
    if (!mapboxToken) {
      return (
        <div className="glassmorphism p-8 rounded-lg mb-4 animate-fade-in">
          <div className="flex justify-center mb-4">
            <MapPin size={40} className="text-memorylane-accent" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center">Mapbox Token Required</h2>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  To view your memories on a map, you need a Mapbox API token. 
                  Get a free token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="font-medium underline">mapbox.com</a>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="mapbox-token" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your Mapbox token
            </label>
            <div className="flex space-x-2">
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1IjoieW91..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSubmitToken}>
                Save
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your token will be saved in your browser's local storage.
            </p>
          </div>
        </div>
      );
    }
    
    if (notesWithLocation.length === 0) {
      return (
        <div className="glassmorphism p-8 rounded-lg mb-4 animate-fade-in text-center">
          <div className="flex justify-center mb-4">
            <MapPin size={40} className="text-memorylane-accent opacity-30" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Memories on the Map</h2>
          <p className="text-memorylane-textSecondary">
            {notes.length > 0 
              ? 'Your notes don\'t have location data. Create a note with location to see it on the map.'
              : 'Create your first note to see it on the map!'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="h-[70vh] glassmorphism p-1 rounded-lg mb-4 animate-fade-in">
        <MapComponent notes={notesWithLocation} onNoteClick={handleNoteClick} mapboxToken={mapboxToken} />
      </div>
    );
  };
  
  // Force re-render if map view is active
  useEffect(() => {
    // This effect will force the component to re-evaluate when it's mounted
    // which helps ensure the map initializes properly
    console.log("Map view mounted, notes with location:", notesWithLocation.length);
  }, []);
  
  return (
    <div className="min-h-screen pb-16 pt-14 px-4 bg-memorylane-bg">
      <Header />
      
      <ViewSelector options={viewOptions} />
      
      <div className="mt-6">
        {renderMapContent()}
      </div>
      
      <BottomNavigation onFabClick={handleCreateNote} />
    </div>
  );
};

export default MapView;

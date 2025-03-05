
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Note } from '@/context/NoteContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Placeholder token - will be replaced by the user input
let MAPBOX_TOKEN = '';

interface MapComponentProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  mapboxToken?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ notes, onNoteClick, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapInitializedRef = useRef<boolean>(false);

  // Update token if provided
  useEffect(() => {
    if (mapboxToken) {
      MAPBOX_TOKEN = mapboxToken;
      // If we already tried to initialize the map but failed, try again with new token
      if (error && mapContainer.current) {
        setError(null);
        initializeMap();
      }
    }
  }, [mapboxToken, error]);

  // Function to initialize map
  const initializeMap = () => {
    if (!mapContainer.current || mapInitializedRef.current) return;
    
    // Don't try to initialize if no token is provided
    if (!MAPBOX_TOKEN) {
      setError('Please provide a Mapbox token to view the map');
      setLoading(false);
      return;
    }
    
    try {
      // Set access token
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      // Create the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 20], // Default center
        zoom: 1.5,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Handle map load
      map.current.on('load', () => {
        setLoading(false);
        setError(null);
        mapInitializedRef.current = true;
        addMapMarkers();
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        if (e.error && e.error.status === 401) {
          setError('Invalid Mapbox token. Please check your token and try again.');
        } else {
          setError('Error loading map. Please try again later.');
        }
        setLoading(false);
      });

      // Add attribution control in a less obtrusive position
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Error initializing map. Please try again later.');
      setLoading(false);
    }
  };

  // Function to add markers to the map
  const addMapMarkers = () => {
    if (!map.current || !mapInitializedRef.current) return;
    
    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (notes.length === 0) return;

    // Add new markers for each note
    const bounds = new mapboxgl.LngLatBounds();
    
    notes.forEach(note => {
      if (!note.location || !note.location.latitude || !note.location.longitude) return;
      
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerHTML = `
        <div class="w-8 h-8 bg-memorylane-accent rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${note.title || 'Untitled Note'}</h3>
          <p class="text-sm text-gray-600">${note.location.name}</p>
        </div>
      `);
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([note.location.longitude, note.location.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Add click handler
      markerEl.addEventListener('click', () => {
        onNoteClick(note);
      });
      
      // Store marker reference for cleanup
      markersRef.current.push(marker);
      
      // Extend bounds to include this point
      bounds.extend([note.location.longitude, note.location.latitude]);
    });
    
    // If we have markers, fit the map to show all of them
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  };

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      mapInitializedRef.current = false;
    };
  }, []);

  // Add markers when notes change
  useEffect(() => {
    addMapMarkers();
  }, [notes, onNoteClick]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-memorylane-accent" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 p-4">
          <p className="text-red-500 mb-2 text-center">{error}</p>
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapComponent;

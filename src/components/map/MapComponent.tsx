
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Note } from '@/context/NoteContext';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet default icon issue
// This is needed because Leaflet's default icons reference content from the server
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for markers
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map bounds
const MapBounds = ({ notes }: { notes: Note[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (notes.length === 0) return;
    
    const bounds = new L.LatLngBounds(
      notes
        .filter(note => note.location && note.location.latitude && note.location.longitude)
        .map(note => [note.location.latitude, note.location.longitude] as [number, number])
    );
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [notes, map]);
  
  return null;
};

interface MapComponentProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ notes, onNoteClick }) => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading to allow the component to fully render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Default center position
  const defaultCenter: [number, number] = [20, 0];
  const defaultZoom = 2;
  
  const notesWithLocation = notes.filter(
    note => note.location && note.location.latitude && note.location.longitude
  );
  
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-memorylane-accent" />
        </div>
      )}
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {notesWithLocation.map((note) => (
          <Marker
            key={note.id}
            position={[note.location.latitude, note.location.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => onNoteClick(note)
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-semibold">{note.title || 'Untitled Note'}</h3>
                <p className="text-sm text-gray-600">{note.location.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapBounds notes={notesWithLocation} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Note } from '@/context/NoteContext';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';

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

// Function to truncate content for preview
const truncateContent = (content: string, maxLength: number = 100) => {
  if (!content) return '';
  return content.length > maxLength 
    ? content.substring(0, maxLength) + '...' 
    : content;
};

// Format date for preview
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

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

// Component to add custom CSS for tooltips
const CustomTooltipStyles = () => {
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .custom-tooltip {
        background-color: rgba(255, 255, 255, 0.95);
        border: none;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 8px 10px;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 220px;
        margin-left: 5px;
        white-space: normal;
      }
      .custom-tooltip::before {
        display: none;
      }
      .tooltip-content {
        width: 100%;
        overflow: hidden;
      }
      .note-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: #333;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .note-date {
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .note-preview {
        font-size: 12px;
        color: #444;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        max-height: 4.2em;
      }
      .note-location {
        font-size: 11px;
        color: #777;
        margin-top: 6px;
        font-style: italic;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
  
  // Marker cluster group options
  const clusterOptions = {
    chunkedLoading: true,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 50
  };
  
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {/* Add custom tooltip styles */}
      <CustomTooltipStyles />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-memorylane-accent" />
        </div>
      )}
      
      <MapContainer
        center={defaultCenter as L.LatLngExpression}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MarkerClusterGroup {...clusterOptions}>
          {notesWithLocation.map((note) => (
            <Marker
              key={note.id}
              position={[note.location.latitude, note.location.longitude] as L.LatLngExpression}
              icon={customIcon}
              eventHandlers={{
                click: () => onNoteClick(note)
              }}
            >
              {/* Tooltip for hover preview */}
              <Tooltip 
                direction="right" 
                offset={[10, -20]} 
                opacity={1}
                permanent={false}
                className="custom-tooltip"
              >
                <div className="tooltip-content">
                  <div className="note-title">{note.title || 'Untitled Note'}</div>
                  <div className="note-date">{formatDate(note.createdAt)}</div>
                  <div className="note-preview">{truncateContent(note.content)}</div>
                  {note.location.name && (
                    <div className="note-location">📍 {note.location.name}</div>
                  )}
                </div>
              </Tooltip>
              
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold">{note.title || 'Untitled Note'}</h3>
                  <p className="text-sm text-gray-600">{note.location.name}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
        
        <MapBounds notes={notesWithLocation} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;

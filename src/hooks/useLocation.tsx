
import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number;
  longitude: number;
  name: string;
  loading: boolean;
  error: string | null;
}

interface UseLocationResult extends LocationState {
  refreshLocation: () => Promise<void>;
}

const defaultLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  name: 'San Francisco, CA'
};

export const useLocation = (): UseLocationResult => {
  const [state, setState] = useState<LocationState>({
    ...defaultLocation,
    loading: true,
    error: null,
  });

  const fetchLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // This would normally use a reverse geocoding API
      // For now, we'll simulate it with a delay and mock data based on coords
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock location names based on coordinates
      const locations = [
        'Home Office',
        'Coffee Shop',
        'Downtown',
        'Central Park',
        'Midtown',
        'Beach',
        'Library',
        'Conference Room',
        'Train Station'
      ];
      
      // Use the coordinates to select a "random" but deterministic location
      const index = Math.floor((latitude * longitude) % locations.length);
      if (index < 0) return locations[0];
      return locations[Math.abs(index)];
    } catch (error) {
      console.error('Error fetching location name:', error);
      return 'Unknown Location';
    }
  };

  const getLocation = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      const locationName = await fetchLocationName(latitude, longitude);
      
      setState({
        latitude,
        longitude,
        name: locationName,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to retrieve your location. Using default location.'
      }));
    }
  };

  // Get location on component mount
  useEffect(() => {
    getLocation();
  }, []);

  return {
    ...state,
    refreshLocation: getLocation,
  };
};

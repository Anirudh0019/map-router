import React, { useState, useCallback, useRef } from 'react';
import { Search as MapSearch } from 'lucide-react';
import Map from './components/Map';
import SearchBox from './components/SearchBox';
import RouteDetails from './components/RouteDetails';
import { calculateRoute, extractRouteInfo, mapStyles, defaultCenter } from './utils/mapUtils';
import { RouteInfo } from './types/maps';

function App() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const sourceMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  
  const sourceLocationRef = useRef<google.maps.LatLngLiteral | null>(null);
  const destinationLocationRef = useRef<google.maps.LatLngLiteral | null>(null);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    directionsServiceRef.current = new google.maps.DirectionsService();
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5,
      },
    });
  }, []);

  const handleSourceSelected = useCallback((place: google.maps.places.PlaceResult) => {
    if (!map || !place.geometry?.location) return;
    
    // Clear previous source marker
    if (sourceMarkerRef.current) {
      sourceMarkerRef.current.setMap(null);
    }
    
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    
    sourceLocationRef.current = location;
    
    // Create new marker
    sourceMarkerRef.current = new google.maps.Marker({
      position: location,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: place.name || 'Source',
    });
    
    // Pan to the selected location
    map.panTo(location);
    
    // If both source and destination are set, calculate route
    if (destinationLocationRef.current) {
      calculateAndDisplayRoute();
    }
  }, [map]);

  const handleDestinationSelected = useCallback((place: google.maps.places.PlaceResult) => {
    if (!map || !place.geometry?.location) return;
    
    // Clear previous destination marker
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
    }
    
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    
    destinationLocationRef.current = location;
    
    // Create new marker
    destinationMarkerRef.current = new google.maps.Marker({
      position: location,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#EA4335',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: place.name || 'Destination',
    });
    
    // Pan to the selected location
    map.panTo(location);
    
    // If both source and destination are set, calculate route
    if (sourceLocationRef.current) {
      calculateAndDisplayRoute();
    }
  }, [map]);

  const calculateAndDisplayRoute = async () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || 
        !sourceLocationRef.current || !destinationLocationRef.current) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await calculateRoute(
        directionsServiceRef.current,
        sourceLocationRef.current,
        destinationLocationRef.current
      );
      
      directionsRendererRef.current.setDirections(result);
      
      // Extract and set route information
      const info = extractRouteInfo(result);
      setRouteInfo(info);
      
      // Fit the map to show the entire route
      if (map && result.routes[0].bounds) {
        map.fitBounds(result.routes[0].bounds);
      }
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Failed to calculate route. Please try again.');
      setRouteInfo(null);
      
      // Clear the directions
      directionsRendererRef.current.setDirections({ routes: [] } as unknown as google.maps.DirectionsResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindRoute = () => {
    if (sourceLocationRef.current && destinationLocationRef.current) {
      calculateAndDisplayRoute();
    } else {
      setError('Please select both source and destination locations.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center">
          <MapSearch size={28} className="text-blue-500 mr-2" />
          <h1 className="text-xl font-bold text-gray-800">Maps Route Finder</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Find the fastest route</h2>
            
            <div className="space-y-4">
              <SearchBox 
                map={map} 
                placeholder="Enter source location" 
                icon="source" 
                onPlaceSelected={handleSourceSelected} 
              />
              
              <SearchBox 
                map={map} 
                placeholder="Enter destination" 
                icon="destination" 
                onPlaceSelected={handleDestinationSelected} 
              />
              
              <button 
                onClick={handleFindRoute}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
              >
                {isLoading ? 'Calculating...' : 'Find Route'}
              </button>
              
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
          
          {routeInfo && <RouteDetails routeInfo={routeInfo} />}
        </div>
        
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-hidden h-[500px] md:h-auto">
          <Map 
            apiKey="AIzaSyBKFxPiCIZFIhsUVhRi8JmnsvWv2I_hDU0"
            options={{
              center: defaultCenter,
              zoom: 12,
              disableDefaultUI: false,
              clickableIcons: false,
              styles: mapStyles,
            }}
            onMapLoad={handleMapLoad}
          />
        </div>
      </main>
      
      <footer className="bg-white shadow-md p-4 mt-auto">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Maps Route Finder | Built with Google Maps Platform
        </div>
      </footer>
    </div>
  );
}

export default App;
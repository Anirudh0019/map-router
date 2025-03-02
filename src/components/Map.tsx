import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapOptions, RouteInfo } from '../types/maps';

interface MapProps {
  apiKey: string;
  options: MapOptions;
  onMapLoad?: (map: google.maps.Map) => void;
}

const Map: React.FC<MapProps> = ({ apiKey, options, onMapLoad }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'routes']
    });

    loader.load().then(() => {
      if (mapRef.current && !mapInstance) {
        const map = new google.maps.Map(mapRef.current, options);
        setMapInstance(map);
        if (onMapLoad) onMapLoad(map);
      }
    }).catch(error => {
      console.error('Error loading Google Maps API:', error);
    });
  }, [apiKey, options, onMapLoad, mapInstance]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
};

export default Map;
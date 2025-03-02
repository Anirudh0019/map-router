import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface SearchBoxProps {
  map: google.maps.Map | null;
  placeholder: string;
  icon: 'source' | 'destination';
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ map, placeholder, icon, onPlaceSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!map || !inputRef.current) return;

    const options = {
      fields: ['formatted_address', 'geometry', 'name'],
      strictBounds: false,
    };

    searchBoxRef.current = new google.maps.places.Autocomplete(inputRef.current, options);
    searchBoxRef.current.bindTo('bounds', map);

    searchBoxRef.current.addListener('place_changed', () => {
      const place = searchBoxRef.current?.getPlace();
      if (place && place.geometry && place.geometry.location) {
        onPlaceSelected(place);
      }
    });

    return () => {
      if (searchBoxRef.current) {
        google.maps.event.clearInstanceListeners(searchBoxRef.current);
      }
    };
  }, [map, onPlaceSelected]);

  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 text-gray-500">
        {icon === 'source' ? (
          <MapPin size={18} className="text-blue-500" />
        ) : (
          <Navigation size={18} className="text-red-500" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SearchBox;
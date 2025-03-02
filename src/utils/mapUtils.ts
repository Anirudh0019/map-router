export const calculateRoute = async (
  directionsService: google.maps.DirectionsService,
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral
): Promise<google.maps.DirectionsResult> => {
  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      }
    );
  });
};

export const extractRouteInfo = (result: google.maps.DirectionsResult) => {
  const route = result.routes[0];
  const leg = route.legs[0];
  
  return {
    distance: leg.distance?.text || 'Unknown',
    duration: leg.duration?.text || 'Unknown',
    startAddress: leg.start_address || 'Unknown',
    endAddress: leg.end_address || 'Unknown',
  };
};

export const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

export const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City
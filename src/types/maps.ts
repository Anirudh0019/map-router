export interface MapOptions {
  center: google.maps.LatLngLiteral;
  zoom: number;
  disableDefaultUI?: boolean;
  clickableIcons?: boolean;
  styles?: google.maps.MapTypeStyle[];
}

export interface RouteInfo {
  distance: string;
  duration: string;
  startAddress: string;
  endAddress: string;
}
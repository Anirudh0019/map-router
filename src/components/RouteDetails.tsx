import React from 'react';
import { Clock, Route } from 'lucide-react';
import { RouteInfo } from '../types/maps';

interface RouteDetailsProps {
  routeInfo: RouteInfo | null;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ routeInfo }) => {
  if (!routeInfo) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Route Information</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <Route size={18} className="text-blue-500 mr-2" />
          <span className="text-gray-700">Distance: {routeInfo.distance}</span>
        </div>
        <div className="flex items-center">
          <Clock size={18} className="text-blue-500 mr-2" />
          <span className="text-gray-700">Duration: {routeInfo.duration}</span>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          <div>From: {routeInfo.startAddress}</div>
          <div>To: {routeInfo.endAddress}</div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
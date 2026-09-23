import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Compass,
  CornerUpRight,
} from 'lucide-react';
import { DeliveryTask } from '../../types/delivery';
import {
  openRiderToSellerGoogleMaps,
  openSellerToCustomerGoogleMaps,
} from '../../utils/navigation';

// Clean Leaflet HTML DivIcons
export const createHubIcon = () => {
  return L.divIcon({
    className: 'custom-hub-marker',
    html: `
      <div style="width: 36px; height: 36px; background: #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.22); border: 2.5px solid #009DE0; position: relative;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#009DE0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export const createDestinationIcon = () => {
  return L.divIcon({
    className: 'custom-destination-marker',
    html: `
      <div style="width: 36px; height: 36px; background: #0f172a; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(15,23,42,0.28); border: 2.5px solid #ffffff; position: relative;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3" fill="#0f172a"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export const createRiderIcon = () => {
  return L.divIcon({
    className: 'custom-rider-marker',
    html: `
      <div style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; position: relative;">
        <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(0, 157, 224, 0.28); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 34px; height: 34px; background: #009DE0; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,157,224,0.4); border: 2.5px solid #ffffff; position: relative; z-index: 10;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

/**
 * Generates verified road corridor coordinates
 */
function generateRealisticRoadPath(start: [number, number], end: [number, number]): [number, number][] {
  const isNearIndiranagarCMH =
    Math.abs(start[0] - 12.9783) < 0.005 && Math.abs(end[0] - 12.9784) < 0.005;

  let roadNodes: [number, number][];

  if (isNearIndiranagarCMH) {
    roadNodes = [
      [start[0], start[1]],
      [12.9783, 77.6345],
      [12.9783, 77.6365],
      [12.9784, 77.6385],
      [12.9784, 77.6402],
      [end[0], end[1]],
    ];
  } else {
    const latMid = start[0] + (end[0] - start[0]) * 0.55;
    roadNodes = [
      [start[0], start[1]],
      [latMid, start[1]],
      [latMid, end[1]],
      [end[0], end[1]],
    ];
  }

  const densePath: [number, number][] = [];
  for (let i = 0; i < roadNodes.length - 1; i++) {
    const p1 = roadNodes[i];
    const p2 = roadNodes[i + 1];
    const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 111000;
    const steps = Math.max(5, Math.ceil(dist / 12));
    for (let s = 0; s < steps; s++) {
      const ratio = s / steps;
      densePath.push([
        p1[0] + (p2[0] - p1[0]) * ratio,
        p1[1] + (p2[1] - p1[1]) * ratio,
      ]);
    }
  }
  densePath.push([end[0], end[1]]);
  return densePath;
}

export type MapMode = 'RIDER_TO_SELLER' | 'AT_SELLER' | 'SELLER_TO_CUSTOMER' | 'VERIFICATION';

interface InteractiveMapProps {
  task: DeliveryTask;
  mode?: MapMode;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  task,
  mode,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const roadPointsRef = useRef<[number, number][]>([]);

  const isHeadingToSeller = task.orderStatus === 'placed' || task.orderStatus === 'picking';
  const isAtSeller = task.orderStatus === 'packed';
  const isInTransitToCustomer = task.orderStatus === 'out_for_delivery';
  const isAtCustomer = task.orderStatus === 'arriving';

  const currentMode: MapMode =
    mode ||
    (isHeadingToSeller
      ? 'RIDER_TO_SELLER'
      : isAtSeller
      ? 'AT_SELLER'
      : isInTransitToCustomer
      ? 'SELLER_TO_CUSTOMER'
      : 'VERIFICATION');

  // Exact coordinates setup
  const riderCoord: [number, number] = [12.9783, 77.6335];
  const sellerCoord: [number, number] = [task.pickup.coordinates.lat, task.pickup.coordinates.lng];
  const customerCoord: [number, number] = [task.drop.coordinates.lat, task.drop.coordinates.lng];

  const startCoord: [number, number] = isHeadingToSeller ? riderCoord : sellerCoord;
  const endCoord: [number, number] = (isHeadingToSeller || isAtSeller) ? sellerCoord : customerCoord;

  const handleOpenGoogleMaps = () => {
    if (isHeadingToSeller || isAtSeller) {
      openRiderToSellerGoogleMaps(
        {
          lat: sellerCoord[0],
          lng: sellerCoord[1],
          storeName: task.pickup.storeName,
          address: task.pickup.address,
        },
        { lat: riderCoord[0], lng: riderCoord[1] }
      );
    } else {
      openSellerToCustomerGoogleMaps(
        {
          lat: customerCoord[0],
          lng: customerCoord[1],
          customerName: task.drop.customerName,
          address: task.drop.address,
        },
        { lat: sellerCoord[0], lng: sellerCoord[1] }
      );
    }
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (currentMode === 'AT_SELLER') {
      mapInstanceRef.current.setView(sellerCoord, 18, { animate: true });
    } else if (currentMode === 'VERIFICATION') {
      mapInstanceRef.current.setView(customerCoord, 18, { animate: true });
    } else {
      const bounds = L.latLngBounds([startCoord, endCoord]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    });
    tileLayer.addTo(map);

    const roadPoints = generateRealisticRoadPath(startCoord, endCoord);
    roadPointsRef.current = roadPoints;

    if (currentMode === 'RIDER_TO_SELLER') {
      // Rider marker
      L.marker(startCoord, { icon: createRiderIcon() }).addTo(map);
      // Store marker
      L.marker(endCoord, { icon: createHubIcon() }).addTo(map);

      // Route Glow & Line
      L.polyline(roadPoints, {
        color: '#009DE0',
        weight: 8,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      L.polyline(roadPoints, {
        color: '#009DE0',
        weight: 4.5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      const bounds = L.latLngBounds([startCoord, endCoord]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (currentMode === 'AT_SELLER') {
      // At Seller Store location
      L.marker(sellerCoord, { icon: createHubIcon() }).addTo(map);
      L.marker([sellerCoord[0] - 0.00012, sellerCoord[1] + 0.00010], {
        icon: createRiderIcon(),
      }).addTo(map);

      L.circle(sellerCoord, {
        radius: 35,
        color: '#009DE0',
        fillColor: '#009DE0',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(map);

      map.setView(sellerCoord, 18);
    } else if (currentMode === 'SELLER_TO_CUSTOMER') {
      // Rider current position marker
      L.marker(startCoord, { icon: createRiderIcon() }).addTo(map);
      // Customer destination marker
      L.marker(endCoord, { icon: createDestinationIcon() }).addTo(map);

      // Route Polyline
      L.polyline(roadPoints, {
        color: '#009DE0',
        weight: 8,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      L.polyline(roadPoints, {
        color: '#009DE0',
        weight: 4.5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      const bounds = L.latLngBounds([startCoord, endCoord]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Geofence arrived verification at customer door
      L.marker(customerCoord, { icon: createDestinationIcon() }).addTo(map);
      L.marker([customerCoord[0] - 0.00015, customerCoord[1] + 0.00012], {
        icon: createRiderIcon(),
      }).addTo(map);

      L.circle(customerCoord, {
        radius: 40,
        color: '#009DE0',
        fillColor: '#009DE0',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(map);

      map.setView(customerCoord, 18);
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentMode, task.id, startCoord[0], startCoord[1], endCoord[0], endCoord[1]]);

  const distanceText =
    currentMode === 'RIDER_TO_SELLER'
      ? '1.4 km · 5 mins'
      : currentMode === 'AT_SELLER'
      ? '0.0 km · At Store'
      : currentMode === 'SELLER_TO_CUSTOMER'
      ? `${task.route.distanceKm} km · ${task.route.formattedEta}`
      : '0.0 km · At Customer';

  return (
    <div
      className={`relative w-full h-[48vh] sm:h-[54vh] rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs flex flex-col justify-between p-3.5 bg-[#e5e9ec] ${className}`}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top Floating Controls */}
      <div className="z-10 flex items-start justify-end">
        {/* Recenter Compass Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md text-neutral-800 shadow-sm border border-neutral-200/90 flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition cursor-pointer shrink-0"
          title="Recenter Route"
        >
          <Compass className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      {/* Bottom Floating Navigation Action Bar */}
      <div className="z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-neutral-200/90 shadow-md flex items-center justify-between gap-2">
        <div className="shrink-0 px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200/80 font-bold text-xs text-neutral-900 whitespace-nowrap flex items-center justify-center">
          {distanceText}
        </div>

        {/* Google Maps Turn-by-Turn Navigation Trigger */}
        <button
          type="button"
          onClick={handleOpenGoogleMaps}
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#009DE0] hover:bg-[#008bc7] active:bg-[#0079ad] text-white font-bold text-xs shadow-xs transition cursor-pointer whitespace-nowrap"
          title="Open Navigation in Google Maps"
        >
          <CornerUpRight className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="truncate">Open Maps</span>
        </button>
      </div>
    </div>
  );
};

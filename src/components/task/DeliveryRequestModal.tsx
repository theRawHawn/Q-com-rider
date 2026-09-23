import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Zap,
  Clock,
  Navigation,
  Package,
  MapPin,
  X,
  Building2,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { DeliveryTask } from '../../types/delivery';
import { createHubIcon, createDestinationIcon, createRiderIcon } from '../navigation/InteractiveMap';

interface DeliveryRequestModalProps {
  task: DeliveryTask;
  isOpen: boolean;
  onClose: () => void;
  onStartOrder: (task: DeliveryTask) => void;
}

export const DeliveryRequestModal: React.FC<DeliveryRequestModalProps> = ({
  task,
  isOpen,
  onClose,
  onStartOrder,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Initialize Leaflet mini route map for the request modal
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const riderCoord: [number, number] = [12.9783, 77.6335];
    const storeCoord: [number, number] = [
      task.pickup.coordinates.lat,
      task.pickup.coordinates.lng,
    ];
    const dropCoord: [number, number] = [
      task.drop.coordinates.lat,
      task.drop.coordinates.lng,
    ];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Rider Marker
    L.marker(riderCoord, { icon: createRiderIcon() })
      .bindPopup('Your Current Location')
      .addTo(map);

    // Pickup Store Marker
    L.marker(storeCoord, { icon: createHubIcon() })
      .bindPopup(`<b>${task.pickup.storeName}</b><br>Pickup Store`)
      .addTo(map);

    // Customer Drop Marker
    L.marker(dropCoord, { icon: createDestinationIcon() })
      .bindPopup(`<b>${task.drop.customerName}</b><br>Delivery Destination`)
      .addTo(map);

    // Connect with Route Polyline
    const routeCoords: [number, number][] = [
      riderCoord,
      [12.9784, 77.6385],
      storeCoord,
      [12.9610, 77.6330],
      dropCoord,
    ];

    L.polyline(routeCoords, {
      color: '#1e293b',
      weight: 3.5,
      dashArray: '6, 8',
      opacity: 0.85,
    }).addTo(map);

    const bounds = L.latLngBounds([riderCoord, storeCoord, dropCoord]);
    map.fitBounds(bounds, { padding: [35, 35] });

    mapInstanceRef.current = map;

    // Trigger invalidateSize to ensure clean rendering in modal
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, task.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-neutral-200/90">
        {/* Top Right Urgent / Category Badge */}
        <div className="absolute top-3.5 right-3.5 z-30">
          <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-sm flex items-center gap-1.5 text-xs font-bold text-neutral-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Assigned Order</span>
          </div>
        </div>

        {/* Map Header Canvas Area */}
        <div className="relative w-full h-[200px] sm:h-[220px] bg-neutral-100 shrink-0 border-b border-neutral-200/80">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
        </div>

        {/* Bottom Details Sheet */}
        <div className="p-4 sm:p-5 space-y-3 bg-white text-neutral-900">
          {/* Estimated Earning Title & Large Payout Display */}
          <div className="text-center pt-0.5">
            <span className="text-xs font-semibold text-neutral-500 tracking-wide block">
              Estimated Earning
            </span>
            <div className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight my-0.5">
              ₹{task.payoutBreakdown.totalPayout}
            </div>
          </div>

          {/* Time & Distance Row */}
          <div className="text-center text-xs sm:text-sm font-bold text-neutral-700 pb-2 border-b border-neutral-100 flex items-center justify-center gap-3">
            <span>Time: {task.route.formattedEta}</span>
            <span className="text-neutral-300">|</span>
            <span>Distance: {task.route.distanceKm} kms</span>
          </div>

          {/* Pickup Hardware & Auto Spares Detail */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-600">
              <span className="text-sm">📦</span>
              <span className="uppercase text-[11px] tracking-wider text-neutral-500 font-extrabold">
                Pickup Hardware / Auto Spares
              </span>
            </div>
            <p className="font-extrabold text-neutral-900 text-sm pl-6 leading-tight">
              {task.pickup.storeName}
            </p>
            <p className="text-[11px] text-neutral-500 pl-6 truncate">
              {task.pickup.address}
            </p>
          </div>

          {/* Dropoff Destination Detail */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="uppercase text-[11px] tracking-wider text-neutral-500 font-extrabold">
                Dropoff Jobsite / Customer
              </span>
            </div>
            <p className="font-extrabold text-neutral-900 text-sm pl-6 leading-tight">
              {task.drop.customerName}
            </p>
            <p className="text-[11px] text-neutral-500 pl-6 truncate">
              {task.drop.address}
            </p>
          </div>

          {/* Primary Action Button: "Start order" */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onStartOrder(task)}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#f25100] hover:bg-[#d94800] text-white font-black text-base shadow-md active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 tracking-wide"
            >
              <span>Start order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

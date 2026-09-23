import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { X, ArrowRight } from 'lucide-react';
import { DeliveryTask } from '../../types/delivery';
import { createHubIcon, createDestinationIcon, createRiderIcon } from '../navigation/InteractiveMap';
import { audioNotificationService } from '../../services/audioNotificationService';

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

  // Play crisp single-shot notification sound when order modal opens
  useEffect(() => {
    if (isOpen) {
      audioNotificationService.playNewOrderTone();
    }
  }, [isOpen, task.id]);

  const handleStart = () => {
    audioNotificationService.playActionBeep();
    onStartOrder(task);
  };

  const handleDismiss = () => {
    onClose();
  };

  // Initialize Leaflet mini route map for the request view
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
    map.fitBounds(bounds, { padding: [40, 40] });

    mapInstanceRef.current = map;

    // Trigger invalidateSize to ensure clean rendering
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between overflow-hidden animate-in fade-in duration-150 max-w-md mx-auto w-full h-full shadow-2xl">
      {/* Sleek Floating Dismiss Button in Top-Left */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer active:scale-95"
        title="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Map Area - Fills upper portion of full screen */}
      <div className="relative w-full flex-1 min-h-[220px] bg-neutral-100 border-b border-neutral-200/70">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
      </div>

      {/* Bottom Full-Width Operations Card */}
      <div className="bg-white p-4 sm:p-5 space-y-3.5 text-neutral-900 border-t border-neutral-200/70 shadow-lg shrink-0">
        {/* Estimated Earning Title & Large Payout Display */}
        <div className="text-center pt-0.5">
          <span className="text-xs font-semibold text-neutral-500 tracking-wide block uppercase">
            Estimated Earning
          </span>
          <div className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight my-0.5">
            ₹{task.payoutBreakdown.totalPayout}
          </div>
        </div>

        {/* Time & Distance Row */}
        <div className="text-center text-xs font-bold text-neutral-700 pb-2 border-b border-neutral-100 flex items-center justify-center gap-3">
          <span>Time: {task.route.formattedEta}</span>
          <span className="text-neutral-300">|</span>
          <span>Distance: {task.route.distanceKm} kms</span>
        </div>

        {/* Unified Sleek Professional Route Timeline Card (Compact, Cool & Clean) */}
        <div className="p-3.5 bg-neutral-50/90 rounded-2xl border border-neutral-200/70 space-y-2.5">
          {/* Pickup Point */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-3 ring-emerald-100 shrink-0" />
              <div className="w-0.5 h-6 bg-neutral-300/80 my-0.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block">
                Pickup
              </span>
              <p className="font-extrabold text-neutral-900 text-xs sm:text-sm truncate mt-0.5 leading-snug">
                {task.pickup.storeName}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">
                {task.pickup.address}
              </p>
            </div>
          </div>

          {/* Drop Point */}
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 ring-3 ring-neutral-200 shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-800 bg-neutral-200/80 px-2 py-0.5 rounded-md inline-block">
                Drop
              </span>
              <p className="font-extrabold text-neutral-900 text-xs sm:text-sm truncate mt-0.5 leading-snug">
                {task.drop.customerName}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">
                {task.drop.address}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button: "Start order" */}
        <div className="pt-0.5 pb-1">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#009DE0] hover:bg-[#0082BD] active:bg-[#0074A8] text-white font-black text-base shadow-md active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 tracking-wide"
          >
            <span>Start order</span>
            <ArrowRight className="w-4 h-4 text-white/90" />
          </button>
        </div>
      </div>
    </div>
  );
};

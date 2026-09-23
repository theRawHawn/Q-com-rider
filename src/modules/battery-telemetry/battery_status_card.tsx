/**
 * BatteryStatusCard
 * 
 * Reusable, self-contained Dashboard Widget displaying live SoC %, voltage,
 * temperature, range estimate, and Bluetooth connection status.
 * Can be dropped directly into any dashboard or sidebar without layout conflicts.
 */

import React, { useEffect, useState } from 'react';
import {
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Bluetooth,
  RefreshCw,
  Zap,
  Thermometer,
  Gauge,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { TelemetryPacket } from './telemetry_packet';
import {
  BatteryTelemetryService,
  batteryTelemetryService,
  ConnectionState,
} from './battery_telemetry_service';

export interface BatteryStatusCardProps {
  service?: BatteryTelemetryService;
  vehicleModel?: string;
  vehicleId?: string;
  className?: string;
  compact?: boolean;
  onOpenDetails?: () => void;
}

export const BatteryStatusCard: React.FC<BatteryStatusCardProps> = ({
  service = batteryTelemetryService,
  vehicleModel = 'Ather 450X Gen 3',
  vehicleId = 'EV-142',
  className = '',
  compact = false,
  onOpenDetails,
}) => {
  const [packet, setPacket] = useState<TelemetryPacket>(service.getCurrentPacket());
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    service.getConnectionState()
  );
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Subscribe to reactive 60-second telemetry stream
    const unsubscribeTelemetry = service.subscribe((newPacket) => {
      setPacket(newPacket);
    });

    // Subscribe to BLE connection state changes
    const unsubscribeState = service.onConnectionStateChange((state) => {
      setConnectionState(state);
      setIsConnecting(state === 'connecting' || state === 'scanning');
    });

    // Automatically trigger initial connection if disconnected
    if (service.getConnectionState() === 'disconnected') {
      service.connect();
    }

    return () => {
      unsubscribeTelemetry();
      unsubscribeState();
    };
  }, [service]);

  const handleToggleConnection = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectionState === 'connected') {
      service.disconnect();
    } else {
      setIsConnecting(true);
      await service.connect();
      setIsConnecting(false);
    }
  };

  // Helper for battery color & icon
  const getBatteryStyle = (soc: number) => {
    if (soc > 50) {
      return {
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-500',
        borderColor: 'border-emerald-200',
        badgeBg: 'bg-emerald-50 text-emerald-800',
        icon: <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />,
      };
    } else if (soc > 20) {
      return {
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-500',
        borderColor: 'border-amber-200',
        badgeBg: 'bg-amber-50 text-amber-800',
        icon: <BatteryMedium className="w-4 h-4 text-amber-600 shrink-0" />,
      };
    } else {
      return {
        textColor: 'text-rose-700',
        bgColor: 'bg-rose-500',
        borderColor: 'border-rose-200',
        badgeBg: 'bg-rose-50 text-rose-800',
        icon: <BatteryLow className="w-4 h-4 text-rose-600 shrink-0" />,
      };
    }
  };

  const style = getBatteryStyle(packet.soc);

  if (compact) {
    return (
      <div
        onClick={onOpenDetails}
        className={`p-3 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 shadow-2xs transition-all ${
          onOpenDetails ? 'cursor-pointer hover:border-neutral-300' : ''
        } ${className}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Vehicle & Telemetry
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleConnection}
              title={connectionState === 'connected' ? 'Disconnect BMS' : 'Connect BMS'}
              className="p-1 rounded-md hover:bg-neutral-200/60 transition-colors text-neutral-500"
            >
              <Bluetooth
                className={`w-3.5 h-3.5 ${
                  connectionState === 'connected'
                    ? 'text-emerald-600'
                    : isConnecting
                    ? 'text-amber-500 animate-spin'
                    : 'text-neutral-400'
                }`}
              />
            </button>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                connectionState === 'connected'
                  ? 'bg-emerald-100 text-emerald-800'
                  : connectionState === 'reconnecting'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connectionState === 'connected'
                    ? 'bg-emerald-600'
                    : connectionState === 'reconnecting'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-neutral-400'
                }`}
              />
              {connectionState === 'connected'
                ? 'Active'
                : connectionState === 'reconnecting'
                ? 'Syncing'
                : 'Offline'}
            </span>
          </div>
        </div>

        <p className="text-xs font-bold text-neutral-900 truncate">
          {vehicleModel} <span className="text-neutral-400 font-normal text-[11px]">({vehicleId})</span>
        </p>

        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200/60 text-xs text-neutral-600">
          {style.icon}
          <span className="font-bold text-neutral-900">{packet.soc}% Battery</span>
          <span className="text-neutral-400 text-[11px]">({packet.estimatedRangeKm} km)</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onOpenDetails}
      className={`p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs transition-all space-y-3 ${
        onOpenDetails ? 'cursor-pointer hover:border-neutral-300' : ''
      } ${className}`}
    >
      {/* Header Row: Title & BLE State */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 leading-tight">
              {vehicleModel}
            </h4>
            <span className="text-[10px] text-neutral-500 font-mono">
              BMS Node #{vehicleId} · {packet.bmsProtocol}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleConnection}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-[11px] font-semibold text-neutral-700 transition-colors"
          >
            <Bluetooth
              className={`w-3.5 h-3.5 ${
                connectionState === 'connected'
                  ? 'text-emerald-600'
                  : isConnecting
                  ? 'text-amber-500 animate-spin'
                  : 'text-neutral-400'
              }`}
            />
            <span>
              {connectionState === 'connected'
                ? 'Connected'
                : isConnecting
                ? 'Connecting...'
                : 'Connect'}
            </span>
          </button>
        </div>
      </div>

      {/* Main SoC Level & Progress Bar */}
      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {style.icon}
            <div>
              <span className="text-lg font-black text-neutral-900 leading-none">
                {packet.soc}%
              </span>
              <span className="text-[10px] text-neutral-500 block">
                State of Charge
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-neutral-800">
              {packet.estimatedRangeKm} km
            </span>
            <span className="text-[10px] text-neutral-400 block">Est. Range</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${style.bgColor}`}
            style={{ width: `${packet.soc}%` }}
          />
        </div>
      </div>

      {/* Secondary Metrics Grid: Voltage & Temperature */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <Gauge className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px]">Voltage</span>
          </div>
          <span className="font-bold text-neutral-900">
            {connectionState === 'connected' ? `${packet.voltage}V` : '--'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <Thermometer className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px]">Temp</span>
          </div>
          <span className="font-bold text-neutral-900">
            {connectionState === 'connected' ? `${packet.temperature}°C` : '--'}
          </span>
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-100">
        <span className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3 text-neutral-400" />
          Updated 60s Stream
        </span>
        <span className="font-mono">
          {new Date(packet.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

/**
 * TelemetryPacket
 * Standalone Data Model for EV Battery Management System (BMS) Telemetry
 */

export interface ITelemetryPacket {
  soc: number;            // State of Charge in percentage (0 - 100%)
  voltage: number;        // Total battery pack voltage in Volts (e.g., 52.4)
  temperature: number;    // Average cell temperature in Celsius (e.g., 28.5)
  timestamp: string;      // ISO 8601 Timestamp (e.g. 2026-09-22T10:00:00.000Z)
  latitude: number;       // GPS Latitude (e.g., 12.9716)
  longitude: number;      // GPS Longitude (e.g., 77.5946)
  currentAmps?: number;   // Real-time current in Amperes (+ Charging, - Discharging)
  estimatedRangeKm?: number; // Calculated dynamic distance remaining in km
  healthPercentage?: number; // State of Health (SOH %)
  bmsProtocol?: 'JBD' | 'DALY' | 'JK' | 'ATHER_BLE' | 'GENERIC_BMS';
  connectionStatus?: 'connected' | 'connecting' | 'scanning' | 'disconnected' | 'reconnecting' | 'error';
}

export class TelemetryPacket implements ITelemetryPacket {
  public soc: number;
  public voltage: number;
  public temperature: number;
  public timestamp: string;
  public latitude: number;
  public longitude: number;
  public currentAmps?: number;
  public estimatedRangeKm?: number;
  public healthPercentage?: number;
  public bmsProtocol?: 'JBD' | 'DALY' | 'JK' | 'ATHER_BLE' | 'GENERIC_BMS';
  public connectionStatus?: 'connected' | 'connecting' | 'scanning' | 'disconnected' | 'reconnecting' | 'error';

  constructor(data: ITelemetryPacket) {
    this.soc = Math.max(0, Math.min(100, Math.round(data.soc)));
    this.voltage = Number(data.voltage.toFixed(2));
    this.temperature = Number(data.temperature.toFixed(1));
    this.timestamp = typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString();
    this.latitude = Number(data.latitude.toFixed(6));
    this.longitude = Number(data.longitude.toFixed(6));
    this.currentAmps = data.currentAmps !== undefined ? Number(data.currentAmps.toFixed(2)) : undefined;
    this.estimatedRangeKm = data.estimatedRangeKm !== undefined ? Math.round(data.estimatedRangeKm) : Math.round((data.soc / 100) * 85);
    this.healthPercentage = data.healthPercentage ?? 98;
    this.bmsProtocol = data.bmsProtocol || 'ATHER_BLE';
    this.connectionStatus = data.connectionStatus || 'connected';
  }

  /**
   * Serializes the telemetry packet to a clean JSON object for backend transmission
   */
  public toJson(): Record<string, any> {
    return {
      soc: this.soc,
      voltage: this.voltage,
      temperature: this.temperature,
      timestamp: this.timestamp,
      latitude: this.latitude,
      longitude: this.longitude,
      current_amps: this.currentAmps,
      estimated_range_km: this.estimatedRangeKm,
      health_percentage: this.healthPercentage,
      bms_protocol: this.bmsProtocol,
      connection_status: this.connectionStatus,
    };
  }

  /**
   * Factory method to construct TelemetryPacket from JSON/API payload
   */
  public static fromJson(json: Record<string, any>): TelemetryPacket {
    return new TelemetryPacket({
      soc: json.soc ?? json.state_of_charge ?? 0,
      voltage: json.voltage ?? 0,
      temperature: json.temperature ?? 25.0,
      timestamp: json.timestamp ?? new Date().toISOString(),
      latitude: json.latitude ?? json.lat ?? 0,
      longitude: json.longitude ?? json.lng ?? 0,
      currentAmps: json.current_amps ?? json.currentAmps,
      estimatedRangeKm: json.estimated_range_km ?? json.estimatedRangeKm,
      healthPercentage: json.health_percentage ?? json.healthPercentage,
      bmsProtocol: json.bms_protocol ?? json.bmsProtocol,
      connectionStatus: json.connection_status ?? json.connectionStatus,
    });
  }
}

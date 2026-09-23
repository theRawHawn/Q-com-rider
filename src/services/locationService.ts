/**
 * Location & Telemetry Service
 * Handles live GPS telemetry, route distance calculations, turn-by-turn simulation, and emergency SOS pings.
 */

import { Coordinates, RouteInfo, TelemetryPing } from '../types/delivery';

class LocationService {
  private currentLocation: Coordinates = { lat: 12.9784, lng: 77.6408 };
  private speedKmH = 28;
  private heading = 180;

  public getCurrentLocation(): Coordinates {
    return this.currentLocation;
  }

  /**
   * Transmits live GPS telemetry ping to platform backend
   * NEW BACKEND/API REQUIREMENT: POST /api/delivery/rider/telemetry
   */
  public sendTelemetryPing(riderId: string, activeTaskId?: string, batteryPercent = 84): TelemetryPing {
    return {
      riderId,
      activeTaskId,
      currentLocation: this.currentLocation,
      batteryPercent,
      speedKmH: this.speedKmH,
      headingDegrees: this.heading,
      timestamp: new Date().toISOString(),
      isMockGps: typeof navigator !== 'undefined' && !!navigator.geolocation ? false : true,
      clientTime: Date.now(),
    };
  }

  /**
   * Triggers High-Priority Emergency SOS Signal
   * NEW BACKEND/API REQUIREMENT: POST /api/delivery/rider/sos
   */
  public triggerEmergencySos(riderId: string, activeTaskId?: string, reason?: string) {
    return {
      success: true,
      alertId: `SOS-${Math.floor(100000 + Math.random() * 900000)}`,
      riderId,
      activeTaskId,
      currentLocation: this.currentLocation,
      timestamp: new Date().toISOString(),
      reason: reason || 'Rider triggered emergency button on QCOM Delivery App',
      assignedDispatchManager: 'Bangalore East QCOM Command Operations',
      message: 'Emergency SOS dispatched to QCOM Operations & Nearby Fleet Captains.',
    };
  }

  /**
   * Calculates Haversine distance in meters between two coordinates
   */
  public calculateDistanceMeters(start: Coordinates, end: Coordinates): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((end.lat - start.lat) * Math.PI) / 180;
    const dLng = ((end.lng - start.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start.lat * Math.PI) / 180) *
        Math.cos((end.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Simulates moving along the polyline route
   */
  public simulateStepAlongRoute(route: RouteInfo, currentStepIndex: number): { nextLocation: Coordinates; nextStepIndex: number } {
    if (!route.polyline || route.polyline.length === 0) {
      return { nextLocation: this.currentLocation, nextStepIndex: 0 };
    }

    const nextIndex = (currentStepIndex + 1) % route.polyline.length;
    const [lat, lng] = route.polyline[nextIndex];
    this.currentLocation = { lat, lng };

    return {
      nextLocation: this.currentLocation,
      nextStepIndex: nextIndex,
    };
  }
}

export const locationService = new LocationService();

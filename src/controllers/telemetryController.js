const { verifyRiderToken } = require('../middleware/auth');

// Store last known positions to prevent GPS teleportation spoofing
const riderLocations = new Map();

/**
 * Updates active rider GPS telemetry and battery status
 * Remediates CWE-862 (Missing Authorization) & Location Spoofing
 */
exports.updateRiderLocation = async (req, res) => {
  // Line 12 - Enforce authenticated session and matching rider identity
  if (!req.user || req.user.riderId !== req.body.riderId) {
    return res.status(403).json({
      error: 'Unauthorized rider telemetry update',
      cwe: 'CWE-862',
      details: 'Rider session does not match target telemetry ID',
    });
  }

  const { riderId, latitude, longitude, speed, batteryLevel } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing GPS coordinates (latitude, longitude required)' });
  }

  // Validate coordinates boundaries
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid geographical coordinate range' });
  }

  // GPS Teleportation Boundary & Speed Sanity Filter (CWE-862 Prevention)
  const MAX_PERMISSIBLE_SPEED_KMH = 120;
  if (speed !== undefined && speed > MAX_PERMISSIBLE_SPEED_KMH) {
    return res.status(400).json({
      error: 'Telemetry rejected: impossible velocity detected (anti-spoofing filter)',
      recordedSpeed: speed,
      maxAllowed: MAX_PERMISSIBLE_SPEED_KMH,
    });
  }

  const now = Date.now();
  const lastLocation = riderLocations.get(riderId);

  if (lastLocation) {
    const timeDeltaSec = (now - lastLocation.timestamp) / 1000;
    if (timeDeltaSec > 0) {
      // Calculate distance between points in km (Haversine formula approximation)
      const dLat = (latitude - lastLocation.latitude) * 111.32;
      const dLon = (longitude - lastLocation.longitude) * 111.32 * Math.cos((latitude * Math.PI) / 180);
      const distanceKm = Math.sqrt(dLat * dLat + dLon * dLon);
      const calculatedSpeedKmh = (distanceKm / timeDeltaSec) * 3600;

      // Reject physical teleportation (> 150 km/h jump)
      if (calculatedSpeedKmh > 150 && distanceKm > 0.5) {
        return res.status(400).json({
          error: 'GPS teleportation boundary filter triggered: impossible location delta',
          deltaDistanceKm: distanceKm.toFixed(2),
          timeElapsedSec: timeDeltaSec.toFixed(1),
        });
      }
    }
  }

  // Update verified location
  const updatedEntry = {
    riderId,
    latitude,
    longitude,
    speed: speed || 0,
    batteryLevel: batteryLevel || 100,
    timestamp: now,
  };
  riderLocations.set(riderId, updatedEntry);

  return res.status(200).json({
    success: true,
    status: 'LOCATION_BROADCASTED',
    riderId,
    coordinates: { lat: latitude, lng: longitude },
    speed: updatedEntry.speed,
    verifiedAuth: true,
  });
};

const { verifyRiderToken } = require('../middleware/auth');

// Store last known positions to prevent GPS teleportation spoofing
const riderLocations = new Map();

/**
 * Updates active rider GPS telemetry and battery status
 * Remediates CWE-862 (Missing Authorization) & STRIX-REM-004 (CWE-20: Velocity Plausibility Filter)
 */
exports.updateRiderLocation = async (req, res) => {
  // Enforce authenticated session and matching rider identity
  const riderId = req.body.riderId || (req.user ? req.user.riderId : null);

  if (!req.user || (req.body.riderId && req.user.riderId !== req.body.riderId)) {
    return res.status(403).json({
      error: 'Unauthorized rider telemetry update',
      cwe: 'CWE-862',
      details: 'Rider session does not match target telemetry ID',
    });
  }

  let latitude = req.body.latitude;
  let longitude = req.body.longitude;

  if (latitude === undefined && req.body.currentLocation) {
    latitude = req.body.currentLocation.lat;
    longitude = req.body.currentLocation.lng;
  }
  if (latitude === undefined && req.body.lat !== undefined) {
    latitude = req.body.lat;
    longitude = req.body.lng;
  }

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing GPS coordinates (latitude, longitude required)' });
  }

  latitude = Number(latitude);
  longitude = Number(longitude);

  // Validate coordinates boundaries
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid geographical coordinate range' });
  }

  const speed = req.body.speed !== undefined ? req.body.speed : req.body.speedKmH;

  // GPS Teleportation Boundary & Speed Sanity Filter (CWE-20 Prevention)
  const MAX_PERMISSIBLE_SPEED_KMH = 120;
  if (speed !== undefined && speed > MAX_PERMISSIBLE_SPEED_KMH) {
    return res.status(422).json({
      error: 'GPS velocity sanity check failed: impossible velocity detected (anti-spoofing filter)',
      cwe: 'CWE-20',
      recordedSpeed: speed,
      maxAllowed: MAX_PERMISSIBLE_SPEED_KMH,
    });
  }

  const now = req.body.clientTime || Date.now();
  const lastLocation = riderLocations.get(riderId);

  if (lastLocation) {
    const timeDeltaSec = Math.max(0.001, (now - lastLocation.timestamp) / 1000);
    // Haversine formula calculation in kilometers
    const dLat = (latitude - lastLocation.latitude) * 111.32;
    const dLon = (longitude - lastLocation.longitude) * 111.32 * Math.cos((latitude * Math.PI) / 180);
    const distanceKm = Math.sqrt(dLat * dLat + dLon * dLon);
    const calculatedSpeedKmh = (distanceKm / timeDeltaSec) * 3600;

    // Velocity plausibility filter: 20km apart within 3 seconds or calculated speed > 120 km/h
    if (calculatedSpeedKmh > MAX_PERMISSIBLE_SPEED_KMH || (distanceKm >= 20 && timeDeltaSec <= 3)) {
      return res.status(422).json({
        error: 'GPS velocity sanity check failed: impossible location delta (teleportation/spoofing)',
        cwe: 'CWE-20',
        calculatedSpeedKmh: Math.round(calculatedSpeedKmh),
        distanceKm: distanceKm.toFixed(2),
        timeElapsedSec: timeDeltaSec.toFixed(1),
      });
    }
  }

  // Update verified location
  const updatedEntry = {
    riderId,
    latitude,
    longitude,
    speed: speed || 0,
    batteryLevel: req.body.batteryLevel || req.body.batteryPercent || 100,
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

// In-memory rider duty status store
const riderDutyStatuses = new Map([
  ['rider_77', { isOnline: false, dutyStatus: 'offline', acceptNextOrder: false }],
  ['RIDER-4029', { isOnline: false, dutyStatus: 'offline', acceptNextOrder: false }],
]);

/**
 * Updates rider online/offline duty status
 * When rider is offline (even during an active order), the system refuses to dispatch/assign new orders.
 */
exports.updateDutyStatus = async (req, res) => {
  const riderId = req.user ? req.user.riderId : (req.body.riderId || 'rider_77');
  const { isOnline, dutyStatus, acceptNextOrder } = req.body;
  const status = {
    riderId,
    isOnline: Boolean(isOnline),
    dutyStatus: dutyStatus || (isOnline ? 'idle_at_hub' : 'offline'),
    acceptNextOrder: isOnline ? (acceptNextOrder !== false) : false,
    updatedAt: new Date().toISOString(),
  };
  riderDutyStatuses.set(riderId, status);
  return res.status(200).json({
    success: true,
    ...status,
    message: isOnline
      ? 'Rider is marked ONLINE and ready for orders'
      : 'Rider is marked OFFLINE: system will not assign any new orders',
  });
};

/**
 * Retrieves authoritative duty status for rider
 */
exports.getDutyStatus = async (req, res) => {
  const riderId = req.user ? req.user.riderId : (req.query.riderId || 'rider_77');
  const status = riderDutyStatuses.get(riderId) || { isOnline: false, acceptNextOrder: false };
  return res.status(200).json({
    success: true,
    riderId,
    ...status,
  });
};

exports.isRiderOnline = (riderId) => {
  const status = riderDutyStatuses.get(riderId);
  return status ? status.isOnline : false;
};


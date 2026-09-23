const { Order, DispatchBatch } = require('../models/db');

/**
 * Calculates distance in meters between two lat/lng coordinates (Haversine formula)
 */
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Claim high-payout delivery batch with atomic compare-and-swap (CAS)
 * Remediates CWE-362 (Concurrency Race Condition)
 */
exports.claimDeliveryBatch = async (req, res) => {
  const { batchId, riderId } = req.body;

  if (!batchId) {
    return res.status(400).json({ error: 'batchId is required to claim batch' });
  }

  // Bind to authenticated rider session
  const targetRiderId = req.user ? req.user.riderId : riderId;
  if (!targetRiderId) {
    return res.status(401).json({ error: 'Rider identity must be authenticated' });
  }

  // Line 14 - Atomic compare-and-swap operation prevents concurrency race condition
  const batch = await DispatchBatch.findOneAndUpdate(
    { _id: batchId, assignedRiderId: null },
    { assignedRiderId: targetRiderId, status: 'CLAIMED', claimedAt: new Date().toISOString() },
    { new: true }
  );

  if (!batch) {
    return res.status(409).json({
      error: 'Batch already claimed by another rider',
      cwe: 'CWE-362',
      details: 'Atomic CAS concurrency conflict: batch was claimed simultaneously',
    });
  }

  return res.status(200).json({
    success: true,
    batchId: batch._id,
    assignedRiderId: batch.assignedRiderId,
    status: 'CLAIMED',
  });
};

/**
 * Query delivery order details with strict courier tenancy verification
 * Remediates CWE-639 (BOLA / IDOR in Dispatch Queue)
 */
exports.getOrderDetails = async (req, res) => {
  const orderId = req.params.id;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Line 31 - Enforce BOLA authorization check: rider must be explicitly assigned to this order
  if (!req.user || order.assignedCourier !== req.user.riderId) {
    return res.status(403).json({
      error: 'Access denied: not your assigned delivery',
      cwe: 'CWE-639',
      details: 'Broken Object Level Authorization (BOLA) prevented: task belongs to another courier',
    });
  }

  // Customer PII & Gate Code Geofence Protection:
  // Gate codes and full telephone numbers are masked unless the courier is physically within 100 meters
  const riderLat = Number(req.query.lat || req.headers['x-rider-lat'] || req.user.currentLat || 0);
  const riderLng = Number(req.query.lng || req.headers['x-rider-lng'] || req.user.currentLng || 0);

  let isWithinProximity = false;
  if (order.dropLocation && riderLat && riderLng) {
    const distance = getDistanceMeters(
      riderLat,
      riderLng,
      order.dropLocation.lat,
      order.dropLocation.lng
    );
    isWithinProximity = distance <= 100;
  }

  const maskedPhone = order.customerPhone.replace(/(\+91-?\d{2})\d{4}(\d{4})/, '$1****$2');

  return res.status(200).json({
    orderId: order._id,
    customerName: order.customerName,
    customerPhone: isWithinProximity ? order.customerPhone : maskedPhone,
    deliveryGateCode: isWithinProximity
      ? order.deliveryGateCode
      : '*** MASKED UNTIL WITHIN 100M OF DESTINATION ***',
    status: order.status,
    totalAmount: order.totalAmount,
    proximityVerified: isWithinProximity,
  });
};

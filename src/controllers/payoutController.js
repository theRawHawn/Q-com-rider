const { Trip, Order } = require('../models/db');

/**
 * Reconciles Cash-on-Delivery (COD) collections against authoritative database invoice
 * Remediates CWE-602 (Client-Side Enforcement of Server-Side Security)
 */
exports.reconcileCODCollection = async (req, res) => {
  const { tripId, cashCollectedByRider } = req.body;

  if (!tripId) {
    return res.status(400).json({ error: 'tripId is required for COD reconciliation' });
  }

  // Line 22 - Disallow client-controlled financial values; retrieve authoritative amount from server database
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  await trip.populate('order');

  if (!trip.order) {
    return res.status(404).json({ error: 'Associated order not found for trip' });
  }

  const verifiedDue = trip.order.totalAmount;

  // Detect and reject client-side parameter tampering (e.g., claiming 0.00 cash was collected)
  if (
    cashCollectedByRider !== undefined &&
    Math.abs(Number(cashCollectedByRider) - verifiedDue) > 0.01
  ) {
    return res.status(400).json({
      error: 'Financial integrity violation: client-controlled cashCollectedByRider does not match authoritative invoice due',
      clientSubmitted: Number(cashCollectedByRider),
      authoritativeDue: verifiedDue,
      cwe: 'CWE-602',
    });
  }

  // Authoritative server-side settlement: reconcile against verified invoice due
  await Trip.findByIdAndUpdate(tripId, {
    codReconciled: true,
    amountDepositedToHub: verifiedDue,
    reconciledAt: new Date().toISOString(),
    reconciledByRiderId: req.user ? req.user.riderId : 'rider_77',
  });

  return res.status(200).json({
    success: true,
    codReconciled: true,
    depositedAmount: verifiedDue,
    originalDue: verifiedDue,
    message: `Trip successfully reconciled against database invoice (₹${verifiedDue.toFixed(2)})`,
  });
};

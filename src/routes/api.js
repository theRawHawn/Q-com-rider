const express = require('express');
const router = express.Router();

const { verifyRiderToken } = require('../middleware/auth');
const telemetryController = require('../controllers/telemetryController');
const payoutController = require('../controllers/payoutController');
const dispatchController = require('../controllers/dispatchController');

// Finding 1: Telemetry location update (CWE-862)
router.post(
  ['/vulnerable/qrider/telemetry/location', '/qrider/telemetry/location'],
  verifyRiderToken,
  telemetryController.updateRiderLocation
);

// Finding 2: Cash-on-Delivery reconciliation (CWE-602)
router.post(
  ['/vulnerable/qrider/cod/reconcile', '/qrider/cod/reconcile'],
  verifyRiderToken,
  payoutController.reconcileCODCollection
);

// Finding 3: Order details retrieval with BOLA/IDOR protection (CWE-639)
router.get(
  ['/vulnerable/qrider/orders/:id/details', '/qrider/orders/:id/details'],
  verifyRiderToken,
  dispatchController.getOrderDetails
);

// Finding 4: Concurrency-safe delivery batch claims (CWE-362)
router.post(
  ['/vulnerable/qrider/delivery/claim', '/qrider/delivery/claim'],
  verifyRiderToken,
  dispatchController.claimDeliveryBatch
);

module.exports = router;

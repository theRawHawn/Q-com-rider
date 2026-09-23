const express = require('express');
const router = express.Router();

const { verifyRiderToken } = require('../middleware/auth');
const telemetryController = require('../controllers/telemetryController');
const payoutController = require('../controllers/payoutController');
const dispatchController = require('../controllers/dispatchController');

// Finding 1: Telemetry location update (CWE-862 & STRIX-REM-004 CWE-20)
router.post(
  [
    '/vulnerable/qrider/telemetry/location',
    '/qrider/telemetry/location',
    '/delivery/rider/telemetry',
  ],
  verifyRiderToken,
  telemetryController.updateRiderLocation
);

// Finding 2: Cash-on-Delivery reconciliation (CWE-602)
router.post(
  ['/vulnerable/qrider/cod/reconcile', '/qrider/cod/reconcile'],
  verifyRiderToken,
  payoutController.reconcileCODCollection
);

// STRIX-REM-002: Authoritative floating cash balance (CWE-602)
router.get(
  [
    '/vulnerable/qrider/payouts/floating-balance',
    '/qrider/payouts/floating-balance',
    '/delivery/payouts/floating-balance',
  ],
  payoutController.getFloatingBalance
);

// STRIX-REM-003: Authoritative KYC status (CWE-565)
router.get(
  [
    '/vulnerable/qrider/kyc/status',
    '/qrider/kyc/status',
    '/delivery/rider/kyc/status',
  ],
  dispatchController.getKycStatus
);

// STRIX-REM-005: Instant UPI payout withdrawal with Idempotency-Key deduplication (CWE-840)
router.post(
  [
    '/delivery/payouts/withdraw',
    '/vulnerable/qrider/payouts/withdraw',
    '/qrider/payouts/withdraw',
  ],
  payoutController.handleInstantPayoutWithdrawal
);

// Finding 3: Order details retrieval with BOLA/IDOR protection (CWE-639)
router.get(
  ['/vulnerable/qrider/orders/:id/details', '/qrider/orders/:id/details'],
  verifyRiderToken,
  dispatchController.getOrderDetails
);

// STRIX-REM-006: Order stage transition & OTP verification (CWE-841)
router.post(
  [
    '/delivery/orders/:id/advance-stage',
    '/vulnerable/qrider/orders/:id/advance-stage',
    '/delivery/tasks/:id/advance-stage',
  ],
  dispatchController.advanceOrderStage
);

router.post(
  [
    '/delivery/orders/:id/verify-otp',
    '/vulnerable/qrider/orders/:id/verify-otp',
  ],
  dispatchController.verifyDeliveryOtp
);

// Finding 4: Concurrency-safe delivery batch claims (CWE-362)
router.post(
  ['/vulnerable/qrider/delivery/claim', '/qrider/delivery/claim'],
  verifyRiderToken,
  dispatchController.claimDeliveryBatch
);

module.exports = router;

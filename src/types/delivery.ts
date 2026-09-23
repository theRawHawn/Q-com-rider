/**
 * QCOM Delivery Partner App Domain Types
 * Unified & strictly compatible with QCOM Customer, Seller, and Admin repositories.
 */

export type OrderStatus =
  | 'placed'
  | 'picking'
  | 'packed'
  | 'out_for_delivery'
  | 'arriving'
  | 'delivered'
  | 'cancelled';

export type PartnerDutyStatus =
  | 'offline'
  | 'idle_at_hub'
  | 'picking_up'
  | 'in_transit'
  | 'arrived_at_drop'
  | 'on_break';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface VerificationDocuments {
  aadhaarVerified: boolean;
  drivingLicenseVerified: boolean;
  vehicleRcVerified: boolean;
  insuranceVerified: boolean;
  bankVerified: boolean;
  bgvCleared: boolean;
}

export interface BankAccountDetails {
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
  isVerified: boolean;
}

export type PartnerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface DeliveryPartnerProfile {
  id: string;
  partnerCode: string;
  name: string;
  phone: string;
  maskedPhone: string;
  email: string;
  photoUrl: string;
  cityId: string;
  cityName: string;
  assignedHubName: string;
  vehicleType: 'EV_SCOOTER' | 'PETROL_SCOOTER' | 'BICYCLE' | 'E_CARGO_3W';
  vehicleModel: string;
  vehicleNumber: string;
  batteryPercent: number; // For EV
  batteryEstimatedRangeKm: number;
  dutyStatus: PartnerDutyStatus;
  isOnline: boolean;
  activeTaskId?: string;
  rating: number;
  completedDeliveriesCount: number;
  onTimeDeliveryRatePercent: number;
  acceptanceRatePercent?: number;
  tierLevel: PartnerTier;
  floatingCashBalance: number;
  floatingCashLimit: number;
  bankAccount: BankAccountDetails;
  documents: VerificationDocuments;
  currentLocation: Coordinates;
  joinedDate: string;
  shiftHoursTodayMinutes: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  unit: string;
  price: number;
  binLocation?: string;
  imageUrl?: string;
}

export interface PickupLocation {
  sellerId: string;
  storeName: string;
  hubType: string;
  phone: string;
  maskedPhone: string;
  address: string;
  locality: string;
  coordinates: Coordinates;
  accessibleEntranceCoords?: Coordinates;
  pickupNotes?: string;
  basePrepMins: number;
  isPacked: boolean;
}

export interface DropoffLocation {
  customerName: string;
  customerPhone: string;
  maskedPhone: string;
  isPhoneMasked: boolean;
  accountType?: 'electrician' | 'plumber' | 'contractor' | 'individual';
  businessName?: string;
  address: string;
  locality: string;
  landmark?: string;
  floorUnit?: string;
  gateCode?: string;
  siteContactName: string;
  sitePhone: string;
  dropoffInstructions?: string;
  coordinates: Coordinates;
  accessibleEntranceCoords?: Coordinates;
}

export interface PayoutBreakdown {
  basePay: number; // e.g. ₹35
  distancePay: number; // e.g. ₹8/km
  transitTimePay: number; // e.g. ₹0.5/min
  surgeBonus: number; // Peak demand or rain incentive
  multiPickupBonus: number; // Additional store stop
  customerTip: number; // 100% passed through
  totalPayout: number;
}

export interface TurnInstruction {
  text: string;
  distanceMeters: number;
  durationSeconds: number;
  modifier?: string;
  type?: string;
  location: [number, number]; // [lat, lng]
}

export interface RouteInfo {
  distanceMeters: number;
  distanceKm: number;
  estimatedDurationMins: number;
  polyline: [number, number][]; // [lat, lng]
  instructions: TurnInstruction[];
  formattedEta: string;
}

export interface ProofOfHandover {
  id: string;
  photoUrl: string;
  timestamp: string;
  stage: 'PICKUP' | 'DELIVERY';
  coordinates: Coordinates;
  capturedByPartnerId: string;
  orderNumber: string;
  tamperSealStatus: 'INTACT_VERIFIED' | 'TAMPERED' | 'NOT_APPLICABLE';
  securityHash: string; // Anti-tampering digital cryptographic watermark
  retentionUntil: string; // ISO date string when return window closes
  retentionDaysRemaining: number;
  note?: string;
}

export interface DeliveryTask {
  id: string;
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  placedAt: string;
  packedAt?: string;
  estimatedDeliveryAt: string;
  items: OrderItem[];
  itemCount: number;
  orderTotalAmount: number;
  paymentMethod: 'Instant UPI' | 'Corporate Card' | 'Pay on Delivery' | 'Pay on Jobsite' | 'Trade Credit (Net 30)';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  pickup: PickupLocation;
  drop: DropoffLocation;
  payoutBreakdown: PayoutBreakdown;
  route: RouteInfo;
  deliveryOtp: string; // Required for dropoff verification
  isUrgentJobsite: boolean;
  assignedAt?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  pickupProof?: ProofOfHandover;
  deliveryProof?: ProofOfHandover;
}

export type RiderLedgerType =
  | 'TRIP_EARNING'
  | 'SURGE_BONUS'
  | 'ON_TIME_INCENTIVE'
  | 'RAIN_PEAK_BONUS'
  | 'CUSTOMER_TIP'
  | 'TDS_DEDUCTION'
  | 'PAYOUT_RELEASE'
  | 'ADJUSTMENT'
  | 'SECURITY_DEPOSIT';

export interface RiderLedgerEntry {
  id: string;
  riderId: string;
  date: string;
  timestamp: string;
  type: RiderLedgerType;
  category: 'CREDIT' | 'DEBIT';
  title: string;
  description: string;
  amount: number;
  orderNumber?: string;
  status: 'CLEARED' | 'PENDING' | 'RELEASED' | 'PROCESSING';
  payoutMode?: 'UPI' | 'IMPS' | 'NEFT' | 'WALLET';
  utrNumber?: string;
  releasedAt?: string;
}

export interface PartnerEarningsSummary {
  todayTotalEarnings: number;
  todayTripsCompleted: number;
  todayBasePayTotal: number;
  todayIncentivesTotal: number;
  todayTipsTotal: number;
  todayOnlineMinutes: number;
  pendingWithdrawableBalance: number;
  settledLifetimeEarnings: number;
  nextPayoutDate: string;
  avgEarningsPerTrip: number;
}

export interface PartnerNotification {
  id: string;
  type: 'NEW_TASK_BROADCAST' | 'BATTERY_LOW' | 'SLA_ALERT' | 'PAYOUT_RELEASED' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'HIGH' | 'NORMAL' | 'URGENT';
  actionTab?: string;
  taskId?: string;
}

export interface TelemetryPing {
  riderId: string;
  activeTaskId?: string;
  currentLocation: Coordinates;
  batteryPercent: number;
  speedKmH: number;
  headingDegrees: number;
  timestamp: string;
}

// ----------------------------------------------------
// MODULE 1: KYC, ASSETS & VEHICLE SPECIFICATIONS
// ----------------------------------------------------
export interface KycDocumentDetail {
  id: string;
  type: 'AADHAAR' | 'PAN' | 'DRIVING_LICENSE' | 'VEHICLE_RC' | 'BANK_PENNY_DROP';
  name: string;
  documentNumber: string;
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED';
  verifiedVia: string;
  verifiedAt: string;
  expiryDate?: string;
}

export interface VehicleConstraint {
  vehicleType: 'EV_SCOOTER' | 'PETROL_SCOOTER' | 'BICYCLE' | 'E_CARGO_3W';
  label: string;
  maxRadiusKm: number;
  maxWeightKg: number;
  allowedOrderTypes: string[];
  batteryRequired: boolean;
}

export interface AssetAllocation {
  id: string;
  assetType: 'DELIVERY_BAG' | 'RAIN_JACKET' | 'HELMET_SAFETY_KIT';
  name: string;
  serialNumber: string;
  qrCode: string;
  assignedAt: string;
  status: 'ASSIGNED' | 'MAINTENANCE_DUE' | 'RETURNED';
}

export interface SafetyTrainingModule {
  id: string;
  title: string;
  category: 'SAFETY' | 'HARDWARE_HANDLING' | 'COLD_CHAIN' | 'CUSTOMER_ETIQUETTE';
  durationMinutes: number;
  isCompleted: boolean;
  scorePercent?: number;
  completedAt?: string;
}

// ----------------------------------------------------
// MODULE 2: GIG / SHIFT BOOKING & CAPACITY SYSTEM
// ----------------------------------------------------
export type ShiftType = 'MORNING_PEAK' | 'MIDDAY_PEAK' | 'AFTERNOON_SLOT' | 'EVENING_SLOT' | 'EVENING_PEAK' | 'LUNCH_PEAK' | 'AFTERNOON' | 'BREAKFAST' | 'DINNER_PEAK' | 'LATE_NIGHT';

export interface ShiftSlot {
  id: string;
  hubId: string;
  zoneName: string;
  shiftType: ShiftType;
  shiftName: string;
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon, 22 Sep"
  startTime: string; // e.g. "11:00 AM" (12-hour format)
  endTime: string; // e.g. "02:00 PM" (12-hour format)
  capacityLimit: number;
  bookedCount: number;
  minEarningsGuarantee: number;
  status: 'AVAILABLE' | 'BOOKED' | 'FILLED' | 'LOCKED';
  tierAccessRequired: PartnerTier;
  spotSurgeMultiplier: number;
  isPeakBonusEligible: boolean;
}

// ----------------------------------------------------
// MODULE 3: DELAY REPORT & PROOF OF DELIVERY
// ----------------------------------------------------
export type ProofOfDeliveryMode = 'OTP' | 'PHOTO' | 'COD';

export interface OrderDelayReport {
  taskId: string;
  reason: 'STORE_PACKING_DELAY' | 'LONG_QUEUE' | 'ITEM_UNAVAILABLE' | 'SELLER_MISSING';
  reportedAt: string;
  waitDurationMinutes: number;
  compensationAccrued: number;
}

export interface CustomerUnreachableState {
  isActive: boolean;
  taskId: string;
  countdownSeconds: number; // starts at 300 (5 mins)
  attemptsCount: number;
  canReturnToHub: boolean;
}

// ----------------------------------------------------
// MODULE 4: FLOATING CASH & RECONCILIATION
// ----------------------------------------------------
export interface FloatingCashSummary {
  collectedCash: number;
  limit: number;
  warningThreshold: number; // e.g. 2000
  isBlocked: boolean;
  pendingDepositAmount: number;
  lastDepositAt?: string;
}

// ----------------------------------------------------
// MODULE 5: EMERGENCY SOS & TELEPHONY
// ----------------------------------------------------
export interface EmergencySosState {
  isTriggered: boolean;
  alertId?: string;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  dispatchedServices: string[];
}

export interface MaskedCallState {
  isOpen: boolean;
  recipientName: string;
  recipientRole: 'CUSTOMER' | 'SELLER' | 'DISPATCH_SUPPORT';
  maskedNumber: string;
  status: 'CONNECTING' | 'RINGING' | 'IN_CALL' | 'ENDED';
}

// ----------------------------------------------------
// MODULE 6: PERFORMANCE SCORECARD & TIERS
// ----------------------------------------------------
export interface PerformanceScorecard {
  tier: PartnerTier;
  acceptanceRatePercent: number;
  completionRatePercent: number;
  onTimeDeliveryRatePercent: number;
  customerRating: number;
  totalTripsCompleted: number;
  unlockedPerks: string[];
  nextTierRequirements?: {
    nextTier: PartnerTier;
    targetAcceptance: number;
    targetCompletion: number;
    targetRating: number;
  };
}


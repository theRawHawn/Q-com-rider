import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Navigation,
  KeyRound,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Building,
  Clock,
  Camera,
  Banknote,
  RotateCcw,
  Zap,
  ShieldCheck,
  Lock,
  CornerUpRight,
  ExternalLink,
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { InteractiveMap, MapMode } from '../navigation/InteractiveMap';
import { OtpVerificationModal } from './OtpVerificationModal';
import { OrderDelayModal } from './OrderDelayModal';
import { ContactlessDeliveryModal } from './ContactlessDeliveryModal';
import { CodCollectionModal } from './CodCollectionModal';
import { CustomerUnreachableModal } from './CustomerUnreachableModal';
import { MaskedCallModal } from './MaskedCallModal';
import { ProofCameraModal } from '../common/ProofCameraModal';
import { profileService } from '../../services/profileService';
import { ProofOfHandover } from '../../types/delivery';
import { useToast } from '../../context/ToastContext';
import {
  openRiderToSellerGoogleMaps,
  openSellerToCustomerGoogleMaps,
  openGoogleMapsNavigation,
} from '../../utils/navigation';

export const ActiveDeliveryWorkflow: React.FC = () => {
  const {
    activeTask,
    updateTaskStatus,
    setPickupProof,
    setDeliveryProof,
    verifyContactlessDelivery,
    recordCodDelivery,
    returnOrderToHub,
  } = useTask();
  const { showToast } = useToast();

  const [selectedMapMode, setSelectedMapMode] = useState<MapMode | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isContactlessModalOpen, setIsContactlessModalOpen] = useState(false);
  const [isCodModalOpen, setIsCodModalOpen] = useState(false);
  const [isUnreachableModalOpen, setIsUnreachableModalOpen] = useState(false);
  const [isProofCameraOpen, setIsProofCameraOpen] = useState(false);
  const [proofStage, setProofStage] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');

  const [maskedCallData, setMaskedCallData] = useState<{
    isOpen: boolean;
    recipientName: string;
    role: 'CUSTOMER' | 'SELLER' | 'DISPATCH_SUPPORT';
  }>({
    isOpen: false,
    recipientName: '',
    role: 'CUSTOMER',
  });

  const [sellerVerified, setSellerVerified] = useState<boolean>(false);
  const [sellerTokenEntered, setSellerTokenEntered] = useState<boolean>(false);
  const [sealIntact, setSealIntact] = useState<boolean>(true);
  const [storeDelayReported, setStoreDelayReported] = useState<string | null>(null);

  const profile = profileService.getProfile();

  if (!activeTask) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200/80 my-4 space-y-3">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
          <Navigation className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">No Active Delivery Task</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          You currently have no active order in transit. Go to the Command Center to accept incoming delivery requests.
        </p>
      </div>
    );
  }

  const isAtPickupStage =
    activeTask.orderStatus === 'placed' ||
    activeTask.orderStatus === 'picking' ||
    activeTask.orderStatus === 'packed';
  const isInTransitStage = activeTask.orderStatus === 'out_for_delivery';
  const isArrivedDropStage = activeTask.orderStatus === 'arriving';

  const defaultMapMode: MapMode = isAtPickupStage
    ? 'RIDER_TO_SELLER'
    : isInTransitStage
    ? 'SELLER_TO_CUSTOMER'
    : 'VERIFICATION';
  const activeMapMode: MapMode = selectedMapMode || defaultMapMode;

  const handleOpenMaskedCall = (name: string, role: 'CUSTOMER' | 'SELLER' | 'DISPATCH_SUPPORT') => {
    setMaskedCallData({
      isOpen: true,
      recipientName: name,
      role,
    });
  };

  const handleOpenProofCamera = (stage: 'PICKUP' | 'DELIVERY') => {
    setProofStage(stage);
    setIsProofCameraOpen(true);
  };

  const handleConfirmProof = (proof: ProofOfHandover) => {
    if (proof.stage === 'PICKUP') {
      setPickupProof(proof);
      setSellerVerified(true);
      setSealIntact(true);
    } else {
      setDeliveryProof(proof);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-16">
      {/* Top Prominent Quick-Access Pickup Token Card (Instantly Accessible at Top Without Scrolling) */}
      {isAtPickupStage && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
              Store Pickup Token
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-2xl font-black text-indigo-950 tracking-wider">
                PK-8819
              </span>
              <span className="text-[11px] text-indigo-700 font-semibold hidden sm:inline">
                • {activeTask.pickup.storeName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sellerTokenEntered ? (
              <Badge variant="emerald" size="sm">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                Seller Verified
              </Badge>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSellerTokenEntered(true);
                  setSellerVerified(true);
                  showToast('Seller verified Pickup Token PK-8819! Camera upload unlocked.', 'success');
                }}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs transition cursor-pointer"
                title="Simulate seller entering token into Seller App"
              >
                Seller Enter Token
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Delivery Progress Tracker & 3 Map Switcher */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-neutral-900">
                {activeTask.orderNumber}
              </span>
              <Badge variant="emerald" size="sm">
                ₹{activeTask.payoutBreakdown.totalPayout} Payout
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Est. SLA Delivery: {activeTask.estimatedDeliveryAt}
            </p>
          </div>

          <Badge
            variant={isAtPickupStage ? 'indigo' : isInTransitStage ? 'emerald' : 'amber'}
            size="md"
          >
            {isAtPickupStage
              ? 'STORE PICKUP'
              : isInTransitStage
              ? 'IN TRANSIT'
              : 'ARRIVED DROPOFF'}
          </Badge>
        </div>

        {/* 3 Dedicated Maps and Workflow Phases */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-100">
          {/* Map 1: Rider -> Seller */}
          <button
            type="button"
            onClick={() => setSelectedMapMode('RIDER_TO_SELLER')}
            className={`p-2 rounded-xl text-left transition cursor-pointer ${
              activeMapMode === 'RIDER_TO_SELLER'
                ? 'bg-blue-50/90 border-2 border-blue-500 ring-2 ring-blue-100'
                : 'hover:bg-neutral-50 border border-neutral-200/80'
            }`}
          >
            <div
              className={`h-1.5 rounded-full mb-1.5 ${
                isAtPickupStage || isInTransitStage || isArrivedDropStage
                  ? 'bg-blue-600'
                  : 'bg-neutral-200'
              }`}
            />
            <span className="text-[10px] font-semibold text-neutral-600/80 block leading-tight whitespace-nowrap truncate">
              1. Rider → Seller
            </span>
          </button>

          {/* Map 2: Seller -> Customer */}
          <button
            type="button"
            onClick={() => setSelectedMapMode('SELLER_TO_CUSTOMER')}
            className={`p-2 rounded-xl text-left transition cursor-pointer ${
              activeMapMode === 'SELLER_TO_CUSTOMER'
                ? 'bg-blue-50/90 border-2 border-blue-500 ring-2 ring-blue-100'
                : 'hover:bg-neutral-50 border border-neutral-200/80'
            }`}
          >
            <div
              className={`h-1.5 rounded-full mb-1.5 ${
                isInTransitStage || isArrivedDropStage
                  ? 'bg-blue-600'
                  : 'bg-neutral-200'
              }`}
            />
            <span className="text-[10px] font-semibold text-neutral-600/80 block leading-tight whitespace-nowrap truncate">
              2. Seller → Cust.
            </span>
          </button>

          {/* Map 3: Verification Delivery */}
          <button
            type="button"
            onClick={() => setSelectedMapMode('VERIFICATION')}
            className={`p-2 rounded-xl text-left transition cursor-pointer ${
              activeMapMode === 'VERIFICATION'
                ? 'bg-amber-50/90 border-2 border-amber-500 ring-2 ring-amber-100'
                : 'hover:bg-neutral-50 border border-neutral-200/80'
            }`}
          >
            <div
              className={`h-1.5 rounded-full mb-1.5 ${
                isArrivedDropStage ? 'bg-amber-500' : 'bg-neutral-200'
              }`}
            />
            <span className="text-[10px] font-semibold text-neutral-600/80 block leading-tight whitespace-nowrap truncate">
              3. Verification
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Map (Selected from the 3 Map Modes) */}
      <div id="active-navigation-map" className="scroll-mt-4">
        <InteractiveMap task={activeTask} mode={activeMapMode} />
      </div>

      {/* Primary Action Card Based on Lifecycle Stage */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
        {/* Stage 1: Pickup Store */}
        {isAtPickupStage && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                  STEP 1: SELLER STORE PICKUP
                </span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  {activeTask.pickup.storeName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openRiderToSellerGoogleMaps(activeTask.pickup, {
                      lat: activeTask.pickup.coordinates.lat + 0.0075,
                      lng: activeTask.pickup.coordinates.lng - 0.0095,
                    })
                  }
                  icon={<CornerUpRight className="w-3.5 h-3.5 text-indigo-600" />}
                  className="text-xs text-indigo-900 border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 font-bold"
                  title="Open Route from Rider to Seller in Google Maps App"
                >
                  Google Maps Route
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDelayModalOpen(true)}
                  icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
                  className="text-xs text-amber-800 border-amber-200 hover:bg-amber-50"
                >
                  Order Not Ready
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleOpenMaskedCall(activeTask.pickup.storeName, 'SELLER')
                  }
                  icon={<Phone className="w-3.5 h-3.5 text-indigo-600" />}
                  className="text-xs"
                >
                  Call Store
                </Button>
              </div>
            </div>

            <p className="text-xs text-neutral-600">{activeTask.pickup.address}</p>

            {activeTask.pickup.pickupNotes && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-900">
                <p className="font-bold">Store Entrance & Bay Note:</p>
                <p className="text-indigo-800 mt-0.5">{activeTask.pickup.pickupNotes}</p>
              </div>
            )}

            {storeDelayReported && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Delay Logged: {storeDelayReported}</span>
                <span className="font-bold text-emerald-700">₹1.20/min Wait Comp Active</span>
              </div>
            )}

            {/* Seller Handover & Token Verification */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Seller Handover Verification
                  </span>
                  <p className="text-xs font-bold text-neutral-800">
                    Provide Token to Store Counter Staff
                  </p>
                </div>
                {sellerTokenEntered ? (
                  <Badge variant="emerald" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                    Token Verified by Seller
                  </Badge>
                ) : (
                  <Badge variant="amber" size="sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1 inline-block" />
                    Awaiting Seller Entry
                  </Badge>
                )}
              </div>

              {/* Pickup Token Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Rider Pickup Token
                    </span>
                    <span className="font-mono text-xl font-bold text-indigo-700 tracking-wider">
                      PK-8819
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Order ID</span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {activeTask.orderNumber}
                    </span>
                  </div>
                </div>

                {!sellerTokenEntered ? (
                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-2">
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Give token <strong className="font-mono text-amber-950">PK-8819</strong> to the seller. When the seller enters it into the Seller App, the photo upload step will automatically unlock.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSellerTokenEntered(true);
                        setSellerVerified(true);
                        showToast('Seller verified Pickup Token! Photo upload unlocked.', 'success');
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simulate Seller Entered Token in Seller App</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Seller validated token in Seller App
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      MATCHED
                    </span>
                  </div>
                )}
              </div>

              {/* Tamper Seal Checklist */}
              <div className="space-y-2">
                <div
                  onClick={() => setSealIntact(!sealIntact)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    sealIntact
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${
                      sealIntact
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {sealIntact && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      Tamper-Evident Bag Seal Intact
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Confirmed package security seal is intact with order label attached
                    </span>
                  </div>
                </div>

                {/* Audit Photo Proof Action (Unlocked only after Seller Enters Token) */}
                {!sellerTokenEntered ? (
                  <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/80 text-neutral-500 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neutral-400" />
                      <span className="text-[11px] font-medium">
                        Take Picture Option (Locked until seller enters token)
                      </span>
                    </div>
                    <span className="text-[10px] bg-neutral-200 text-neutral-600 font-semibold px-2 py-0.5 rounded">
                      Step 2
                    </span>
                  </div>
                ) : activeTask.pickupProof ? (
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Pickup Audit Proof Attached
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        7-Day Vault Shield
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={activeTask.pickupProof.photoUrl}
                        alt="Pickup Proof"
                        className="w-14 h-14 rounded-lg object-cover border border-emerald-300 shadow-2xs"
                      />
                      <div className="text-[11px] text-neutral-600 space-y-0.5">
                        <p className="font-mono text-[10px] text-neutral-500">
                          {activeTask.pickupProof.securityHash}
                        </p>
                        <p className="text-neutral-500">
                          Captured at {new Date(activeTask.pickupProof.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenProofCamera('PICKUP')}
                          className="text-emerald-700 font-bold hover:underline cursor-pointer text-[11px]"
                        >
                          Retake Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenProofCamera('PICKUP')}
                    className="w-full p-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    Take Picture and Upload (Anti-Tamper Package Proof)
                  </button>
                )}
              </div>
            </div>

            <Button
              variant="brand"
              size="lg"
              fullWidth
              disabled={!sellerTokenEntered || !sealIntact}
              onClick={() => {
                updateTaskStatus('out_for_delivery');
                setSelectedMapMode('SELLER_TO_CUSTOMER');
                showToast('Seller pickup verified! Starting ride to customer.', 'success');
                setTimeout(() => {
                  const mapEl = document.getElementById('active-navigation-map');
                  if (mapEl) {
                    mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }, 80);
              }}
              icon={<PackageCheck className="w-5 h-5" />}
              className="font-bold"
            >
              Verify Pickup with Seller & Start Delivery
            </Button>
          </div>
        )}

        {/* Stage 2: In Transit to Jobsite */}
        {isInTransitStage && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  STEP 2: EN ROUTE TO JOBSITE
                </span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  {activeTask.drop.customerName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openSellerToCustomerGoogleMaps(activeTask.drop, activeTask.pickup.coordinates)
                  }
                  icon={<CornerUpRight className="w-3.5 h-3.5 text-emerald-600" />}
                  className="text-xs text-emerald-900 border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 font-bold"
                  title="Open Route from Seller to Customer in Google Maps App"
                >
                  Google Maps Route
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleOpenMaskedCall(activeTask.drop.customerName, 'CUSTOMER')
                  }
                  icon={<Phone className="w-3.5 h-3.5 text-emerald-600" />}
                  className="text-xs"
                >
                  Call Customer
                </Button>
              </div>
            </div>

            <p className="text-xs text-neutral-600">{activeTask.drop.address}</p>
            {activeTask.drop.landmark && (
              <p className="text-xs text-neutral-500">
                Landmark: <strong>{activeTask.drop.landmark}</strong>
              </p>
            )}

            {activeTask.drop.dropoffInstructions && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
                <p className="font-bold">Dropoff & Gate Access Note:</p>
                <p className="text-emerald-800 mt-0.5">
                  {activeTask.drop.dropoffInstructions}
                </p>
              </div>
            )}

            <Button
              variant="brand"
              size="lg"
              fullWidth
              onClick={() => updateTaskStatus('arriving')}
              icon={<MapPin className="w-5 h-5" />}
              className="font-bold"
            >
              I Have Arrived at Customer Site (&le; 30m)
            </Button>
          </div>
        )}

        {/* Stage 3: Arrived & Multi-Mode Verification */}
        {isArrivedDropStage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                  STEP 3: CUSTOMER DROPOFF VERIFICATION
                </span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  Customer Delivery Handover
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleOpenMaskedCall(activeTask.drop.customerName, 'CUSTOMER')
                }
                icon={<Phone className="w-3.5 h-3.5 text-amber-600" />}
                className="text-xs"
              >
                Call Customer
              </Button>
            </div>

            {/* Primary Delivery Completion via Customer OTP */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  Ask Customer for 4-Digit Delivery OTP
                </span>
                <span className="text-[10px] bg-white text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                  Required Verification
                </span>
              </div>
              <p className="text-xs text-amber-900/90">
                Customer receives a 4-digit PIN in their QCOM Customer App. Enter this code to verify handover and complete delivery.
              </p>
              <Button
                variant="brand"
                size="lg"
                fullWidth
                onClick={() => setIsOtpModalOpen(true)}
                icon={<KeyRound className="w-4 h-4" />}
                className="font-bold shadow-xs"
              >
                Enter Customer Delivery OTP
              </Button>
            </div>

            {/* Secondary Handover Modes Grid */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Alternative Delivery Modes (If Requested by Customer)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Mode 2: Contactless Proof-of-Delivery Photo */}
                <button
                  onClick={() => setIsContactlessModalOpen(true)}
                  className="p-3.5 rounded-2xl border border-neutral-200 hover:border-emerald-500 bg-white text-left transition-all hover:shadow-xs cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 w-fit mb-2">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-neutral-900 group-hover:text-emerald-700">
                    Contactless Photo Drop
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Doorstep / security gate drop with geotag
                  </p>
                </button>

                {/* Mode 3: Cash On Delivery Collection */}
                <button
                  onClick={() => setIsCodModalOpen(true)}
                  className="p-3.5 rounded-2xl border border-neutral-200 hover:border-amber-500 bg-white text-left transition-all hover:shadow-xs cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 w-fit mb-2">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-neutral-900 group-hover:text-amber-700">
                    Cash on Delivery (COD)
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Collect cash & record digital change
                  </p>
                </button>
              </div>
            </div>

            {/* Exception: Customer Unreachable Button */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Doorbell unheeded or phone switched off?
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUnreachableModalOpen(true)}
                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
              >
                Customer Unreachable (5 Min)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
      />

      <OrderDelayModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        onConfirmDelay={(reason) => setStoreDelayReported(reason)}
        storeName={activeTask.pickup.storeName}
      />

      <ContactlessDeliveryModal
        isOpen={isContactlessModalOpen}
        onClose={() => setIsContactlessModalOpen(false)}
        onConfirmProof={(note) => verifyContactlessDelivery(undefined, note)}
        customerName={activeTask.drop.customerName}
        orderNumber={activeTask.orderNumber}
      />

      <CodCollectionModal
        isOpen={isCodModalOpen}
        onClose={() => setIsCodModalOpen(false)}
        onConfirmPayment={(amt) => recordCodDelivery(amt)}
        orderTotal={activeTask.orderTotalAmount || 420.0}
        orderNumber={activeTask.orderNumber}
      />

      <CustomerUnreachableModal
        isOpen={isUnreachableModalOpen}
        onClose={() => setIsUnreachableModalOpen(false)}
        onConfirmReturnToStore={() => returnOrderToHub()}
        onTriggerIvrCall={() =>
          handleOpenMaskedCall(activeTask.drop.customerName, 'CUSTOMER')
        }
        customerName={activeTask.drop.customerName}
        orderNumber={activeTask.orderNumber}
      />

      <MaskedCallModal
        isOpen={maskedCallData.isOpen}
        onClose={() => setMaskedCallData((prev) => ({ ...prev, isOpen: false }))}
        recipientName={maskedCallData.recipientName}
        recipientRole={maskedCallData.role}
      />

      <ProofCameraModal
        isOpen={isProofCameraOpen}
        onClose={() => setIsProofCameraOpen(false)}
        onConfirmProof={handleConfirmProof}
        stage={proofStage}
        orderNumber={activeTask.orderNumber}
        locationName={
          proofStage === 'PICKUP'
            ? activeTask.pickup.storeName
            : activeTask.drop.customerName
        }
        coordinates={
          proofStage === 'PICKUP'
            ? activeTask.pickup.coordinates
            : activeTask.drop.coordinates
        }
        partnerId={profile.id}
        partnerName={profile.name}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  KeyRound,
  PackageCheck,
  Clock,
  Camera,
  Banknote,
  ShieldCheck,
  CornerUpRight,
  Lock,
  Image as ImageIcon,
  RotateCw,
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { InteractiveMap } from '../navigation/InteractiveMap';
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

  const [sellerTokenEntered, setSellerTokenEntered] = useState<boolean>(false);
  const [sealIntact, setSealIntact] = useState<boolean>(true);
  const [storeDelayReported, setStoreDelayReported] = useState<string | null>(null);

  const profile = profileService.getProfile();

  if (!activeTask) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200/80 my-4 space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#EBF7FD] text-[#009DE0] flex items-center justify-center mx-auto">
          <Navigation className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">No Active Delivery Task</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          You currently have no active order in transit. Go to the Command Center to accept incoming delivery requests.
        </p>
      </div>
    );
  }

  // Exact 4-step linear delivery workflow
  const isHeadingToSeller = activeTask.orderStatus === 'placed' || activeTask.orderStatus === 'picking';
  const isAtSeller = activeTask.orderStatus === 'packed';
  const isInTransitToCustomer = activeTask.orderStatus === 'out_for_delivery';
  const isAtCustomer = activeTask.orderStatus === 'arriving';

  const hasDeliveryPhoto = Boolean(activeTask.deliveryProof?.photoUrl);

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
      setSellerTokenEntered(true);
      setSealIntact(true);
    } else {
      setDeliveryProof(proof);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-12">
      {/* Compact Clean Order Info Header */}
      <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
        <span className="font-mono text-sm font-black text-neutral-900">
          {activeTask.orderNumber}
        </span>
        <span className="text-[11px] font-semibold text-neutral-500">
          Est. SLA: <strong className="text-neutral-900">{activeTask.estimatedDeliveryAt}</strong>
        </span>
      </div>

      {/* Full-view Rider Route Navigation Map */}
      <div id="active-navigation-map">
        <InteractiveMap
          task={activeTask}
          mode={
            isHeadingToSeller
              ? 'RIDER_TO_SELLER'
              : isAtSeller
              ? 'AT_SELLER'
              : isInTransitToCustomer
              ? 'SELLER_TO_CUSTOMER'
              : 'VERIFICATION'
          }
        />
      </div>

      {/* Primary Operational Action Card */}
      <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
        
        {/* Step 1: Heading to Seller Location */}
        {isHeadingToSeller && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-[#009DE0] uppercase tracking-wider block">
                  Step 1: En Route to Store
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
                  icon={<CornerUpRight className="w-3.5 h-3.5 text-[#009DE0]" />}
                  className="text-xs text-neutral-800 border-neutral-200 hover:bg-neutral-50 font-bold"
                >
                  Maps Route
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDelayModalOpen(true)}
                  icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
                  className="text-xs text-amber-800 border-amber-200 hover:bg-amber-50"
                >
                  Not Ready
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleOpenMaskedCall(activeTask.pickup.storeName, 'SELLER')
                  }
                  icon={<Phone className="w-3.5 h-3.5 text-neutral-700" />}
                  className="text-xs"
                >
                  Call Store
                </Button>
              </div>
            </div>

            <p className="text-xs text-neutral-600">{activeTask.pickup.address}</p>

            {activeTask.pickup.pickupNotes && (
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-xs text-neutral-700">
                <p className="font-bold text-neutral-900">Store Note:</p>
                <p className="mt-0.5">{activeTask.pickup.pickupNotes}</p>
              </div>
            )}

            {storeDelayReported && (
              <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Delay Logged: {storeDelayReported}</span>
                <span className="font-bold text-emerald-700">₹1.20/min Wait Active</span>
              </div>
            )}

            <Button
              variant="brand"
              size="lg"
              fullWidth
              onClick={() => {
                updateTaskStatus('packed');
                showToast('Reached seller location. Verify token & package.', 'info');
              }}
              icon={<MapPin className="w-5 h-5" />}
              className="font-bold py-3.5"
            >
              Reached Seller Location
            </Button>
          </div>
        )}

        {/* Step 2: At Seller Location (Token, Seal & Picture Step) */}
        {isAtSeller && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-[#009DE0] uppercase tracking-wider block">
                  Step 2: Store Handover
                </span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  {activeTask.pickup.storeName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDelayModalOpen(true)}
                  icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
                  className="text-xs text-amber-800 border-amber-200 hover:bg-amber-50"
                >
                  Not Ready
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleOpenMaskedCall(activeTask.pickup.storeName, 'SELLER')
                  }
                  icon={<Phone className="w-3.5 h-3.5 text-neutral-700" />}
                  className="text-xs"
                >
                  Call Store
                </Button>
              </div>
            </div>

            {/* Pickup Token & Handover Box */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                    Store Pickup Token
                  </span>
                  <span className="font-mono text-xl font-black text-[#009DE0] tracking-wider">
                    {activeTask.pickupToken || 'PK-8819'}
                  </span>
                </div>
                {sellerTokenEntered ? (
                  <Badge variant="emerald" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                    Verified by Store
                  </Badge>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSellerTokenEntered(true);
                      showToast('Pickup Token verified by seller!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#009DE0] hover:bg-[#008bc7] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Simulate Seller Token
                  </button>
                )}
              </div>

              {/* Tamper Seal Checklist */}
              <div
                onClick={() => setSealIntact(!sealIntact)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  sealIntact
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-white border-neutral-200 text-neutral-800'
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
                  <span className="font-bold block">Tamper Seal Checked</span>
                  <span className="text-[11px] text-neutral-500">
                    Package seal is intact with order label
                  </span>
                </div>
              </div>

              {/* Photo proof */}
              <div>
                {activeTask.pickupProof ? (
                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Package Photo Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenProofCamera('PICKUP')}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer text-xs"
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenProofCamera('PICKUP')}
                    className="w-full p-2.5 rounded-xl border border-dashed border-[#009DE0] bg-[#EBF7FD]/60 hover:bg-[#EBF7FD] text-[#009DE0] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4 text-[#009DE0]" />
                    Take Package Photo
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
                showToast('Pickup verified! Starting ride to customer.', 'success');
              }}
              icon={<PackageCheck className="w-5 h-5" />}
              className="font-bold py-3.5"
            >
              Confirm Pickup & Start Delivery
            </Button>
          </div>
        )}

        {/* Step 3: En Route to Customer Location */}
        {isInTransitToCustomer && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Step 3: En Route to Customer
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
                >
                  Maps Route
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleOpenMaskedCall(activeTask.drop.customerName, 'CUSTOMER')
                  }
                  icon={<Phone className="w-3.5 h-3.5 text-neutral-700" />}
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
              <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-xs text-neutral-700">
                <p className="font-bold text-neutral-900">Access Note:</p>
                <p className="mt-0.5">{activeTask.drop.dropoffInstructions}</p>
              </div>
            )}

            <Button
              variant="brand"
              size="lg"
              fullWidth
              onClick={() => {
                updateTaskStatus('arriving');
                showToast('Arrived at customer location', 'info');
              }}
              icon={<MapPin className="w-5 h-5" />}
              className="font-bold py-3.5"
            >
              Reached Delivery Location
            </Button>
          </div>
        )}

        {/* Step 4: At Delivery Location (Photo Proof -> Unlock OTP Verification) */}
        {isAtCustomer && (
          <div className="space-y-4">
            {/* Header: Customer Info & Call */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#009DE0] uppercase tracking-wider block">
                  Step 4: Delivery Verification
                </span>
                <h3 className="text-base font-extrabold text-neutral-900">
                  {activeTask.drop.customerName}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleOpenMaskedCall(activeTask.drop.customerName, 'CUSTOMER')
                }
                icon={<Phone className="w-3.5 h-3.5 text-neutral-700" />}
                className="text-xs font-bold"
              >
                Call Customer
              </Button>
            </div>

            {/* Sub-step 1: Take Package / Doorstep Picture */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      hasDeliveryPhoto
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#009DE0] text-white'
                    }`}
                  >
                    {hasDeliveryPhoto ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
                  </div>
                  <span className="text-xs font-black text-neutral-900">
                    Take Package & Doorstep Photo
                  </span>
                </div>
                {hasDeliveryPhoto ? (
                  <Badge variant="emerald" size="sm">
                    Verified
                  </Badge>
                ) : (
                  <span className="text-[10px] font-bold text-[#009DE0] bg-[#EBF7FD] px-2 py-0.5 rounded-md border border-[#009DE0]/20">
                    Required First
                  </span>
                )}
              </div>

              {hasDeliveryPhoto ? (
                <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    {activeTask.deliveryProof?.photoUrl ? (
                      <img
                        src={activeTask.deliveryProof.photoUrl}
                        alt="Delivery Proof"
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">
                        Package Photo Captured
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        GPS & timestamp tagged
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenProofCamera('DELIVERY')}
                    className="text-xs text-[#009DE0] hover:text-[#008bc7] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    Retake
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenProofCamera('DELIVERY')}
                  className="w-full p-3.5 rounded-xl border-2 border-dashed border-[#009DE0] bg-[#EBF7FD]/60 hover:bg-[#EBF7FD] text-[#009DE0] flex items-center justify-center gap-2 text-xs font-extrabold shadow-2xs transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#009DE0]" />
                  <span>Click Package Photo at Doorstep</span>
                </button>
              )}
            </div>

            {/* Sub-step 2: Enter Customer 4-Digit OTP (Locked until photo is taken) */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                hasDeliveryPhoto
                  ? 'bg-[#EBF7FD]/40 border-[#009DE0]/40'
                  : 'bg-neutral-50/70 border-neutral-200/80 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                      hasDeliveryPhoto
                        ? 'bg-[#009DE0] text-white'
                        : 'bg-neutral-300 text-neutral-600'
                    }`}
                  >
                    {hasDeliveryPhoto ? '2' : <Lock className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-black text-neutral-900">
                    Enter Customer 4-Digit OTP
                  </span>
                </div>
                {hasDeliveryPhoto ? (
                  <Badge variant="brand" size="sm">
                    Unlocked
                  </Badge>
                ) : (
                  <span className="text-[10px] font-semibold text-neutral-400">
                    Locked
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-500 mb-3">
                {hasDeliveryPhoto
                  ? "Ask customer for the 4-digit verification code shown on their app."
                  : "Complete Step 1 (package photo) above to unlock OTP verification."}
              </p>

              <Button
                variant="brand"
                size="md"
                fullWidth
                disabled={!hasDeliveryPhoto}
                onClick={() => setIsOtpModalOpen(true)}
                icon={
                  hasDeliveryPhoto ? (
                    <KeyRound className="w-4 h-4 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 shrink-0" />
                  )
                }
                className="h-12 rounded-2xl font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span className="truncate">
                  {hasDeliveryPhoto
                    ? 'Enter Delivery OTP & Complete'
                    : 'Take Photo First to Enter OTP'}
                </span>
              </Button>
            </div>

            {/* Secondary Handover Edge Cases */}
            <div className="pt-2 border-t border-neutral-100 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setIsContactlessModalOpen(true)}
                className="p-2.5 rounded-xl border border-neutral-200 hover:border-[#009DE0] bg-white text-center transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-neutral-700 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-neutral-800 block truncate">
                  No Contact
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsCodModalOpen(true)}
                className="p-2.5 rounded-xl border border-neutral-200 hover:border-amber-500 bg-white text-center transition cursor-pointer"
              >
                <Banknote className="w-4 h-4 text-neutral-700 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-neutral-800 block truncate">
                  Collect Cash
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsUnreachableModalOpen(true)}
                className="p-2.5 rounded-xl border border-neutral-200 hover:border-rose-300 bg-white text-center transition cursor-pointer"
              >
                <Clock className="w-4 h-4 text-neutral-700 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-neutral-800 block truncate">
                  Unreachable
                </span>
              </button>
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

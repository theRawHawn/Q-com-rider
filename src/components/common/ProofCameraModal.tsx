import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CheckCircle2,
  X,
  Upload,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { Button } from './Button';
import { Coordinates, ProofOfHandover } from '../../types/delivery';
import {
  calculateReturnPeriodExpiry,
  generateTamperSecurityHash,
  stampWatermarkOnImage,
  generateSampleParcelImage,
} from '../../utils/photoProofUtils';
import { useToast } from '../../context/ToastContext';

interface ProofCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmProof: (proof: ProofOfHandover) => void;
  stage: 'PICKUP' | 'DELIVERY';
  orderNumber: string;
  locationName: string;
  coordinates: Coordinates;
  partnerId: string;
  partnerName: string;
}

export const ProofCameraModal: React.FC<ProofCameraModalProps> = ({
  isOpen,
  onClose,
  onConfirmProof,
  stage,
  orderNumber,
  locationName,
  coordinates,
  partnerId,
  partnerName,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const expiryInfo = calculateReturnPeriodExpiry();
  const cleanOrderNumber = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  // Start live camera stream
  const startCamera = useCallback(
    async (preferredFacing: 'environment' | 'user' = facingMode) => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not accessible');
        }

        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }

        let mediaStream: MediaStream | null = null;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: preferredFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback to standard webcam/camera
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        setStream(mediaStream);
        setCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => {
            console.warn('Playback error:', err);
          });
        }
      } catch (err: any) {
        console.warn('Camera start error:', err);
        setCameraError('Camera preview restricted. Use phone camera button below.');
        setCameraActive(false);
      }
    },
    [facingMode, stream]
  );

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPhotos([]);
      setCameraError(null);
      startCamera();
    } else {
      document.body.style.overflow = 'unset';
      stopCamera();
      setPhotos([]);
      setCameraActive(false);
      setCameraError(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  // Synchronize video element ref
  const handleVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && stream) {
      element.srcObject = stream;
      element.play().catch((err) => {
        console.warn('Video playback warning on ref mount:', err);
      });
    }
  };

  // Watermark photo and add to state
  const processAndAddPhoto = async (rawImage: string) => {
    if (photos.length >= 3) {
      showToast('Maximum 3 photos added.', 'warning');
      return;
    }

    const timestamp = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const securityHash = generateTamperSecurityHash(orderNumber, stage, timestamp, partnerId);

    const watermarked = await stampWatermarkOnImage(rawImage, {
      orderNumber,
      stage,
      locationName,
      coordinates,
      partnerId,
      partnerName,
      timestamp,
      expiryFormatted: expiryInfo.formatted,
      securityHash,
    });

    setPhotos((prev) => [...prev, watermarked]);
    showToast(`Photo ${photos.length + 1} of 3 added.`, 'info');
  };

  // Capture current frame from live viewfinder
  const captureVideoFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        await processAndAddPhoto(rawDataUrl);
      }
    } catch (err) {
      console.error('Failed to capture frame', err);
      showToast('Error capturing frame. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle native camera capture (triggers system camera app like Gemini)
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      await processAndAddPhoto(rawDataUrl);
      setIsProcessing(false);
      if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Quick proof sample
  const handleQuickCapture = async () => {
    setIsProcessing(true);
    const sampleRaw = generateSampleParcelImage(cleanOrderNumber, stage, photos.length + 1);
    await processAndAddPhoto(sampleRaw);
    setIsProcessing(false);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleConfirm = () => {
    if (photos.length < 2) {
      showToast('Please add at least 2 pictures before confirming.', 'warning');
      return;
    }

    const timestamp = new Date().toISOString();
    const securityHash = generateTamperSecurityHash(orderNumber, stage, timestamp, partnerId);

    const proof: ProofOfHandover = {
      id: `PROOF-${stage}-${Date.now()}`,
      photoUrl: photos[0],
      photoUrls: photos,
      timestamp,
      stage,
      coordinates,
      capturedByPartnerId: partnerId,
      orderNumber: cleanOrderNumber,
      tamperSealStatus: 'INTACT_VERIFIED',
      securityHash,
      retentionUntil: expiryInfo.iso,
      retentionDaysRemaining: expiryInfo.daysRemaining,
      note:
        stage === 'PICKUP'
          ? `${photos.length} store verification photos attached with intact seal`
          : `${photos.length} customer delivery handover photos attached with intact seal`,
    };

    onConfirmProof(proof);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Mobile-First Zero-Scroll Full Viewport Container */}
      <div className="w-full max-w-md h-full sm:h-[620px] max-h-[100dvh] sm:max-h-[92vh] bg-neutral-900 text-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-neutral-800 flex flex-col justify-between overflow-hidden">
        {/* Top Bar with Close Button */}
        <div className="px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact 3-Photo Slots Strip (Takes only 44px, never overflows) */}
        <div className="px-3 py-2 bg-neutral-950/80 border-b border-neutral-800 shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => {
              const photo = photos[idx];
              const isRequired = idx < 2;

              return (
                <div
                  key={idx}
                  className={`h-11 rounded-lg border flex items-center justify-between px-2 text-[10px] relative overflow-hidden transition-all ${
                    photo
                      ? 'border-emerald-500 bg-neutral-900'
                      : 'border-dashed border-neutral-700 bg-neutral-900/50 text-neutral-400'
                  }`}
                >
                  {photo ? (
                    <>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src={photo}
                          alt={`Proof ${idx + 1}`}
                          className="w-7 h-7 rounded object-cover border border-emerald-500 shrink-0"
                        />
                        <span className="font-bold text-emerald-400 truncate">Photo {idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="w-4 h-4 rounded-full bg-neutral-800 hover:bg-red-600 text-white flex items-center justify-center shrink-0 ml-1 cursor-pointer transition-colors"
                        title="Delete photo"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-neutral-400">Photo {idx + 1}</span>
                      <span
                        className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                          isRequired ? 'bg-amber-950/80 text-amber-300' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {isRequired ? 'Req' : 'Opt'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Central Viewfinder Area - Directly Visible with ZERO Scrolling */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {photos.length < 3 ? (
            cameraActive ? (
              /* Live Camera Stream directly in view */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={handleVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Framing Guidelines Overlay */}
                <div className="absolute inset-6 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-white" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-white" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-white" />
                  </div>
                </div>

                {/* Floating Bottom Shutter & Controls */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-7 z-20">
                  {/* Native Device Camera Button (Direct phone camera like Gemini) */}
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white flex items-center justify-center border border-white/30 shadow-lg cursor-pointer transition active:scale-95"
                    title="Open Native Phone Camera"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                  </button>

                  {/* Main Shutter Button */}
                  <button
                    type="button"
                    onClick={captureVideoFrame}
                    disabled={isProcessing}
                    className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 shadow-2xl cursor-pointer flex items-center justify-center transition-transform active:scale-95 shrink-0"
                    title="Snap Picture"
                  >
                    <div className="w-6 h-6 rounded-full bg-white" />
                  </button>

                  {/* Flip Camera */}
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white flex items-center justify-center border border-white/30 shadow-lg cursor-pointer transition active:scale-95"
                    title="Flip Camera"
                  >
                    <RotateCcw className="w-4 h-4 text-neutral-300" />
                  </button>
                </div>
              </div>
            ) : (
              /* Fallback / Camera Permission Restricted (Direct Phone Camera trigger) */
              <div className="text-center p-4 space-y-3 w-full max-w-xs mx-auto">
                <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Take Picture {photos.length + 1} of 3</p>
                  <p className="text-xs text-neutral-400">
                    Use your phone's native camera or quick capture.
                  </p>
                </div>

                {cameraError && (
                  <p className="text-[11px] text-amber-300 bg-amber-950/60 p-2 rounded-lg border border-amber-800/60 flex items-center gap-1.5 justify-center">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{cameraError}</span>
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-98"
                  >
                    <Camera className="w-4 h-4" />
                    Open Phone Camera
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-neutral-700 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Preview
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickCapture}
                      className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-neutral-700 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Quick Proof
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Max 3 Photos Added View */
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">All 3 Photos Captured</h4>
                <p className="text-xs text-neutral-400">
                  Minimum verification met. Click Confirm and save below to continue.
                </p>
              </div>
            </div>
          )}

          {/* Direct Native Camera System Input (Standard Mobile Camera API) */}
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleNativeCameraCapture}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleNativeCameraCapture}
          />
        </div>

        {/* Pinned Footer (Zero scroll, always visible) */}
        <div className="px-4 py-3 bg-neutral-900 border-t border-neutral-800 shrink-0 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
            Cancel
          </Button>

          <Button
            variant="brand"
            size="sm"
            onClick={handleConfirm}
            disabled={photos.length < 2 || isProcessing}
            className="font-bold text-xs"
          >
            Confirm and save
          </Button>
        </div>
      </div>
    </div>
  );
};

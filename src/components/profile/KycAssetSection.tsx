import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Truck,
  Package,
  BookOpen,
  CheckCircle2,
  QrCode,
  AlertCircle,
  ExternalLink,
  Award,
} from 'lucide-react';
import { kycAssetService } from '../../services/kycAssetService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const KycAssetSection: React.FC = () => {
  const { partner, updateProfile } = useAuth();
  const { showToast } = useToast();

  const documents = kycAssetService.getDocuments();
  const constraints = kycAssetService.getVehicleConstraints();
  const assets = kycAssetService.getAllocatedAssets();
  const [trainingModules, setTrainingModules] = useState(() =>
    kycAssetService.getTrainingModules()
  );

  const activeConstraint = kycAssetService.getConstraintForVehicle(partner.vehicleType);

  const handleCompleteTraining = (moduleId: string) => {
    const ok = kycAssetService.completeTrainingModule(moduleId, 100);
    if (ok) {
      setTrainingModules(kycAssetService.getTrainingModules());
      showToast('Training module completed! 100% score recorded.', 'success');
    }
  };

  const handleSwitchVehicle = (
    type: 'EV_SCOOTER' | 'PETROL_SCOOTER' | 'BICYCLE' | 'E_CARGO_3W'
  ) => {
    updateProfile({ vehicleType: type });
    showToast(`Active vehicle updated to ${type}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Automated BGV Clearance Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-emerald-950">
              Digital KYC & Background Verification (BGV) Cleared
            </h3>
            <Badge variant="emerald" size="sm">
              GREEN - LEVEL 1
            </Badge>
          </div>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            National judicial database, eCourts records, and district police registry checks verified on 14 Jan 2025. Verified for hyper-local fulfillment and high-value equipment transport.
          </p>
        </div>
      </div>

      {/* 2. Document Verification Status Cards */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-neutral-600" />
            <h3 className="text-sm font-extrabold text-neutral-900">
              Government Identity & Vehicle Registrations
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">5 of 5 Verified</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl border border-neutral-200/70 bg-neutral-50/50 flex items-start justify-between gap-2"
            >
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block uppercase tracking-wider">
                  {doc.name}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-900">
                  {doc.documentNumber}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Verified via {doc.verifiedVia}
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                Verified
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Vehicle Profile & Constraint Engine */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#009DE0]" />
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900">
                Vehicle Profile & Operating Constraint Matrix
              </h3>
              <p className="text-xs text-neutral-500">
                Dispatch engine applies radius and payload limits based on selected profile.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Vehicle Info */}
        <div className="p-3.5 rounded-xl bg-[#EBF7FD]/60 border border-[#009DE0]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-neutral-900">
              Active Configuration: {activeConstraint.label}
            </span>
            <Badge variant="brand" size="sm">
              Active
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-[#009DE0]/15">
              <span className="text-[10px] text-neutral-500 block">Operating Radius</span>
              <span className="font-extrabold text-neutral-900">
                &le; {activeConstraint.maxRadiusKm} km
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-[#009DE0]/15">
              <span className="text-[10px] text-neutral-500 block">Payload Limit</span>
              <span className="font-extrabold text-neutral-900">
                &le; {activeConstraint.maxWeightKg} kg
              </span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-[#009DE0]/15">
              <span className="text-[10px] text-neutral-500 block">EV Telemetry</span>
              <span className="font-extrabold text-emerald-700">
                {activeConstraint.batteryRequired ? 'Required' : 'Exempt'}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Switcher Selection */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-neutral-600 block">
            Select / Change Registered Vehicle
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {constraints.map((c) => {
              const isSelected = partner.vehicleType === c.vehicleType;
              return (
                <button
                  key={c.vehicleType}
                  onClick={() => handleSwitchVehicle(c.vehicleType)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#009DE0] bg-[#EBF7FD]/50 ring-1 ring-[#009DE0]/20'
                      : 'border-neutral-200/70 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-neutral-900 block truncate">
                    {c.label}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    &le;{c.maxRadiusKm}km • &le;{c.maxWeightKg}kg
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Allocated Physical Assets & QR Serials */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-neutral-600" />
            <h3 className="text-sm font-extrabold text-neutral-900">
              Allocated Operational Gear & Assets
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">3 Assets Assigned</span>
        </div>

        <div className="space-y-2.5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="p-3 rounded-xl border border-neutral-200/70 bg-neutral-50/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-200/60 text-neutral-700">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-neutral-900">{asset.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                    <span className="font-mono font-bold">{asset.serialNumber}</span>
                    <span>•</span>
                    <span>Assigned {asset.assignedAt}</span>
                  </div>
                </div>
              </div>
              <Badge variant="emerald" size="sm">
                Assigned
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Safety & Cold-Chain Micro-Learning Modules */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-600" />
            <h3 className="text-sm font-extrabold text-neutral-900">
              Mandatory Safety & Compliance Training
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">Annual Recertification</span>
        </div>

        <div className="space-y-2.5">
          {trainingModules.map((module) => (
            <div
              key={module.id}
              className="p-3 rounded-xl border border-neutral-200/70 bg-neutral-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-neutral-900">{module.title}</h4>
                  <span className="text-[11px] text-neutral-400">
                    {module.durationMinutes} min video course • Completed with {module.scorePercent}% score
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Badge variant="emerald" size="sm">
                  Certified
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCompleteTraining(module.id)}
                  className="text-[11px] py-1 px-2.5 h-auto"
                >
                  Review Module
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

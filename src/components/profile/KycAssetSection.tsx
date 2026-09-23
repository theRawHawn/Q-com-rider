import React from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Truck,
  Package,
  QrCode,
} from 'lucide-react';
import { kycAssetService } from '../../services/kycAssetService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';

export const KycAssetSection: React.FC = () => {
  const { partner, updateProfile } = useAuth();
  const { showToast } = useToast();

  const documents = kycAssetService.getDocuments();
  const constraints = kycAssetService.getVehicleConstraints();
  const assets = kycAssetService.getAllocatedAssets();

  const handleSwitchVehicle = (
    type: 'EV_SCOOTER' | 'PETROL_SCOOTER' | 'BICYCLE' | 'E_CARGO_3W'
  ) => {
    updateProfile({ vehicleType: type });
    showToast(`Active vehicle updated to ${type}`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* 1. KYC Clearance Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-emerald-950">
              KYC & Background Verification Cleared
            </h3>
            <Badge variant="emerald" size="sm">
              Level 1
            </Badge>
          </div>
          <p className="text-[11px] text-emerald-800 mt-0.5">
            Verified for quick-commerce deliveries and equipment transport.
          </p>
        </div>
      </div>

      {/* 2. Document Verification Status Cards */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-neutral-600" />
            <h3 className="text-xs font-black text-neutral-900">
              Identity & Registrations
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">{documents.length} of {documents.length} Verified</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-2.5 rounded-xl border border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between gap-2"
            >
              <div>
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">
                  {doc.name}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-900">
                  {doc.documentNumber}
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                Verified
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Vehicle Profile & Switcher */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <Truck className="w-4 h-4 text-[#009DE0]" />
          <div>
            <h3 className="text-xs font-black text-neutral-900">
              Registered Vehicle
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {constraints.map((c) => {
            const isSelected = partner.vehicleType === c.vehicleType;
            return (
              <button
                key={c.vehicleType}
                type="button"
                onClick={() => handleSwitchVehicle(c.vehicleType)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#009DE0] bg-[#EBF7FD] ring-1 ring-[#009DE0]/30 shadow-2xs'
                    : 'border-neutral-200/70 hover:border-neutral-300 bg-neutral-50/40'
                }`}
              >
                <span className={`text-xs font-bold block truncate ${isSelected ? 'text-[#009DE0]' : 'text-neutral-900'}`}>
                  {c.label}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  &le; {c.maxRadiusKm} km · &le; {c.maxWeightKg} kg
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Allocated Physical Assets */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-neutral-600" />
            <h3 className="text-xs font-black text-neutral-900">
              Partner Kit & Gear
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">{assets.length} items</span>
        </div>

        <div className="space-y-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="p-2.5 rounded-xl border border-neutral-200/70 bg-neutral-50/40 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-neutral-200/60 text-neutral-700">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{asset.name}</h4>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {asset.serialNumber}
                  </span>
                </div>
              </div>
              <Badge variant="neutral" size="sm">
                Active
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


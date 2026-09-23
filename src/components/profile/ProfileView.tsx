import React, { useState } from 'react';
import {
  Building,
  Phone,
  LogOut,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { KycAssetSection } from './KycAssetSection';
import { PerformanceScorecardSection } from './PerformanceScorecardSection';
import { BatteryStatusCard } from '../../modules/battery-telemetry';

type ProfileSubTab = 'performance' | 'kyc_assets' | 'account_telemetry';

export const ProfileView: React.FC = () => {
  const { partner, logout } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('performance');

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-12 max-w-md mx-auto">
      {/* Profile Header Hero Card */}
      <div className="p-4 bg-white rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-3.5">
          <img
            src={partner.photoUrl}
            alt={partner.name}
            className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 shadow-2xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black text-neutral-900 tracking-tight truncate">
              {partner.name}
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              {partner.phone}
            </p>
          </div>
        </div>

        {/* 3 Clean Highlight Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 text-center">
          <div className="bg-neutral-50/80 rounded-2xl p-2 border border-neutral-200/60">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Rating</span>
            <span className="text-sm font-black text-neutral-900 flex items-center justify-center gap-1">
              <span className="text-amber-500">★</span> {partner.rating}
            </span>
          </div>
          <div className="bg-neutral-50/80 rounded-2xl p-2 border border-neutral-200/60">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Trips</span>
            <span className="text-sm font-black text-neutral-900">
              {partner.completedDeliveriesCount}
            </span>
          </div>
          <div className="bg-neutral-50/80 rounded-2xl p-2 border border-neutral-200/60">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Tier</span>
            <span className="text-sm font-black text-[#009DE0]">
              {partner.tierLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="bg-white p-1 rounded-2xl border border-neutral-200/80 shadow-2xs grid grid-cols-3 gap-1 text-center text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('performance')}
          className={`py-2 px-1 rounded-xl transition cursor-pointer ${
            activeSubTab === 'performance'
              ? 'bg-[#009DE0] text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveSubTab('kyc_assets')}
          className={`py-2 px-1 rounded-xl transition cursor-pointer ${
            activeSubTab === 'kyc_assets'
              ? 'bg-[#009DE0] text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveSubTab('account_telemetry')}
          className={`py-2 px-1 rounded-xl transition cursor-pointer ${
            activeSubTab === 'account_telemetry'
              ? 'bg-[#009DE0] text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Account
        </button>
      </div>

      {/* Active Sub-Tab View */}
      {activeSubTab === 'performance' && <PerformanceScorecardSection />}

      {activeSubTab === 'kyc_assets' && <KycAssetSection />}

      {activeSubTab === 'account_telemetry' && (
        <div className="space-y-3">
          {/* Live EV BMS Node - Only for EV vehicles */}
          {(partner.vehicleType === 'EV_SCOOTER' || partner.vehicleType === 'E_CARGO_3W') && (
            <BatteryStatusCard
              vehicleModel={partner.vehicleModel}
              vehicleId={partner.vehicleNumber}
            />
          )}

          {/* Bank & Payout Details */}
          <div className="p-4 bg-white rounded-3xl border border-neutral-200/80 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
              <Building className="w-4 h-4 text-[#009DE0]" />
              <h3 className="text-xs font-black text-neutral-900">
                Settlement Bank Account
              </h3>
            </div>
            <div className="space-y-2 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/60">
              <div className="flex justify-between py-0.5 border-b border-neutral-200/40">
                <span className="text-neutral-500 font-medium">Bank</span>
                <span className="font-bold text-neutral-900">{partner.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-neutral-200/40">
                <span className="text-neutral-500 font-medium">Account Number</span>
                <span className="font-mono font-bold text-neutral-900">{partner.bankAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-neutral-200/40">
                <span className="text-neutral-500 font-medium">IFSC</span>
                <span className="font-mono font-bold text-neutral-900">{partner.bankAccount.ifscCode}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500 font-medium">UPI ID</span>
                <span className="font-mono font-bold text-emerald-700">{partner.bankAccount.upiId}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 bg-white rounded-3xl border border-neutral-200/80 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
              <Phone className="w-4 h-4 text-[#009DE0]" />
              <h3 className="text-xs font-black text-neutral-900">
                Contact Info
              </h3>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">Phone</span>
                <span className="font-bold text-neutral-900">{partner.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500 font-medium">Email</span>
                <span className="font-bold text-neutral-900 truncate max-w-[200px]">{partner.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Sign Out Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={logout}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-rose-50/60 border border-neutral-200/80 text-rose-600 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};


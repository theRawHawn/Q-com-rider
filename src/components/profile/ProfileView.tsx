import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  BatteryCharging,
  Zap,
  Building,
  FileCheck,
  Phone,
  Mail,
  LogOut,
  Award,
  Layers,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { KycAssetSection } from './KycAssetSection';
import { PerformanceScorecardSection } from './PerformanceScorecardSection';
import { BatteryStatusCard } from '../../modules/battery-telemetry';

type ProfileSubTab = 'performance' | 'kyc_assets' | 'account_telemetry';

export const ProfileView: React.FC = () => {
  const { partner, logout } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('performance');

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Profile Header Hero Card */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={partner.photoUrl}
            alt={partner.name}
            className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-neutral-900 truncate">
                {partner.name}
              </h1>
              <Badge variant="emerald" size="sm" dot>
                VERIFIED
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Partner Code: <span className="font-mono font-bold text-neutral-800">{partner.partnerCode}</span>
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-600">
              <span>Rating: <strong className="text-neutral-900">★ {partner.rating}</strong></span>
              <span>•</span>
              <span>Trips: <strong className="text-neutral-900">{partner.completedDeliveriesCount}</strong></span>
              <span>•</span>
              <span className="font-bold text-[#009DE0]">{partner.tierLevel} TIER</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-xs text-neutral-600 hover:text-rose-600 border-neutral-200"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('performance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'performance'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Scorecard & Tier Perks</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kyc_assets')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'kyc_assets'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>KYC, Assets & Vehicle Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('account_telemetry')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'account_telemetry'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Settings className="w-4 h-4 text-neutral-600" />
          <span>Bank & Device Telemetry</span>
        </button>
      </div>

      {/* Active Sub-Tab View */}
      {activeSubTab === 'performance' && <PerformanceScorecardSection />}

      {activeSubTab === 'kyc_assets' && <KycAssetSection />}

      {activeSubTab === 'account_telemetry' && (
        <div className="space-y-4">
          {/* Live EV BMS & Bluetooth Telemetry Node - Only for EV vehicles */}
          {(partner.vehicleType === 'EV_SCOOTER' || partner.vehicleType === 'E_CARGO_3W') && (
            <BatteryStatusCard
              vehicleModel={partner.vehicleModel}
              vehicleId={partner.vehicleNumber}
            />
          )}

          {/* Bank & Payout Details */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-neutral-700" />
              Direct Settlement Bank Account & UPI
            </h3>
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60">
              <div className="flex justify-between py-0.5 border-b border-neutral-200/50">
                <span className="text-neutral-500">Bank Name</span>
                <span className="font-bold text-neutral-900">{partner.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-neutral-200/50">
                <span className="text-neutral-500">Account Number</span>
                <span className="font-mono font-bold text-neutral-900">{partner.bankAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-neutral-200/50">
                <span className="text-neutral-500">IFSC Code</span>
                <span className="font-mono font-bold text-neutral-900">{partner.bankAccount.ifscCode}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500">Registered Instant UPI VPA</span>
                <span className="font-mono font-bold text-emerald-700">{partner.bankAccount.upiId}</span>
              </div>
            </div>
          </div>

          {/* Contact & Dispatch Support */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-2 text-xs">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-neutral-700" />
              Registered Contact Channels
            </h3>
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-500">Primary Mobile</span>
              <span className="font-bold text-neutral-900">{partner.phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Official Communication Email</span>
              <span className="font-bold text-neutral-900">{partner.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

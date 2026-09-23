import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Award,
  Shield,
} from 'lucide-react';
import { performanceService } from '../../services/performanceService';
import { useAuth } from '../../context/AuthContext';
import { PartnerTier } from '../../types/delivery';

export const PerformanceScorecardSection: React.FC = () => {
  const { partner } = useAuth();
  const scorecard = performanceService.getScorecard();
  const tierDetails = performanceService.getTierDetails(partner.tierLevel);

  const tiers: PartnerTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

  return (
    <div className="space-y-4">
      {/* Top Tier Status Card */}
      <div className="p-4 bg-white rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF7FD] text-[#009DE0] font-black text-[10px] uppercase tracking-wider">
              {partner.tierLevel} Partner
            </span>
          </div>
          <h2 className="text-base font-black text-neutral-900 tracking-tight mt-1">
            {tierDetails.title}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {tierDetails.description}
          </p>
        </div>

        <div className="bg-neutral-50 p-2.5 rounded-2xl border border-neutral-200/60 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block">
            30-Day Trips
          </span>
          <span className="text-xl font-black text-neutral-900">
            {scorecard.totalTripsCompleted}
          </span>
        </div>
      </div>

      {/* 4 Core Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Acceptance Rate */}
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Acceptance</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-neutral-900">
            {scorecard.acceptanceRatePercent}%
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Target &ge; 85%</span>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completion</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-neutral-900">
            {scorecard.completionRatePercent}%
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Target &ge; 98%</span>
        </div>

        {/* On-Time Delivery Rate */}
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time SLA</span>
            <Clock className="w-3.5 h-3.5 text-[#009DE0]" />
          </div>
          <div className="text-xl font-black text-neutral-900">
            {scorecard.onTimeDeliveryRatePercent}%
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Target &ge; 95%</span>
        </div>

        {/* Customer Rating */}
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rating</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-xl font-black text-neutral-900">
            {scorecard.customerRating} <span className="text-xs text-neutral-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">418 ratings</span>
        </div>
      </div>

      {/* Unlocked Tier Benefits List */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-black text-neutral-900">
            Tier Privileges
          </h3>
        </div>

        <div className="space-y-2">
          {tierDetails.perks.map((perk, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl border border-neutral-200/70 bg-neutral-50/40 flex items-start gap-2 text-xs text-neutral-800"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-semibold text-xs">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <Shield className="w-4 h-4 text-neutral-600" />
          <h3 className="text-xs font-black text-neutral-900">
            Tier Ladder
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tiers.map((t) => {
            const isCurrent = partner.tierLevel === t;
            const details = performanceService.getTierDetails(t);

            return (
              <div
                key={t}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'border-[#009DE0] bg-[#EBF7FD] ring-1 ring-[#009DE0]/30 shadow-2xs'
                    : 'border-neutral-200/70 bg-neutral-50/40 text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      isCurrent ? 'text-[#009DE0]' : 'text-neutral-800'
                    }`}
                  >
                    {t}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-bold bg-[#009DE0] text-white px-1.5 py-0.2 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] block font-medium ${
                    isCurrent ? 'text-neutral-700' : 'text-neutral-500'
                  }`}
                >
                  {details.slotAdvanceHours}h Slot Release
                </span>
                <span
                  className={`text-[10px] block mt-0.5 font-semibold ${
                    isCurrent ? 'text-sky-950' : 'text-neutral-400'
                  }`}
                >
                  {details.instantFee === 0 ? '0% Payout Fee' : `₹${details.instantFee} Payout Fee`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


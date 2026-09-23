import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Sparkles,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { performanceService } from '../../services/performanceService';
import { useAuth } from '../../context/AuthContext';
import { PartnerTier } from '../../types/delivery';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const PerformanceScorecardSection: React.FC = () => {
  const { partner } = useAuth();
  const scorecard = performanceService.getScorecard();
  const tierDetails = performanceService.getTierDetails(partner.tierLevel);
  const [selectedTierModal, setSelectedTierModal] = useState<PartnerTier | null>(null);

  const tiers: PartnerTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

  return (
    <div className="space-y-6">
      {/* Top Banner: Tier Status & Privileges */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 text-neutral-900 shadow-2xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="orange" size="sm">
                {scorecard.tier} TIER LEADER
              </Badge>
              <span className="text-xs text-neutral-500 font-semibold">Top 5% Bangalore Courier</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {tierDetails.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-lg">
              {tierDetails.description}
            </p>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              Rolling 30-Day Trips
            </span>
            <span className="text-2xl font-black text-neutral-900">
              {scorecard.totalTripsCompleted}
            </span>
            <span className="text-[10px] text-emerald-700 block font-bold mt-0.5">
              Target Exceeded
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Acceptance Rate */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Acceptance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900">
            {scorecard.acceptanceRatePercent}%
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium mt-1">
            <span>Target: &ge; 85%</span>
            <span className="text-emerald-600 font-bold">Optimal</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completion</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900">
            {scorecard.completionRatePercent}%
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium mt-1">
            <span>Target: &ge; 98%</span>
            <span className="text-emerald-600 font-bold">Flawless</span>
          </div>
        </div>

        {/* On-Time Delivery Rate */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time SLA</span>
            <Clock className="w-4 h-4 text-[#f25100]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900">
            {scorecard.onTimeDeliveryRatePercent}%
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium mt-1">
            <span>Target: &ge; 95%</span>
            <span className="text-emerald-600 font-bold">&lt; 15 min SLA</span>
          </div>
        </div>

        {/* Customer Rating */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900">
            {scorecard.customerRating} <span className="text-xs text-neutral-400 font-bold">/ 5.0</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium mt-1">
            <span>418 Reviews</span>
            <span className="text-amber-600 font-bold">5-Star Avg</span>
          </div>
        </div>
      </div>

      {/* Unlocked Tier Benefits List */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-extrabold text-neutral-900">
              Active Tier Privileges & Unlocked Perks
            </h3>
          </div>
          <Badge variant="orange" size="sm">
            {partner.tierLevel}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tierDetails.perks.map((perk, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-neutral-200/70 bg-neutral-50/40 flex items-start gap-2.5 text-xs text-neutral-800"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Comparison Matrix Explorer */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-neutral-600" />
            <h3 className="text-sm font-extrabold text-neutral-900">
              Courier Tier Ladder & Requirements
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">Updated Weekly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tiers.map((t) => {
            const isCurrent = partner.tierLevel === t;
            const details = performanceService.getTierDetails(t);

            return (
              <div
                key={t}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-orange-500 bg-orange-50/60 text-neutral-900 shadow-2xs ring-1 ring-orange-500/20'
                    : 'border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-100/60 text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      isCurrent ? 'text-[#f25100]' : 'text-neutral-800'
                    }`}
                  >
                    {t}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-bold bg-[#f25100] text-white px-1.5 py-0.5 rounded-sm">
                      Current
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
                  className={`text-[10px] block mt-1 font-semibold ${
                    isCurrent ? 'text-orange-950' : 'text-neutral-400'
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

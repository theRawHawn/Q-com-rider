import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Calendar,
  Award,
  Target,
  Gift,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { earningsService } from '../../services/earningsService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { PayoutModal } from './PayoutModal';
import { FloatingCashCard } from './FloatingCashCard';

type PeriodFilter = 'daily' | 'weekly' | 'monthly' | 'lifetime';

interface BarDataPoint {
  label: string;
  amount: number;
}

export const EarningsView: React.FC = () => {
  const [summary, setSummary] = useState(() => earningsService.getSummary());
  const [ledger, setLedger] = useState(() => earningsService.getLedger());
  const [selectedFilter, setSelectedFilter] = useState<PeriodFilter>('daily');
  const [periodOffset, setPeriodOffset] = useState<number>(0);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isOrderEarningExpanded, setIsOrderEarningExpanded] = useState(true);

  const refreshEarnings = () => {
    setSummary({ ...earningsService.getSummary() });
    setLedger([...earningsService.getLedger()]);
  };

  const handleFilterChange = (filter: PeriodFilter) => {
    setSelectedFilter(filter);
    setPeriodOffset(0);
  };

  // Calculation and chart data per period filter and offset
  const getPeriodData = () => {
    if (selectedFilter === 'daily') {
      const days = [
        {
          dateRangePickerLabel: 'Today, 22 Sep',
          dateRangeHeaderLabel: '22 Sep 2026',
          total: summary.todayTotalEarnings,
          trips: summary.todayTripsCompleted,
          hours: '5:10 hrs',
          basePay: summary.todayBasePayTotal,
          incentives: summary.todayIncentivesTotal,
          tips: summary.todayTipsTotal,
          chartData: [
            { label: '9 AM', amount: 120 },
            { label: '12 PM', amount: 240 },
            { label: '3 PM', amount: 190 },
            { label: '6 PM', amount: 260 },
            { label: '9 PM', amount: 138 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: 'Yesterday, 21 Sep',
          dateRangeHeaderLabel: '21 Sep 2026',
          total: 802,
          trips: 7,
          hours: '4:45 hrs',
          basePay: 640,
          incentives: 102,
          tips: 60,
          chartData: [
            { label: '9 AM', amount: 100 },
            { label: '12 PM', amount: 190 },
            { label: '3 PM', amount: 180 },
            { label: '6 PM', amount: 210 },
            { label: '9 PM', amount: 122 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: 'Sun, 20 Sep',
          dateRangeHeaderLabel: '20 Sep 2026',
          total: 1150,
          trips: 10,
          hours: '6:30 hrs',
          basePay: 890,
          incentives: 170,
          tips: 90,
          chartData: [
            { label: '9 AM', amount: 180 },
            { label: '12 PM', amount: 320 },
            { label: '3 PM', amount: 250 },
            { label: '6 PM', amount: 280 },
            { label: '9 PM', amount: 120 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: 'Sat, 19 Sep',
          dateRangeHeaderLabel: '19 Sep 2026',
          total: 980,
          trips: 9,
          hours: '5:50 hrs',
          basePay: 770,
          incentives: 135,
          tips: 75,
          chartData: [
            { label: '9 AM', amount: 140 },
            { label: '12 PM', amount: 260 },
            { label: '3 PM', amount: 220 },
            { label: '6 PM', amount: 240 },
            { label: '9 PM', amount: 120 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: 'Fri, 18 Sep',
          dateRangeHeaderLabel: '18 Sep 2026',
          total: 860,
          trips: 8,
          hours: '5:15 hrs',
          basePay: 680,
          incentives: 110,
          tips: 70,
          chartData: [
            { label: '9 AM', amount: 110 },
            { label: '12 PM', amount: 220 },
            { label: '3 PM', amount: 190 },
            { label: '6 PM', amount: 230 },
            { label: '9 PM', amount: 110 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: 'Thu, 17 Sep',
          dateRangeHeaderLabel: '17 Sep 2026',
          total: 790,
          trips: 7,
          hours: '4:30 hrs',
          basePay: 620,
          incentives: 110,
          tips: 60,
          chartData: [
            { label: '9 AM', amount: 90 },
            { label: '12 PM', amount: 200 },
            { label: '3 PM', amount: 180 },
            { label: '6 PM', amount: 220 },
            { label: '9 PM', amount: 100 },
          ] as BarDataPoint[],
        },
      ];
      const idx = Math.min(Math.max(-periodOffset, 0), days.length - 1);
      return { ...days[idx], label: `${days[idx].dateRangePickerLabel} Earnings`, maxOffset: days.length - 1 };
    }

    if (selectedFilter === 'weekly') {
      const weeks = [
        {
          dateRangePickerLabel: '02 Dec - 08 Dec ▾',
          dateRangeHeaderLabel: '2 Dec - 8 Dec 2024',
          total: 2185.76,
          trips: 68,
          hours: '26:02 hrs',
          basePay: 1840,
          incentives: 215.76,
          tips: 130,
          chartData: [
            { label: '2', amount: 562 },
            { label: '3', amount: 524 },
            { label: '4', amount: 800 },
            { label: '5', amount: 297 },
            { label: '6', amount: 0 },
            { label: '7', amount: 0 },
            { label: '8', amount: 0 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: '25 Nov - 01 Dec ▾',
          dateRangeHeaderLabel: '25 Nov - 1 Dec 2024',
          total: 6450.0,
          trips: 48,
          hours: '32:15 hrs',
          basePay: 5120,
          incentives: 880,
          tips: 450,
          chartData: [
            { label: '25', amount: 860 },
            { label: '26', amount: 920 },
            { label: '27', amount: 1150 },
            { label: '28', amount: 980 },
            { label: '29', amount: 790 },
            { label: '30', amount: 802 },
            { label: '1', amount: 948 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: '18 Nov - 24 Nov ▾',
          dateRangeHeaderLabel: '18 Nov - 24 Nov 2024',
          total: 5890.0,
          trips: 44,
          hours: '29:40 hrs',
          basePay: 4680,
          incentives: 760,
          tips: 450,
          chartData: [
            { label: '18', amount: 750 },
            { label: '19', amount: 810 },
            { label: '20', amount: 950 },
            { label: '21', amount: 890 },
            { label: '22', amount: 780 },
            { label: '23', amount: 860 },
            { label: '24', amount: 850 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: '11 Nov - 17 Nov ▾',
          dateRangeHeaderLabel: '11 Nov - 17 Nov 2024',
          total: 6120.0,
          trips: 46,
          hours: '31:10 hrs',
          basePay: 4860,
          incentives: 810,
          tips: 450,
          chartData: [
            { label: '11', amount: 800 },
            { label: '12', amount: 890 },
            { label: '13', amount: 920 },
            { label: '14', amount: 910 },
            { label: '15', amount: 820 },
            { label: '16', amount: 880 },
            { label: '17', amount: 900 },
          ] as BarDataPoint[],
        },
      ];
      const idx = Math.min(Math.max(-periodOffset, 0), weeks.length - 1);
      return { ...weeks[idx], label: `${weeks[idx].dateRangePickerLabel} Earnings`, maxOffset: weeks.length - 1 };
    }

    if (selectedFilter === 'monthly') {
      const months = [
        {
          dateRangePickerLabel: '01 Sep - 30 Sep ▾',
          dateRangeHeaderLabel: '1 Sep - 30 Sep 2026',
          total: 28920,
          trips: 210,
          hours: '142:30 hrs',
          basePay: 23100,
          incentives: 3850,
          tips: 1970,
          chartData: [
            { label: 'W1', amount: 7200 },
            { label: 'W2', amount: 6850 },
            { label: 'W3', amount: 8420 },
            { label: 'W4', amount: 6450 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: '01 Aug - 31 Aug ▾',
          dateRangeHeaderLabel: '1 Aug - 31 Aug 2026',
          total: 27450,
          trips: 198,
          hours: '136:00 hrs',
          basePay: 21900,
          incentives: 3650,
          tips: 1900,
          chartData: [
            { label: 'W1', amount: 6800 },
            { label: 'W2', amount: 6950 },
            { label: 'W3', amount: 7100 },
            { label: 'W4', amount: 6600 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: '01 Jul - 31 Jul ▾',
          dateRangeHeaderLabel: '1 Jul - 31 Jul 2026',
          total: 29100,
          trips: 215,
          hours: '145:15 hrs',
          basePay: 23200,
          incentives: 3950,
          tips: 1950,
          chartData: [
            { label: 'W1', amount: 7100 },
            { label: 'W2', amount: 7400 },
            { label: 'W3', amount: 7300 },
            { label: 'W4', amount: 7300 },
          ] as BarDataPoint[],
        },
        {
          dateRangePickerLabel: '01 Jun - 30 Jun ▾',
          dateRangeHeaderLabel: '1 Jun - 30 Jun 2026',
          total: 26800,
          trips: 192,
          hours: '130:45 hrs',
          basePay: 21400,
          incentives: 3550,
          tips: 1850,
          chartData: [
            { label: 'W1', amount: 6500 },
            { label: 'W2', amount: 6700 },
            { label: 'W3', amount: 6900 },
            { label: 'W4', amount: 6700 },
          ] as BarDataPoint[],
        },
      ];
      const idx = Math.min(Math.max(-periodOffset, 0), months.length - 1);
      return { ...months[idx], label: `${months[idx].dateRangePickerLabel} Earnings`, maxOffset: months.length - 1 };
    }

    // lifetime
    const years = [
      {
        dateRangePickerLabel: 'All Time (2025 - 2026) ▾',
        dateRangeHeaderLabel: 'Jan 2025 - Sep 2026',
        total: 142850,
        trips: 1140,
        hours: '780:00 hrs',
        basePay: 116400,
        incentives: 18200,
        tips: 8250,
        chartData: [
          { label: 'Q1', amount: 24500 },
          { label: 'Q2', amount: 38200 },
          { label: 'Q3', amount: 41250 },
          { label: 'Q4', amount: 38900 },
        ] as BarDataPoint[],
      },
      {
        dateRangePickerLabel: 'Year 2025 ▾',
        dateRangeHeaderLabel: 'Jan 2025 - Dec 2025',
        total: 96400,
        trips: 770,
        hours: '525:00 hrs',
        basePay: 78500,
        incentives: 12400,
        tips: 5500,
        chartData: [
          { label: 'Q1', amount: 22000 },
          { label: 'Q2', amount: 24200 },
          { label: 'Q3', amount: 25100 },
          { label: 'Q4', amount: 25100 },
        ] as BarDataPoint[],
      },
    ];
    const idx = Math.min(Math.max(-periodOffset, 0), years.length - 1);
    return { ...years[idx], label: `${years[idx].dateRangePickerLabel} Earnings`, maxOffset: years.length - 1 };
  };

  const periodData = getPeriodData();
  const maxBarAmount = Math.max(...periodData.chartData.map((d) => d.amount), 100);

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-16 max-w-md md:max-w-2xl mx-auto">
      {/* 1. Filter Tabs: Today | Weekly | Monthly | Lifetime */}
      <div className="bg-white p-1 rounded-2xl border border-neutral-200/80 shadow-2xs grid grid-cols-4 gap-1 text-center text-xs font-bold">
        {(['daily', 'weekly', 'monthly', 'lifetime'] as PeriodFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`py-2 rounded-xl capitalize transition-all cursor-pointer ${
              selectedFilter === filter
                ? 'bg-[#009DE0] text-white shadow-xs font-black'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {filter === 'daily' ? 'Today' : filter}
          </button>
        ))}
      </div>

      {/* 2. Reference Card 1: Date Range & Big Earnings Header */}
      <div className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-xs text-center space-y-3">
        {/* Date Selector Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
          <span>{periodData.dateRangePickerLabel}</span>
        </div>

        {/* Amount with Left / Right Chevrons */}
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => setPeriodOffset((prev) => Math.max(prev - 1, -periodData.maxOffset))}
            disabled={periodOffset <= -periodData.maxOffset}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              periodOffset <= -periodData.maxOffset
                ? 'opacity-30 cursor-not-allowed text-neutral-400'
                : 'hover:bg-neutral-100 text-neutral-800 cursor-pointer active:scale-95'
            }`}
            title="Previous Period"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight tabular-nums">
            ₹{periodData.total.toLocaleString(undefined, { minimumFractionDigits: selectedFilter === 'weekly' ? 2 : 0, maximumFractionDigits: 2 })}
          </div>

          <button
            type="button"
            onClick={() => setPeriodOffset((prev) => Math.min(prev + 1, 0))}
            disabled={periodOffset >= 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              periodOffset >= 0
                ? 'opacity-30 cursor-not-allowed text-neutral-400'
                : 'hover:bg-neutral-100 text-neutral-800 cursor-pointer active:scale-95'
            }`}
            title="Next Period"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Compact & Professional Withdraw Action */}
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => setIsPayoutModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#009DE0] hover:bg-[#0082BD] active:scale-98 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Withdraw Payout</span>
          </button>
        </div>
      </div>

      {/* 3. Reference Card 2: Bar Chart & Dual Metric Box (Orders & Time on Order) */}
      <div className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
        {/* Date Range Sub-Heading */}
        <h3 className="text-sm font-bold text-neutral-900">
          {periodData.dateRangeHeaderLabel}
        </h3>

        {/* Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="flex items-end justify-between gap-2 h-28 px-1">
            {periodData.chartData.map((bar, idx) => {
              const heightPercent = bar.amount > 0 ? Math.max(12, Math.round((bar.amount / maxBarAmount) * 100)) : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                  {/* Amount on top of bar */}
                  <span
                    className={`text-[10px] font-bold mb-1 transition-opacity tabular-nums ${
                      bar.amount > 0 ? 'text-neutral-700 -rotate-30 sm:rotate-0 origin-bottom' : 'text-neutral-400'
                    }`}
                  >
                    ₹{bar.amount}
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[28px] bg-neutral-100 rounded-t-lg flex items-end h-20">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        bar.amount > 0 ? 'bg-gradient-to-t from-[#0082BD] to-[#009DE0]' : 'bg-transparent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* X-axis Day/Slot Label */}
                  <span className="text-[11px] font-semibold text-neutral-600 mt-2">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dashed Baseline */}
          <div className="border-b border-dashed border-neutral-300 w-full mt-1" />
        </div>

        {/* Reference Layout: Dual Metric Box (Orders & Time on Order) */}
        <div className="grid grid-cols-2 pt-3 border-t border-neutral-100">
          <div className="text-center pr-2">
            <div className="text-2xl sm:text-3xl font-black text-neutral-900">
              {periodData.trips}
            </div>
            <span className="text-xs font-semibold text-neutral-400 block mt-0.5">
              Orders
            </span>
          </div>

          <div className="text-center pl-2 border-l border-neutral-200">
            <div className="text-2xl sm:text-3xl font-black text-neutral-900">
              {periodData.hours}
            </div>
            <span className="text-xs font-semibold text-neutral-400 block mt-0.5">
              Time on order
            </span>
          </div>
        </div>
      </div>

      {/* 4. Reference Cards 3: Accordion Breakdown Cards */}
      <div className="space-y-2.5">
        {/* Order Earning (Expandable) */}
        <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
          <button
            type="button"
            onClick={() => setIsOrderEarningExpanded(!isOrderEarningExpanded)}
            className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-50/50 transition"
          >
            <span className="text-sm font-bold text-neutral-900">Order earning</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">
                ₹{periodData.basePay.toLocaleString(undefined, { minimumFractionDigits: selectedFilter === 'weekly' ? 2 : 0, maximumFractionDigits: 2 })}
              </span>
              {isOrderEarningExpanded ? (
                <ChevronUp className="w-4 h-4 text-neutral-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              )}
            </div>
          </button>

          {isOrderEarningExpanded && (
            <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-neutral-100 text-xs text-neutral-600 bg-neutral-50/40">
              <div className="flex justify-between">
                <span>Base trip pay ({periodData.trips} orders)</span>
                <span className="font-semibold text-neutral-900">
                  ₹{Math.round(periodData.basePay * 0.7).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Distance & Transit time pay</span>
                <span className="font-semibold text-neutral-900">
                  ₹{Math.round(periodData.basePay * 0.3).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Incentive */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between text-left">
          <span className="text-sm font-bold text-neutral-900">Incentive</span>
          <span className="text-sm font-bold text-neutral-900">
            ₹{periodData.incentives.toLocaleString(undefined, { minimumFractionDigits: selectedFilter === 'weekly' ? 2 : 0, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Other earnings (100% Direct Tips) */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between text-left">
          <span className="text-sm font-bold text-neutral-900">Other earnings</span>
          <span className="text-sm font-bold text-neutral-900">
            ₹{periodData.tips.toLocaleString(undefined, { minimumFractionDigits: selectedFilter === 'weekly' ? 2 : 0, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 5. Milestone & Daily Incentive Targets Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#009DE0]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">
              Trip Milestone Targets
            </h3>
          </div>
          <span className="text-xs text-emerald-600 font-bold">+₹180 Bonus Available</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-800">
              Today: {summary.todayTripsCompleted} of 12 Trips Done
            </span>
            <span className="text-neutral-500 font-medium">4 trips left for ₹180</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#009DE0] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (summary.todayTripsCompleted / 12) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6. Floating Cash & COD Reconciliation Card */}
      <FloatingCashCard />

      {/* 7. Statement Ledger & Audit Logs */}
      <div className="space-y-2.5 pt-1">
        <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider flex items-center justify-between">
          <span>Statement Ledger & Audit Logs</span>
          <span className="text-[11px] text-neutral-400 font-normal">Real-time</span>
        </h3>

        <div className="space-y-2">
          {ledger.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between text-xs hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    entry.category === 'CREDIT'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {entry.category === 'CREDIT' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <p className="font-bold text-neutral-900">{entry.title}</p>
                  <p className="text-neutral-500 text-[11px] truncate max-w-[170px] sm:max-w-xs">
                    {entry.description}
                  </p>
                  <span className="text-neutral-400 text-[10px]">
                    {entry.date} · {entry.timestamp}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-xs font-black block ${
                    entry.category === 'CREDIT' ? 'text-emerald-700' : 'text-neutral-900'
                  }`}
                >
                  {entry.category === 'CREDIT' ? '+' : '-'}₹{entry.amount}
                </span>
                <Badge
                  variant={
                    entry.status === 'CLEARED' || entry.status === 'RELEASED'
                      ? 'emerald'
                      : 'amber'
                  }
                  size="sm"
                >
                  {entry.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal Dialog Modal */}
      <PayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onSuccess={refreshEarnings}
      />
    </div>
  );
};

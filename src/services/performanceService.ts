/**
 * QCOM Performance Scorecard & Gamification Service
 * Module 6: Partner metrics (Acceptance Rate, Completion Rate, On-Time Rate, Rating) & Tier perks.
 */

import { PerformanceScorecard, PartnerTier } from '../types/delivery';
import { INITIAL_PERFORMANCE_SCORECARD } from './mockData';

class PerformanceService {
  private scorecard: PerformanceScorecard = { ...INITIAL_PERFORMANCE_SCORECARD };

  public getScorecard(): PerformanceScorecard {
    return { ...this.scorecard };
  }

  public getTierDetails(tier: PartnerTier): {
    title: string;
    description: string;
    perks: string[];
    slotAdvanceHours: number;
    instantFee: number;
  } {
    switch (tier) {
      case 'PLATINUM':
        return {
          title: 'Platinum Super Rider',
          description: 'Top 5% delivery partners across Bengaluru cluster.',
          perks: [
            '72-Hour Priority Shift Slot Access',
            'Sub-2s VIP Dispatch Priority on High Payout Orders',
            '0% Instant Withdrawal Platform Fee',
            'Max ₹3,500 COD Floating Cash Limit',
            'Priority 24/7 Telephone Helpdesk Bridge',
          ],
          slotAdvanceHours: 72,
          instantFee: 0,
        };
      case 'GOLD':
        return {
          title: 'Gold Star Partner',
          description: 'High reliability partner with >90% acceptance.',
          perks: [
            '48-Hour Early Shift Slot Access',
            'Priority Allocation during Peak Surges',
            '50% Off Instant Withdrawal Platform Fee',
            '₹3,000 Floating Cash Limit',
          ],
          slotAdvanceHours: 48,
          instantFee: 5,
        };
      case 'SILVER':
        return {
          title: 'Silver Active Partner',
          description: 'Consistent delivery performance.',
          perks: [
            '36-Hour Shift Slot Access',
            'Standard Allocation Priority',
            '₹2,500 Floating Cash Limit',
          ],
          slotAdvanceHours: 36,
          instantFee: 10,
        };
      case 'BRONZE':
      default:
        return {
          title: 'Bronze Entry Partner',
          description: 'Onboarding tier for new and standard couriers.',
          perks: [
            '24-Hour Shift Slot Access',
            'Standard Dispatch Priority',
            '₹2,000 Floating Cash Limit',
          ],
          slotAdvanceHours: 24,
          instantFee: 15,
        };
    }
  }
}

export const performanceService = new PerformanceService();

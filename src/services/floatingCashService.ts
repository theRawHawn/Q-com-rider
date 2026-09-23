/**
 * QCOM Floating Cash & COD Reconciliation Service
 * Tracks partner collected cash, enforces the ₹2,500 ceiling, and manages UPI deposits.
 */

import { FloatingCashSummary } from '../types/delivery';
import { INITIAL_PARTNER_PROFILE } from './mockData';

const CASH_STORAGE_KEY = 'qcom_floating_cash_state_v1';

class FloatingCashService {
  private collectedCash: number = 850.0;
  private readonly limit: number = 2500.0;
  private readonly warningThreshold: number = 2000.0;

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(CASH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.collectedCash = parsed.collectedCash ?? 850.0;
        return;
      }
    } catch (e) {
      console.warn('Error reading floating cash storage', e);
    }
    this.collectedCash = INITIAL_PARTNER_PROFILE.floatingCashBalance ?? 850.0;
  }

  private saveState() {
    try {
      localStorage.setItem(
        CASH_STORAGE_KEY,
        JSON.stringify({
          collectedCash: this.collectedCash,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Error saving floating cash state', e);
    }
  }

  public getSummary(): FloatingCashSummary {
    return {
      collectedCash: this.collectedCash,
      limit: this.limit,
      warningThreshold: this.warningThreshold,
      isBlocked: this.collectedCash >= this.limit,
      pendingDepositAmount: Math.max(0, this.collectedCash),
    };
  }

  public recordCodCollection(amount: number): FloatingCashSummary {
    this.collectedCash += amount;
    this.saveState();
    return this.getSummary();
  }

  public depositCashViaUpi(
    amount: number,
    upiVpa: string
  ): { success: boolean; newBalance: number; utr: string; message: string } {
    if (amount <= 0 || amount > this.collectedCash) {
      return {
        success: false,
        newBalance: this.collectedCash,
        utr: '',
        message: 'Invalid deposit amount specified.',
      };
    }

    const utr = `QCOM${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    this.collectedCash = Math.max(0, this.collectedCash - amount);
    this.saveState();

    return {
      success: true,
      newBalance: this.collectedCash,
      utr,
      message: `₹${amount.toFixed(2)} remitted successfully via UPI (${upiVpa}). Floating limit restored.`,
    };
  }
}

export const floatingCashService = new FloatingCashService();

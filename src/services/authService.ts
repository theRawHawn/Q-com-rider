/**
 * Partner Authentication Service
 */

import { DeliveryPartnerProfile } from '../types/delivery';
import { INITIAL_PARTNER_PROFILE } from './mockData';

class AuthService {
  private partner: DeliveryPartnerProfile;

  constructor() {
    let saved: DeliveryPartnerProfile | null = null;
    try {
      const raw = localStorage.getItem('qcom_rider_profile');
      if (raw) {
        saved = JSON.parse(raw);
      }
    } catch {
      // ignore JSON parse error
    }
    this.partner = saved || { ...INITIAL_PARTNER_PROFILE };
  }

  public getPartner(): DeliveryPartnerProfile {
    return this.partner;
  }

  public updateDutyStatus(isOnline: boolean, dutyStatus?: DeliveryPartnerProfile['dutyStatus']): DeliveryPartnerProfile {
    this.partner = {
      ...this.partner,
      isOnline,
      dutyStatus: isOnline ? (dutyStatus || 'idle_at_hub') : 'offline',
    };
    try {
      localStorage.setItem('qcom_rider_profile', JSON.stringify(this.partner));
    } catch {
      // ignore localStorage quota error
    }

    // Inform backend dispatch system of duty change
    try {
      fetch('/api/qrider/duty-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: this.partner.id,
          isOnline,
          dutyStatus: this.partner.dutyStatus,
        }),
      }).catch(() => {});
    } catch {
      // ignore network error
    }

    return this.partner;
  }

  public async loginWithOtp(phone: string, otp: string): Promise<DeliveryPartnerProfile> {
    // Simulated OTP verification
    if (otp === '1234' || otp.length === 4) {
      this.partner = {
        ...this.partner,
        phone,
        isOnline: true,
        dutyStatus: 'idle_at_hub',
      };
      return this.partner;
    }
    throw new Error('Invalid OTP. Please enter 1234.');
  }

  public logout(): void {
    this.partner = {
      ...this.partner,
      isOnline: false,
      dutyStatus: 'offline',
    };
  }
}

export const authService = new AuthService();

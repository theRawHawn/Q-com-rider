/**
 * Partner Authentication Service
 */

import { DeliveryPartnerProfile } from '../types/delivery';
import { INITIAL_PARTNER_PROFILE } from './mockData';

class AuthService {
  private partner: DeliveryPartnerProfile = { ...INITIAL_PARTNER_PROFILE };

  public getPartner(): DeliveryPartnerProfile {
    return this.partner;
  }

  public updateDutyStatus(isOnline: boolean, dutyStatus?: DeliveryPartnerProfile['dutyStatus']): DeliveryPartnerProfile {
    this.partner = {
      ...this.partner,
      isOnline,
      dutyStatus: isOnline ? (dutyStatus || 'idle_at_hub') : 'offline',
    };
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

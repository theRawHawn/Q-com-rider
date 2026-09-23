/**
 * Delivery Partner Profile & Vehicle Telemetry Service
 */

import { DeliveryPartnerProfile } from '../types/delivery';
import { INITIAL_PARTNER_PROFILE } from './mockData';

class ProfileService {
  private profile: DeliveryPartnerProfile = { ...INITIAL_PARTNER_PROFILE };

  public getProfile(): DeliveryPartnerProfile {
    return this.profile;
  }

  public updateVehicleInfo(vehicleType: DeliveryPartnerProfile['vehicleType'], vehicleModel: string, vehicleNumber: string): DeliveryPartnerProfile {
    this.profile = {
      ...this.profile,
      vehicleType,
      vehicleModel,
      vehicleNumber,
    };
    return this.profile;
  }

  public updateBankAccount(upiId: string, bankName: string, accountNumber: string, ifscCode: string): DeliveryPartnerProfile {
    this.profile = {
      ...this.profile,
      bankAccount: {
        accountHolderName: this.profile.name.toUpperCase(),
        accountNumber,
        ifscCode,
        bankName,
        upiId,
        isVerified: true,
      },
    };
    return this.profile;
  }
}

export const profileService = new ProfileService();

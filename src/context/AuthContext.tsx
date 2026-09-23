import React, { createContext, useContext, useState } from 'react';
import { DeliveryPartnerProfile } from '../types/delivery';
import { authService } from '../services/authService';

interface AuthContextType {
  partner: DeliveryPartnerProfile;
  toggleOnlineDuty: (isOnline: boolean) => void;
  updateProfile: (updated: Partial<DeliveryPartnerProfile>) => void;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partner, setPartner] = useState<DeliveryPartnerProfile>(() => authService.getPartner());

  const toggleOnlineDuty = (isOnline: boolean) => {
    const updated = authService.updateDutyStatus(isOnline);
    setPartner({ ...updated });
  };

  const updateProfile = (updated: Partial<DeliveryPartnerProfile>) => {
    setPartner((prev) => ({ ...prev, ...updated }));
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    const updated = await authService.loginWithOtp(phone, otp);
    setPartner({ ...updated });
  };

  const logout = () => {
    authService.logout();
    setPartner({ ...authService.getPartner() });
  };

  return (
    <AuthContext.Provider value={{ partner, toggleOnlineDuty, updateProfile, loginWithOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

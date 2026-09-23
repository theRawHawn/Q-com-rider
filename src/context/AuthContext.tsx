import React, { createContext, useContext, useState } from 'react';
import { DeliveryPartnerProfile } from '../types/delivery';
import { authService } from '../services/authService';
import { deliveryTaskService } from '../services/deliveryTaskService';
import { useToast } from './ToastContext';

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
  const { showToast } = useToast();

  const toggleOnlineDuty = (isOnline: boolean) => {
    const updated = authService.updateDutyStatus(isOnline);
    setPartner({ ...updated });

    const activeTask = deliveryTaskService.getActiveTask();
    if (activeTask) {
      if (!isOnline) {
        showToast(
          'Profile marked Offline: System will not assign any new orders after this delivery.',
          'info'
        );
      } else {
        showToast(
          'Profile marked Online: System will assign new orders after this delivery.',
          'success'
        );
      }
    } else {
      if (isOnline) {
        showToast('You are now Online and accepting deliveries.', 'success');
      } else {
        showToast('You are now Offline.', 'info');
      }
    }
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

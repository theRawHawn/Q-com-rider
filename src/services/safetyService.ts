/**
 * QCOM Safety, Telephony Masking & Dispute Service
 * Module 5: Emergency SOS, Masked IVR call simulation, and Unreachable customer exception flow.
 */

import { EmergencySosState, MaskedCallState, CustomerUnreachableState } from '../types/delivery';

class SafetyService {
  private sosState: EmergencySosState = {
    isTriggered: false,
    dispatchedServices: [],
  };

  private maskedCallState: MaskedCallState = {
    isOpen: false,
    recipientName: '',
    recipientRole: 'CUSTOMER',
    maskedNumber: '',
    status: 'CONNECTING',
  };

  private unreachableState: CustomerUnreachableState = {
    isActive: false,
    taskId: '',
    countdownSeconds: 300,
    attemptsCount: 0,
    canReturnToHub: false,
  };

  public getSosState(): EmergencySosState {
    return { ...this.sosState };
  }

  public triggerEmergencySos(lat: number, lng: number): EmergencySosState {
    const alertId = `SOS-${Date.now().toString().slice(-6)}`;
    this.sosState = {
      isTriggered: true,
      alertId,
      timestamp: new Date().toLocaleTimeString(),
      latitude: lat,
      longitude: lng,
      dispatchedServices: [
        'National Emergency Helpline (112)',
        'QCOM 24/7 Rapid Incident Command',
        'Area Fleet Operations Field Supervisor',
      ],
    };
    return { ...this.sosState };
  }

  public cancelEmergencySos(): EmergencySosState {
    this.sosState = {
      isTriggered: false,
      dispatchedServices: [],
    };
    return { ...this.sosState };
  }

  public getMaskedCallState(): MaskedCallState {
    return { ...this.maskedCallState };
  }

  public initiateMaskedCall(
    recipientName: string,
    role: 'CUSTOMER' | 'SELLER' | 'DISPATCH_SUPPORT',
    maskedNumber: string
  ): MaskedCallState {
    this.maskedCallState = {
      isOpen: true,
      recipientName,
      recipientRole: role,
      maskedNumber,
      status: 'CONNECTING',
    };
    return { ...this.maskedCallState };
  }

  public updateCallStatus(status: 'CONNECTING' | 'RINGING' | 'IN_CALL' | 'ENDED'): MaskedCallState {
    this.maskedCallState.status = status;
    if (status === 'ENDED') {
      setTimeout(() => {
        this.maskedCallState.isOpen = false;
      }, 1200);
    }
    return { ...this.maskedCallState };
  }

  public closeMaskedCall(): void {
    this.maskedCallState.isOpen = false;
    this.maskedCallState.status = 'ENDED';
  }

  public startCustomerUnreachable(taskId: string): CustomerUnreachableState {
    this.unreachableState = {
      isActive: true,
      taskId,
      countdownSeconds: 300, // 5 minutes
      attemptsCount: 1,
      canReturnToHub: false,
    };
    return { ...this.unreachableState };
  }

  public tickCustomerUnreachable(): CustomerUnreachableState {
    if (!this.unreachableState.isActive) return { ...this.unreachableState };

    const nextSeconds = Math.max(0, this.unreachableState.countdownSeconds - 1);
    this.unreachableState.countdownSeconds = nextSeconds;

    if (nextSeconds === 0) {
      this.unreachableState.canReturnToHub = true;
    }

    return { ...this.unreachableState };
  }

  public recordIvrCallAttempt(): CustomerUnreachableState {
    this.unreachableState.attemptsCount += 1;
    return { ...this.unreachableState };
  }

  public resetCustomerUnreachable(): void {
    this.unreachableState = {
      isActive: false,
      taskId: '',
      countdownSeconds: 300,
      attemptsCount: 0,
      canReturnToHub: false,
    };
  }

  public getCustomerUnreachableState(): CustomerUnreachableState {
    return { ...this.unreachableState };
  }
}

export const safetyService = new SafetyService();

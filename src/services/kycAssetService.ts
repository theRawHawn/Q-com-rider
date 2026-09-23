/**
 * QCOM KYC, Asset Tracking & Vehicle Profile Service
 * Module 1: Document validation status, vehicle profile constraints, asset serials, and training modules.
 */

import {
  KycDocumentDetail,
  VehicleConstraint,
  AssetAllocation,
  SafetyTrainingModule,
} from '../types/delivery';
import {
  INITIAL_KYC_DOCUMENTS,
  VEHICLE_CONSTRAINTS,
  INITIAL_ASSET_ALLOCATIONS,
  INITIAL_SAFETY_MODULES,
} from './mockData';

const ASSET_STORAGE_KEY = 'qcom_kyc_asset_state_v1';

class KycAssetService {
  private documents: KycDocumentDetail[] = [...INITIAL_KYC_DOCUMENTS];
  private vehicleConstraints: VehicleConstraint[] = [...VEHICLE_CONSTRAINTS];
  private assets: AssetAllocation[] = [...INITIAL_ASSET_ALLOCATIONS];
  private trainingModules: SafetyTrainingModule[] = [...INITIAL_SAFETY_MODULES];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(ASSET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.documents) this.documents = parsed.documents;
        if (parsed.assets) this.assets = parsed.assets;
        if (parsed.trainingModules) this.trainingModules = parsed.trainingModules;
      }
    } catch (e) {
      console.warn('Error reading KYC/Asset storage', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(
        ASSET_STORAGE_KEY,
        JSON.stringify({
          documents: this.documents,
          assets: this.assets,
          trainingModules: this.trainingModules,
        })
      );
    } catch (e) {
      console.warn('Error saving KYC/Asset state', e);
    }
  }

  public getDocuments(): KycDocumentDetail[] {
    return [...this.documents];
  }

  public getVehicleConstraints(): VehicleConstraint[] {
    return [...this.vehicleConstraints];
  }

  public getConstraintForVehicle(
    type: 'EV_SCOOTER' | 'PETROL_SCOOTER' | 'BICYCLE' | 'E_CARGO_3W'
  ): VehicleConstraint {
    return (
      this.vehicleConstraints.find((c) => c.vehicleType === type) ?? this.vehicleConstraints[0]
    );
  }

  public getAllocatedAssets(): AssetAllocation[] {
    return [...this.assets];
  }

  public getTrainingModules(): SafetyTrainingModule[] {
    return [...this.trainingModules];
  }

  public completeTrainingModule(moduleId: string, score: number): boolean {
    const idx = this.trainingModules.findIndex((m) => m.id === moduleId);
    if (idx !== -1) {
      this.trainingModules[idx] = {
        ...this.trainingModules[idx],
        isCompleted: true,
        scorePercent: score,
        completedAt: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };
      this.saveState();
      return true;
    }
    return false;
  }
}

export const kycAssetService = new KycAssetService();

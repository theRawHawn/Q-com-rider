/**
 * Delivery Task Service
 * Handles active order lifecycle state transitions, broadcast tasks, and OTP verification.
 */

import { DeliveryTask, OrderStatus, ProofOfHandover } from '../types/delivery';
import { INITIAL_ACTIVE_TASK, UNASSIGNED_BROADCAST_TASKS, INITIAL_COMPLETED_TASKS } from './mockData';

class DeliveryTaskService {
  private activeTask: DeliveryTask | null = null;
  private broadcastTasks: DeliveryTask[] = [...UNASSIGNED_BROADCAST_TASKS];
  private completedTasksHistory: DeliveryTask[] = [...INITIAL_COMPLETED_TASKS];

  public getActiveTask(): DeliveryTask | null {
    return this.activeTask;
  }

  public getBroadcastTasks(): DeliveryTask[] {
    return this.broadcastTasks;
  }

  public getCompletedHistory(): DeliveryTask[] {
    return this.completedTasksHistory;
  }

  /**
   * Sets the verified pickup photo proof (store handover)
   */
  public setPickupProof(proof: ProofOfHandover): void {
    if (!this.activeTask) return;
    this.activeTask = {
      ...this.activeTask,
      pickupProof: proof,
    };
  }

  /**
   * Sets the verified delivery photo proof (customer handover)
   */
  public setDeliveryProof(proof: ProofOfHandover): void {
    if (!this.activeTask) return;
    this.activeTask = {
      ...this.activeTask,
      deliveryProof: proof,
    };
  }

  /**
   * Accepts a broadcast task
   * NEW BACKEND/API REQUIREMENT: POST /api/delivery/tasks/:id/accept
   */
  public acceptBroadcastTask(taskId: string): DeliveryTask {
    const taskIndex = this.broadcastTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task no longer available or already accepted by another partner.');
    }

    const acceptedTask = {
      ...this.broadcastTasks[taskIndex],
      orderStatus: 'packed' as OrderStatus,
      assignedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    };

    this.broadcastTasks.splice(taskIndex, 1);
    this.activeTask = acceptedTask;
    return acceptedTask;
  }

  /**
   * Transition order status (e.g. 'packed' -> 'out_for_delivery' -> 'arriving' -> 'delivered')
   */
  public updateTaskStatus(newStatus: OrderStatus, proof?: ProofOfHandover): DeliveryTask {
    if (!this.activeTask) {
      throw new Error('No active delivery task to update.');
    }

    const now = new Date().toISOString();
    let updatedTask: DeliveryTask = {
      ...this.activeTask,
      orderStatus: newStatus,
    };

    if (newStatus === 'out_for_delivery') {
      updatedTask.pickedUpAt = now;
      if (proof) {
        updatedTask.pickupProof = proof;
      }
    } else if (newStatus === 'delivered') {
      updatedTask.deliveredAt = now;
      if (proof) {
        updatedTask.deliveryProof = proof;
      }
      this.completedTasksHistory.unshift(updatedTask);
      this.activeTask = null;
    } else {
      this.activeTask = updatedTask;
    }

    return updatedTask;
  }

  /**
   * Verifies 4-digit Customer Delivery OTP
   * NEW BACKEND/API REQUIREMENT: POST /api/delivery/orders/:id/verify-otp
   */
  public verifyDeliveryOtp(enteredOtp: string, proof?: ProofOfHandover): boolean {
    if (!this.activeTask) {
      throw new Error('No active task to verify OTP for.');
    }

    if (enteredOtp.trim() === this.activeTask.deliveryOtp.trim()) {
      this.updateTaskStatus('delivered', proof);
      return true;
    }
    return false;
  }

  /**
   * Verifies delivery via contactless photo proof
   */
  public verifyContactlessDelivery(proof?: ProofOfHandover, photoNote?: string): boolean {
    if (!this.activeTask) {
      throw new Error('No active task to complete.');
    }
    this.updateTaskStatus('delivered', proof);
    return true;
  }

  /**
   * Verifies Cash-on-Delivery payment handover
   */
  public recordCodDelivery(amountCollected: number, proof?: ProofOfHandover): boolean {
    if (!this.activeTask) {
      throw new Error('No active task to complete.');
    }
    this.updateTaskStatus('delivered', proof);
    return true;
  }

  /**
   * Handles customer unreachable return trip completion
   */
  public returnOrderToHub(): DeliveryTask {
    if (!this.activeTask) {
      throw new Error('No active task to return.');
    }
    const returnedTask: DeliveryTask = {
      ...this.activeTask,
      orderStatus: 'cancelled',
      deliveredAt: new Date().toISOString(),
    };
    this.completedTasksHistory.unshift(returnedTask);
    this.activeTask = null;
    return returnedTask;
  }

  /**
   * Simulates new broadcast arrival
   */
  public addMockBroadcast(task: DeliveryTask): void {
    this.broadcastTasks.unshift(task);
  }
}

export const deliveryTaskService = new DeliveryTaskService();

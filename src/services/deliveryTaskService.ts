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
      orderStatus: 'picking' as OrderStatus,
      assignedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    };

    this.broadcastTasks.splice(taskIndex, 1);
    this.activeTask = acceptedTask;
    return acceptedTask;
  }

  /**
   * Generates a fresh incoming delivery order for continuous workflow
   */
  public generateIncomingTask(): DeliveryTask {
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const orderNum = `#Q${randomId}`;
    const newTask: DeliveryTask = {
      id: `TASK-${randomId}`,
      orderId: `ORD-${randomId}`,
      orderNumber: orderNum,
      orderStatus: 'picking' as OrderStatus,
      placedAt: 'Just now',
      packedAt: 'Ready at store',
      estimatedDeliveryAt: '15 mins from now',
      deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      pickupToken: `PK-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [
        {
          productId: `PROD-${Math.floor(100 + Math.random() * 900)}`,
          productName: 'Polycab 4.0 sq mm Multi-strand Copper Cable',
          brand: 'Polycab',
          quantity: 1,
          unit: 'Coil (90m)',
          price: 2450,
          binLocation: 'Aisle 3 - Bay 02',
        },
        {
          productId: `PROD-${Math.floor(100 + Math.random() * 900)}`,
          productName: 'Anchor Roma 6A 1-Way Modular Switch (White)',
          brand: 'Anchor',
          quantity: 10,
          unit: 'Pieces',
          price: 35,
          binLocation: 'Aisle 1 - Box 12',
        },
      ],
      itemCount: 11,
      orderTotalAmount: 2800,
      paymentMethod: 'Instant UPI',
      paymentStatus: 'PAID',
      isUrgentJobsite: true,
      pickup: {
        sellerId: `STORE-${Math.floor(100 + Math.random() * 900)}`,
        storeName: 'Indiranagar Electric & Hardware Hub',
        hubType: 'Partner Retail Hardware Hub',
        phone: '+91 98765 11223',
        maskedPhone: '+91 98XXX-XX223 (QCOM Proxy)',
        address: '100 Feet Road, 6th Main, Indiranagar',
        locality: 'Indiranagar, Bengaluru',
        coordinates: { lat: 12.9784, lng: 77.6408 },
        accessibleEntranceCoords: { lat: 12.9786, lng: 77.6410 },
        pickupNotes: 'Loading bay entrance on the right side counter.',
        basePrepMins: 3,
        isPacked: true,
      },
      drop: {
        customerName: 'Anand Varma (Project Engineer)',
        customerPhone: '+91 98450 44556',
        maskedPhone: '+91 98XXX-XX556 (QCOM IVR Proxy)',
        isPhoneMasked: true,
        accountType: 'contractor',
        businessName: 'Skyline Buildtech Solutions',
        siteContactName: 'Anand Varma',
        sitePhone: '+91 98450 44556',
        address: 'Tower 2, Plot 18, Domlur Layout',
        locality: 'Domlur, Bengaluru',
        landmark: 'Near Embassy Golf Links Tech Park',
        floorUnit: '4th Floor Fitting Office',
        dropoffInstructions: 'Security check at Gate 1. Service lift available.',
        coordinates: { lat: 12.9610, lng: 77.6380 },
        accessibleEntranceCoords: { lat: 12.9612, lng: 77.6382 },
      },
      payoutBreakdown: {
        basePay: 40,
        distancePay: 32,
        transitTimePay: 10,
        surgeBonus: 20,
        multiPickupBonus: 0,
        customerTip: 25,
        totalPayout: 127,
      },
      route: {
        distanceMeters: 2800,
        distanceKm: 2.8,
        estimatedDurationMins: 9,
        formattedEta: '9 mins',
        instructions: [
          {
            text: 'Head south on 100 Feet Road towards Domlur',
            distanceMeters: 1200,
            durationSeconds: 240,
            location: [12.9784, 77.6408],
          },
        ],
        polyline: [
          [12.9784, 77.6408],
          [12.9690, 77.6390],
          [12.9610, 77.6380],
        ],
      },
    };

    this.broadcastTasks.unshift(newTask);
    return newTask;
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

    if (newStatus === 'delivered') {
      updatedTask.deliveredAt = now;
      if (proof) {
        updatedTask.deliveryProof = proof;
      }
      this.completedTasksHistory.unshift(updatedTask);
      this.activeTask = null;
    } else {
      if (newStatus === 'out_for_delivery') {
        updatedTask.pickedUpAt = now;
        if (proof) {
          updatedTask.pickupProof = proof;
        }
      }
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

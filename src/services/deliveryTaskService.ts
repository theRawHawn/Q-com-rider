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

    const storeHubs = [
      {
        storeName: 'Indiranagar QuickHub & Tools',
        address: '100 Feet Road, 6th Main, Indiranagar',
        locality: 'Indiranagar, Bengaluru',
        phone: '+91 98765 11223',
        maskedPhone: '+91 98XXX-XX223 (QCOM Proxy)',
        coords: { lat: 12.9784, lng: 77.6408 },
        notes: 'Express dispatch bay at Counter #2.',
      },
      {
        storeName: 'Koramangala SuperMart Hub',
        address: '80 Feet Road, 4th Block, Koramangala',
        locality: 'Koramangala, Bengaluru',
        phone: '+91 98765 22334',
        maskedPhone: '+91 98XXX-XX334 (QCOM Proxy)',
        coords: { lat: 12.9352, lng: 77.6245 },
        notes: 'Priority rider pickup window at rear gate.',
      },
      {
        storeName: 'HSR Layout Fast Commerce DarkStore',
        address: '27th Main, Sector 1, HSR Layout',
        locality: 'HSR Layout, Bengaluru',
        phone: '+91 98765 33445',
        maskedPhone: '+91 98XXX-XX445 (QCOM Proxy)',
        coords: { lat: 12.9116, lng: 77.6472 },
        notes: 'Ready bagged orders on Shelf A-4.',
      },
      {
        storeName: 'Domlur Express Mart & Supplies',
        address: 'Intermediate Ring Road, Domlur',
        locality: 'Domlur, Bengaluru',
        phone: '+91 98765 44556',
        maskedPhone: '+91 98XXX-XX556 (QCOM Proxy)',
        coords: { lat: 12.9609, lng: 77.6387 },
        notes: 'Direct ramp access for delivery 2-wheelers.',
      },
    ];

    const customerDropoffs = [
      {
        name: 'Rohan Deshmukh (Flat 402)',
        phone: '+91 98450 11990',
        maskedPhone: '+91 98XXX-XX990 (QCOM Proxy)',
        address: 'Prestige Ozone, Whitefield Main Road',
        locality: 'Whitefield, Bengaluru',
        landmark: 'Near Forum Shantiniketan Mall',
        instructions: 'Call at intercom 402 upon arrival.',
        coords: { lat: 12.9698, lng: 77.7499 },
      },
      {
        name: 'Priya Sundaram (Site Supervisor)',
        phone: '+91 98450 22880',
        maskedPhone: '+91 98XXX-XX880 (QCOM Proxy)',
        address: 'Skyline Terrace, 12th Cross, Indiranagar',
        locality: 'Indiranagar, Bengaluru',
        landmark: 'Opposite Defence Colony Park',
        instructions: 'Hand over at security desk or 3rd floor office.',
        coords: { lat: 12.9735, lng: 77.6462 },
      },
      {
        name: 'Vikram Mehta (Tech Lead)',
        phone: '+91 98450 33770',
        maskedPhone: '+91 98XXX-XX770 (QCOM Proxy)',
        address: 'Sobha Dahlia, Bellandur Outer Ring Road',
        locality: 'Bellandur, Bengaluru',
        landmark: 'Behind Ecospace Tech Park',
        instructions: 'Doorbell is active. Please leave at door if contactless.',
        coords: { lat: 12.9260, lng: 77.6762 },
      },
      {
        name: 'Sunil Rao (Project Manager)',
        phone: '+91 98450 44660',
        maskedPhone: '+91 98XXX-XX660 (QCOM Proxy)',
        address: 'Tower 3, Brigade Gateway, Malleshwaram',
        locality: 'Malleshwaram, Bengaluru',
        landmark: 'Next to Orion Mall Gate 2',
        instructions: 'Use Service Elevator B to 14th floor.',
        coords: { lat: 13.0112, lng: 77.5550 },
      },
    ];

    const store = storeHubs[Math.floor(Math.random() * storeHubs.length)];
    const customer = customerDropoffs[Math.floor(Math.random() * customerDropoffs.length)];
    const distKm = parseFloat((1.5 + Math.random() * 3.8).toFixed(1));
    const estTimeMins = Math.round(distKm * 3.2 + 4);
    const basePay = 40;
    const distancePay = Math.round(distKm * 12);
    const surgeBonus = Math.random() > 0.4 ? 20 : 0;
    const customerTip = Math.random() > 0.5 ? 20 : 0;
    const totalPayout = basePay + distancePay + surgeBonus + customerTip;

    const newTask: DeliveryTask = {
      id: `TASK-${randomId}`,
      orderId: `ORD-${randomId}`,
      orderNumber: orderNum,
      orderStatus: 'picking' as OrderStatus,
      placedAt: 'Just now',
      packedAt: 'Ready at store',
      estimatedDeliveryAt: `${estTimeMins} mins from now`,
      deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      pickupToken: `PK-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [
        {
          productId: `PROD-${Math.floor(100 + Math.random() * 900)}`,
          productName: 'Fast-Moving Electrical Pack & Multi-Core Wiring',
          brand: 'Anchor / Polycab',
          quantity: 2,
          unit: 'Pack',
          price: 1850,
          binLocation: 'Aisle 2 - Bay 04',
        },
      ],
      itemCount: 2,
      orderTotalAmount: 1850,
      paymentMethod: 'Instant UPI',
      paymentStatus: 'PAID',
      isUrgentJobsite: true,
      pickup: {
        sellerId: `STORE-${Math.floor(100 + Math.random() * 900)}`,
        storeName: store.storeName,
        hubType: 'Partner Retail Hub',
        phone: store.phone,
        maskedPhone: store.maskedPhone,
        address: store.address,
        locality: store.locality,
        coordinates: store.coords,
        accessibleEntranceCoords: {
          lat: store.coords.lat + 0.0002,
          lng: store.coords.lng + 0.0002,
        },
        pickupNotes: store.notes,
        basePrepMins: 2,
        isPacked: true,
      },
      drop: {
        customerName: customer.name,
        customerPhone: customer.phone,
        maskedPhone: customer.maskedPhone,
        isPhoneMasked: true,
        accountType: 'contractor',
        businessName: 'Residential Delivery',
        siteContactName: customer.name,
        sitePhone: customer.phone,
        address: customer.address,
        locality: customer.locality,
        landmark: customer.landmark,
        floorUnit: 'Doorstep',
        dropoffInstructions: customer.instructions,
        coordinates: customer.coords,
        accessibleEntranceCoords: {
          lat: customer.coords.lat + 0.0002,
          lng: customer.coords.lng + 0.0002,
        },
      },
      payoutBreakdown: {
        basePay,
        distancePay,
        transitTimePay: 10,
        surgeBonus,
        multiPickupBonus: 0,
        customerTip,
        totalPayout,
      },
      route: {
        distanceMeters: Math.round(distKm * 1000),
        distanceKm: distKm,
        estimatedDurationMins: estTimeMins,
        formattedEta: `${estTimeMins} mins`,
        instructions: [
          {
            text: `Head towards ${customer.locality}`,
            distanceMeters: Math.round(distKm * 1000),
            durationSeconds: estTimeMins * 60,
            location: [store.coords.lat, store.coords.lng],
          },
        ],
        polyline: [
          [store.coords.lat, store.coords.lng],
          [
            (store.coords.lat + customer.coords.lat) / 2 + 0.002,
            (store.coords.lng + customer.coords.lng) / 2 - 0.002,
          ],
          [customer.coords.lat, customer.coords.lng],
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

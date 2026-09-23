/**
 * In-memory Mongoose-compatible database models for Pentest Verification
 * Supports findById, findByIdAndUpdate, findOneAndUpdate, and populate
 */

const ordersStore = new Map([
  [
    'ord_9901',
    {
      _id: 'ord_9901',
      assignedCourier: 'rider_assigned_99', // Rider B assigned
      customerName: 'Ananya Sharma',
      customerPhone: '+91-9876543210',
      deliveryGateCode: '#4029',
      status: 'out_for_delivery',
      totalAmount: 1450.0,
      otpVerified: true,
      delivered: true,
      dropLocation: { lat: 12.9352, lng: 77.6245 },
    },
  ],
  [
    'ord_8821',
    {
      _id: 'ord_8821',
      assignedCourier: 'rider_77',
      customerName: 'Rahul Sharma',
      customerPhone: '+91-9812345678',
      deliveryGateCode: '#1082',
      status: 'delivered',
      totalAmount: 1450.0,
      otpVerified: true,
      delivered: true,
      dropLocation: { lat: 12.936, lng: 77.625 },
    },
  ],
]);

const tripsStore = new Map([
  [
    'trip_8821',
    {
      _id: 'trip_8821',
      orderId: 'ord_8821',
      riderId: 'rider_77',
      codReconciled: false,
      amountDepositedToHub: 0,
      order: {
        _id: 'ord_8821',
        totalAmount: 1450.0,
        otpVerified: true,
        delivered: true,
      },
    },
  ],
]);

const dispatchBatchesStore = new Map([
  [
    'batch_surge_99',
    {
      _id: 'batch_surge_99',
      assignedRiderId: null, // Unassigned originally
      status: 'AVAILABLE',
      payout: 420.0,
      orders: ['ord_9901'],
    },
  ],
]);

// Atomic lock simulator for concurrency race condition prevention
const batchLocks = new Set();

const Order = {
  async findById(id) {
    const order = ordersStore.get(id);
    return order ? { ...order } : null;
  },
  async findByIdAndUpdate(id, updates) {
    const order = ordersStore.get(id);
    if (!order) return null;
    const updated = { ...order, ...updates };
    ordersStore.set(id, updated);
    return updated;
  },
};

const Trip = {
  async findById(id) {
    const trip = tripsStore.get(id);
    if (!trip) return null;
    return {
      ...trip,
      populate: async function (field) {
        if (field === 'order') {
          const ord = ordersStore.get(this.orderId) || this.order;
          this.order = ord;
        }
        return this;
      },
    };
  },
  async findByIdAndUpdate(id, updates) {
    const trip = tripsStore.get(id);
    if (!trip) return null;
    const updated = { ...trip, ...updates };
    tripsStore.set(id, updated);
    return updated;
  },
};

const DispatchBatch = {
  async findById(id) {
    const batch = dispatchBatchesStore.get(id);
    return batch ? { ...batch } : null;
  },
  /**
   * Atomic Compare-and-Swap (CAS) implementation
   * Remediates CWE-362 (Race Condition)
   */
  async findOneAndUpdate(query, update, options = {}) {
    const id = query._id;
    if (batchLocks.has(id)) {
      // Concurrency lock conflict
      return null;
    }

    try {
      batchLocks.add(id);
      const batch = dispatchBatchesStore.get(id);
      if (!batch) return null;

      // Enforce atomic CAS condition
      if (query.assignedRiderId !== undefined && batch.assignedRiderId !== query.assignedRiderId) {
        return null;
      }

      const updated = { ...batch, ...update };
      dispatchBatchesStore.set(id, updated);
      return options.new ? updated : batch;
    } finally {
      batchLocks.delete(id);
    }
  },
};

module.exports = {
  Order,
  Trip,
  DispatchBatch,
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeliveryTask, OrderStatus, ProofOfHandover } from '../types/delivery';
import { deliveryTaskService } from '../services/deliveryTaskService';
import { earningsService } from '../services/earningsService';
import { floatingCashService } from '../services/floatingCashService';
import { useToast } from './ToastContext';

interface TaskContextType {
  activeTask: DeliveryTask | null;
  broadcastTasks: DeliveryTask[];
  completedHistory: DeliveryTask[];
  acceptBroadcastTask: (taskId: string) => void;
  updateTaskStatus: (newStatus: OrderStatus, proof?: ProofOfHandover) => void;
  setPickupProof: (proof: ProofOfHandover) => void;
  setDeliveryProof: (proof: ProofOfHandover) => void;
  verifyDeliveryOtp: (enteredOtp: string, proof?: ProofOfHandover) => boolean;
  verifyContactlessDelivery: (proof?: ProofOfHandover, photoNote?: string) => boolean;
  recordCodDelivery: (amountCollected: number, proof?: ProofOfHandover) => boolean;
  returnOrderToHub: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useState<DeliveryTask | null>(() => deliveryTaskService.getActiveTask());
  const [broadcastTasks, setBroadcastTasks] = useState<DeliveryTask[]>(() => deliveryTaskService.getBroadcastTasks());
  const [completedHistory, setCompletedHistory] = useState<DeliveryTask[]>(() => deliveryTaskService.getCompletedHistory());
  const { showToast } = useToast();

  const refreshState = () => {
    setActiveTask(deliveryTaskService.getActiveTask());
    setBroadcastTasks([...deliveryTaskService.getBroadcastTasks()]);
    setCompletedHistory([...deliveryTaskService.getCompletedHistory()]);
  };

  const acceptBroadcastTask = (taskId: string) => {
    try {
      const task = deliveryTaskService.acceptBroadcastTask(taskId);
      refreshState();
      showToast(`Accepted task ${task.orderNumber}! Navigate to ${task.pickup.storeName}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to accept task', 'error');
    }
  };

  const setPickupProof = (proof: ProofOfHandover) => {
    deliveryTaskService.setPickupProof(proof);
    refreshState();
    showToast('Store pickup photo proof recorded in audit vault.', 'success');
  };

  const setDeliveryProof = (proof: ProofOfHandover) => {
    deliveryTaskService.setDeliveryProof(proof);
    refreshState();
    showToast('Customer delivery photo proof recorded in audit vault.', 'success');
  };

  const updateTaskStatus = (newStatus: OrderStatus, proof?: ProofOfHandover) => {
    try {
      const task = deliveryTaskService.updateTaskStatus(newStatus, proof);
      refreshState();
      if (newStatus === 'out_for_delivery') {
        showToast('Order Picked Up! Proceeding to Customer Jobsite.', 'info');
      } else if (newStatus === 'arriving') {
        showToast('Arrived at Customer Location. Requesting Delivery OTP.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const scheduleNextOrderAssignment = () => {
    setTimeout(() => {
      const remaining = deliveryTaskService.getBroadcastTasks();
      let nextTask: DeliveryTask;
      if (remaining.length > 0) {
        nextTask = deliveryTaskService.acceptBroadcastTask(remaining[0].id);
      } else {
        const fresh = deliveryTaskService.generateIncomingTask();
        nextTask = deliveryTaskService.acceptBroadcastTask(fresh.id);
      }
      refreshState();
      showToast(`New order assigned: ${nextTask.orderNumber}! Navigate to pickup.`, 'info');
    }, 2000);
  };

  const verifyDeliveryOtp = (enteredOtp: string, proof?: ProofOfHandover): boolean => {
    if (!activeTask) return false;
    const task = activeTask;
    const success = deliveryTaskService.verifyDeliveryOtp(enteredOtp, proof);
    if (success) {
      earningsService.creditTripEarnings(
        task.orderNumber,
        task.payoutBreakdown.totalPayout,
        task.payoutBreakdown.customerTip
      );
      refreshState();
      showToast(`Delivery verified! ₹${task.payoutBreakdown.totalPayout} credited to wallet.`, 'success');
      scheduleNextOrderAssignment();
      return true;
    } else {
      showToast('Incorrect OTP. Please ask customer for 4-digit code.', 'error');
      return false;
    }
  };

  const verifyContactlessDelivery = (proof?: ProofOfHandover, photoNote?: string): boolean => {
    if (!activeTask) return false;
    const task = activeTask;
    const success = deliveryTaskService.verifyContactlessDelivery(proof, photoNote);
    if (success) {
      earningsService.creditTripEarnings(
        task.orderNumber,
        task.payoutBreakdown.totalPayout,
        task.payoutBreakdown.customerTip
      );
      refreshState();
      showToast(`Contactless proof verified! ₹${task.payoutBreakdown.totalPayout} credited.`, 'success');
      scheduleNextOrderAssignment();
      return true;
    }
    return false;
  };

  const recordCodDelivery = (amountCollected: number, proof?: ProofOfHandover): boolean => {
    if (!activeTask) return false;
    const task = activeTask;
    const success = deliveryTaskService.recordCodDelivery(amountCollected, proof);
    if (success) {
      floatingCashService.recordCodCollection(amountCollected);
      earningsService.creditTripEarnings(
        task.orderNumber,
        task.payoutBreakdown.totalPayout,
        task.payoutBreakdown.customerTip
      );
      refreshState();
      showToast(`COD ₹${amountCollected} collected. ₹${task.payoutBreakdown.totalPayout} payout credited.`, 'success');
      scheduleNextOrderAssignment();
      return true;
    }
    return false;
  };

  const returnOrderToHub = () => {
    if (!activeTask) return;
    const task = activeTask;
    deliveryTaskService.returnOrderToHub();
    // Compensate courier full payout + ₹25 return trip fee
    const returnPayout = task.payoutBreakdown.totalPayout + 25;
    earningsService.creditTripEarnings(task.orderNumber, returnPayout, 0);
    refreshState();
    showToast(`Order returned to store. Full fare + ₹25 return compensation credited.`, 'info');
  };

  return (
    <TaskContext.Provider
      value={{
        activeTask,
        broadcastTasks,
        completedHistory,
        acceptBroadcastTask,
        updateTaskStatus,
        setPickupProof,
        setDeliveryProof,
        verifyDeliveryOtp,
        verifyContactlessDelivery,
        recordCodDelivery,
        returnOrderToHub,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

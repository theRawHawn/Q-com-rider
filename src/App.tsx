import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { TopHeader } from './components/layout/TopHeader';
import { MobileBottomNav, NavTab } from './components/layout/MobileBottomNav';
import { SOSWidget } from './components/layout/SOSWidget';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { RiderSupportModal } from './components/support/RiderSupportModal';
import { LocationPickerModal } from './components/location/LocationPickerModal';
import { HomeOverview } from './components/home/HomeOverview';
import { ShiftBookingView } from './components/shifts/ShiftBookingView';
import { ActiveDeliveryWorkflow } from './components/task/ActiveDeliveryWorkflow';
import { EarningsView } from './components/earnings/EarningsView';
import { DeliveryHistoryView } from './components/history/DeliveryHistoryView';
import { ProfileView } from './components/profile/ProfileView';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-900 flex justify-center antialiased selection:bg-[#009DE0] selection:text-white">
      {/* Mobile-Only App Shell */}
      <div className="w-full max-w-md min-h-screen bg-[#F7F9FA] text-[#141414] font-sans flex flex-col relative shadow-2xl overflow-x-hidden">
        {/* Sticky Top Header */}
        <TopHeader
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenLocation={() => setIsLocationOpen(true)}
        />

        {/* View Content Area */}
        <main className="flex-1 min-w-0 p-3.5 pb-24 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeOverview onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'shifts' && <ShiftBookingView />}

          {activeTab === 'navigation' && <ActiveDeliveryWorkflow />}

          {activeTab === 'earnings' && <EarningsView />}

          {activeTab === 'history' && <DeliveryHistoryView />}

          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />
      </div>

      {/* Rider Support Modal */}
      <RiderSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onTriggerSos={() => setIsSosOpen(true)}
      />

      {/* Rider Location Verification Modal */}
      <LocationPickerModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      {/* Safety Emergency SOS Modal */}
      <SOSWidget isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />

      {/* Notifications Drawer Sheet */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TaskProvider>
          <MainAppContent />
        </TaskProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

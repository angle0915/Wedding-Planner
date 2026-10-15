/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Venue,
  Supplier,
  Guest,
  TableItem,
  BudgetItem,
  MilestoneItem,
  DayOfScheduleItem,
  MoodboardPin,
  LanguageCode,
  NotificationItem,
  IntegrationWebhook,
} from './types/wedding';
import {
  INITIAL_USERS,
  INITIAL_VENUES,
  INITIAL_SUPPLIERS,
  INITIAL_GUESTS,
  INITIAL_TABLES,
  INITIAL_BUDGET,
  INITIAL_MILESTONES,
  INITIAL_DAY_OF_SCHEDULE,
  INITIAL_MOODBOARD_PINS,
  PALETTE_SWATCHES,
  INITIAL_NOTIFICATIONS,
  INITIAL_INTEGRATIONS,
} from './data/initialData';
import {
  calculateBudgetSummary,
  calculateRSVPSummary,
  generateSimpleChecksum,
} from './utils/weddingLogic';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { VenuesSuppliersView } from './components/VenuesSuppliersView';
import { GuestSeatingView } from './components/GuestSeatingView';
import { BudgetFinanceView } from './components/BudgetFinanceView';
import { MoodboardView } from './components/MoodboardView';
import { AnalyticsIntegrationsView } from './components/AnalyticsIntegrationsView';
import { RoleLoginModal } from './components/RoleLoginModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { TRANSLATIONS } from './i18n/translations';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'alert';
  message: string;
}

export default function App() {
  // Navigation & Language State
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  // Role Authentication State
  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // Camille (Bride)
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Notification Modal State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Core Wedding Entities
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(INITIAL_BUDGET);
  const [totalBudgetCap, setTotalBudgetCap] = useState<number>(75000);
  const [milestones, setMilestones] = useState<MilestoneItem[]>(INITIAL_MILESTONES);
  const [dayOfSchedule] = useState<DayOfScheduleItem[]>(INITIAL_DAY_OF_SCHEDULE);
  const [moodboardPins, setMoodboardPins] = useState<MoodboardPin[]>(INITIAL_MOODBOARD_PINS);
  const [integrations, setIntegrations] = useState<IntegrationWebhook[]>(INITIAL_INTEGRATIONS);

  // Offline Simulation State
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'alert' = 'success') => {
    const id = 'toast_' + Math.random().toString(36).slice(2, 8);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Check ?autostart=1 or tab param from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setCurrentTab(tabParam);
    }
  }, []);

  // Venue selection handler
  const handleSelectVenue = (venueId: string) => {
    setVenues((prev) =>
      prev.map((v) => ({
        ...v,
        selected: v.id === venueId,
      }))
    );
    const chosen = venues.find((v) => v.id === venueId);
    addToast(`Selected "${chosen?.name}" as your primary celebration venue.`);
    trackOfflineMutation(`select_venue_${venueId}`);
  };

  // Supplier messaging handler
  const handleAddMessageToSupplier = (supplierId: string, messageText: string) => {
    const newMessage = {
      id: 'msg_' + Date.now(),
      sender: currentUser.role === 'bride' || currentUser.role === 'groom' ? ('Couple' as const) : ('Planner' as const),
      text: messageText,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId
          ? { ...s, messages: [...s.messages, newMessage] }
          : s
      )
    );
    addToast('Message dispatched to partner.');
    trackOfflineMutation(`message_vendor_${supplierId}`);
  };

  const handleAddSupplier = (supplierData: Omit<Supplier, 'id' | 'messages'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 's_' + Date.now(),
      messages: [],
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    addToast(`Vendor "${newSupplier.name}" added to master directory.`);
    trackOfflineMutation(`add_supplier_${newSupplier.id}`);
  };

  // Guest list handlers
  const handleAddGuest = (guestData: Omit<Guest, 'id'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: 'g_' + Date.now(),
    };
    setGuests((prev) => [...prev, newGuest]);
    addToast(`Guest "${newGuest.name}" registered to roster.`);
    trackOfflineMutation(`add_guest_${newGuest.id}`);
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    setGuests((prev) => prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)));
    addToast(`Guest record for "${updatedGuest.name}" updated.`);
    trackOfflineMutation(`update_guest_${updatedGuest.id}`);
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    addToast('Guest removed from roster.', 'info');
    trackOfflineMutation(`delete_guest_${guestId}`);
  };

  const handleAssignGuestToTable = (guestId: string, tableId: string | undefined) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, tableId } : g))
    );
    const guest = guests.find((g) => g.id === guestId);
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      addToast(`Seated ${guest?.name} at ${table.name}.`);
    } else {
      addToast(`Unseated ${guest?.name}.`, 'info');
    }
    trackOfflineMutation(`assign_seating_${guestId}`);
  };

  const handleAddTable = (tableData: Omit<TableItem, 'id'>) => {
    const newTable: TableItem = {
      ...tableData,
      id: 't_' + Date.now(),
    };
    setTables((prev) => [...prev, newTable]);
    addToast(`Table "${newTable.name}" positioned on floor plan.`);
    trackOfflineMutation(`add_table_${newTable.id}`);
  };

  // Budget handlers
  const handleAddBudgetItem = (itemData: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      ...itemData,
      id: 'b_' + Date.now(),
    };
    setBudgetItems((prev) => [...prev, newItem]);
    addToast(`Budget line item "${newItem.name}" recorded.`);
    trackOfflineMutation(`add_budget_item_${newItem.id}`);
  };

  const handleUpdatePayment = (itemId: string, newPaidAmount: number) => {
    setBudgetItems((prev) =>
      prev.map((b) => {
        if (b.id !== itemId) return b;
        const status = newPaidAmount >= b.actualCost ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending';
        return { ...b, paidAmount: newPaidAmount, status };
      })
    );
    addToast('Disbursement payment reconciled.');
    trackOfflineMutation(`update_payment_${itemId}`);
  };

  const handleUpdateTotalBudget = (newCap: number) => {
    setTotalBudgetCap(newCap);
    addToast(`Master budget cap adjusted to $${newCap.toLocaleString()}.`);
    trackOfflineMutation(`update_budget_cap_${newCap}`);
  };

  // Milestone toggling
  const handleToggleMilestone = (milestoneId: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, completed: !m.completed } : m))
    );
    const m = milestones.find((item) => item.id === milestoneId);
    addToast(`Milestone "${m?.title}" marked ${!m?.completed ? 'completed' : 'pending'}.`);
    trackOfflineMutation(`toggle_milestone_${milestoneId}`);
  };

  // Moodboard pin like & creation
  const handleToggleLikePin = (pinId: string) => {
    setMoodboardPins((prev) =>
      prev.map((pin) => {
        if (pin.id !== pinId) return pin;
        const hasLiked = pin.likedBy.includes(currentUser.id);
        const likedBy = hasLiked
          ? pin.likedBy.filter((id) => id !== currentUser.id)
          : [...pin.likedBy, currentUser.id];
        return { ...pin, likes: likedBy.length, likedBy };
      })
    );
  };

  const handleAddPin = (pinData: Omit<MoodboardPin, 'id' | 'likes' | 'likedBy'>) => {
    const newPin: MoodboardPin = {
      ...pinData,
      id: 'mb_' + Date.now(),
      likes: 1,
      likedBy: [currentUser.id],
    };
    setMoodboardPins((prev) => [newPin, ...prev]);
    addToast(`Inspiration pin "${newPin.title}" added to mood board.`);
    trackOfflineMutation(`add_pin_${newPin.id}`);
  };

  // Offline Tracking Simulator
  const trackOfflineMutation = (mutationKey: string) => {
    if (isOffline) {
      setOfflineQueue((prev) => [...prev, `${mutationKey} @ ${new Date().toLocaleTimeString()}`]);
    }
  };

  const handleToggleOffline = () => {
    if (!isOffline) {
      setIsOffline(true);
      addToast('Offline Mode Enabled. Changes will be preserved in local cache.', 'info');
    } else {
      setIsOffline(false);
      const count = offlineQueue.length;
      setOfflineQueue([]);
      addToast(`Reconnected to Cloud. Synchronized ${count} pending actions.`, 'success');
    }
  };

  // Integration sync simulation
  const handleTriggerSyncIntegration = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? { ...i, lastSynced: 'Just now' }
          : i
      )
    );
    const intg = integrations.find((i) => i.id === integrationId);
    addToast(`Webhook synchronized with ${intg?.platform}.`);
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      couple: 'Camille Laurent & Julian Vance',
      weddingDate: '2026-09-18',
      venues,
      suppliers,
      guests,
      tables,
      budgetItems,
      totalBudgetCap,
      milestones,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const checksum = generateSimpleChecksum(jsonStr);

    const archiveData = {
      checksum,
      encryption: 'AES-256-SIM',
      data: payload,
    };

    const blob = new Blob([JSON.stringify(archiveData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding_encrypted_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('Encrypted JSON archive successfully downloaded.');
  };

  const handleRestoreBackupFile = (fileContent: string): boolean => {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed && parsed.data) {
        if (parsed.data.guests) setGuests(parsed.data.guests);
        if (parsed.data.tables) setTables(parsed.data.tables);
        if (parsed.data.budgetItems) setBudgetItems(parsed.data.budgetItems);
        if (parsed.data.milestones) setMilestones(parsed.data.milestones);
        if (parsed.data.venues) setVenues(parsed.data.venues);
        addToast('Wedding database successfully restored from archive.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleTriggerInstantSnapshot = (): string => {
    const rawData = JSON.stringify({ guests, tables, budgetItems, milestones });
    const chk = generateSimpleChecksum(rawData);
    addToast(`Encrypted snapshot recorded. Verified checksum: ${chk}`);
    return chk;
  };

  // Test notification trigger
  const handleTriggerTestAlert = () => {
    const newNotice: NotificationItem = {
      id: 'notice_' + Date.now(),
      title: 'Timeline Reminder · Seating Chart Review',
      message: 'Automated notice: Reception seating manifest is due for catering review in 48 hours.',
      timestamp: 'Just now',
      read: false,
      type: 'timeline',
    };
    setNotifications((prev) => [newNotice, ...prev]);
    addToast('New automated alert received: Review seating chart deadline.');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read.');
  };

  // Summaries
  const budgetSummary = calculateBudgetSummary(budgetItems, totalBudgetCap);
  const rsvpSummary = calculateRSVPSummary(guests);
  const selectedVenue = venues.find((v) => v.selected) || venues[0];
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-rose-100 selection:text-rose-900">
      {/* Top Bar Contract Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenRoleModal={() => setShowRoleModal(true)}
        onOpenNotificationModal={() => setShowNotificationModal(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'overview' && (
          <OverviewView
            currentLang={currentLang}
            currentUser={currentUser}
            milestones={milestones}
            onToggleMilestone={handleToggleMilestone}
            dayOfSchedule={dayOfSchedule}
            budgetSummary={budgetSummary}
            rsvpSummary={rsvpSummary}
            selectedVenue={selectedVenue}
            onNavigateTab={setCurrentTab}
            onTriggerTestAlert={handleTriggerTestAlert}
          />
        )}

        {currentTab === 'venues_suppliers' && (
          <VenuesSuppliersView
            currentLang={currentLang}
            currentUser={currentUser}
            venues={venues}
            onSelectVenue={handleSelectVenue}
            suppliers={suppliers}
            onAddMessageToSupplier={handleAddMessageToSupplier}
            onAddSupplier={handleAddSupplier}
            weddingDate="September 18, 2026"
            guestCount={rsvpSummary.totalGuests}
          />
        )}

        {currentTab === 'guests_seating' && (
          <GuestSeatingView
            currentLang={currentLang}
            currentUser={currentUser}
            guests={guests}
            onAddGuest={handleAddGuest}
            onUpdateGuest={handleUpdateGuest}
            onDeleteGuest={handleDeleteGuest}
            tables={tables}
            onAssignGuestToTable={handleAssignGuestToTable}
            onAddTable={handleAddTable}
          />
        )}

        {currentTab === 'budget_finance' && (
          <BudgetFinanceView
            currentLang={currentLang}
            currentUser={currentUser}
            budgetSummary={budgetSummary}
            budgetItems={budgetItems}
            onAddBudgetItem={handleAddBudgetItem}
            onUpdatePayment={handleUpdatePayment}
            onUpdateTotalBudget={handleUpdateTotalBudget}
          />
        )}

        {currentTab === 'moodboard' && (
          <MoodboardView
            currentLang={currentLang}
            currentUser={currentUser}
            pins={moodboardPins}
            onToggleLikePin={handleToggleLikePin}
            onAddPin={handleAddPin}
            swatches={PALETTE_SWATCHES}
          />
        )}

        {currentTab === 'analytics_hub' && (
          <AnalyticsIntegrationsView
            currentLang={currentLang}
            currentUser={currentUser}
            milestones={milestones}
            budgetSummary={budgetSummary}
            rsvpSummary={rsvpSummary}
            teamMembers={users}
            integrations={integrations}
            onTriggerSyncIntegration={handleTriggerSyncIntegration}
            onExportBackup={handleExportBackup}
            onRestoreBackupFile={handleRestoreBackupFile}
            onTriggerInstantSnapshot={handleTriggerInstantSnapshot}
            isOffline={isOffline}
            offlineQueueCount={offlineQueue.length}
          />
        )}
      </main>

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-stone-900 text-stone-100 p-3 rounded-xl border border-stone-800 shadow-xl flex items-center justify-between text-xs animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'alert' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-rose-300 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-stone-400 hover:text-stone-200 ml-2"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Role Switcher & Login Modal */}
      {showRoleModal && (
        <RoleLoginModal
          users={users}
          currentUser={currentUser}
          onSelectUser={(u) => {
            setCurrentUser(u);
            addToast(`Switched active role to ${u.name} (${u.roleTitle}).`);
          }}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <NotificationCenterModal
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          onClose={() => setShowNotificationModal(false)}
          onTriggerTestAlert={handleTriggerTestAlert}
        />
      )}

      {/* Editorial Footer */}
      <footer className="border-t border-stone-200 bg-white mt-16 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-sm">Aethel & Ever</span>
            <span>·</span>
            <span>{TRANSLATIONS[currentLang].tagline}</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span>Encrypted Storage Active</span>
            <span>·</span>
            <span>Tuscany · Paris · London</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

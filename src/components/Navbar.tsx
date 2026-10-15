import React from 'react';
import { UserProfile, LanguageCode } from '../types/wedding';
import { TRANSLATIONS } from '../i18n/translations';
import { Shield, Bell, Cloud, CloudOff, Globe } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  onOpenRoleModal: () => void;
  onOpenNotificationModal: () => void;
  unreadNotificationsCount: number;
  isOffline: boolean;
  onToggleOffline: () => void;
  currentLang: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenRoleModal,
  onOpenNotificationModal,
  unreadNotificationsCount,
  isOffline,
  onToggleOffline,
  currentLang,
  onChangeLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  const navItems = [
    { id: 'overview', label: t.navOverview },
    { id: 'venues_suppliers', label: t.navVenuesSuppliers },
    { id: 'guests_seating', label: t.navGuestSeating },
    { id: 'budget_finance', label: t.navBudgetFinance },
    { id: 'moodboard', label: t.navMoodboard },
    { id: 'analytics_hub', label: t.navAnalyticsIntegrations },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            setCurrentTab('overview');
          }}
          className="text-xl sm:text-2xl font-serif tracking-tight text-stone-100 hover:text-rose-200 transition-colors whitespace-nowrap shrink-0 font-medium"
        >
          {t.appName}
        </a>

        {/* Zone 2: Navigation Links (Single-line, quiet typography) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-300 overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'text-rose-200 border-rose-300 font-semibold'
                    : 'text-stone-300 hover:text-white border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action (User Role & Security Session Control) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Language Toggle */}
          <div className="relative flex items-center gap-1 bg-stone-800 px-2 py-1 rounded border border-stone-700 text-xs">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={currentLang}
              onChange={(e) => onChangeLang(e.target.value as LanguageCode)}
              aria-label="Select language"
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-stone-900 text-stone-100">EN</option>
              <option value="es" className="bg-stone-900 text-stone-100">ES</option>
              <option value="fr" className="bg-stone-900 text-stone-100">FR</option>
              <option value="it" className="bg-stone-900 text-stone-100">IT</option>
              <option value="de" className="bg-stone-900 text-stone-100">DE</option>
              <option value="ja" className="bg-stone-900 text-stone-100">JA</option>
            </select>
          </div>

          {/* Offline/Online Simulator Button */}
          <button
            onClick={onToggleOffline}
            aria-label={isOffline ? 'Offline mode active, click to reconnect' : 'Cloud sync online, click to simulate offline'}
            title={isOffline ? 'Offline Mode Active' : 'Cloud Synchronized'}
            className={`p-1.5 rounded transition-colors text-xs flex items-center gap-1 border ${
              isOffline
                ? 'bg-amber-950/60 text-amber-200 border-amber-700'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-emerald-300'
            }`}
          >
            {isOffline ? <CloudOff className="w-3.5 h-3.5 text-amber-400" /> : <Cloud className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline text-[11px]">
              {isOffline ? 'Offline' : 'Sync'}
            </span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotificationModal}
            aria-label={`Notifications, ${unreadNotificationsCount} unread`}
            className="relative p-1.5 text-stone-300 hover:text-white bg-stone-800 border border-stone-700 rounded transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Role Profile & Switcher Button */}
          <button
            onClick={onOpenRoleModal}
            aria-label={`Active role: ${currentUser.roleTitle}. Click to switch role`}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded text-xs text-rose-200 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-rose-300" />
            <span className="font-medium truncate max-w-[110px] sm:max-w-[150px]">
              {currentUser.name.split(' ')[0]} ({currentUser.role === 'bride' ? 'Bride' : currentUser.role === 'groom' ? 'Groom' : 'Team'})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Navigation Bar */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 bg-stone-950 border-t border-stone-800 overflow-x-auto text-xs">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`whitespace-nowrap px-3 py-1 rounded transition-colors ${
                isActive
                  ? 'bg-stone-800 text-rose-200 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

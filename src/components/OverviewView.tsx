import React from 'react';
import {
  MilestoneItem,
  DayOfScheduleItem,
  UserProfile,
  LanguageCode,
  Venue,
} from '../types/wedding';
import { TRANSLATIONS } from '../i18n/translations';
import {
  BudgetSummary,
  RSVPSummary,
  calculateMilestoneProgress,
} from '../utils/weddingLogic';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  MapPin,
  Sparkles,
  Users,
  Wallet,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface OverviewViewProps {
  currentLang: LanguageCode;
  currentUser: UserProfile;
  milestones: MilestoneItem[];
  onToggleMilestone: (id: string) => void;
  dayOfSchedule: DayOfScheduleItem[];
  budgetSummary: BudgetSummary;
  rsvpSummary: RSVPSummary;
  selectedVenue: Venue;
  onNavigateTab: (tab: string) => void;
  onTriggerTestAlert: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentLang,
  currentUser,
  milestones,
  onToggleMilestone,
  dayOfSchedule,
  budgetSummary,
  rsvpSummary,
  selectedVenue,
  onNavigateTab,
  onTriggerTestAlert,
}) => {
  const t = TRANSLATIONS[currentLang];
  const progress = calculateMilestoneProgress(milestones);

  // Calculate days to wedding date (Sept 18, 2027)
  const weddingDate = new Date('2027-09-18T15:00:00');
  const now = new Date();
  const diffTime = Math.max(0, weddingDate.getTime() - now.getTime());
  const daysToGo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-stone-900 text-stone-100 shadow-md">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/hero_grand_reception_1792069436371.jpg"
            alt="Glasshouse Grand Reception"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium text-rose-300 mb-3 tracking-wide uppercase">
            <span>Camille Laurent & Julian Vance</span>
            <span aria-hidden="true">·</span>
            <span>{selectedVenue.name}, {selectedVenue.region}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight mb-4">
            The Celebration of Forever
          </h1>

          <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed mb-6 max-w-xl">
            {t.ceremonyDate}. A bespoke 3-day matrimonial gathering celebrating timeless love, fine Tuscan gastronomy, and cherished memories.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('guests_seating')}
              className="px-5 py-2.5 bg-rose-200 hover:bg-rose-100 text-stone-900 rounded font-medium text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{t.exportManifest}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onTriggerTestAlert}
              className="px-4 py-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded font-medium text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-rose-300" />
              <span>{t.triggerNotification}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Metric High-Density Performance Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Days Countdown */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>{t.daysToGo}</span>
            <Calendar className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {daysToGo} <span className="text-xs font-sans font-normal text-stone-500">days</span>
          </div>
          <div className="text-xs text-stone-400 mt-2">
            Target: Sept 18, 2026
          </div>
        </div>

        {/* Guest RSVP Velocity */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>{t.confirmedGuests}</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {rsvpSummary.attending} <span className="text-xs font-sans font-normal text-stone-500">/ {rsvpSummary.totalGuests}</span>
          </div>
          <div className="text-xs text-stone-500 mt-2 flex items-center gap-1">
            <span className="font-semibold text-emerald-700 tabular-nums">{rsvpSummary.attendanceRate}%</span>
            <span>attendance rate</span>
          </div>
        </div>

        {/* Budget Cushion */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>{t.remainingBudget}</span>
            <Wallet className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            ${budgetSummary.remainingBudget.toLocaleString()}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            <span className="tabular-nums font-semibold">${budgetSummary.totalSpent.toLocaleString()}</span> spent ({budgetSummary.percentSpent}%)
          </div>
        </div>

        {/* Milestones Velocity */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>{t.operationalEfficiency}</span>
            <CheckCircle2 className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {progress.percentCompleted}%
          </div>
          <div className="text-xs text-stone-500 mt-2">
            <span className="tabular-nums font-semibold">{progress.completed}</span> of {progress.total} milestones locked
          </div>
        </div>
      </section>

      {/* Main Dual Column: Timeline Schedule & Milestone Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Day-of Minute Schedule */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                {t.timelineSchedule}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Precision synchronized logistical flow with automated staff reminders
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-50 px-2.5 py-1 rounded border border-stone-200">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Full Day Orchestration</span>
            </div>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {dayOfSchedule.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-rose-300 border-2 border-white ring-1 ring-stone-300" />

                <div className="bg-stone-50 hover:bg-stone-100/80 p-3.5 rounded-lg border border-stone-200/80 transition-colors">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-rose-800 tabular-nums">
                      {item.time}
                    </span>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {item.location}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-stone-900 mb-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Lead: <strong className="font-medium text-stone-700">{item.responsible}</strong></span>
                    <span className="text-[11px] italic text-stone-400">{item.notes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Milestone Roadmap & Security Access Notice */}
        <div className="lg:col-span-5 space-y-6">
          {/* Milestone Checklist */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  {t.milestoneRoadmap}
                </h2>
                <p className="text-xs text-stone-500">
                  Click any item to toggle completed status
                </p>
              </div>
              <span className="text-xs font-medium text-stone-500 tabular-nums">
                {progress.completed}/{progress.total}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onToggleMilestone(m.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                    m.completed
                      ? 'bg-emerald-50/40 border-emerald-200 text-stone-500'
                      : 'bg-stone-50 hover:bg-stone-100/90 border-stone-200 text-stone-800'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                    aria-label={`Mark ${m.title} as ${m.completed ? 'incomplete' : 'complete'}`}
                  >
                    {m.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-snug ${m.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {m.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                      <span>{m.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">Due {m.dueDate}</span>
                      {m.priority === 'high' && !m.completed && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-700 font-semibold">High Priority</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Security & Permissions Card */}
          <div className="bg-stone-900 text-stone-200 p-5 rounded-xl border border-stone-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-rose-300">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-wider font-semibold">
                Role-Based Security Active
              </h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-3">
              Signed in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.roleTitle}). Encrypted data integrity enabled with automated daily snapshots.
            </p>
            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
              <span>Local Database Checksum:</span>
              <span className="font-mono text-stone-300">chk_9a4f210d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

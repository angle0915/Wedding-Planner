import React, { useState } from 'react';
import {
  UserProfile,
  LanguageCode,
  MilestoneItem,
  Guest,
  IntegrationWebhook,
} from '../types/wedding';
import { TRANSLATIONS } from '../i18n/translations';
import {
  BudgetSummary,
  RSVPSummary,
  calculateMilestoneProgress,
  generateSimpleChecksum,
  evaluatePermissions,
} from '../utils/weddingLogic';
import {
  Activity,
  Shield,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  Layers,
  PieChart,
  TrendingUp,
  Cpu,
  Lock,
} from 'lucide-react';

interface AnalyticsIntegrationsViewProps {
  currentLang: LanguageCode;
  currentUser: UserProfile;
  milestones: MilestoneItem[];
  budgetSummary: BudgetSummary;
  rsvpSummary: RSVPSummary;
  teamMembers: UserProfile[];
  integrations: IntegrationWebhook[];
  onTriggerSyncIntegration: (integrationId: string) => void;
  onExportBackup: () => void;
  onRestoreBackupFile: (fileContent: string) => boolean;
  onTriggerInstantSnapshot: () => string;
  isOffline: boolean;
  offlineQueueCount: number;
}

export const AnalyticsIntegrationsView: React.FC<AnalyticsIntegrationsViewProps> = ({
  currentLang,
  currentUser,
  milestones,
  budgetSummary,
  rsvpSummary,
  teamMembers,
  integrations,
  onTriggerSyncIntegration,
  onExportBackup,
  onRestoreBackupFile,
  onTriggerInstantSnapshot,
  isOffline,
  offlineQueueCount,
}) => {
  const t = TRANSLATIONS[currentLang];
  const progress = calculateMilestoneProgress(milestones);
  const canManageBackups = evaluatePermissions(currentUser.role, 'manage_backups');

  const [snapshotChecksum, setSnapshotChecksum] = useState<string>('chk_9a4f210d');
  const [snapshotTimestamp, setSnapshotTimestamp] = useState<string>('Today at 04:00 AM');
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // Handle instant snapshot creation
  const handleTakeSnapshot = () => {
    const chk = onTriggerInstantSnapshot();
    setSnapshotChecksum(chk);
    setSnapshotTimestamp(new Date().toLocaleTimeString());
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 3000);
  };

  // Handle file restore
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = onRestoreBackupFile(content);
      if (ok) {
        setRestoreMessage('Database successfully restored from encrypted archive.');
      } else {
        setRestoreMessage('Invalid backup format or corrupted checksum.');
      }
      setTimeout(() => setRestoreMessage(null), 4000);
    };
    reader.readAsText(file);
  };

  // Calculate team member task completion metrics
  const teamMetrics = teamMembers.map((member) => {
    const assigned = milestones.filter(
      (m) =>
        m.assigneeRole === member.role ||
        (member.role === 'bride' && m.assigneeRole === 'bride') ||
        (member.role === 'groom' && m.assigneeRole === 'groom')
    );
    const completed = assigned.filter((m) => m.completed).length;
    const rate = assigned.length > 0 ? Math.round((completed / assigned.length) * 100) : 100;
    return {
      member,
      assignedCount: assigned.length,
      completedCount: completed,
      completionRate: rate,
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {t.navAnalyticsIntegrations}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Operational velocity metrics, team role performance, daily encrypted snapshots, and API connectors.
          </p>
        </div>

        {/* Offline Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 border ${
              isOffline
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isOffline ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span>
              {isOffline ? `Offline Cache (${offlineQueueCount} queued)` : 'Cloud Replicated · 0 latency'}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Milestone Completion Velocity */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Milestone Completion Velocity</span>
            <Activity className="w-4 h-4 text-stone-400" />
          </div>

          <div className="text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {progress.percentCompleted}%
          </div>

          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-stone-900 h-full rounded-full transition-all"
              style={{ width: `${progress.percentCompleted}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span>{progress.completed} of {progress.total} locked</span>
            <span className="text-emerald-700 font-semibold">{progress.upcoming} upcoming</span>
          </div>
        </div>

        {/* Dietary Distribution Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Catering Meal Distribution</span>
            <PieChart className="w-4 h-4 text-stone-400" />
          </div>

          <div className="text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {rsvpSummary.attending} <span className="text-xs font-sans text-stone-400">servings</span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <span>Beef Fillet:</span>
              <strong className="tabular-nums font-mono">{rsvpSummary.meals.beef} ({Math.round(((rsvpSummary.meals.beef || 0) / (rsvpSummary.attending || 1)) * 100)}%)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Pan-Seared Sea Bass:</span>
              <strong className="tabular-nums font-mono">{rsvpSummary.meals.fish} ({Math.round(((rsvpSummary.meals.fish || 0) / (rsvpSummary.attending || 1)) * 100)}%)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Vegetarian / Vegan:</span>
              <strong className="tabular-nums font-mono">{(rsvpSummary.meals.vegetarian || 0) + (rsvpSummary.meals.vegan || 0)}</strong>
            </div>
          </div>
        </div>

        {/* Budget Variance */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Budget Cushion & Variance</span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>

          <div className="text-3xl font-serif font-bold text-stone-900 tabular-nums">
            ${budgetSummary.remainingBudget.toLocaleString()}
          </div>

          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-900 h-full rounded-full transition-all"
              style={{ width: `${budgetSummary.percentSpent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span>Variance vs Target:</span>
            <span className="font-semibold text-stone-900">
              {budgetSummary.variance >= 0 ? `+$${budgetSummary.variance.toLocaleString()}` : `-$${Math.abs(budgetSummary.variance).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Team Member Role Performance Matrix */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              Team Operational Responsibility & Performance
            </h2>
            <p className="text-xs text-stone-500">
              Milestone execution breakdown by designated planning team member.
            </p>
          </div>
          <span className="text-xs text-stone-500">
            {teamMembers.length} active leads
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMetrics.map(({ member, assignedCount, completedCount, completionRate }) => (
            <div
              key={member.id}
              className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-stone-300"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    {member.name}
                  </h3>
                  <span className="text-[11px] text-rose-800 font-medium block">
                    {member.roleTitle.split('·')[0]}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Assigned Deliverables:</span>
                  <strong className="tabular-nums font-mono">{completedCount} / {assignedCount}</strong>
                </div>

                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-stone-900 h-full rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <div className="text-right text-[10px] text-stone-500">
                  {completionRate}% completion rate
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DAILY ENCRYPTED BACKUPS & INTEGRITY AUDIT */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-900" />
              <h2 className="text-base font-serif font-bold text-stone-900">
                {t.dailyEncryptedBackup} & Disaster Recovery
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Automated cryptographic backups with SHA-256 data integrity checksums.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTakeSnapshot}
              disabled={!canManageBackups}
              className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                canManageBackups
                  ? 'bg-stone-900 hover:bg-stone-800 text-white'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.runBackupNow}</span>
            </button>

            <button
              onClick={onExportBackup}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Archive</span>
            </button>

            {canManageBackups && (
              <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Archive</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {snapshotSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Encrypted snapshot created and verified. Checksum: <strong className="font-mono">{snapshotChecksum}</strong></span>
          </div>
        )}

        {restoreMessage && (
          <div className="p-3 bg-stone-100 border border-stone-300 rounded text-xs text-stone-800">
            {restoreMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div>
            <span className="text-stone-400 block mb-1">Last Automated Snapshot:</span>
            <strong className="text-stone-900 font-mono">{snapshotTimestamp}</strong>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">Cryptographic Checksum:</span>
            <strong className="text-stone-900 font-mono text-emerald-800">{snapshotChecksum}</strong>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">Encryption Protocol:</span>
            <strong className="text-stone-900">AES-256 GCM Simulation</strong>
          </div>
        </div>
      </div>

      {/* THIRD-PARTY PROJECT MANAGEMENT API INTEGRATIONS */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              {t.thirdPartyIntegrations}
            </h2>
            <p className="text-xs text-stone-500">
              Bidirectional webhook sync with Notion databases, Google Sheets manifests, and Asana boards.
            </p>
          </div>
          <span className="text-xs text-stone-500">
            {integrations.filter((i) => i.status === 'active').length} of {integrations.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((intg) => (
            <div
              key={intg.id}
              className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    {intg.platform}
                  </span>
                  <h3 className="text-sm font-semibold text-stone-900">
                    {intg.name}
                  </h3>
                  <span className="text-[11px] font-mono text-stone-400 truncate block max-w-xs mt-0.5">
                    {intg.endpointUrl}
                  </span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    intg.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {intg.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200/60">
                <span className="text-stone-400 text-[11px]">
                  Synced: {intg.lastSynced}
                </span>

                <button
                  onClick={() => onTriggerSyncIntegration(intg.id)}
                  className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

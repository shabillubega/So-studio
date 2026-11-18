import React, { useEffect, useState } from 'react';
import {
  Camera,
  FolderGit2,
  LayoutDashboard,
  Menu,
  Recycle,
  Settings,
  X,
} from 'lucide-react';
import { ClassificationRecord, SystemSettings } from './types';
import { DEFAULT_SETTINGS, INITIAL_CLASSIFICATION_LOGS } from './data/defaults';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { ReferencesView } from './components/ReferencesView';
import { ClassifyModal } from './components/ClassifyModal';

type ActiveTab = 'dashboard' | 'settings' | 'references';

const SETTINGS_STORAGE_KEY = 'sortlens_settings_v1';
const LOGS_STORAGE_KEY = 'sortlens_logs_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [classifyOpen, setClassifyOpen] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as SystemSettings;
    } catch {
      // ignore invalid storage
    }
    return DEFAULT_SETTINGS;
  });

  const [logs, setLogs] = useState<ClassificationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as ClassificationRecord[];
    } catch {
      // ignore invalid storage
    }
    return INITIAL_CLASSIFICATION_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage quota errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore storage quota errors
    }
  }, [logs]);

  const handleClassified = (record: ClassificationRecord) => {
    const storedRecord = settings.saveTestingEvidence
      ? record
      : { ...record, thumbnailDataUrl: undefined };
    setLogs((prev) => [storedRecord, ...prev]);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'references', label: 'GitHub Repos', icon: FolderGit2 },
  ];

  const breadcrumbLabel =
    activeTab === 'dashboard'
      ? 'Dashboard'
      : activeTab === 'settings'
        ? 'Settings'
        : 'GitHub Reference Repositories';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
          <Recycle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            SortLens
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <p className="font-medium text-slate-700">AI Waste Sorting System</p>
          <p className="mt-0.5 truncate">{settings.deploymentProfile}</p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative z-50 flex w-64 flex-col bg-white border-r border-slate-200">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <div className="flex items-center gap-2">
                <Recycle className="h-5 w-5 text-emerald-600" />
                <span className="font-display text-base font-bold text-slate-900">SortLens</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-1 p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-8 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="hidden sm:inline">AI Waste Sorting</span>
              <span className="hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 truncate">{breadcrumbLabel}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setClassifyOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 whitespace-nowrap shrink-0"
          >
            <Camera className="h-3.5 w-3.5" />
            Classify Waste
          </button>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 p-4 sm:p-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              logs={logs}
              settings={settings}
              onOpenClassify={() => setClassifyOpen(true)}
              onClearLogs={() => setLogs([])}
              onRestoreBaseline={() => setLogs(INITIAL_CLASSIFICATION_LOGS)}
              onNavigateSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(next) => setSettings(next)}
              onResetDefaults={() => setSettings(DEFAULT_SETTINGS)}
            />
          )}

          {activeTab === 'references' && <ReferencesView />}
        </main>
      </div>

      <ClassifyModal
        isOpen={classifyOpen}
        onClose={() => setClassifyOpen(false)}
        settings={settings}
        onClassified={handleClassified}
      />
    </div>
  );
}

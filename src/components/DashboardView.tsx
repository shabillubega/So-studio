import React, { useMemo, useState } from 'react';
import { Download, RotateCcw, Search, Trash2, ArrowUpRight } from 'lucide-react';
import { ClassificationRecord, SystemSettings, WasteCategory } from '../types';
import { WASTE_CATEGORY_LIST } from '../data/defaults';

interface DashboardViewProps {
  logs: ClassificationRecord[];
  settings: SystemSettings;
  onOpenClassify: () => void;
  onClearLogs: () => void;
  onRestoreBaseline: () => void;
  onNavigateSettings: () => void;
}

const CATEGORY_BAR_COLOR: Record<WasteCategory, string> = {
  Plastic: 'bg-blue-600',
  'Paper & Cardboard': 'bg-sky-500',
  Glass: 'bg-teal-600',
  Metal: 'bg-amber-600',
  Organic: 'bg-emerald-600',
  'E-Waste': 'bg-red-600',
  'General Landfill': 'bg-slate-500',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  logs,
  settings,
  onOpenClassify,
  onClearLogs,
  onRestoreBaseline,
  onNavigateSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const stats = useMemo(() => {
    const total = logs.length;
    const recyclableCount = logs.filter((l) => l.recyclable).length;
    const diversionRate = total > 0 ? Math.round((recyclableCount / total) * 100) : 0;
    const avgConfidence =
      total > 0
        ? Math.round(logs.reduce((sum, item) => sum + item.confidence, 0) / total)
        : 0;
    const passedCount = logs.filter((l) => l.confidence >= settings.confidenceThreshold).length;

    return {
      total,
      diversionRate,
      avgConfidence,
      passedCount,
    };
  }, [logs, settings.confidenceThreshold]);

  const distribution = useMemo(() => {
    const counts = new Map<WasteCategory, number>();
    WASTE_CATEGORY_LIST.forEach((cat) => counts.set(cat, 0));
    logs.forEach((entry) => {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    });
    const total = logs.length || 1;
    return WASTE_CATEGORY_LIST.map((category) => {
      const count = counts.get(category) ?? 0;
      return {
        category,
        count,
        percent: logs.length > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs.filter((entry) => {
      const matchesCategory = categoryFilter === 'All' || entry.category === categoryFilter;
      const matchesSearch =
        !q ||
        entry.itemName.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        entry.binLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [logs, searchQuery, categoryFilter]);

  const exportCsv = () => {
    const headers = [
      'ID',
      'Timestamp',
      'Item Name',
      'Category',
      'Confidence (%)',
      'Recyclable',
      'Bin Assignment',
      'Source',
      'Sorting Action',
    ];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.itemName.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      String(l.confidence),
      l.recyclable ? 'Yes' : 'No',
      `"${l.binLabel}"`,
      `"${l.source}"`,
      `"${l.sortingAction.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waste-sorting-evidence-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Classified Items</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {stats.total}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {stats.passedCount} passed {settings.confidenceThreshold}% threshold
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Landfill Diversion Rate</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-emerald-700 tabular-nums">
            {stats.diversionRate}%
          </p>
          <p className="mt-1 text-xs text-slate-500">Recyclable or compostable streams</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Mean Confidence</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {stats.avgConfidence}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Input resolution {settings.inputResolution}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Active Model Profile</p>
            <button
              type="button"
              onClick={onNavigateSettings}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline whitespace-nowrap shrink-0"
            >
              Configure
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-slate-900">
            {settings.deploymentProfile}
          </p>
          <p className="mt-1.5 truncate text-xs text-slate-500">
            {settings.cameraSource} · {settings.autoActuateServo ? 'Auto-sort on' : 'Manual sort'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Waste Category Distribution
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Classification breakdown across active recycling and residual streams
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {logs.length} total
            </span>
          </div>

          <div className="mt-5 space-y-3.5">
            {distribution.map((row) => (
              <div key={row.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{row.category}</span>
                  <span className="font-mono text-slate-600 tabular-nums">
                    {row.count} ({row.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${CATEGORY_BAR_COLOR[row.category]}`}
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Configured Bin Routing
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Active GPIO servo channels and bin assignments
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateSettings}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline whitespace-nowrap shrink-0"
            >
              Edit in Settings
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {settings.binMappings.map((mapping) => (
              <div
                key={mapping.category}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <div className="min-w-0 pr-3">
                  <p className="truncate font-medium text-slate-800">{mapping.category}</p>
                  <p className="truncate text-slate-500">{mapping.binLabel}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                  <span className="text-slate-500">{mapping.servoChannel}</span>
                  <span
                    className={
                      mapping.enabled
                        ? 'font-medium text-emerald-700'
                        : 'font-medium text-slate-400'
                    }
                  >
                    {mapping.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Classification & Testing Evidence Log
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Inspect live vision inferences, filter by stream, or export CSV evidence
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            {logs.length > 0 ? (
              <button
                type="button"
                onClick={onClearLogs}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Log
              </button>
            ) : (
              <button
                type="button"
                onClick={onRestoreBaseline}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Load Baseline Samples
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-3.5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search item, category, or bin..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {['All', ...WASTE_CATEGORY_LIST].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'Paper & Cardboard' ? 'Paper' : cat === 'General Landfill' ? 'Landfill' : cat}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-800">No classification entries found</p>
            <p className="mt-1 text-xs text-slate-500">
              {logs.length === 0
                ? 'Run a live image or webcam classification to populate testing evidence.'
                : 'Adjust your search query or category filter.'}
            </p>
            {logs.length === 0 && (
              <button
                type="button"
                onClick={onOpenClassify}
                className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Classify First Item
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 pr-4 pl-6 font-medium">Detected Item</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 font-medium">Bin Routing</th>
                  <th className="px-4 py-2.5 font-medium text-right">Confidence</th>
                  <th className="px-4 py-2.5 font-medium">Source</th>
                  <th className="py-2.5 pr-6 pl-4 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="h-11 transition-colors hover:bg-slate-50">
                    <td className="py-2 pr-4 pl-6 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        {entry.thumbnailDataUrl && (
                          <img
                            src={entry.thumbnailDataUrl}
                            alt={entry.itemName}
                            className="h-7 w-7 rounded border border-slate-200 object-cover shrink-0"
                          />
                        )}
                        <span className="truncate max-w-[220px]">{entry.itemName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-700 whitespace-nowrap">{entry.category}</td>
                    <td className="px-4 py-2 text-slate-600 whitespace-nowrap">{entry.binLabel}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums whitespace-nowrap">
                      <span
                        className={
                          entry.confidence >= settings.confidenceThreshold
                            ? 'font-medium text-emerald-700'
                            : 'font-medium text-amber-700'
                        }
                      >
                        {entry.confidence}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{entry.source}</td>
                    <td className="py-2 pr-6 pl-4 text-right font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {formatTime(entry.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

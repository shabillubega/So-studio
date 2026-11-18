import React, { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { CameraSource, DeploymentProfile, SystemSettings, WasteCategory } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (next: SystemSettings) => void;
  onResetDefaults: () => void;
}

const DEPLOYMENT_PROFILES: DeploymentProfile[] = [
  'Gemini Vision Cloud',
  'YOLOv8 (ONNX Runtime)',
  'TensorFlow Lite (Raspberry Pi)',
  'PyTorch / Keras Edge',
];

const CAMERA_SOURCES: CameraSource[] = [
  'Browser Webcam',
  'USB Camera (/dev/video0)',
  'Raspberry Pi Camera Module v2',
  'Image File Upload',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDefaults,
}) => {
  const [draft, setDraft] = useState<SystemSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(draft);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    onResetDefaults();
    setSavedNotice(false);
  };

  const updateBinMapping = (
    category: WasteCategory,
    patch: Partial<{ enabled: boolean; binLabel: string; servoChannel: string }>
  ) => {
    setDraft((prev) => ({
      ...prev,
      binMappings: prev.binMappings.map((item) =>
        item.category === category ? { ...item, ...patch } : item
      ),
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            System & Model Configuration
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Tune computer vision thresholds, camera inputs, and physical bin routing rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
              <Check className="h-3.5 w-3.5" />
              Settings saved
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
          >
            Save Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Vision Model & Inference Parameters
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Select deployment target and detection filtering thresholds
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="deploymentProfile"
                className="block text-xs font-medium text-slate-700"
              >
                Target Runtime Profile
              </label>
              <select
                id="deploymentProfile"
                value={draft.deploymentProfile}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    deploymentProfile: e.target.value as DeploymentProfile,
                  }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {DEPLOYMENT_PROFILES.map((profile) => (
                  <option key={profile} value={profile}>
                    {profile}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="confidenceThreshold" className="font-medium text-slate-700">
                  Minimum Confidence Threshold
                </label>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {draft.confidenceThreshold}%
                </span>
              </div>
              <input
                id="confidenceThreshold"
                type="range"
                min={50}
                max={99}
                step={1}
                value={draft.confidenceThreshold}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, confidenceThreshold: Number(e.target.value) }))
                }
                className="mt-2 w-full accent-emerald-600"
              />
              <p className="mt-1 text-xs text-slate-500">
                Predictions below this confidence trigger manual review instead of auto-sorting.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="nmsThreshold" className="font-medium text-slate-700">
                  NMS IoU Overlap Threshold
                </label>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {(draft.nmsThreshold / 100).toFixed(2)}
                </span>
              </div>
              <input
                id="nmsThreshold"
                type="range"
                min={20}
                max={85}
                step={5}
                value={draft.nmsThreshold}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, nmsThreshold: Number(e.target.value) }))
                }
                className="mt-2 w-full accent-emerald-600"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700">
                Model Input Frame Resolution
              </span>
              <div className="mt-1.5 flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
                {(['320x320', '640x640', '1280x720'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, inputResolution: res }))}
                    className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium tabular-nums whitespace-nowrap shrink-0 transition-colors ${
                      draft.inputResolution === res
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Camera Input & Hardware Bridge
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Configure frame capture cadence and Raspberry Pi / Arduino actuator serial link
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="cameraSource" className="block text-xs font-medium text-slate-700">
                Video / Image Source
              </label>
              <select
                id="cameraSource"
                value={draft.cameraSource}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, cameraSource: e.target.value as CameraSource }))
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {CAMERA_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="captureIntervalMs"
                  className="block text-xs font-medium text-slate-700"
                >
                  Frame Interval (ms)
                </label>
                <input
                  id="captureIntervalMs"
                  type="number"
                  min={250}
                  max={10000}
                  step={250}
                  value={draft.captureIntervalMs}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, captureIntervalMs: Number(e.target.value) }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 tabular-nums focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="serialPort" className="block text-xs font-medium text-slate-700">
                  Controller Serial Port
                </label>
                <input
                  id="serialPort"
                  type="text"
                  value={draft.serialPort}
                  onChange={(e) => setDraft((p) => ({ ...p, serialPort: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700">UART Baud Rate</span>
              <div className="mt-1.5 flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
                {([9600, 115200] as const).map((baud) => (
                  <button
                    key={baud}
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, baudRate: baud }))}
                    className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium tabular-nums whitespace-nowrap shrink-0 transition-colors ${
                      draft.baudRate === baud
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {baud} bps
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 cursor-pointer">
                <div>
                  <p className="text-xs font-medium text-slate-800">Auto-Actuate Sorting Servo</p>
                  <p className="text-xs text-slate-500">
                    Dispatch bin signal automatically when confidence passes threshold
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.autoActuateServo}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, autoActuateServo: e.target.checked }))
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 cursor-pointer">
                <div>
                  <p className="text-xs font-medium text-slate-800">
                    Capture Testing Evidence Thumbnails
                  </p>
                  <p className="text-xs text-slate-500">
                    Store classified frame thumbnails in the inspection log
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.saveTestingEvidence}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, saveTestingEvidence: e.target.checked }))
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
              </label>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Waste Class & Physical Bin Mapping
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Enable target waste classes and assign destination bin labels and actuator channels
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="py-2.5 pr-4 pl-6 font-medium">Enabled</th>
                <th className="px-4 py-2.5 font-medium">Waste Category</th>
                <th className="px-4 py-2.5 font-medium">Destination Bin Label</th>
                <th className="py-2.5 pr-6 pl-4 font-medium">GPIO / Servo Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {draft.binMappings.map((row) => (
                <tr key={row.category} className="h-12">
                  <td className="py-2 pr-4 pl-6">
                    <input
                      type="checkbox"
                      aria-label={`Enable ${row.category}`}
                      checked={row.enabled}
                      onChange={(e) =>
                        updateBinMapping(row.category, { enabled: e.target.checked })
                      }
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900 whitespace-nowrap">
                    {row.category}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.binLabel}
                      onChange={(e) =>
                        updateBinMapping(row.category, { binLabel: e.target.value })
                      }
                      className="w-full max-w-xs rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 pr-6 pl-4">
                    <input
                      type="text"
                      value={row.servoChannel}
                      onChange={(e) =>
                        updateBinMapping(row.category, { servoChannel: e.target.value })
                      }
                      className="w-28 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </form>
  );
};

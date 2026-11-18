import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { ClassificationRecord, SystemSettings, WasteCategory } from '../types';

interface ClassifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onClassified: (record: ClassificationRecord) => void;
}

interface ApiClassifyResponse {
  itemName: string;
  category: WasteCategory;
  confidence: number;
  recyclable: boolean;
  sortingAction: string;
  materialNotes: string;
}

export const ClassifyModal: React.FC<ClassifyModalProps> = ({
  isOpen,
  onClose,
  settings,
  onClassified,
}) => {
  const [mode, setMode] = useState<'upload' | 'webcam'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationRecord | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setError(null);
      setResult(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const startCamera = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Camera unavailable: ${err.message}`
          : 'Unable to access camera. Check browser permissions or use image upload.'
      );
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setPreviewUrl(dataUrl);
    setMimeType('image/jpeg');
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const runClassification = async () => {
    if (!previewUrl) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const enabledCategories = settings.binMappings
        .filter((b) => b.enabled)
        .map((b) => b.category);

      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
          mimeType,
          enabledCategories,
          confidenceThreshold: settings.confidenceThreshold,
          deploymentProfile: settings.deploymentProfile,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Vision classification failed.');
      }

      const data = payload as ApiClassifyResponse;
      const mappedBin = settings.binMappings.find((m) => m.category === data.category);
      const binLabel = mappedBin ? mappedBin.binLabel : 'Bin 7 · Residual Landfill';
      const passedThreshold = data.confidence >= settings.confidenceThreshold;

      const record: ClassificationRecord = {
        id: `run-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        itemName: data.itemName,
        category: data.category,
        confidence: data.confidence,
        recyclable: data.recyclable,
        binLabel,
        sortingAction: data.sortingAction,
        materialNotes: data.materialNotes,
        source: mode === 'webcam' ? 'Webcam Capture' : 'Live Vision',
        passedThreshold,
        thumbnailDataUrl: previewUrl,
      };

      setResult(record);
      onClassified(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to classify image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="classify-modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="classify-modal-title" className="text-base font-semibold text-slate-900">
              Waste Vision Classifier
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {settings.deploymentProfile} · Threshold {settings.confidenceThreshold}%
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-600"
            aria-label="Close classifier modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setMode('upload');
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                mode === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Image Upload
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('webcam');
                setPreviewUrl(null);
                setResult(null);
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                mode === 'webcam'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              Webcam Capture
            </button>
          </div>

          {mode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {!previewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-56 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/30"
                >
                  <Upload className="mb-2 h-6 w-6 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    Select a waste item image to classify
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Supports JPEG, PNG, or WebP frames
                  </span>
                </button>
              ) : (
                <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={previewUrl}
                    alt="Selected waste item preview"
                    className="h-56 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setResult(null);
                    }}
                    className="absolute top-2 right-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                  >
                    Replace
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'webcam' && (
            <div className="space-y-3">
              {!previewUrl ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 flex-col items-center justify-center px-4 text-center text-slate-300">
                      <Camera className="mb-2 h-6 w-6 text-slate-400" />
                      <p className="text-sm font-medium">Camera stream is idle</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        Start Camera
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={previewUrl}
                    alt="Captured camera frame"
                    className="h-56 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setResult(null);
                      startCamera();
                    }}
                    className="absolute top-2 right-2 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                  >
                    Retake
                  </button>
                </div>
              )}

              {cameraActive && !previewUrl && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={captureFrame}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Capture Frame
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500">
                    {result.category} · {result.binLabel}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-slate-900">
                    {result.itemName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium tabular-nums">
                  {result.passedThreshold ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {result.confidence}% confidence (Threshold passed)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      {result.confidence}% confidence (Below {settings.confidenceThreshold}%)
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2.5 text-xs text-slate-700">
                <span className="font-medium text-slate-900">Sorting action:</span>{' '}
                {result.sortingAction}
              </p>
              <p className="mt-1 text-xs text-slate-600">{result.materialNotes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!previewUrl || isAnalyzing}
            onClick={runClassification}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {isAnalyzing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isAnalyzing ? 'Classifying...' : 'Run Classification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export type WasteCategory =
  | 'Plastic'
  | 'Paper & Cardboard'
  | 'Glass'
  | 'Metal'
  | 'Organic'
  | 'E-Waste'
  | 'General Landfill';

export type DeploymentProfile =
  | 'Gemini Vision Cloud'
  | 'YOLOv8 (ONNX Runtime)'
  | 'TensorFlow Lite (Raspberry Pi)'
  | 'PyTorch / Keras Edge';

export type CameraSource =
  | 'Browser Webcam'
  | 'USB Camera (/dev/video0)'
  | 'Raspberry Pi Camera Module v2'
  | 'Image File Upload';

export interface BinMapping {
  category: WasteCategory;
  enabled: boolean;
  binLabel: string;
  servoChannel: string;
}

export interface SystemSettings {
  deploymentProfile: DeploymentProfile;
  confidenceThreshold: number;
  nmsThreshold: number;
  inputResolution: '320x320' | '640x640' | '1280x720';
  cameraSource: CameraSource;
  captureIntervalMs: number;
  serialPort: string;
  baudRate: 9600 | 115200;
  autoActuateServo: boolean;
  saveTestingEvidence: boolean;
  binMappings: BinMapping[];
}

export interface ClassificationRecord {
  id: string;
  timestamp: string;
  itemName: string;
  category: WasteCategory;
  confidence: number;
  recyclable: boolean;
  binLabel: string;
  sortingAction: string;
  materialNotes: string;
  source: 'Live Vision' | 'Webcam Capture' | 'Baseline Sample';
  passedThreshold: boolean;
  thumbnailDataUrl?: string;
}

export interface GitHubReferenceRepo {
  id: string;
  ownerRepo: string;
  title: string;
  url: string;
  stack: string;
  dashboardNotes: string;
  settingsNotes: string;
  matchesBriefTools: string[];
}

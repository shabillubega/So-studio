import { ClassificationRecord, GitHubReferenceRepo, SystemSettings, WasteCategory } from '../types';

export const WASTE_CATEGORY_LIST: WasteCategory[] = [
  'Plastic',
  'Paper & Cardboard',
  'Glass',
  'Metal',
  'Organic',
  'E-Waste',
  'General Landfill',
];

export const DEFAULT_SETTINGS: SystemSettings = {
  deploymentProfile: 'Gemini Vision Cloud',
  confidenceThreshold: 75,
  nmsThreshold: 45,
  inputResolution: '640x640',
  cameraSource: 'Browser Webcam',
  captureIntervalMs: 1500,
  serialPort: '/dev/ttyACM0',
  baudRate: 115200,
  autoActuateServo: true,
  saveTestingEvidence: true,
  binMappings: [
    { category: 'Plastic', enabled: true, binLabel: 'Bin 1 · Blue Plastics', servoChannel: 'GPIO-17' },
    { category: 'Paper & Cardboard', enabled: true, binLabel: 'Bin 2 · Paper Stream', servoChannel: 'GPIO-27' },
    { category: 'Glass', enabled: true, binLabel: 'Bin 3 · Glass Recovery', servoChannel: 'GPIO-22' },
    { category: 'Metal', enabled: true, binLabel: 'Bin 4 · Ferrous / Aluminum', servoChannel: 'GPIO-23' },
    { category: 'Organic', enabled: true, binLabel: 'Bin 5 · Green Compost', servoChannel: 'GPIO-24' },
    { category: 'E-Waste', enabled: true, binLabel: 'Bin 6 · Hazardous / E-Waste', servoChannel: 'GPIO-25' },
    { category: 'General Landfill', enabled: true, binLabel: 'Bin 7 · Residual Landfill', servoChannel: 'GPIO-12' },
  ],
};

export const INITIAL_CLASSIFICATION_LOGS: ClassificationRecord[] = [
  {
    id: 'run-1042',
    timestamp: '2026-11-18T08:14:22Z',
    itemName: 'Clear PET Beverage Bottle',
    category: 'Plastic',
    confidence: 96,
    recyclable: true,
    binLabel: 'Bin 1 · Blue Plastics',
    sortingAction: 'Empty residual liquid, keep cap attached, and route to Bin 1.',
    materialNotes: 'PET (#1) thermoplastic is widely recovered for bottle-to-fiber and bottle-to-bottle recycling.',
    source: 'Baseline Sample',
    passedThreshold: true,
  },
  {
    id: 'run-1041',
    timestamp: '2026-11-18T08:09:47Z',
    itemName: 'Corrugated Shipping Carton',
    category: 'Paper & Cardboard',
    confidence: 94,
    recyclable: true,
    binLabel: 'Bin 2 · Paper Stream',
    sortingAction: 'Flatten box and remove heavy packing tape before routing to Bin 2.',
    materialNotes: 'Clean corrugated fiberboard retains long cellulose fibers ideal for pulping.',
    source: 'Baseline Sample',
    passedThreshold: true,
  },
  {
    id: 'run-1040',
    timestamp: '2026-11-18T07:58:15Z',
    itemName: 'Aluminum Soda Can',
    category: 'Metal',
    confidence: 98,
    recyclable: true,
    binLabel: 'Bin 4 · Ferrous / Aluminum',
    sortingAction: 'Rinse lightly and route directly to Bin 4 aluminum stream.',
    materialNotes: 'Aluminum can be recycled indefinitely with ~95% lower energy than primary smelting.',
    source: 'Baseline Sample',
    passedThreshold: true,
  },
  {
    id: 'run-1039',
    timestamp: '2026-11-18T07:45:03Z',
    itemName: 'Organic Fruit Peelings',
    category: 'Organic',
    confidence: 91,
    recyclable: true,
    binLabel: 'Bin 5 · Green Compost',
    sortingAction: 'Route to Bin 5 organic compost chamber; keep free of plastic stickers.',
    materialNotes: 'Biodegradable organic waste diverts methane-producing mass from municipal landfills.',
    source: 'Baseline Sample',
    passedThreshold: true,
  },
  {
    id: 'run-1038',
    timestamp: '2026-11-18T07:33:19Z',
    itemName: 'Amber Glass Beverage Jar',
    category: 'Glass',
    confidence: 89,
    recyclable: true,
    binLabel: 'Bin 3 · Glass Recovery',
    sortingAction: 'Separate metal lid and deposit glass body into Bin 3.',
    materialNotes: 'Cullet glass melts at lower kiln temperatures without losing structural purity.',
    source: 'Baseline Sample',
    passedThreshold: true,
  },
  {
    id: 'run-1037',
    timestamp: '2026-11-18T07:21:40Z',
    itemName: 'Discarded Lithium-Ion Battery Pack',
    category: 'E-Waste',
    confidence: 88,
    recyclable: true,
    binLabel: 'Bin 6 · Hazardous / E-Waste',
    sortingAction: 'Isolate terminals and route immediately to Bin 6 hazardous e-waste containment.',
    materialNotes: 'Requires specialized recovery to prevent thermal runaway and recover cobalt/lithium.',
    source: 'Baseline Sample',
    passedThreshold: true,
  },
];

export const GITHUB_REFERENCE_REPOS: GitHubReferenceRepo[] = [
  {
    id: 'sandiozo',
    ownerRepo: 'Sandiozo/Waste-AI-Sorting-System',
    title: 'Raspberry Pi YOLOv8 & TFLite Waste AI Sorting System',
    url: 'https://github.com/Sandiozo/Waste-AI-Sorting-System',
    stack: 'Python · YOLOv8 · TensorFlow Lite · Flask · Raspberry Pi',
    dashboardNotes:
      'Includes a Flask web dashboard showing live camera streams, category disposal counters (Organic, Paper, Plastic), and bin-fullness camera tracking.',
    settingsNotes:
      'Configures detection intervals, confidence thresholds, NMS filtering, and Raspberry Pi GPIO pin mappings for physical LED/bin indicators.',
    matchesBriefTools: ['Python', 'YOLO', 'Raspberry Pi', 'TensorFlow Lite'],
  },
  {
    id: 'teamsmcorg',
    ownerRepo: 'teamsmcorg/Waste-Classification-using-YOLOv8',
    title: 'Waste Classification using YOLOv8 & Streamlit',
    url: 'https://github.com/teamsmcorg/Waste-Classification-using-YOLOv8',
    stack: 'Python · YOLOv8 · OpenCV · Streamlit',
    dashboardNotes:
      'Provides an interactive Streamlit UI for image, video, and live webcam waste classification across 6 waste streams with bounding boxes.',
    settingsNotes:
      'Includes dedicated configuration parameters (settings.py / sidebar controls) for confidence threshold, source selection, and class labels.',
    matchesBriefTools: ['Python', 'OpenCV', 'YOLO'],
  },
  {
    id: 'diegotovar910',
    ownerRepo: 'diegotovar910/smartsorting',
    title: 'SmartSorting (Wasste) — AI Waste Management Platform',
    url: 'https://github.com/diegotovar910/smartsorting',
    stack: 'React · Vite · Express · Gemini Vision',
    dashboardNotes:
      'Features a city overview dashboard (/), AI waste scanner (/scan), analytics (/analytics), and route planner (/routes).',
    settingsNotes:
      'Configures strict sub-bin category schemas, fill-percentage thresholds, and route optimization parameters (urgency vs. distance).',
    matchesBriefTools: ['Computer Vision', 'Web Dashboard'],
  },
  {
    id: 'jerophin123',
    ownerRepo: 'Jerophin123/Waste_Management_System',
    title: 'Full-Stack Waste Classification & Analytics System',
    url: 'https://github.com/Jerophin123/Waste_Management_System',
    stack: 'React · Flask · TensorFlow · MySQL',
    dashboardNotes:
      'Includes a live trends dashboard, webcam classification interface, historical logs page, and CSV/PDF report exports.',
    settingsNotes:
      'Provides database configuration, environment route settings, and user role/module management.',
    matchesBriefTools: ['Python', 'TensorFlow', 'Keras'],
  },
  {
    id: 'sabyasachi2125',
    ownerRepo: 'Sabyasachi2125/ai-waste-management-assistant',
    title: 'AI Waste Management Assistant (with README Screenshots)',
    url: 'https://github.com/Sabyasachi2125/ai-waste-management-assistant',
    stack: 'Python · FastAPI · HTML/JS Frontend',
    dashboardNotes:
      'Documents the main interface, analysis breakdown, and recycling guidance panels with screenshots directly in the repository README.',
    settingsNotes:
      'Exposes interactive API docs (/docs) and model classification threshold parameters.',
    matchesBriefTools: ['Python', 'Working Prototype'],
  },
];

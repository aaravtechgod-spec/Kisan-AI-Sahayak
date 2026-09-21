export type ResponseMode = 'AUTO' | 'SCOPE' | 'DEBUG' | 'PITCH';

export type Verdict = 'SHIP IT' | 'FAKE IT' | 'CUT IT';

export interface StatusBlock {
  hoursRemaining: number;
  works: string;
  stubbed: string;
  cut: string;
}

export interface ContextOptions {
  targetDomain: 'Healthcare' | 'Agriculture & Climate' | 'Governance & Civic' | 'Education & Livelihood' | 'General';
  bricsFocus: boolean;
  farmerMode?: boolean;
  preferredLanguage?: 'en' | 'hi' | 'mr';
}

export interface MentorAudit {
  id: string;
  timestamp: string;
  query: string;
  mode: ResponseMode;
  detectedMode?: string;
  verdict?: Verdict | null;
  feasibilityScore?: number | null;
  response: string;
  statusSnapshot: StatusBlock;
  modelUsed: string;
}

export interface FarmerUser {
  id: string;
  username: string; // User ID
  name: string;
  password?: string;
  avatar: string;
  village: string;
  state: string;
  crops: string[];
  acres: string;
  bio: string;
  followers: string[]; // array of usernames/ids following this farmer
  following: string[]; // array of usernames/ids this farmer follows
  joinedDate: string;
  isVerified?: boolean;
}

export interface PostComment {
  id: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

export interface KisanPost {
  id: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  authorVillage: string;
  imageUrl?: string;
  caption: string;
  cropTag: string;
  timestamp: string;
  likes: string[]; // usernames who liked
  comments: PostComment[];
}

export interface KisanStory {
  id: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  imageUrl: string;
  crop: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  text: string;
  timestamp: string;
  isVoiceNote?: boolean;
  adviceCard?: {
    crop: string;
    verdict: string;
    summary: string;
  };
}

export interface CropDiseaseDiagnosis {
  id: string;
  timestamp: string;
  crop: string;
  diseaseName: string;
  diseaseNameHindi: string;
  pathogenType: 'Fungal' | 'Insect/Pest' | 'Bacterial' | 'Nutrient Deficiency' | 'Viral';
  severity: 'Mild' | 'Moderate' | 'Severe';
  confidence: number;
  imageUrl?: string;
  symptoms: string;
  chemicalTreatment: {
    medicineName: string;
    dosagePerPump: string;
    dosagePerAcre: string;
    waitingPeriodDays: number;
    estimatedCost: string;
  };
  organicAlternative: {
    recipeName: string;
    ingredients: string;
    applicationMethod: string;
    estimatedCost: string;
  };
  sprayTiming: string;
  fieldSafetyTips: string[];
  helpline: string;
  modelUsed?: string;
}

export interface MandiRateItem {
  id: string;
  crop: string;
  cropHindi: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  modalPrice: number; // in ₹/quintal
  minPrice: number;
  maxPrice: number;
  mspPrice: number;
  priceChange7d: number; // e.g. +80 or -40
  trend: 'up' | 'down' | 'stable';
  arrivalTonsToday: number;
  aiRecommendation: string;
  aiRecommendationHindi: string;
}

export interface WeatherSprayAdvisory {
  location: string;
  temperature: number; // in °C
  humidity: number; // in %
  windSpeedKmH: number;
  rainProbability: number; // in %
  condition: string;
  conditionHindi: string;
  spraySafetyStatus: 'SAFE' | 'CAUTION' | 'UNSAFE';
  spraySafetyReason: string;
  spraySafetyReasonHindi: string;
  optimalSprayHours: string;
  alerts: {
    title: string;
    titleHindi: string;
    severity: 'warning' | 'info' | 'danger';
    message: string;
    actionableAdvice: string;
  }[];
}

export interface FertilizerCalculation {
  crop: string;
  stage: string;
  acres: number;
  soilType: string;
  ureaKg: number;
  ureaBags: number;
  dapKg: number;
  dapBags: number;
  mopKg: number;
  zincKg: number;
  nanoUreaBottles: number;
  organicJeevamruthaLiters: number;
  conventionalCostEst: number;
  balancedCostEst: number;
  netSavingsRupees: number;
  guidancePoints: string[];
}

export interface OfflineEmergencyItem {
  id: string;
  crop: string;
  problem: string;
  problemHindi: string;
  symptomSign: string;
  quickChemical: string;
  quickOrganic: string;
  dosage: string;
  urgentAction: string;
}

export interface BricsAgriNNode {
  id: string;
  countryCode: 'IN' | 'BR' | 'ZA' | 'CN' | 'RU' | 'AE' | 'ET' | 'EG';
  countryName: string;
  countryNameHindi: string;
  institutionName: string;
  flag: string;
  status: 'ONLINE' | 'SYNCED' | 'FEDERATING';
  agroClimaticZones: string[];
  sharedModelsCount: number;
  carbonSequesteredMT: string;
  dataPointsExchanged: string;
  focalContact: string;
}

export interface SatelliteObservation {
  ndvi: number; // 0.0 - 1.0 (Normalized Difference Vegetation Index)
  ndviTrend: 'Greening' | 'Stable' | 'Browning/Stress';
  ndre: number; // Red Edge Chlorophyll Index
  soilMoisturePct: number; // Root zone moisture %
  surfaceTempC: number;
  leafAreaIndex: number;
  cloudCoverPct: number;
  satellitePlatform: string;
  resolutionMeters: number;
  lastPassTimestamp: string;
}

export interface SoilHealthProfile {
  sampleId: string;
  ph: number;
  organicCarbonPct: number;
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
  electricalConductivityDsM: number;
  zincPpm: number;
  boronPpm: number;
  soilTexture: string;
  healthGrade: 'Degraded' | 'Moderate' | 'Regenerative High';
}

export interface RegenerativeBioInput {
  name: string;
  type: 'Biofertilizer' | 'Biostimulant' | 'Biochar' | 'Microbial Inoculant' | 'Green Manure';
  applicationRate: string;
  benefit: string;
  benefitHindi: string;
}

export interface RegenerativeAdvisory {
  id: string;
  timestamp: string;
  country: string;
  agroZone: string;
  primaryCrop: string;
  companionCrop: string;
  coverCropRotation: string;
  carbonSequestrationEstTonsHa: number;
  syntheticFertilizerReductionPct: number;
  soilHealthDeltaScore: number; // e.g. +34%
  bioInputsPrescription: RegenerativeBioInput[];
  soilRestorationSteps: string[];
  soilRestorationStepsHindi: string[];
  weatherRiskMitigation: string;
  weatherRiskMitigationHindi: string;
  waterConservationMethod: string;
  estimatedFarmerSavingsPerHa: number;
  dpgSchemaStandard: string;
  federatedModelReference: string;
}

export interface BricsFederatedModel {
  id: string;
  name: string;
  category: 'Soil Carbon' | 'Pest Surveillance' | 'Drought & Salinity' | 'Microclimate AI' | 'Regenerative Yield';
  contributingNation: string;
  contributingInstitution: string;
  flag: string;
  license: string;
  accuracyF1Score: number;
  parametersCount: string;
  trainingSamples: string;
  status: 'Active Federation' | 'Peer Reviewed';
  description: string;
  descriptionHindi: string;
  downloadEndpoint: string;
  interoperableFormat: 'ONNX' | 'TensorFlow Lite' | 'PyTorch' | 'JSON-LD Schema';
}



export type RecommendationType = 'spray-safety' | 'regenerative';

export type DecisionCode =
  | 'GO_SAFE'
  | 'CAUTION_MARGINAL'
  | 'NO_GO_UNSAFE'
  | 'REGEN_OPTIMAL'
  | 'REGEN_STRESS_MULCH_NOW';

export interface AgroAdvisorySourceNode {
  nodeId: string;
  country: string;
  institution: string;
}

export interface AgroAdvisoryCrop {
  name: string;
  variety?: string;
  growthStage?: string;
}

export interface AgroAdvisoryCoordinates {
  latitude: number;
  longitude: number;
}

export interface AgroAdvisoryRegion {
  countryCode: string; // e.g. "IN", "BR", "ZA"
  administrativeArea: string; // e.g. "Punjab", "Goiás"
  coordinates: AgroAdvisoryCoordinates;
}

export interface AgroAdvisorySoilSignal {
  surfaceWetnessPercent: number; // 0 - 100
  gwettopRaw: number; // 0.0 - 1.0 (NASA MERRA-2 GWETTOP)
  source: 'NASA_POWER_MERRA2_GWETTOP' | 'ISRO_VEDAS_SMAP' | 'IN_SITU_TELEMETRY';
  capturedAt?: string;
}

export interface AgroAdvisoryWeatherSignal {
  temperatureCelsius: number;
  windSpeedKmh: number;
  relativeHumidityPercent: number;
  rainProbabilityPercent?: number;
  source: string; // e.g. "OPEN_METEO_API"
}

export interface AgroAdvisoryRecommendation {
  decisionCode: DecisionCode;
  primaryAdviceText: string;
  spokenAdvice: {
    en: string;
    hi: string;
  };
  actionItems?: string[];
  syntheticFertilizerReductionPct?: number;
  confidenceScore?: number;
}

export interface AgroAdvisoryRecord {
  schemaVersion: 'brics.agrin.agro-advisory.v1';
  recordId: string;
  timestamp: string; // ISO-8601 UTC
  sourceNode: AgroAdvisorySourceNode;
  recommendationType: RecommendationType;
  crop: AgroAdvisoryCrop;
  region: AgroAdvisoryRegion;
  soilSignal: AgroAdvisorySoilSignal;
  weatherSignal: AgroAdvisoryWeatherSignal;
  recommendation: AgroAdvisoryRecommendation;
}

export interface AgroAdvisoryInput {
  schemaVersion?: 'brics.agrin.agro-advisory.v1';
  recordId?: string;
  timestamp?: string;
  sourceNode: AgroAdvisorySourceNode;
  recommendationType: RecommendationType;
  crop: AgroAdvisoryCrop;
  region: AgroAdvisoryRegion;
  soilSignal: AgroAdvisorySoilSignal;
  weatherSignal: AgroAdvisoryWeatherSignal;
  recommendation: AgroAdvisoryRecommendation;
}

export function validateAgroAdvisoryPayload(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Payload must be a non-null JSON object'] };
  }

  if (!data.recommendationType || !['spray-safety', 'regenerative'].includes(data.recommendationType)) {
    errors.push('recommendationType must be either "spray-safety" or "regenerative"');
  }

  if (!data.sourceNode || typeof data.sourceNode !== 'object') {
    errors.push('sourceNode object is required');
  } else {
    if (!data.sourceNode.nodeId) errors.push('sourceNode.nodeId is required');
    if (!data.sourceNode.country) errors.push('sourceNode.country is required');
    if (!data.sourceNode.institution) errors.push('sourceNode.institution is required');
  }

  if (!data.crop || typeof data.crop !== 'object' || !data.crop.name) {
    errors.push('crop object with "name" string is required');
  }

  if (!data.region || typeof data.region !== 'object') {
    errors.push('region object is required');
  } else {
    if (!data.region.countryCode) errors.push('region.countryCode is required');
    if (!data.region.administrativeArea) errors.push('region.administrativeArea is required');
    if (
      !data.region.coordinates ||
      typeof data.region.coordinates.latitude !== 'number' ||
      typeof data.region.coordinates.longitude !== 'number'
    ) {
      errors.push('region.coordinates with valid numeric latitude and longitude is required');
    }
  }

  if (!data.soilSignal || typeof data.soilSignal !== 'object') {
    errors.push('soilSignal object is required');
  } else {
    if (typeof data.soilSignal.surfaceWetnessPercent !== 'number') {
      errors.push('soilSignal.surfaceWetnessPercent must be a number');
    }
    if (typeof data.soilSignal.gwettopRaw !== 'number') {
      errors.push('soilSignal.gwettopRaw must be a number (0.0 to 1.0)');
    }
    if (!data.soilSignal.source) {
      errors.push('soilSignal.source is required');
    }
  }

  if (!data.weatherSignal || typeof data.weatherSignal !== 'object') {
    errors.push('weatherSignal object is required');
  } else {
    if (typeof data.weatherSignal.temperatureCelsius !== 'number') {
      errors.push('weatherSignal.temperatureCelsius must be a number');
    }
    if (typeof data.weatherSignal.windSpeedKmh !== 'number') {
      errors.push('weatherSignal.windSpeedKmh must be a number');
    }
    if (typeof data.weatherSignal.relativeHumidityPercent !== 'number') {
      errors.push('weatherSignal.relativeHumidityPercent must be a number');
    }
  }

  if (!data.recommendation || typeof data.recommendation !== 'object') {
    errors.push('recommendation object is required');
  } else {
    const validCodes: DecisionCode[] = [
      'GO_SAFE',
      'CAUTION_MARGINAL',
      'NO_GO_UNSAFE',
      'REGEN_OPTIMAL',
      'REGEN_STRESS_MULCH_NOW'
    ];
    if (!validCodes.includes(data.recommendation.decisionCode)) {
      errors.push(`recommendation.decisionCode must be one of: ${validCodes.join(', ')}`);
    }
    if (!data.recommendation.primaryAdviceText) {
      errors.push('recommendation.primaryAdviceText is required');
    }
    if (
      !data.recommendation.spokenAdvice ||
      typeof data.recommendation.spokenAdvice !== 'object' ||
      !data.recommendation.spokenAdvice.en ||
      !data.recommendation.spokenAdvice.hi
    ) {
      errors.push('recommendation.spokenAdvice must contain "en" and "hi" strings');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

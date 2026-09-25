import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';

// Inlined config from firebase-applet-config.json to guarantee zero-fail bundling on Vercel
const FIREBASE_CONFIG = {
  projectId: 'gen-lang-client-0738776852',
  appId: '1:558867077355:web:c25f6c051e9cba4c9586ae',
  apiKey: 'AIzaSyDfqc-aRiAKclWsEMv2ia_RNB89K4zyZOs',
  authDomain: 'gen-lang-client-0738776852.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-kisanaisahayak-8b310804-edaf-4fd8-87c4-0e47798ed5a7',
  storageBucket: 'gen-lang-client-0738776852.firebasestorage.app',
  messagingSenderId: '558867077355'
};

function getDbInstance() {
  const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
  return getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
}

function validatePayload(data: any): { valid: boolean; errors: string[] } {
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
    const validCodes = [
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

  return { valid: errors.length === 0, errors };
}

/**
 * Universal Handler: works natively as Vercel Serverless Function
 * and can be mounted inside Express in dev without drift.
 */
export default async function handler(req: any, res: any) {
  // Global CORS headers for interoperable DPG consumers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const db = getDbInstance();

  // GET: Query federated agro-advisory records
  if (req.method === 'GET') {
    try {
      const typeFilter = req.query?.type as string | undefined;
      const cropFilter = req.query?.crop as string | undefined;
      const limitParam = parseInt((req.query?.limit as string) || '20', 10);
      const queryLimit = Math.min(Math.max(1, isNaN(limitParam) ? 20 : limitParam), 100);

      const advisoriesRef = collection(db, 'agro_advisories');
      let q = query(advisoriesRef, firestoreLimit(queryLimit));

      if (typeFilter && ['spray-safety', 'regenerative'].includes(typeFilter)) {
        q = query(advisoriesRef, where('recommendationType', '==', typeFilter), firestoreLimit(queryLimit));
      }

      const snapshot = await getDocs(q);
      let records: any[] = [];
      snapshot.forEach(docSnap => {
        records.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Filter in-memory by crop name if specified
      if (cropFilter) {
        const lowerCrop = cropFilter.toLowerCase();
        records = records.filter(r => r.crop?.name?.toLowerCase().includes(lowerCrop));
      }

      // Sort newest first
      records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return res.status(200).json({
        status: 'success',
        schema: 'brics.agrin.agro-advisory.v1',
        total: records.length,
        records
      });
    } catch (err: any) {
      console.error('Error querying agro-advisories from Firestore:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve agro-advisory records from Firestore',
        details: err?.message || String(err)
      });
    }
  }

  // POST: Ingest a newly generated agro-advisory record
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const validation = validatePayload(body);

      if (!validation.valid) {
        return res.status(400).json({
          status: 'invalid_schema',
          message: 'The submitted record does not conform to brics.agrin.agro-advisory.v1',
          errors: validation.errors
        });
      }

      const recordId = body.recordId || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const timestamp = body.timestamp || new Date().toISOString();

      const recordToStore = {
        schemaVersion: 'brics.agrin.agro-advisory.v1',
        recordId,
        timestamp,
        sourceNode: {
          nodeId: body.sourceNode.nodeId,
          country: body.sourceNode.country,
          institution: body.sourceNode.institution
        },
        recommendationType: body.recommendationType,
        crop: {
          name: body.crop.name,
          variety: body.crop.variety || 'Standard Local',
          growthStage: body.crop.growthStage || 'Active Growth'
        },
        region: {
          countryCode: body.region.countryCode,
          administrativeArea: body.region.administrativeArea,
          coordinates: {
            latitude: Number(body.region.coordinates.latitude),
            longitude: Number(body.region.coordinates.longitude)
          }
        },
        soilSignal: {
          surfaceWetnessPercent: Number(body.soilSignal.surfaceWetnessPercent),
          gwettopRaw: Number(body.soilSignal.gwettopRaw),
          source: body.soilSignal.source,
          capturedAt: body.soilSignal.capturedAt || timestamp
        },
        weatherSignal: {
          temperatureCelsius: Number(body.weatherSignal.temperatureCelsius),
          windSpeedKmh: Number(body.weatherSignal.windSpeedKmh),
          relativeHumidityPercent: Number(body.weatherSignal.relativeHumidityPercent),
          rainProbabilityPercent: body.weatherSignal.rainProbabilityPercent !== undefined
            ? Number(body.weatherSignal.rainProbabilityPercent)
            : 0,
          source: body.weatherSignal.source || 'OPEN_METEO_API'
        },
        recommendation: {
          decisionCode: body.recommendation.decisionCode,
          primaryAdviceText: body.recommendation.primaryAdviceText,
          spokenAdvice: {
            en: body.recommendation.spokenAdvice.en,
            hi: body.recommendation.spokenAdvice.hi
          },
          actionItems: Array.isArray(body.recommendation.actionItems)
            ? body.recommendation.actionItems
            : [],
          syntheticFertilizerReductionPct: body.recommendation.syntheticFertilizerReductionPct !== undefined
            ? Number(body.recommendation.syntheticFertilizerReductionPct)
            : 0,
          confidenceScore: body.recommendation.confidenceScore !== undefined
            ? Number(body.recommendation.confidenceScore)
            : 0.95
        }
      };

      const docRef = await addDoc(collection(db, 'agro_advisories'), recordToStore);

      return res.status(201).json({
        status: 'created',
        message: 'Agro-advisory record successfully stored in federated DPG repository',
        firestoreDocId: docRef.id,
        record: recordToStore
      });
    } catch (err: any) {
      console.error('Error writing agro-advisory record to Firestore:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to write agro-advisory record to Firestore',
        details: err?.message || String(err)
      });
    }
  }

  return res.status(405).json({
    status: 'method_not_allowed',
    message: `HTTP method ${req.method} is not supported. Use GET or POST.`
  });
}

# BRICS AgriN Interoperable Agro-Advisory Schema (v1.0)
**Digital Public Good (DPG) Machine-to-Machine Integration Guide**

---

## 1. Overview & Objective

The **BRICS AgriN Agro-Advisory Protocol (`brics.agrin.agro-advisory.v1`)** provides a vendor-neutral, machine-readable JSON standard for federating localized crop advisories across national agricultural research nodes (e.g., ICAR in India, Embrapa in Brazil, ARC in South Africa). 

By decoupling satellite telemetry (NASA POWER MERRA-2 Surface Soil Wetness `GWETTOP`) and weather forecasting from proprietary presentation tiers, any partner institution, rural cooperative, tractor telematics unit, or IVR/WhatsApp gateway can publish and consume validated agro-advisories.

- **Base URL (Production Vercel):** `https://kisan-ai-sahayak.vercel.app/api/v1/agro-advisory`
- **Schema ID:** `brics.agrin.agro-advisory.v1`
- **Persistence Layer:** Google Cloud Firestore (multi-region active replication)
- **Data Licensing:** Open Digital Public Good (CC-BY 4.0 / ODC-By)

---

## 2. API Endpoints

### `POST /api/v1/agro-advisory`
Publishes a freshly evaluated agro-advisory record into the federated repository.

- **Content-Type:** `application/json`
- **CORS:** Unrestricted (`Access-Control-Allow-Origin: *`)

#### Request Headers
```http
POST /api/v1/agro-advisory HTTP/1.1
Host: kisan-ai-sahayak.vercel.app
Content-Type: application/json
```

#### Request Payload Example (Spray Safety Advisory)
```json
{
  "sourceNode": {
    "nodeId": "in-icar-crida-01",
    "country": "India",
    "institution": "ICAR - Central Research Institute for Dryland Agriculture"
  },
  "recommendationType": "spray-safety",
  "crop": {
    "name": "Wheat (गेहूं)",
    "variety": "HD-2967",
    "growthStage": "Tillering"
  },
  "region": {
    "countryCode": "IN",
    "administrativeArea": "Punjab / Haryana Agro-Climatic Zone",
    "coordinates": {
      "latitude": 30.7333,
      "longitude": 76.7794
    }
  },
  "soilSignal": {
    "surfaceWetnessPercent": 58,
    "gwettopRaw": 0.58,
    "source": "NASA_POWER_MERRA2_GWETTOP"
  },
  "weatherSignal": {
    "temperatureCelsius": 22.4,
    "windSpeedKmh": 7.2,
    "relativeHumidityPercent": 64.0,
    "rainProbabilityPercent": 5.0,
    "source": "OPEN_METEO_API"
  },
  "recommendation": {
    "decisionCode": "GO_SAFE",
    "primaryAdviceText": "Excellent spray window. Calm winds (<10 km/h) and optimal humidity ensure minimal drift and maximum leaf absorption.",
    "spokenAdvice": {
      "en": "Conditions are safe for pesticide application. Wind is calm at 7 km/h with zero wash risk.",
      "hi": "दवा छिड़काव के लिए मौसम बिल्कुल अनुकूल है। हवा की गति 7 किमी/घंटा है और बारिश का खतरा नहीं है।"
    },
    "actionItems": [
      "Use flat-fan nozzles for uniform droplet deposition",
      "Maintain spray tank pressure at 2.5 - 3.0 bar",
      "Avoid spraying during peak mid-day direct heat"
    ],
    "syntheticFertilizerReductionPct": 0,
    "confidenceScore": 0.96
  }
}
```

#### Response (`HTTP/2 201 Created`)
```json
{
  "status": "created",
  "message": "Agro-advisory record successfully stored in federated DPG repository",
  "firestoreDocId": "c0X3wKjLz71eB8mOPq9v",
  "record": {
    "schemaVersion": "brics.agrin.agro-advisory.v1",
    "recordId": "rec_1727289600000_3k9f2a",
    "timestamp": "2026-09-25T22:15:00.000Z",
    "sourceNode": {
      "nodeId": "in-icar-crida-01",
      "country": "India",
      "institution": "ICAR - Central Research Institute for Dryland Agriculture"
    },
    "recommendationType": "spray-safety",
    "crop": {
      "name": "Wheat (गेहूं)",
      "variety": "HD-2967",
      "growthStage": "Tillering"
    },
    "region": {
      "countryCode": "IN",
      "administrativeArea": "Punjab / Haryana Agro-Climatic Zone",
      "coordinates": {
        "latitude": 30.7333,
        "longitude": 76.7794
      }
    },
    "soilSignal": {
      "surfaceWetnessPercent": 58,
      "gwettopRaw": 0.58,
      "source": "NASA_POWER_MERRA2_GWETTOP",
      "capturedAt": "2026-09-25T22:15:00.000Z"
    },
    "weatherSignal": {
      "temperatureCelsius": 22.4,
      "windSpeedKmh": 7.2,
      "relativeHumidityPercent": 64,
      "rainProbabilityPercent": 5,
      "source": "OPEN_METEO_API"
    },
    "recommendation": {
      "decisionCode": "GO_SAFE",
      "primaryAdviceText": "Excellent spray window. Calm winds (<10 km/h) and optimal humidity ensure minimal drift and maximum leaf absorption.",
      "spokenAdvice": {
        "en": "Conditions are safe for pesticide application. Wind is calm at 7 km/h with zero wash risk.",
        "hi": "दवा छिड़काव के लिए मौसम बिल्कुल अनुकूल है। हवा की गति 7 किमी/घंटा है और बारिश का खतरा नहीं है।"
      },
      "actionItems": [
        "Use flat-fan nozzles for uniform droplet deposition",
        "Maintain spray tank pressure at 2.5 - 3.0 bar",
        "Avoid spraying during peak mid-day direct heat"
      ],
      "syntheticFertilizerReductionPct": 0,
      "confidenceScore": 0.96
    }
  }
}
```

---

### `GET /api/v1/agro-advisory`
Queries historical and current federated advisories.

#### Query Parameters
| Parameter | Type | Default | Description |
|:---|:---|:---|:---|
| `type` | String | *(all)* | Filter by advisory type: `spray-safety` or `regenerative` |
| `crop` | String | *(all)* | Case-insensitive substring match (e.g. `Wheat`, `Rice`, `Soybean`) |
| `limit` | Integer | `20` | Maximum records to return (1 - 100) |

#### Example Request
```http
GET /api/v1/agro-advisory?type=spray-safety&limit=5 HTTP/1.1
Host: kisan-ai-sahayak.vercel.app
```

#### Response (`HTTP/2 200 OK`)
```json
{
  "status": "success",
  "schema": "brics.agrin.agro-advisory.v1",
  "total": 1,
  "records": [
    {
      "id": "c0X3wKjLz71eB8mOPq9v",
      "schemaVersion": "brics.agrin.agro-advisory.v1",
      "recordId": "rec_1727289600000_3k9f2a",
      "timestamp": "2026-09-25T22:15:00.000Z",
      "recommendationType": "spray-safety",
      "crop": { "name": "Wheat (गेहूं)" },
      "recommendation": {
        "decisionCode": "GO_SAFE",
        "primaryAdviceText": "Excellent spray window..."
      }
    }
  ]
}
```

---

## 3. Decision Codes Reference

| Code | Type | Meaning | Operational Action |
|:---|:---|:---|:---|
| `GO_SAFE` | `spray-safety` | Wind < 12 km/h, humidity 50-80%, zero rain | Proceed with spray application |
| `CAUTION_MARGINAL` | `spray-safety` | Moderate wind (12-18 km/h) or humidity > 80% | Use coarse droplets, monitor closely |
| `NO_GO_UNSAFE` | `spray-safety` | Wind > 18 km/h or imminent rain forecast | Cease all spraying; chemical drift/runoff risk |
| `REGEN_OPTIMAL` | `regenerative` | Soil wetness 50-70% (NASA GWETTOP) | Mulch residues, reduce synthetic urea by 25% |
| `REGEN_STRESS_MULCH_NOW` | `regenerative` | Soil wetness < 30% (moisture deficit) | Apply straw mulch immediately, hold chemicals |

---

## 4. Quick Partner Testing via `curl`

### 1. Test Ingestion (`POST`)
```bash
curl -X POST https://kisan-ai-sahayak.vercel.app/api/v1/agro-advisory \
  -H "Content-Type: application/json" \
  -d '{
    "sourceNode": { "nodeId": "br-embrapa-cnptia-01", "country": "Brazil", "institution": "Embrapa" },
    "recommendationType": "regenerative",
    "crop": { "name": "Soybean" },
    "region": {
      "countryCode": "BR",
      "administrativeArea": "Cerrado",
      "coordinates": { "latitude": -15.78, "longitude": -47.93 }
    },
    "soilSignal": { "surfaceWetnessPercent": 61, "gwettopRaw": 0.61, "source": "NASA_POWER_MERRA2_GWETTOP" },
    "weatherSignal": { "temperatureCelsius": 26.5, "windSpeedKmh": 9.0, "relativeHumidityPercent": 68.0, "source": "OPEN_METEO_API" },
    "recommendation": {
      "decisionCode": "REGEN_OPTIMAL",
      "primaryAdviceText": "Optimal soil moisture. Apply biological nitrogen fixers and cover crop rotation.",
      "spokenAdvice": {
        "en": "Soil condition is optimal. Utilize inoculants and maintain residue cover.",
        "hi": "मृदा स्थिति उत्तम है। जैविक खाद का उपयोग करें।"
      },
      "syntheticFertilizerReductionPct": 30
    }
  }'
```

### 2. Verify Retrieval (`GET`)
```bash
curl -s "https://kisan-ai-sahayak.vercel.app/api/v1/agro-advisory?type=regenerative&limit=5"
```

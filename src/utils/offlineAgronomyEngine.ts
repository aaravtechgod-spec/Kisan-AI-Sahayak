// Offline Agronomy Intelligence Engine
// Zero-data on-device rule & symptom triage for Indian smallholder farmers.
// Runs 100% locally in browser without internet or server connection.

export interface OfflineAdvisoryResult {
  isOffline: boolean;
  verdict: 'SAFE' | 'CAUTION' | 'URGENT';
  cropOrCategory: string;
  problem: string;
  problemHindi: string;
  spokenSentence: string;
  spokenSentenceHindi: string;
  primaryAction: string;
  primaryActionHindi: string;
  organicDosage: string;
  chemicalDosage: string;
  waterPerAcre: string;
  confidence: number;
}

const OFFLINE_KNOWLEDGE_BASE = [
  {
    keywords: ['yellow', 'rust', 'पीला', 'रतुआ', 'पत्ती', 'wheat', 'गेहूं', 'stripe'],
    verdict: 'URGENT' as const,
    cropOrCategory: 'Wheat (गेहूं)',
    problem: 'Yellow Rust / Stripe Rust',
    problemHindi: 'पीला रतुआ फफूंद रोग',
    spokenSentence: 'Warning: Yellow rust detected. Spray Propiconazole 1ml per liter or sour buttermilk immediately to stop spread.',
    spokenSentenceHindi: 'सावधानी: गेहूं में पीला रतुआ का लक्षण है। तुरंत प्रोपिकोनाजोल या खट्टी छाछ का छिड़काव करें।',
    primaryAction: 'Foliar spray within 48 hours to prevent crop loss.',
    primaryActionHindi: '48 घंटे के भीतर फफूंदनाशक का छिड़काव करें।',
    organicDosage: '500ml aged sour buttermilk (खट्टी छाछ) + 50g turmeric in 15L water pump',
    chemicalDosage: 'Propiconazole 25% EC (Tilt) @ 15ml per 15L pump (1ml/L)',
    waterPerAcre: '150 - 200 Litres',
  },
  {
    keywords: ['blight', 'झुलसा', 'spot', 'धान', 'rice', 'paddy', 'sheath', 'सड़न'],
    verdict: 'URGENT' as const,
    cropOrCategory: 'Paddy / Rice (धान)',
    problem: 'Blight / Sheath Blight',
    problemHindi: 'शीथ ब्लाइट एवं झुलसा',
    spokenSentence: 'Blight detected. Drain standing water and spray Hexaconazole or Trichoderma at plant base.',
    spokenSentenceHindi: 'खेत में झुलसा रोग है। खेत से रुका पानी निकालें और हेक्साकोनाजोल का छिड़काव करें।',
    primaryAction: 'Drain field water for 48 hours to lower humidity.',
    primaryActionHindi: 'खेत से 2 दिन के लिए पानी निकालें और जड़ों के पास स्प्रे करें।',
    organicDosage: 'Trichoderma viride bio-fungicide @ 5g per Litre early morning',
    chemicalDosage: 'Hexaconazole 5% SC @ 30ml per 15L pump or Validamycin 3% L',
    waterPerAcre: '150 Litres',
  },
  {
    keywords: ['pest', 'worm', 'कीड़ा', 'कीट', 'सुंडी', 'bollworm', 'कपास', 'cotton', 'caterpillar', 'इल्ली'],
    verdict: 'CAUTION' as const,
    cropOrCategory: 'Cotton / Legumes (कपास / दलहन)',
    problem: 'Bollworm / Pod Borer Caterpillar',
    problemHindi: 'गुलाबी सुंडी / फली छेदक इल्ली',
    spokenSentence: 'Caterpillar pest detected. Install pheromone traps and spray Neem Oil or Emamectin Benzoate.',
    spokenSentenceHindi: 'फसल में सुंडी कीट का प्रकोप है। नीम तेल या इमामेक्टिन का शाम के समय छिड़काव करें।',
    primaryAction: 'Evening spray and install 4 pheromone traps per acre.',
    primaryActionHindi: 'शाम के समय छिड़काव करें और खेत में फेरोमोन ट्रैप लगाएं।',
    organicDosage: 'Neem Oil 1500 PPM @ 50ml per 15L pump with small soap liquid',
    chemicalDosage: 'Emamectin Benzoate 5% SG @ 5g per 15L pump',
    waterPerAcre: '150 Litres',
  },
  {
    keywords: ['aphid', 'chepa', 'mahu', 'माहू', 'चेपा', 'सरसों', 'mustard', 'sucking'],
    verdict: 'CAUTION' as const,
    cropOrCategory: 'Mustard / Vegetables (सरसों / सब्जी)',
    problem: 'Aphid / Chepa (Sucking Pest)',
    problemHindi: 'माहू / चेपा रसचूसक कीट',
    spokenSentence: 'Aphid swarm detected. Spray Dimethoate or soapy Neem water before 10 AM, avoid midday bee hours.',
    spokenSentenceHindi: 'सरसों में चेपा कीट है। सुबह 10 बजे से पहले नीम का काढ़ा या रोगोर का छिड़काव करें।',
    primaryAction: 'Spray strictly before 10 AM to protect pollinating honeybees.',
    primaryActionHindi: 'मधुमक्खियों की रक्षा के लिए सुबह 10 बजे से पहले ही स्प्रे करें।',
    organicDosage: 'Neem Seed Kernel Extract 5% (50g/L) or fine wood ash dusting',
    chemicalDosage: 'Dimethoate 30% EC (Rogor) @ 25ml per 15L water pump',
    waterPerAcre: '120 - 150 Litres',
  },
  {
    keywords: ['irrigation', 'water', 'पानी', 'सिंचाई', 'सूखा', 'dry', 'moisture'],
    verdict: 'SAFE' as const,
    cropOrCategory: 'Soil Moisture / Irrigation (सिंचाई प्रबंधन)',
    problem: 'Irrigation Scheduling Guidance',
    problemHindi: 'सिंचाई का सही समय व जल प्रबंधन',
    spokenSentence: 'Field irrigation advice: Irrigate early morning or night to cut 40% evaporation loss.',
    spokenSentenceHindi: 'सिंचाई सलाह: सुबह या शाम को हल्की सिंचाई करें, तेज धूप में पानी न लगाएं।',
    primaryAction: 'Irrigate during low-evaporation hours (early morning 6-9 AM).',
    primaryActionHindi: 'सुबह 6 से 9 बजे या शाम को ही पानी दें।',
    organicDosage: 'Mulch field with crop straw/husk to conserve 35% soil moisture',
    chemicalDosage: 'Check soil ball test: if soil crumbles in palm, irrigate immediately',
    waterPerAcre: 'Light furrow irrigation',
  },
  {
    keywords: ['fertilizer', 'खाद', 'urea', 'यूरिया', 'dap', 'npk', 'बचत', 'cost'],
    verdict: 'SAFE' as const,
    cropOrCategory: 'Nutrient & Fertilizer (खाद प्रबंधन)',
    problem: 'Nutrient Optimization & Soil Health',
    problemHindi: 'संतुलित खाद व लागत कटौती',
    spokenSentence: 'Fertilizer advice: Split Urea into 3 doses with Neem coating. Never broadcast during peak noon.',
    spokenSentenceHindi: 'खाद सलाह: यूरिया को 3 भागों में बांटकर दें। नीम लेपित यूरिया से 25% कम खाद लगती है।',
    primaryAction: 'Split application of nitrogen at tillering and flowering stage.',
    primaryActionHindi: 'यूरिया एक साथ न डालें, कल्ले फूटते समय और फूल आते समय 2-3 बार में दें।',
    organicDosage: 'Ghanajeevamrutha 250kg per acre during land preparation',
    chemicalDosage: 'NPK 19:19:19 foliar spray @ 75g per 15L pump for fast absorption',
    waterPerAcre: '150 Litres foliar solution',
  },
];

export function runOfflineAgronomyTriage(queryText: string): OfflineAdvisoryResult {
  const normalized = (queryText || '').toLowerCase().trim();

  // Find best matching agronomy rule
  let bestMatch = OFFLINE_KNOWLEDGE_BASE[0];
  let maxScore = 0;

  for (const item of OFFLINE_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // Fallback if no specific keyword matched
  if (maxScore === 0) {
    return {
      isOffline: true,
      verdict: 'SAFE',
      cropOrCategory: 'General Field Crop (सामान्य फसल)',
      problem: 'Offline Field Diagnostic (Standard Protocol)',
      problemHindi: 'ऑफलाइन फसल प्राथमिक सुरक्षा प्रोटोकॉल',
      spokenSentence: 'Offline triage: Inspect leaf undersides for pests. If yellowing, apply mild NPK foliar spray in early morning.',
      spokenSentenceHindi: 'ऑफलाइन सलाह: पत्तियों के नीचे कीड़े जांचें। पीलापन हो तो सुबह हल्का एनपीके या नीम तेल का स्प्रे करें।',
      primaryAction: 'Observe leaf signs and use clean water spray pump.',
      primaryActionHindi: 'सुबह पत्तियों का निरीक्षण करें और साफ पानी के साथ स्प्रे करें।',
      organicDosage: 'Neem Oil 1500 PPM @ 4ml per Litre water',
      chemicalDosage: 'NPK 19:19:19 foliar spray (5g/L water)',
      waterPerAcre: '150 Litres',
      confidence: 78,
    };
  }

  return {
    isOffline: true,
    verdict: bestMatch.verdict,
    cropOrCategory: bestMatch.cropOrCategory,
    problem: bestMatch.problem,
    problemHindi: bestMatch.problemHindi,
    spokenSentence: bestMatch.spokenSentence,
    spokenSentenceHindi: bestMatch.spokenSentenceHindi,
    primaryAction: bestMatch.primaryAction,
    primaryActionHindi: bestMatch.primaryActionHindi,
    organicDosage: bestMatch.organicDosage,
    chemicalDosage: bestMatch.chemicalDosage,
    waterPerAcre: bestMatch.waterPerAcre,
    confidence: 88,
  };
}

export function runOfflineImageDiagnosis(cropType: string, sampleIdHint?: string): any {
  // Pre-compiled offline triage profiles for visual samples
  const profiles: Record<string, any> = {
    rust: {
      diseaseName: 'Wheat Yellow Rust (Puccinia striiformis)',
      diseaseNameHindi: 'गेहूं का पीला रतुआ रोग',
      severity: 'HIGH',
      confidenceScore: 92,
      spokenSentence: 'फसल में पीला रतुआ की पहचान हुई है। तुरंत प्रोपिकोनाजोल या खट्टी छाछ का छिड़काव करें।',
      immediateStep: 'तत्काल प्रोपिकोनाजोल 25% EC (1 मिली/लीटर) या खट्टी छाछ (500 मिली/15L) का छिड़काव करें।',
      dosage: '15 मिली प्रति 15 लीटर पानी का स्प्रे पंप',
      organicAlternative: '500 मिली 4-5 दिन पुरानी खट्टी छाछ + 50 ग्राम हल्दी पाउडर 15 लीटर पानी में।',
      timingRecommendation: 'सुबह 7 से 10 बजे शांत हवा में छिड़काव करें।',
      isOfflineAnalysis: true,
    },
    blight: {
      diseaseName: 'Paddy Sheath Blight (Rhizoctonia solani)',
      diseaseNameHindi: 'धान का शीथ ब्लाइट (झुलसा)',
      severity: 'HIGH',
      confidenceScore: 89,
      spokenSentence: 'धान में झुलसा रोग मिला है। खेत से 2 दिन पानी निकालें और हेक्साकोनाजोल दवा डालें।',
      immediateStep: 'खेत से जमा पानी निकालें और हेक्साकोनाजोल 5% SC (2 मिली/लीटर) पौधों की जड़ के पास छिड़कें।',
      dosage: '30 मिली प्रति 15 लीटर स्प्रे पंप',
      organicAlternative: 'ट्राइकोडर्मा विरिडी 5 ग्राम प्रति लीटर पानी का छिड़काव।',
      timingRecommendation: 'सुबह के समय पौधों के निचले तने पर सीधा स्प्रे करें।',
      isOfflineAnalysis: true,
    },
    pest: {
      diseaseName: 'Cotton Pink Bollworm (Pectinophora gossypiella)',
      diseaseNameHindi: 'कपास की गुलाबी सुंडी',
      severity: 'HIGH',
      confidenceScore: 91,
      spokenSentence: 'कपास में गुलाबी सुंडी का प्रकोप है। फेरोमोन ट्रैप लगाएं और शाम को इमामेक्टिन का छिड़काव करें।',
      immediateStep: 'गुलाब के आकार के ग्रसित फूलों को तोड़कर नष्ट करें और इमामेक्टिन बेंजोएट का छिड़काव करें।',
      dosage: '5 ग्राम इमामेक्टिन 5% SG प्रति 15 लीटर पानी',
      organicAlternative: 'नीम तेल 1500 PPM (50 मिली/पंप) + प्रति एकड़ 4-5 फेरोमोन ट्रैप लगाएं।',
      timingRecommendation: 'शाम 4 से 6 बजे के बीच जब सुंडी सक्रिय होती है।',
      isOfflineAnalysis: true,
    },
    aphid: {
      diseaseName: 'Mustard Aphid / Mahu (Lipaphis erysimi)',
      diseaseNameHindi: 'सरसों का माहू / चेपा कीट',
      severity: 'MEDIUM',
      confidenceScore: 94,
      spokenSentence: 'सरसों में चेपा कीट लगा है। सुबह 10 बजे से पहले नीम का घोल या रोगोर दवा छिड़कें।',
      immediateStep: 'डायमेथोएट 30% EC (रोगोर) का 25 मिली प्रति पंप छिड़काव करें।',
      dosage: '25 मिली प्रति 15 लीटर स्प्रे पंप',
      organicAlternative: 'नीम बीज अर्क 5% या सुबह की ओस में लकड़ी की बारीक राख का भुरकाव।',
      timingRecommendation: 'सुबह 10 बजे से पहले ही छिड़कें ताकि मधुमक्खियों को नुकसान न हो।',
      isOfflineAnalysis: true,
    },
  };

  const matched = sampleIdHint && profiles[sampleIdHint] ? profiles[sampleIdHint] : profiles.rust;
  return matched;
}

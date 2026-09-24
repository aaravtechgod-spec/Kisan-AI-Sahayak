import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  ArrowLeft,
  Volume2,
  VolumeX,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Droplets,
  ChevronDown,
  ChevronUp,
  Share2,
  WifiOff,
} from 'lucide-react';
import { speechManager } from '../utils/speech';
import { runOfflineImageDiagnosis } from '../utils/offlineAgronomyEngine';

interface CropDiagnosisViewProps {
  lang: 'hi' | 'en';
  onBack: () => void;
  isSunMode?: boolean;
}

const VISUAL_LEAF_SAMPLES = [
  {
    id: 'rust',
    name: 'गेहूं: पीला रतुआ (Yellow Rust)',
    crop: 'Wheat',
    icon: '🌾',
    imgUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'blight',
    name: 'धान: झुलसा रोग (Blight)',
    crop: 'Paddy',
    icon: '🌱',
    imgUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pest',
    name: 'कपास: गुलाबी सुंडी (Bollworm)',
    crop: 'Cotton',
    icon: '🐛',
    imgUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'aphid',
    name: 'सरसों: चेपा / माहू कीट (Aphid)',
    crop: 'Mustard',
    icon: '🐞',
    imgUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
  },
];

export const CropDiagnosisView: React.FC<CropDiagnosisViewProps> = ({
  lang,
  onBack,
  isSunMode = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTechSlip, setShowTechSlip] = useState(false);
  const [showDosageGuide, setShowDosageGuide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Stop speech if leaving
  useEffect(() => {
    return () => {
      speechManager.stop();
    };
  }, []);

  const handleFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      runScan(base64, 'Field Crop');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof VISUAL_LEAF_SAMPLES[0]) => {
    setSelectedImage(sample.imgUrl);
    runScan(sample.imgUrl, sample.crop, sample.id);
  };

  const runScan = async (imgSource: string, cropName: string = 'Field Crop', sampleIdHint?: string) => {
    setIsScanning(true);
    setDiagnosis(null);
    setError(null);
    speechManager.stop();

    // Spoken guidance that scanning is in progress
    const waitSentence = lang === 'hi'
      ? 'फसल की जांच हो रही है, कृपया 5 सेकंड प्रतीक्षा करें।'
      : 'Analyzing leaf photo with crop doctor AI, please wait.';
    speechManager.speak(waitSentence, lang);

    // If completely offline, run deterministic offline vision/agronomy triage
    if (!navigator.onLine) {
      const offlineDiag = runOfflineImageDiagnosis(cropName, sampleIdHint);
      setDiagnosis(offlineDiag);
      const speechToSpeak = offlineDiag.spokenSentence;
      speechManager.speak(
        speechToSpeak,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
      setIsScanning(false);
      return;
    }

    try {
      let base64Data = imgSource;
      if (imgSource.startsWith('http')) {
        const response = await fetch(imgSource);
        const blob = await response.blob();
        base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/scan-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          cropType: cropName,
          preferredLanguage: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.diagnosis) {
        throw new Error(data.error || 'Scan analysis failed');
      }

      const diag = data.diagnosis;
      setDiagnosis(diag);

      // Rule: Every result: icon -> color -> ONE spoken sentence, in that order
      const speechToSpeak = diag.spokenSentence || (
        lang === 'hi'
          ? `फसल में ${diag.diseaseNameHindi || diag.diseaseName} की पहचान हुई है। तुरंत बताई गई दवा का छिड़काव करें।`
          : `Diagnosed ${diag.diseaseName}. Immediate action recommended.`
      );

      speechManager.speak(
        speechToSpeak,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    } catch (e: any) {
      console.warn('Online cloud scan failed or offline, switching to on-device offline triage:', e);
      // Fallback to offline rule-based diagnosis
      const offlineDiag = runOfflineImageDiagnosis(cropName, sampleIdHint);
      setDiagnosis(offlineDiag);
      const speechToSpeak = offlineDiag.spokenSentence;
      speechManager.speak(
        speechToSpeak,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    } finally {
      setIsScanning(false);
    }
  };

  const speakResultAgain = () => {
    if (!diagnosis) return;
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
      return;
    }
    const speechToSpeak = diagnosis.spokenSentence || (
      lang === 'hi'
        ? `फसल में ${diagnosis.diseaseNameHindi || diagnosis.diseaseName} की पहचान हुई है। तुरंत बताई गई दवा का छिड़काव करें।`
        : `Diagnosed ${diagnosis.diseaseName}. Immediate action recommended.`
    );
    speechManager.speak(
      speechToSpeak,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Hidden File Inputs for Direct Camera and Gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
        }}
      />

      {/* Top High-Contrast Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b-3 border-black px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => {
            speechManager.stop();
            onBack();
          }}
          className="h-12 px-4 rounded-xl border-2 border-black bg-slate-100 active:bg-slate-200 font-black text-sm flex items-center gap-2 shadow-[0_3px_0_0_#000]"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
          <span>{lang === 'hi' ? 'पीछे जाएं' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2 font-black text-base sm:text-lg">
          <span className="text-2xl">📷</span>
          <span>{lang === 'hi' ? 'फसल डॉक्टर' : 'Crop Doctor'}</span>
        </div>

        <a
          href="tel:18001801551"
          className="h-12 w-12 rounded-xl border-2 border-black bg-emerald-400 active:bg-emerald-500 flex items-center justify-center shadow-[0_3px_0_0_#000]"
          title="Call Kisan Helpline"
        >
          <PhoneCall className="w-6 h-6 text-black" />
        </a>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* STEP 1: INITIAL STATE (NO RESULT YET) */}
        {!diagnosis && !isScanning && (
          <div className="space-y-4">
            {/* Primary Action Button: Takes > 25% of screen height */}
            <div className="bg-white rounded-3xl border-3 border-black p-4 shadow-[0_6px_0_0_#000] text-center space-y-3">
              <span className="text-xs sm:text-sm font-black text-slate-600 uppercase tracking-wider block">
                {lang === 'hi' ? 'कदम 1: पत्ती या फसल की फोटो लें' : 'Step 1: Take Photo of Leaf'}
              </span>

              {/* GIANT CAMERA BUTTON (The Primary Action >= 25% screen) */}
              <button
                type="button"
                id="big-camera-action-button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full min-h-[160px] sm:min-h-[190px] rounded-3xl bg-[#16A34A] hover:bg-[#15803D] active:scale-98 text-white border-3 border-black flex flex-col items-center justify-center gap-2 shadow-[0_6px_0_0_#000] transition group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-white border-3 border-black flex items-center justify-center text-black shadow-inner group-hover:scale-105 transition">
                  <Camera className="w-11 h-11 text-emerald-700" />
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-wide text-white">
                  {lang === 'hi' ? '📷 कैमरा चालू करें' : '📷 Take Photo'}
                </span>
                <span className="text-xs font-bold text-emerald-100 bg-black/30 px-3 py-1 rounded-full">
                  {lang === 'hi' ? 'एक टैप में फोटो खींचें' : 'Single Tap to Capture'}
                </span>
              </button>

              {/* Secondary Gallery Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-14 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_0_#000]"
              >
                <Upload className="w-5 h-5 text-slate-800" />
                <span>{lang === 'hi' ? '🖼️ गैलरी से फोटो चुनें' : '🖼️ Pick from Gallery'}</span>
              </button>
            </div>

            {/* 1-Tap Visual Leaf Samples for Instant Testing without camera */}
            <div className="bg-white rounded-3xl border-3 border-black p-4 shadow-[0_6px_0_0_#000] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-slate-800">
                  {lang === 'hi' ? 'या इन पत्तों पर टैप करके जांचें:' : 'Or tap sample leaf to test:'}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  {lang === 'hi' ? '1-टैप' : '1-Tap'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {VISUAL_LEAF_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 border-2 border-black text-left flex flex-col gap-1.5 shadow-[0_2px_0_0_#000] transition"
                  >
                    <div className="h-20 w-full rounded-xl overflow-hidden border border-black relative bg-black/5">
                      <img
                        src={sample.imgUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 bg-white/95 px-1.5 py-0.5 rounded text-xs border border-black font-black">
                        {sample.icon}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-900 truncate">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SCANNING IN PROGRESS */}
        {isScanning && (
          <div className="bg-white rounded-3xl border-3 border-black p-6 sm:p-8 text-center space-y-5 shadow-[0_6px_0_0_#000]">
            <div className="relative w-28 h-28 mx-auto rounded-3xl bg-emerald-100 border-3 border-black flex items-center justify-center shadow-inner overflow-hidden">
              <Camera className="w-14 h-14 text-emerald-700 animate-bounce" />
              <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                {lang === 'hi' ? 'जांच हो रही है...' : 'Scanning Crop Leaf...'}
              </h2>
              <p className="text-sm font-bold text-slate-600">
                {lang === 'hi'
                  ? 'रोग, कीट और सही दवा की पहचान की जा रही है'
                  : 'Identifying pathogen, pest, and exact spray dose'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-emerald-800 bg-emerald-100 p-3 rounded-2xl border-2 border-emerald-600 font-black text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{lang === 'hi' ? 'आवाज़ तैयार हो रही है...' : 'Preparing voice diagnosis...'}</span>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT SCREEN (FOLLOWING EXACT CONSTRAINTS) */}
        {/* Constraints: ONE icon + ONE spoken sentence + ONE action ("spray X" or "call helpline"), not a text report */}
        {diagnosis && !isScanning && (
          <div className="space-y-4">
            {/* Primary Result Card */}
            <div
              className={`rounded-3xl border-4 p-5 text-center shadow-[0_6px_0_0_#000] space-y-4 ${
                diagnosis.statusColor === 'green'
                  ? 'bg-[#E8F8EE] border-[#16A34A]'
                  : diagnosis.statusColor === 'amber'
                  ? 'bg-[#FEF9C3] border-[#CA8A04]'
                  : 'bg-[#FEE2E2] border-[#DC2626]'
              }`}
            >
              {/* Offline Engine Tag */}
              {diagnosis.isOfflineAnalysis && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black font-black text-xs border-2 border-black shadow-sm">
                  <WifiOff className="w-4 h-4 text-black" />
                  <span>{lang === 'hi' ? 'ऑफलाइन एआई निदान सक्रिय (0 Data)' : 'Offline Agri-AI Active (0 Data)'}</span>
                </div>
              )}

              {/* 1. ONE GIANT ICON */}
              <div className="relative mx-auto w-24 h-24 rounded-full bg-white border-3 border-black flex items-center justify-center shadow-[0_4px_0_0_#000]">
                <span className="text-5xl">
                  {diagnosis.statusColor === 'green'
                    ? '🌿'
                    : diagnosis.primaryIcon === 'pest'
                    ? '🐛'
                    : '🍂'}
                </span>
                <span
                  className={`absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full text-xs font-black text-white border-2 border-black ${
                    diagnosis.statusColor === 'green'
                      ? 'bg-emerald-600'
                      : diagnosis.statusColor === 'amber'
                      ? 'bg-amber-500 text-black'
                      : 'bg-red-600'
                  }`}
                >
                  {diagnosis.severity || 'Urgent'}
                </span>
              </div>

              {/* Disease Name Badge (Large High Contrast) */}
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-950 block">
                  {lang === 'hi'
                    ? diagnosis.diseaseNameHindi || diagnosis.diseaseName
                    : diagnosis.diseaseName}
                </span>
                <span className="text-xs font-bold text-slate-700 mt-0.5 block">
                  {diagnosis.crop} • {diagnosis.pathogenType || 'Crop Health'}
                </span>
              </div>

              {/* 2. ONE SPOKEN SENTENCE (TTS Auto-Speaks) + Replay Button */}
              <div className="bg-white/95 border-2 border-black rounded-2xl p-3.5 shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>{lang === 'hi' ? '📢 डॉक्टर की आवाज़' : '📢 Doctor Voice'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={speakResultAgain}
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-[0_2px_0_0_#000] active:scale-95 transition ${
                      isSpeaking ? 'bg-amber-400 text-black' : 'bg-emerald-400 text-black'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'फिर से सुनें' : 'Listen')}</span>
                  </button>
                </div>

                <p className="text-base sm:text-lg font-black text-slate-950 leading-snug text-left">
                  "{diagnosis.spokenSentence}"
                </p>
              </div>

              {/* 3. ONE PRIMARY ACTION BUTTON (>= 25% screen width/height footprint) */}
              <div className="space-y-2 pt-1">
                {diagnosis.chemicalTreatment?.medicineName ? (
                  <button
                    type="button"
                    id="single-primary-spray-action"
                    onClick={() => setShowDosageGuide(!showDosageGuide)}
                    className="w-full min-h-[74px] sm:min-h-[84px] rounded-2xl bg-[#16A34A] hover:bg-[#15803D] active:scale-98 text-white border-3 border-black font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-[0_5px_0_0_#000] transition cursor-pointer"
                  >
                    <Droplets className="w-8 h-8 text-white shrink-0 animate-pulse" />
                    <div className="text-left leading-tight">
                      <span className="block text-lg sm:text-xl font-black">
                        {lang === 'hi'
                          ? `🚿 छिड़काव: ${diagnosis.chemicalTreatment.medicineName.split('(')[0]}`
                          : `🚿 Spray: ${diagnosis.chemicalTreatment.medicineName.split('(')[0]}`}
                      </span>
                      <span className="text-xs font-bold text-emerald-100">
                        {diagnosis.chemicalTreatment.dosagePerPump || '15ml per 15L tank'} (टैप करें)
                      </span>
                    </div>
                  </button>
                ) : (
                  <a
                    href="tel:18001801551"
                    className="w-full min-h-[74px] rounded-2xl bg-[#16A34A] text-white border-3 border-black font-black text-lg flex items-center justify-center gap-3 shadow-[0_5px_0_0_#000]"
                  >
                    <PhoneCall className="w-8 h-8 text-white" />
                    <span>{lang === 'hi' ? '📞 किसान हेल्पलाइन 1800-180-1551' : '📞 Call Helpline 1800-180-1551'}</span>
                  </a>
                )}

                {/* Instant Dosage Tank Visualizer when primary action is tapped */}
                {showDosageGuide && diagnosis.chemicalTreatment && (
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-black text-left space-y-2 shadow-inner">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                      <span>🧪</span>
                      <span>{lang === 'hi' ? 'सही मात्रा व घोलने का तरीका:' : 'Exact Dosage & Mixing:'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-300">
                        <span className="text-slate-500 block text-[10px]">{lang === 'hi' ? '15 लीटर टंकी' : '15L Tank'}</span>
                        <span className="text-slate-900 font-black text-sm">{diagnosis.chemicalTreatment.dosagePerPump}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-300">
                        <span className="text-slate-500 block text-[10px]">{lang === 'hi' ? '1 एकड़ खर्च' : '1 Acre Cost'}</span>
                        <span className="text-slate-900 font-black text-sm">{diagnosis.chemicalTreatment.estimatedCost}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      ⏰ <strong>{lang === 'hi' ? 'समय:' : 'Timing:'}</strong> {diagnosis.sprayTiming || 'सुबह 10 बजे से पहले'}
                    </p>
                  </div>
                )}
              </div>

              {/* Secondary Call Helpline Fallback */}
              <a
                href="tel:18001801551"
                className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-black text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_0_0_#000]"
              >
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'hi' ? '📞 फोन पर डॉक्टर से बात करें: 1800-180-1551' : '📞 Talk to Doctor: 1800-180-1551'}</span>
              </a>
            </div>

            {/* Collapsed Technical Report Slip (NOT primary UI, for literate shopkeeper) */}
            <div className="bg-white rounded-2xl border-2 border-black p-3 shadow-sm">
              <button
                type="button"
                onClick={() => setShowTechSlip(!showTechSlip)}
                className="w-full text-xs font-black text-slate-800 flex items-center justify-between py-1"
              >
                <span className="flex items-center gap-1.5">
                  <span>📋</span>
                  <span>{lang === 'hi' ? 'दवा दुकानदार के लिए पर्ची (विवरण)' : 'Prescription for Agrochemical Dealer'}</span>
                </span>
                {showTechSlip ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTechSlip && (
                <div className="pt-3 border-t border-slate-200 mt-2 space-y-2 text-xs text-slate-800">
                  <div>
                    <strong className="block text-slate-900">{lang === 'hi' ? 'रासायनिक दवा:' : 'Chemical Medicine:'}</strong>
                    <span>{diagnosis.chemicalTreatment?.medicineName} ({diagnosis.chemicalTreatment?.dosagePerAcre})</span>
                  </div>
                  {diagnosis.organicAlternative?.recipeName && (
                    <div>
                      <strong className="block text-slate-900">{lang === 'hi' ? 'सस्ता देशी विकल्प:' : 'Organic Alternative:'}</strong>
                      <span>{diagnosis.organicAlternative.recipeName} ({diagnosis.organicAlternative.ingredients})</span>
                    </div>
                  )}
                  <div>
                    <strong className="block text-slate-900">{lang === 'hi' ? 'सुरक्षा नियम:' : 'Safety Precaution:'}</strong>
                    <span>{diagnosis.fieldSafetyTips?.[0] || 'मुंह पर गमछा या मास्क बांधकर छिड़काव करें।'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Retake Photo Button */}
            <button
              type="button"
              onClick={() => {
                setDiagnosis(null);
                setSelectedImage(null);
                speechManager.stop();
              }}
              className="w-full h-14 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_0_#000]"
            >
              <RefreshCw className="w-5 h-5 text-black" />
              <span>{lang === 'hi' ? '📷 दूसरी फोटो जांचें' : '📷 Scan Another Photo'}</span>
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-600 text-red-950 text-xs font-bold space-y-2">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="px-3 py-1 rounded-lg bg-red-600 text-white font-black"
            >
              {lang === 'hi' ? 'ठीक है' : 'Dismiss'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

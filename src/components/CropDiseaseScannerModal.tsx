import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  AlertTriangle,
  Volume2,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Leaf,
  Bug,
  Droplets,
  DollarSign,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';
import { CropDiseaseDiagnosis } from '../types';

interface CropDiseaseScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'hi';
  onSavePrescription?: (diagnosis: CropDiseaseDiagnosis) => void;
}

const SAMPLE_DISEASE_CASES = [
  {
    name: 'Wheat Yellow Rust',
    nameHindi: 'गेहूं का पीला रतुआ',
    crop: 'Wheat',
    notes: 'Yellowish-orange powder stripes along leaf veins, spreading fast',
    imgUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Paddy Sheath Blight',
    nameHindi: 'धान का शीथ ब्लाइट / झुलसा',
    crop: 'Paddy',
    notes: 'Oval greyish-green lesions on leaf sheath near water level',
    imgUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cotton Pink Bollworm',
    nameHindi: 'कपास गुलाबी सुंडी',
    crop: 'Cotton',
    notes: 'Rosetted flowers and boreholes in developing bolls',
    imgUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mustard Aphid Attack',
    nameHindi: 'सरसों का चेपा / माहू कीट',
    crop: 'Mustard',
    notes: 'Tiny black-green insects clustered on flowering shoots sucking sap',
    imgUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
  },
];

export const CropDiseaseScannerModal: React.FC<CropDiseaseScannerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSavePrescription,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState('Wheat');
  const [farmerNotes, setFarmerNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<CropDiseaseDiagnosis | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setDiagnosis(null);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_DISEASE_CASES[0]) => {
    setCropType(sample.crop);
    setFarmerNotes(sample.notes);
    setSelectedImage(sample.imgUrl);
    setDiagnosis(null);
    setScanError(null);
  };

  const runVisualScan = async () => {
    if (!selectedImage) {
      setScanError(lang === 'en' ? 'Please upload or capture a crop leaf photo.' : 'कृपया फसल या पत्ती की फोटो अपलोड करें।');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      // If the selected image is an external URL (sample), fetch it and convert to base64
      let base64Data = selectedImage;
      if (selectedImage.startsWith('http')) {
        const imgRes = await fetch(selectedImage);
        const blob = await imgRes.blob();
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
          cropType,
          notes: farmerNotes,
          preferredLanguage: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to scan crop disease');
      }

      const result: CropDiseaseDiagnosis = {
        id: data.id || 'scan_' + Date.now(),
        timestamp: data.timestamp || new Date().toISOString(),
        crop: data.diagnosis.crop || cropType,
        diseaseName: data.diagnosis.diseaseName,
        diseaseNameHindi: data.diagnosis.diseaseNameHindi || data.diagnosis.diseaseName,
        pathogenType: data.diagnosis.pathogenType || 'Fungal',
        severity: data.diagnosis.severity || 'Moderate',
        confidence: data.diagnosis.confidence || 92,
        imageUrl: selectedImage,
        symptoms: data.diagnosis.symptoms,
        chemicalTreatment: data.diagnosis.chemicalTreatment,
        organicAlternative: data.diagnosis.organicAlternative,
        sprayTiming: data.diagnosis.sprayTiming,
        fieldSafetyTips: data.diagnosis.fieldSafetyTips || [],
        helpline: data.diagnosis.helpline || '1800-180-1551',
        modelUsed: data.modelUsed,
      };

      setDiagnosis(result);
    } catch (err: any) {
      console.error('Visual scan error:', err);
      setScanError(
        err.message ||
          (lang === 'en'
            ? 'Visual diagnostic scanner busy. Please retry.'
            : 'फोटो जांच में समस्या आई। कृपया पुनः प्रयास करें।')
      );
    } finally {
      setIsScanning(false);
    }
  };

  const speakDiagnosis = () => {
    if (!diagnosis || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak =
      lang === 'en'
        ? `Crop Diagnosis for ${diagnosis.crop}. Identified condition is ${diagnosis.diseaseName}. Severity is ${diagnosis.severity}. Recommended chemical treatment: ${diagnosis.chemicalTreatment.medicineName}, dosage ${diagnosis.chemicalTreatment.dosagePerPump}. Organic alternative: ${diagnosis.organicAlternative.recipeName}. Spray timing: ${diagnosis.sprayTiming}. For urgent support, call Toll Free 1800-180-1551.`
        : `${diagnosis.crop} की जांच रिपोर्ट। रोग की पहचान हुई है: ${diagnosis.diseaseNameHindi}। बीमारी का स्तर: ${diagnosis.severity}। रासायनिक उपचार: ${diagnosis.chemicalTreatment.medicineName}, मात्रा ${diagnosis.chemicalTreatment.dosagePerPump}। जैविक देशी उपाय: ${diagnosis.organicAlternative.recipeName}। छिड़काव का सही समय: ${diagnosis.sprayTiming}। किसान कॉल सेंटर: 1800-180-1551।`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const shareToWhatsApp = () => {
    if (!diagnosis) return;

    const message =
      lang === 'en'
        ? `🌾 *Kisan AI Sahayak - Crop Health Prescription* 🌾
🌱 *Crop:* ${diagnosis.crop}
🔬 *Disease Identified:* ${diagnosis.diseaseName}
📊 *Severity:* ${diagnosis.severity} (Confidence: ${diagnosis.confidence}%)
💊 *Recommended Chemical Medicine:* ${diagnosis.chemicalTreatment.medicineName}
💧 *Dosage (15L Pump):* ${diagnosis.chemicalTreatment.dosagePerPump}
🚜 *Dosage (Per Acre):* ${diagnosis.chemicalTreatment.dosagePerAcre}
💰 *Estimated Cost:* ${diagnosis.chemicalTreatment.estimatedCost}
🌿 *Organic Remedy:* ${diagnosis.organicAlternative.recipeName} (${diagnosis.organicAlternative.ingredients})
⏰ *Best Spray Time:* ${diagnosis.sprayTiming}
📞 *Kisan Helpline:* 1800-180-1551 (Toll-Free)`
        : `🌾 *किसान एआई सहायक - फसल स्वास्थ्य पर्चा* 🌾
🌱 *फसल:* ${diagnosis.crop}
🔬 *पहचाना गया रोग:* ${diagnosis.diseaseNameHindi}
📊 *स्तर:* ${diagnosis.severity} (सटीकता: ${diagnosis.confidence}%)
💊 *रासायनिक दवा:* ${diagnosis.chemicalTreatment.medicineName}
💧 *पंप मात्रा (15L):* ${diagnosis.chemicalTreatment.dosagePerPump}
🚜 *प्रति एकड़ मात्रा:* ${diagnosis.chemicalTreatment.dosagePerAcre}
💰 *अनुमानित खर्च:* ${diagnosis.chemicalTreatment.estimatedCost}
🌿 *देशी/जैविक उपाय:* ${diagnosis.organicAlternative.recipeName} (${diagnosis.organicAlternative.ingredients})
⏰ *छिड़काव का सही समय:* ${diagnosis.sprayTiming}
📞 *किसान कॉल सेंटर:* 1800-180-1551 (टोल-फ्री)`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSave = () => {
    if (!diagnosis) return;
    if (onSavePrescription) {
      onSavePrescription(diagnosis);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#10141e] border border-neutral-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2 text-white">
                {lang === 'en' ? 'Multimodal Crop Disease Scanner' : 'कैमरा फसल रोग स्कैनर (फोटो जांच)'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  AI Multimodal
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {lang === 'en'
                  ? 'Snap or upload crop leaf photo for instant laboratory-grade pathology & dosage'
                  : 'पत्ती या फसल की फोटो लें - तुरंत सही दवा, सटीक मात्रा और देशी उपाय पाएं'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Image Upload & Capture Stage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Preview / Capture Box */}
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl h-56 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition relative overflow-hidden group ${
                  selectedImage
                    ? 'border-emerald-500/50 bg-neutral-900'
                    : 'border-neutral-700 hover:border-emerald-500/40 bg-neutral-900/40'
                }`}
              >
                {selectedImage ? (
                  <>
                    <img
                      src={selectedImage}
                      alt="Crop leaf"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white text-xs font-semibold">
                      <RefreshCw className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Change Photo' : 'फोटो बदलें'}</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 text-neutral-400">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-200">
                        {lang === 'en' ? 'Upload or Snap Leaf Photo' : 'पत्ती या कीड़े की फोटो लगाएं'}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {lang === 'en' ? 'JPG, PNG, WebP supported' : 'कैमरा या गैलरी से चुनें'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden Inputs for Camera and File */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-neutral-700"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'Take Photo' : 'कैमरा खोलें'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-neutral-700"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'en' ? 'Upload File' : 'गैलरी से चुनें'}</span>
                </button>
              </div>
            </div>

            {/* Input Details */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {lang === 'en' ? 'Select Crop (फसल चुनें):' : 'फसल का चयन करें:'}
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Paddy">Paddy / Rice (धान / चावल)</option>
                    <option value="Mustard">Mustard (सरसों / राई)</option>
                    <option value="Cotton">Cotton (कपास / नरमा)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Sugarcane">Sugarcane (गन्ना)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Maize">Maize (मक्का)</option>
                    <option value="Chilli">Chilli (मिर्च)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {lang === 'en' ? 'Symptoms / Observations (लक्षण):' : 'दिखने वाले लक्षण:'}
                  </label>
                  <textarea
                    rows={2}
                    value={farmerNotes}
                    onChange={(e) => setFarmerNotes(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'e.g. Yellow stripes, white powder, curling leaves, holes...'
                        : 'उदा. पत्तियों पर पीली धारियां, सुंडी, पत्तियों का मुड़ना या फफूंद...'
                    }
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                {/* 1-Tap Sample Disease Cases for Instant Demo */}
                <div>
                  <p className="text-[11px] font-semibold text-neutral-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{lang === 'en' ? 'Quick 1-Tap Demo Samples:' : 'त्वरित डेमो नमूने (1-क्लिक):'}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SAMPLE_DISEASE_CASES.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className="p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-left text-[11px] transition text-neutral-300 hover:text-emerald-300 flex items-center gap-1.5"
                      >
                        <Leaf className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{lang === 'en' ? sample.name : sample.nameHindi}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={runVisualScan}
                disabled={isScanning || !selectedImage}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'en' ? 'Analyzing Leaf Pathogens...' : 'पत्ती और रोग की जांच जारी है...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Run Instant Disease Scan' : 'रोग की तुरंत जांच करें'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scan Error Message */}
          {scanError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Diagnosis Results Card */}
          {diagnosis && (
            <div className="border border-emerald-500/40 rounded-xl bg-neutral-900/90 p-4 space-y-4 shadow-xl animate-in fade-in duration-300">
              {/* Header result row */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                      {diagnosis.pathogenType}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        diagnosis.severity === 'Severe'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : diagnosis.severity === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {diagnosis.severity} Severity
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {diagnosis.confidence}% Confidence
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {lang === 'en' ? diagnosis.diseaseName : diagnosis.diseaseNameHindi}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-0.5">{diagnosis.symptoms}</p>
                </div>

                {/* Voice & Share Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={speakDiagnosis}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                      isSpeaking
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? (lang === 'en' ? 'Stop' : 'रोकें') : lang === 'en' ? 'Listen' : 'सुनें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={shareToWhatsApp}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'WhatsApp' : 'व्हाट्सएप भेजें'}</span>
                  </button>
                </div>
              </div>

              {/* Treatment Solutions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Chemical Treatment Box */}
                <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <Droplets className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Recommended Chemical Prescription' : 'अनुशंसित रासायनिक दवा व सटीक मात्रा'}</span>
                  </div>
                  <p className="text-xs text-white font-bold">
                    {diagnosis.chemicalTreatment.medicineName}
                  </p>
                  <div className="space-y-1 text-[11px] text-neutral-300">
                    <p>
                      <strong>{lang === 'en' ? 'Dosage (15L Pump):' : '15L पंप मात्रा:'}</strong>{' '}
                      <span className="text-emerald-300">{diagnosis.chemicalTreatment.dosagePerPump}</span>
                    </p>
                    <p>
                      <strong>{lang === 'en' ? 'Dosage (Per Acre):' : 'प्रति एकड़ मात्रा:'}</strong>{' '}
                      {diagnosis.chemicalTreatment.dosagePerAcre}
                    </p>
                    <p>
                      <strong>{lang === 'en' ? 'Estimated Cost:' : 'अनुमानित खर्च:'}</strong>{' '}
                      <span className="text-amber-300">{diagnosis.chemicalTreatment.estimatedCost}</span>
                    </p>
                  </div>
                </div>

                {/* Organic / Biological Alternative Box */}
                <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-lime-400 font-semibold text-xs">
                    <Leaf className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Low-Cost Organic Alternative' : 'सस्ता देशी / जैविक विकल्प'}</span>
                  </div>
                  <p className="text-xs text-white font-bold">
                    {diagnosis.organicAlternative.recipeName}
                  </p>
                  <div className="space-y-1 text-[11px] text-neutral-300">
                    <p>
                      <strong>{lang === 'en' ? 'Recipe:' : 'विधि:'}</strong>{' '}
                      {diagnosis.organicAlternative.ingredients}
                    </p>
                    <p>
                      <strong>{lang === 'en' ? 'Method:' : 'छिड़काव:'}</strong>{' '}
                      {diagnosis.organicAlternative.applicationMethod}
                    </p>
                    <p>
                      <strong>{lang === 'en' ? 'Organic Cost:' : 'देशी खर्च:'}</strong>{' '}
                      <span className="text-lime-300">{diagnosis.organicAlternative.estimatedCost}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Timing & Field Safety Banner */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-neutral-200 text-xs space-y-1">
                <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Optimal Spray Window & Safety:' : 'छिड़काव का सही समय व सावधानी:'}</span>
                </p>
                <p className="text-[11px] text-neutral-300">
                  ⏰ {diagnosis.sprayTiming}
                </p>
                <ul className="list-disc list-inside text-[11px] text-neutral-400 space-y-0.5">
                  {diagnosis.fieldSafetyTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Bottom Actions: Save Prescription & Toll-Free */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800">
                <a
                  href="tel:18001801551"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Kisan Call Center: 1800-180-1551</span>
                </a>

                <div className="flex items-center gap-2">
                  {onSavePrescription && (
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-700"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${savedSuccess ? 'text-emerald-400' : ''}`} />
                      <span>
                        {savedSuccess
                          ? lang === 'en'
                            ? 'Saved to Log!'
                            : 'पर्चा सुरक्षित हो गया!'
                          : lang === 'en'
                          ? 'Save Prescription'
                          : 'पर्चा सुरक्षित करें'}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-semibold transition"
                  >
                    {lang === 'en' ? 'Done' : 'पूर्ण'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

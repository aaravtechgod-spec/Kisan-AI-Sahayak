import React, { useState, useEffect } from 'react';
import {
  Globe,
  Satellite,
  Leaf,
  Sparkles,
  Share2,
  Volume2,
  VolumeX,
  Download,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Activity,
  FileText,
  BarChart3,
  Database,
  AlertTriangle,
  TrendingUp,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  RefreshCw,
  Cpu,
  ArrowRight,
  ExternalLink,
  Camera,
  SlidersHorizontal,
} from 'lucide-react';
import {
  BricsAgriNNode,
  SatelliteObservation,
  SoilHealthProfile,
  RegenerativeAdvisory,
  BricsFederatedModel,
} from '../types';
import { Language } from '../data/translations';

interface BricsAgriNNetworkHubProps {
  lang: Language;
  onOpenDiseaseScanner?: () => void;
}

export const BricsAgriNNetworkHub: React.FC<BricsAgriNNetworkHubProps> = ({
  lang,
  onOpenDiseaseScanner,
}) => {
  const [activeTab, setActiveTab] = useState<'advisory' | 'satellite' | 'models' | 'surveillance'>('advisory');
  const [nodes, setNodes] = useState<BricsAgriNNode[]>([]);
  const [models, setModels] = useState<BricsFederatedModel[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('IN');
  const [loading, setLoading] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);

  // Satellite Telemetry State
  const [satelliteData, setSatelliteData] = useState<SatelliteObservation>({
    ndvi: 0.72,
    ndviTrend: 'Greening',
    ndre: 0.45,
    soilMoisturePct: 28.5,
    surfaceTempC: 28.2,
    leafAreaIndex: 3.4,
    cloudCoverPct: 8.4,
    satellitePlatform: 'Copernicus Sentinel-2B (10m) & NASA SMAP',
    resolutionMeters: 10,
    lastPassTimestamp: new Date().toISOString(),
  });

  // Soil Health Card inputs
  const [soilProfile, setSoilProfile] = useState<SoilHealthProfile>({
    sampleId: 'SHC-2026-IN-4821',
    ph: 6.8,
    organicCarbonPct: 0.54,
    nitrogenKgHa: 185,
    phosphorusKgHa: 22,
    potassiumKgHa: 285,
    electricalConductivityDsM: 0.38,
    zincPpm: 0.62,
    boronPpm: 0.45,
    soilTexture: 'Alluvial Loam',
    healthGrade: 'Moderate',
  });

  // Advisory form inputs
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat / Rice Rotation');
  const [acres, setAcres] = useState<number>(3);
  const [advisoryResult, setAdvisoryResult] = useState<RegenerativeAdvisory | null>(null);
  const [dpgSchemaOpen, setDpgSchemaOpen] = useState<boolean>(false);

  // Fetch nodes & models on mount
  useEffect(() => {
    fetchNodes();
    fetchModels();
    fetchSatelliteScan(selectedNode);
  }, []);

  const fetchNodes = async () => {
    try {
      const res = await fetch('/api/brics-agrin/nodes');
      const data = await res.json();
      if (data.success && data.nodes) {
        setNodes(data.nodes);
      }
    } catch (e) {
      console.warn('Failed to load BRICS nodes:', e);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/brics-agrin/models');
      const data = await res.json();
      if (data.success && data.models) {
        setModels(data.models);
      }
    } catch (e) {
      console.warn('Failed to load BRICS models:', e);
    }
  };

  const fetchSatelliteScan = async (countryCode: string) => {
    try {
      const res = await fetch(`/api/brics-agrin/satellite-scan?country=${countryCode}`);
      const data = await res.json();
      if (data.success && data.observation) {
        setSatelliteData(data.observation);
      }
    } catch (e) {
      console.warn('Satellite scan fetch error:', e);
    }
  };

  const handleCountryChange = (code: string) => {
    setSelectedNode(code);
    fetchSatelliteScan(code);
    if (code === 'IN') {
      setSelectedCrop('Wheat / Rice Rotation');
      setSoilProfile(prev => ({ ...prev, soilTexture: 'Alluvial Loam', ph: 6.8, organicCarbonPct: 0.54 }));
    } else if (code === 'BR') {
      setSelectedCrop('Soybean / Corn (Milho Safrinha)');
      setSoilProfile(prev => ({ ...prev, soilTexture: 'Cerrado Oxisol Clay', ph: 5.6, organicCarbonPct: 1.2 }));
    } else if (code === 'ZA') {
      setSelectedCrop('White Maize / Sunflower');
      setSoilProfile(prev => ({ ...prev, soilTexture: 'Sandy Clay Loam', ph: 6.2, organicCarbonPct: 0.42 }));
    } else if (code === 'CN') {
      setSelectedCrop('Double Rice / Rapeseed');
      setSoilProfile(prev => ({ ...prev, soilTexture: 'Paddy Alluvial Silt', ph: 6.5, organicCarbonPct: 0.95 }));
    } else if (code === 'RU') {
      setSelectedCrop('Spring Wheat / Sunflower');
      setSoilProfile(prev => ({ ...prev, soilTexture: 'Chernozem Deep Black Soil', ph: 7.1, organicCarbonPct: 2.4 }));
    } else if (code === 'AE' || code === 'EG') {
      setSelectedCrop('Date Palm / Barley / Biosaline Forage');
      setSoilProfile(prev => ({ ...prev, soilTexture: 'Calcareous Desert Sand', ph: 8.1, organicCarbonPct: 0.18 }));
    }
  };

  const generateAdvisory = async () => {
    setLoading(true);
    try {
      const countryObj = nodes.find(n => n.countryCode === selectedNode);
      const res = await fetch('/api/brics-agrin/regenerative-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: countryObj ? countryObj.countryName : 'India',
          countryCode: selectedNode,
          agroZone: countryObj?.agroClimaticZones[0] || 'Alluvial Basin',
          primaryCrop: selectedCrop,
          soilProfile,
          satelliteData,
          weatherData: { temperature: 27, rainProbability: 20 },
          acres,
          lang,
        }),
      });
      const data = await res.json();
      if (data.success && data.advisory) {
        setAdvisoryResult(data.advisory);
      }
    } catch (e) {
      console.error('Error generating regenerative advisory:', e);
    } finally {
      setLoading(false);
    }
  };

  const speakAdvisory = () => {
    if (!advisoryResult) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const textToSpeak = lang === 'en'
      ? `BRICS AgriN Regenerative Advisory for ${advisoryResult.primaryCrop}. Recommended companion crop is ${advisoryResult.companionCrop}. Potential soil carbon sequestration is estimated at ${advisoryResult.carbonSequestrationEstTonsHa} tonnes per hectare. Synthetic fertilizer can be reduced by ${advisoryResult.syntheticFertilizerReductionPct} percent. Biological prescription includes ${advisoryResult.bioInputsPrescription.map(b => b.name).join(', ')}.`
      : `ब्रिक्स एग्री-नेटवर्क पुनर्जनन सलाह। ${advisoryResult.primaryCrop} के साथ ${advisoryResult.companionCrop} की सह-फसली सिफारिश की जाती है। प्रति हेक्टेयर ${advisoryResult.carbonSequestrationEstTonsHa} टन कार्बन अवशोषण का अनुमान है। रासायनिक खाद में ${advisoryResult.syntheticFertilizerReductionPct} प्रतिशत की कमी होगी।`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'en' ? 'en-US' : 'hi-IN';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const shareWhatsApp = () => {
    if (!advisoryResult) return;
    const msg = `🌾 *BRICS AgriN Regenerative Farm Advisory* 🌾\n` +
      `🌐 Nation: ${advisoryResult.country} (${advisoryResult.agroZone})\n` +
      `🌱 Primary Crop: ${advisoryResult.primaryCrop}\n` +
      `🤝 Companion / Intercrop: ${advisoryResult.companionCrop}\n` +
      `🔄 Cover Crop Rotation: ${advisoryResult.coverCropRotation}\n` +
      `🌍 Est. Carbon Sequestration: ${advisoryResult.carbonSequestrationEstTonsHa} t CO₂e/ha\n` +
      `📉 Synthetic Fertilizer Cut: ${advisoryResult.syntheticFertilizerReductionPct}%\n` +
      `💰 Est. Farmer Benefit: ₹${advisoryResult.estimatedFarmerSavingsPerHa}/ha\n` +
      `📜 Standard: ${advisoryResult.dpgSchemaStandard}\n` +
      `👉 Powered by BRICS AgriN Digital Public Good`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Flagship Header Banner: BRICS AgriN Interoperable Digital Agriculture Network */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-cyan-950 border border-emerald-500/40 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                BRICS AgriN Platform
              </span>
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Digital Public Good (DPG)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/30 text-emerald-200 text-xs font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                8 Federated Nodes Live
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold tracking-wider flex items-center gap-1.5">
                <span>🖥️</span>
                Indoor Research Console
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{lang === 'en' ? 'BRICS AgriN Interoperable Digital Agriculture Network' : 'ब्रिक्स एग्री-नेटवर्क डिजिटल कृषि नेटवर्क'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl mt-1.5 leading-relaxed">
              {lang === 'en'
                ? 'An open, interoperable agricultural intelligence network uniting BRICS research institutions. Fusing real-time Earth Observation satellite data, Soil Health Card analytics, and microclimate forecasting to deliver actionable regenerative advisories and transboundary crop disease defense.'
                : 'ब्रिक्स देशों का खुला व अंतर-संचालनीय डिजिटल कृषि नेटवर्क। उपग्रह डेटा (NDVI), मृदा स्वास्थ्य कार्ड और मौसम पूर्वानुमान के आधार पर जैविक व पुनर्जनन खेती की सटीक सलाह।'}
            </p>
            <div className="mt-2 text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <span>🖥️</span>
              <span>{lang === 'en' ? 'Console Theme: High-density dark layout calibrated for indoor desktop lab terminals & extension kiosks.' : 'कंसोल थीम: प्रयोगशाला और विस्तार केंद्रों के कंप्यूटर मॉनिटर हेतु डार्क मोड।'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-black/40 border border-emerald-500/30 text-right backdrop-blur-sm">
              <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                {lang === 'en' ? 'Pan-BRICS Carbon Sequestered' : 'कुल अवशोषित जैविक कार्बन'}
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                7.72 Million MT CO₂e
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDpgSchemaOpen(true)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 py-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Inspect DPG Open JSON-LD Schema' : 'ओपन DPG स्कीमा देखें'}</span>
            </button>
          </div>
        </div>

        {/* BRICS Member Nations Node Ribbon */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider mr-1">
            {lang === 'en' ? 'Federated Nodes:' : 'सदस्य राष्ट्र:'}
          </span>
          {[
            { code: 'IN', flag: '🇮🇳', name: 'India (ICAR)' },
            { code: 'BR', flag: '🇧🇷', name: 'Brazil (EMBRAPA)' },
            { code: 'ZA', flag: '🇿🇦', name: 'South Africa (ARC)' },
            { code: 'CN', flag: '🇨🇳', name: 'China (CAAS)' },
            { code: 'RU', flag: '🇷🇺', name: 'Russia (VIZR)' },
            { code: 'AE', flag: '🇦🇪', name: 'UAE (ICBA)' },
            { code: 'ET', flag: '🇪🇹', name: 'Ethiopia (EIAR)' },
            { code: 'EG', flag: '🇪🇬', name: 'Egypt (ARC)' },
          ].map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCountryChange(c.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedNode === c.code
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Feature Navigation Tabs */}
      <div className="flex border-b border-neutral-800 bg-[#0d131d] p-1.5 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('advisory')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'advisory'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>{lang === 'en' ? 'Regenerative AI Advisor' : 'पुनर्जनन एआई सलाहकार'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('satellite')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'satellite'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Satellite className="w-4 h-4" />
          <span>{lang === 'en' ? 'Satellite Earth Observation' : 'सैटेलाइट अवलोकन'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'models'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{lang === 'en' ? 'DPG Model Registry' : 'ओपन मॉडल रजिस्ट्री'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('surveillance')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'surveillance'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{lang === 'en' ? 'Transboundary Surveillance' : 'सीमा-पार कीट व रोग निगरानी'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: REGENERATIVE AI AGRO-ADVISORY ENGINE */}
      {/* ============================================================== */}
      {activeTab === 'advisory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Data Input & Multi-Source Fusion */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#111722] border border-neutral-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {lang === 'en' ? 'Localised Soil & Field Telemetry' : 'स्थानीय मृदा व उपग्रह डेटा'}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {lang === 'en' ? 'Connected to National Research Node' : 'राष्ट्रीय अनुसंधान केंद्र से सम्बद्ध'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fetchSatelliteScan(selectedNode)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Rescan' : 'री-स्कैन'}</span>
                </button>
              </div>

              {/* Institutional Agronomist Console Notice (FIX 2) */}
              <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
                <span className="text-base shrink-0">🔬</span>
                <div>
                  <span className="font-bold text-white block">
                    {lang === 'en'
                      ? 'Institutional & Agronomist Data Entry Console'
                      : 'संस्थागत व वैज्ञानिक डेटा प्रविष्टि कंसोल'}
                  </span>
                  <span className="text-[11px] text-emerald-300/90 leading-relaxed block mt-0.5">
                    {lang === 'en'
                      ? 'For Agricultural Extension Officers (AEOs), KVK Scientists, and Agronomy Researchers entering calibrated field telemetry on behalf of smallholders.'
                      : 'कृषि विज्ञान केंद्र (KVK) वैज्ञानिकों व विस्तार अधिकारियों द्वारा किसानों के खेत का प्रमाणित डेटा दर्ज करने के लिए।'}
                  </span>
                </div>
              </div>

              {/* Crop & Land Size */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    {lang === 'en' ? 'Primary Crop / Cropping System' : 'मुख्य फसल / फसल चक्र'}
                  </label>
                  <input
                    type="text"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-[#182234] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Wheat, Soybean, Maize, Cotton..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">
                      {lang === 'en' ? 'Land Size (Acres)' : 'खेत का आकार (एकड़)'}
                    </label>
                    <input
                      type="number"
                      min={0.5}
                      max={500}
                      step={0.5}
                      value={acres}
                      onChange={(e) => setAcres(Number(e.target.value) || 1)}
                      className="w-full bg-[#182234] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">
                      {lang === 'en' ? 'Soil Texture Type' : 'मिट्टी का प्रकार'}
                    </label>
                    <select
                      value={soilProfile.soilTexture}
                      onChange={(e) => setSoilProfile({ ...soilProfile, soilTexture: e.target.value })}
                      className="w-full bg-[#182234] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Alluvial Loam">Alluvial Loam (जलोढ़ दोमट)</option>
                      <option value="Black Clay / Vertisol">Black Clay / Vertisol (काली भारी मिट्टी)</option>
                      <option value="Red Sandy Loam">Red Sandy Loam (लाल बलुई दोमट)</option>
                      <option value="Cerrado Oxisol Clay">Cerrado Oxisol Clay (ऑक्सीसोल)</option>
                      <option value="Chernozem Deep Black Soil">Chernozem Black Earth (चेर्नोज़म)</option>
                      <option value="Calcareous Desert Sand">Calcareous Desert Sand (रेतीली मरुस्थलीय)</option>
                    </select>
                  </div>
                </div>

                {/* Soil Health Card Parameters (FIX 3: Explicitly cite India's real national SHC scheme) */}
                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Soil Health Card (Govt. of India Scheme)' : 'मृदा स्वास्थ्य कार्ड (भारत सरकार)'}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Portal Ref: {soilProfile.sampleId}</span>
                  </div>

                  <div className="text-[10px] text-neutral-400 font-mono">
                    {lang === 'en'
                      ? '🏛️ Source: Dept of Agriculture & Farmers Welfare, Ministry of Agriculture (soilhealth.dac.gov.in) — 12-Parameter National Standard'
                      : '🏛️ स्रोत: कृषि एवं किसान कल्याण विभाग, भारत सरकार (soilhealth.dac.gov.in) — १२ मानक पैरामीटर'}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 rounded-lg bg-neutral-800/80 border border-neutral-700/60">
                      <div className="text-[10px] text-neutral-400">Soil pH</div>
                      <div className="text-xs font-bold text-white">{soilProfile.ph}</div>
                      <div className="text-[9px] text-neutral-500">
                        {soilProfile.ph < 6 ? 'Acidic' : soilProfile.ph > 7.5 ? 'Alkaline' : 'Neutral'}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-800/80 border border-neutral-700/60">
                      <div className="text-[10px] text-neutral-400">Org. Carbon (OC)</div>
                      <div className="text-xs font-bold text-amber-400">{soilProfile.organicCarbonPct}%</div>
                      <div className="text-[9px] text-amber-500/80">
                        {soilProfile.organicCarbonPct < 0.6 ? 'Low (Need +)' : 'Optimal'}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-800/80 border border-neutral-700/60">
                      <div className="text-[10px] text-neutral-400">N-P-K (kg/ha)</div>
                      <div className="text-xs font-bold text-emerald-300">
                        {soilProfile.nitrogenKgHa}:{soilProfile.phosphorusKgHa}:{soilProfile.potassiumKgHa}
                      </div>
                      <div className="text-[9px] text-emerald-400/80">Available</div>
                    </div>
                  </div>
                </div>

                {/* Satellite Live Sensor Fusion */}
                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <Satellite className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Live Earth Observation Telemetry' : 'लाइव सैटेलाइट निगरानी'}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">Sentinel-2B 10m</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60">
                      <span className="text-neutral-400">NDVI Vigor:</span>
                      <span className="font-bold text-emerald-400">{satelliteData.ndvi} ({satelliteData.ndviTrend})</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60">
                      <span className="text-neutral-400">Root Moisture:</span>
                      <span className="font-bold text-cyan-400">{satelliteData.soilMoisturePct}%</span>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={generateAdvisory}
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl ${
                    loading
                      ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25 active:scale-98'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'en' ? 'Synthesizing Satellite & Soil AI...' : 'सैटेलाइट व मृदा डेटा का विश्लेषण जारी...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Generate Regenerative Agro-Advisory' : 'पुनर्जनन कृषि सलाह तैयार करें'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Regenerative Agro-Advisory Output */}
          <div className="lg:col-span-7">
            {advisoryResult ? (
              <div className="bg-[#111722] border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                        {advisoryResult.dpgSchemaStandard}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {new Date(advisoryResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white mt-1 flex items-center gap-2">
                      <span>{lang === 'en' ? 'Precision Regenerative Prescription' : 'सटीक जैविक पुनर्जनन सलाह'}</span>
                      <span className="text-sm font-normal text-neutral-400">({advisoryResult.country})</span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={speakAdvisory}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                        speaking
                          ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                      }`}
                      title="Audio Speech"
                    >
                      {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span className="hidden sm:inline">{speaking ? 'Stop' : 'Listen'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={shareWhatsApp}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Share' : 'शेयर'}</span>
                    </button>
                  </div>
                </div>

                {/* Key Impact Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                      {lang === 'en' ? 'Carbon Offset' : 'कार्बन अवशोषण'}
                    </div>
                    <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                      +{advisoryResult.carbonSequestrationEstTonsHa} t/ha
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">CO₂e Sequestered</div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                    <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
                      {lang === 'en' ? 'Chemical Fertilizer Cut' : 'रासायनिक खाद बचत'}
                    </div>
                    <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                      -{advisoryResult.syntheticFertilizerReductionPct}%
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Without yield loss</div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
                    <div className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">
                      {lang === 'en' ? 'Soil Health Delta' : 'मृदा स्वास्थ्य वृद्धि'}
                    </div>
                    <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                      +{advisoryResult.soilHealthDeltaScore}%
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Microbial Biomass</div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-700">
                    <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                      {lang === 'en' ? 'Farmer Savings' : 'किसान बचत'}
                    </div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      ₹{advisoryResult.estimatedFarmerSavingsPerHa.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Per Hectare / Yr</div>
                  </div>
                </div>

                {/* Cropping Sequence & Companionship */}
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'en' ? 'Intercropping & Biological Nitrogen Fixation' : 'सह-फसली व नाइट्रोजन स्थिरीकरण'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        {lang === 'en' ? 'Companion / Intercrop' : 'साथ बोने हेतु सह-फसल:'}
                      </span>
                      <strong className="text-emerald-300 text-sm block mt-0.5">
                        {advisoryResult.companionCrop}
                      </strong>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        {lang === 'en' ? 'Post-Harvest Cover Crop' : 'कटाई बाद हरी खाद / कवर क्रॉप:'}
                      </span>
                      <strong className="text-cyan-300 text-sm block mt-0.5">
                        {advisoryResult.coverCropRotation}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Biological Inputs Prescription */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'en' ? 'Prescribed Biological & Soil Amendments' : 'अनुशंसित जैविक खाद व बायो-उर्वरक'}</span>
                  </h4>

                  <div className="space-y-2.5">
                    {advisoryResult.bioInputsPrescription.map((bio, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/30 transition text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{bio.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {bio.type}
                          </span>
                        </div>
                        <div className="text-emerald-400 font-mono text-[11px] mt-1">
                          Dosage / Application: {bio.applicationRate}
                        </div>
                        <p className="text-neutral-300 text-[11px] mt-1">
                          {lang === 'hi' ? bio.benefitHindi : bio.benefit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Steps for Soil Regeneration */}
                <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'en' ? 'Field Regeneration Action Plan' : 'खेत सुधारने की कार्य-योजना'}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-neutral-300">
                    {(lang === 'hi' ? advisoryResult.soilRestorationStepsHindi : advisoryResult.soilRestorationSteps).map(
                      (step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold font-mono">0{sIdx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Weather Risk & Water Conservation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                      <Sun className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Microclimate Risk Advisory' : 'मौसम अनुकूलन'}</span>
                    </div>
                    <p className="text-neutral-300 text-[11px]">
                      {lang === 'hi' ? advisoryResult.weatherRiskMitigationHindi : advisoryResult.weatherRiskMitigation}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                      <Droplets className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Water Conservation Protocol' : 'जल संरक्षण विधि'}</span>
                    </div>
                    <p className="text-neutral-300 text-[11px] font-mono">
                      {advisoryResult.waterConservationMethod}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#111722] border border-neutral-800 border-dashed rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[460px]">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Globe className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                  {lang === 'en' ? 'Ready to Synthesize Regenerative AI Advisory' : 'पुनर्जनन सलाह हेतु तैयार'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6">
                  {lang === 'en'
                    ? 'Select your farm parameters on the left and click "Generate Regenerative Agro-Advisory". The AI engine will cross-reference live Sentinel-2 multispectral vegetation data, Soil Health Card metrics, and agro-climatic models.'
                    : 'बाईं ओर अपनी फसल व मिट्टी का विवरण चुनें और "पुनर्जनन कृषि सलाह तैयार करें" पर क्लिक करें। उपग्रह और मृदा विज्ञान के आधार पर संपूर्ण योजना बनेगी।'}
                </p>
                <button
                  type="button"
                  onClick={generateAdvisory}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Run Analysis Now' : 'विश्लेषण शुरू करें'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SATELLITE EARTH OBSERVATION DECK */}
      {/* ============================================================== */}
      {activeTab === 'satellite' && (
        <div className="space-y-6">
          <div className="bg-[#111722] border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                    MULTISPECTRAL EARTH OBSERVATION
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Resolution: 10m Ground Sample Distance
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <span>{lang === 'en' ? 'Sentinel-2 & NASA SMAP Multispectral Field Scan' : 'सैटेलाइट मल्टी-स्पेक्ट्रल फील्ड स्कैन'}</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span>Last Pass:</span>
                <span className="text-emerald-400">{new Date(satelliteData.lastPassTimestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Earth Observation Metrics Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* NDVI Card */}
              <div className="p-4 rounded-xl bg-[#161f2e] border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>NDVI (Vegetation Vigor)</span>
                  <span className="text-emerald-400 font-bold">{satelliteData.ndviTrend}</span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400 my-2">
                  {satelliteData.ndvi}
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-500"
                    style={{ width: `${Math.round(satelliteData.ndvi * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                  <span>0.0 (Bare/Dry)</span>
                  <span>1.0 (Dense Canopy)</span>
                </div>
              </div>

              {/* NDRE Chlorophyll Red Edge */}
              <div className="p-4 rounded-xl bg-[#161f2e] border border-cyan-500/30">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>NDRE (Chlorophyll Index)</span>
                  <span className="text-cyan-400 font-bold">Optimal</span>
                </div>
                <div className="text-2xl font-black font-mono text-cyan-400 my-2">
                  {satelliteData.ndre}
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500"
                    style={{ width: `${Math.round(satelliteData.ndre * 200)}%` }}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 font-mono mt-1">
                  Leaf Nitrogen & Photosynthesis Proxy
                </div>
              </div>

              {/* Soil Moisture */}
              <div className="p-4 rounded-xl bg-[#161f2e] border border-blue-500/30">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>SMAP Root Moisture</span>
                  <span className="text-blue-400 font-bold">Adequate</span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-400 my-2">
                  {satelliteData.soilMoisturePct}%
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${satelliteData.soilMoisturePct}%` }}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 font-mono mt-1">
                  0-100cm Root Zone Volumetric Moisture
                </div>
              </div>

              {/* Surface Thermal Temp */}
              <div className="p-4 rounded-xl bg-[#161f2e] border border-amber-500/30">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>Canopy Surface Temp</span>
                  <span className="text-amber-400 font-bold">No Heat Stress</span>
                </div>
                <div className="text-2xl font-black font-mono text-amber-400 my-2">
                  {satelliteData.surfaceTempC}°C
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(satelliteData.surfaceTempC / 50) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 font-mono mt-1">
                  Thermal Infrared Sensor (Landsat-9 TIRS)
                </div>
              </div>
            </div>

            {/* Simulated Satellite Multispectral Field Polygon */}
            <div className="mt-6 p-4 rounded-xl bg-black/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Farm Parcel Boundary & Multispectral NDVI Heatmap (Simulated Orthomosaic)</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">Polygon: 28.6139° N, 77.2090° E</span>
              </div>

              {/* Visual Satellite False Color Representation */}
              <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center bg-gradient-to-br from-emerald-950/60 via-green-950/40 to-neutral-900">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Simulated Farm Parcel Outlines */}
                <div className="relative z-10 w-4/5 h-4/5 border-2 border-dashed border-emerald-400/80 rounded-xl p-3 flex flex-col justify-between backdrop-blur-sm bg-emerald-500/5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300">
                    <span className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40">Zone A: Vigorous Crop (NDVI 0.78)</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40">Moisture: 31%</span>
                  </div>

                  <div className="text-center font-mono text-xs text-emerald-200">
                    <div className="font-bold">CADASTRE PARCEL #482-BRICS</div>
                    <div className="text-[10px] text-neutral-400">Area: {acres} Acres • Multispectral Verification Complete</div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-amber-300">
                    <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-500/40">Zone B: Sandy Infiltration (NDVI 0.65)</span>
                    <span className="text-neutral-400">Sensor: MSI 13-Band</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DIGITAL PUBLIC GOOD (DPG) MODEL REGISTRY */}
      {/* ============================================================== */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="bg-[#111722] border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    DPG ALLIANCE CERTIFIED
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Open Interoperable Weights & Schemas
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {lang === 'en' ? 'BRICS Open Agronomic AI Model Registry' : 'ब्रिक्स ओपन एग्रोनॉमिक एआई मॉडल रजिस्ट्री'}
                </h3>
              </div>

              <div className="text-xs font-mono text-neutral-400">
                License: <span className="text-emerald-400 font-bold">Apache 2.0 / CC-BY 4.0</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 mb-5">
              {lang === 'en'
                ? 'These artificial intelligence models are contributed as Digital Public Goods by national research institutes across BRICS member states (ICAR, EMBRAPA, ARC, CAAS, VIZR) to democratize climate-resilient agriculture.'
                : 'ये एआई मॉडल्स ब्रिक्स अनुसंधान संस्थानों (ICAR, EMBRAPA, ARC) द्वारा डिजिटल पब्लिक गुड के रूप में साझा किए गए हैं ताकि सभी किसान लाभान्वित हो सकें।'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((mod) => (
                <div
                  key={mod.id}
                  className="p-4 rounded-xl bg-[#141b27] border border-neutral-800 hover:border-emerald-500/40 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-base">
                        <span>{mod.flag}</span>
                        <h4 className="font-bold text-white text-sm">{mod.name}</h4>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {mod.contributingInstitution}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shrink-0">
                      {mod.category}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">
                    {lang === 'hi' ? mod.descriptionHindi : mod.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-center font-mono">
                    <div className="p-2 rounded bg-neutral-900/60">
                      <div className="text-[10px] text-neutral-400">Accuracy F1</div>
                      <div className="text-xs font-bold text-emerald-400">{(mod.accuracyF1Score * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-2 rounded bg-neutral-900/60">
                      <div className="text-[10px] text-neutral-400">Parameters</div>
                      <div className="text-xs font-bold text-white">{mod.parametersCount}</div>
                    </div>
                    <div className="p-2 rounded bg-neutral-900/60">
                      <div className="text-[10px] text-neutral-400">Format</div>
                      <div className="text-xs font-bold text-cyan-300">{mod.interoperableFormat}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Training: {mod.trainingSamples}
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`DPG Model Weights (${mod.interoperableFormat}) available via open API endpoint: ${mod.downloadEndpoint}`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Fetch Model</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: TRANSBOUNDARY SURVEILLANCE & DISEASE DIAGNOSTICS */}
      {/* ============================================================== */}
      {activeTab === 'surveillance' && (
        <div className="space-y-6">
          <div className="bg-[#111722] border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                    EARLY WARNING RADAR
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    BRICS Transboundary Pathogen Tracking
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {lang === 'en' ? 'Transboundary Pest & Crop Disease Early Warning Network' : 'सीमा-पार कीट व रोग पूर्व-चेतावनी नेटवर्क'}
                </h3>
              </div>

              {onOpenDiseaseScanner && (
                <button
                  type="button"
                  onClick={onOpenDiseaseScanner}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Open Crop Doctor Scanner' : 'फसल रोग स्कैनर खोलें'}</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300">
              {lang === 'en'
                ? 'Monitors cross-border vector corridors (wind dispersion, migratory locust swarms, rust spore trajectories) between Southern Africa, South Asia, and South America to preempt epidemic outbreaks.'
                : 'सीमा पार से आने वाले कीटों (जैसे टिड्डी दल, फॉल आर्मीवर्म) और फफूंद बीजाणुओं की रडार निगरानी ताकि महामारी फैलने से पहले रोकथाम हो सके।'}
            </p>

            {/* Active Alert Vectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">Fall Armyworm (FAW)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                    High Alert
                  </span>
                </div>
                <div className="text-xs text-neutral-300">
                  <strong>Trajectory:</strong> Southern Africa → Western India maize & sorghum belt.
                </div>
                <div className="text-[11px] text-neutral-400">
                  Bio-Defense: Pheromone traps (5/acre) + Bacillus thuringiensis (Bt) foliar spray.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-300 text-sm">Wheat Stripe Rust (Ug99)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300">
                    Quarantine Radar
                  </span>
                </div>
                <div className="text-xs text-neutral-300">
                  <strong>Trajectory:</strong> East Africa & Middle East airborne spore dispersal.
                </div>
                <div className="text-[11px] text-neutral-400">
                  Bio-Defense: Resistant cultivars (HD-2967, PBW-550) + early Propiconazole foliar buffer.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm">Desert Locust (Schistocerca)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                    Low Risk (Calm)
                  </span>
                </div>
                <div className="text-xs text-neutral-300">
                  <strong>Trajectory:</strong> Red Sea breeding grounds under satellite radar watch.
                </div>
                <div className="text-[11px] text-neutral-400">
                  Bio-Defense: Metarhizium acridum biopesticide standby protocol.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DPG Open Schema Modal */}
      {dpgSchemaOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111722] border border-neutral-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">BRICS AgriN JSON-LD DPG Schema Standard</h3>
              </div>
              <button
                type="button"
                onClick={() => setDpgSchemaOpen(false)}
                className="text-neutral-400 hover:text-white text-sm font-mono"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Compliant with Digital Public Goods Alliance criteria, AgGateway ADAPT, and FAO GeoNetwork data interoperability.
            </p>

            <pre className="p-4 rounded-xl bg-black border border-neutral-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72">
{`{
  "@context": "https://brics-agrin.org/schemas/v2.4/context.jsonld",
  "@type": "AgriNInteroperableDataStandard",
  "initiative": "BRICS Agricultural Research Platform (AgriN)",
  "version": "2.4.0",
  "openLicense": "Apache-2.0 / CC-BY-4.0",
  "digitalPublicGoodCertification": {
    "dpgAllianceCompliant": true,
    "openSourceRepository": "https://github.com/brics-agrin/interoperable-agro-models",
    "dataGovernance": "Federated sovereign nodes with zero cross-border exfiltration"
  },
  "interoperabilityLayers": [
    "Satellite Multispectral Earth Observation (Sentinel-2, SMAP)",
    "Soil Health & Carbon Sequestration (FAO GSOCseq, ISO 28258)",
    "Microclimate Agro-Meteorology (WMO-No. 558 GTS, OpenMeteo)",
    "Transboundary Crop Disease Surveillance (EPPO, PlantVillage)"
  ]
}`}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDpgSchemaOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

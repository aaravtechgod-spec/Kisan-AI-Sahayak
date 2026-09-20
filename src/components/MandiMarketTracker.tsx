import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  RefreshCw,
  Calculator,
  Share2,
  AlertCircle,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react';
import { MandiRateItem } from '../types';

interface MandiMarketTrackerProps {
  lang: 'en' | 'hi';
}

export const MandiMarketTracker: React.FC<MandiMarketTrackerProps> = ({ lang }) => {
  const [rates, setRates] = useState<MandiRateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Profit Calculator State
  const [calcQuantityQtl, setCalcQuantityQtl] = useState<number>(50);
  const [selectedMandiForCalc, setSelectedMandiForCalc] = useState<MandiRateItem | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/mandi-rates?';
      if (selectedCrop !== 'all') url += `crop=${encodeURIComponent(selectedCrop)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load mandi rates');
      }
      setRates(data.rates || []);
      if (data.rates?.length > 0 && !selectedMandiForCalc) {
        setSelectedMandiForCalc(data.rates[0]);
      }
    } catch (err: any) {
      console.error('Mandi fetch error:', err);
      setError(
        lang === 'en'
          ? 'Unable to load real-time Mandi rates. Showing latest cached market prices.'
          : 'मंडी भाव लोड करने में समस्या। नवीनतम उपलब्ध भाव दिखाए जा रहे हैं।'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [selectedCrop, searchQuery]);

  const shareMandiRate = (item: MandiRateItem) => {
    const text =
      lang === 'en'
        ? `🌾 *Kisan AI - Mandi Rate Alert* 🌾
📍 *Market:* ${item.market}, ${item.district} (${item.state})
🌱 *Crop:* ${item.crop} (${item.variety})
💰 *Today's Modal Price:* ₹${item.modalPrice.toLocaleString()}/Quintal
📊 *Price Range:* ₹${item.minPrice.toLocaleString()} - ₹${item.maxPrice.toLocaleString()}
⚖️ *Govt MSP:* ₹${item.mspPrice.toLocaleString()}
📈 *7-Day Trend:* ${item.priceChange7d >= 0 ? `+₹${item.priceChange7d}` : `-₹${Math.abs(item.priceChange7d)}`}
💡 *AI Recommendation:* ${item.aiRecommendation}`
        : `🌾 *किसान एआई - मंडी भाव व बिक्री सलाह* 🌾
📍 *मंडी:* ${item.market}, ${item.district} (${item.state})
🌱 *फसल:* ${item.cropHindi} (${item.variety})
💰 *आज का मॉडल भाव:* ₹${item.modalPrice.toLocaleString()}/क्विंटल
📊 *न्यूनतम-अधिकतम:* ₹${item.minPrice.toLocaleString()} - ₹${item.maxPrice.toLocaleString()}
⚖️ *सरकारी एमएसपी:* ₹${item.mspPrice.toLocaleString()}
📈 *7 दिन का बदलाव:* ${item.priceChange7d >= 0 ? `+₹${item.priceChange7d}` : `-₹${Math.abs(item.priceChange7d)}`}
💡 *एआई बिक्री सलाह:* ${item.aiRecommendationHindi}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Calculator calculations
  const totalRevenue = selectedMandiForCalc ? selectedMandiForCalc.modalPrice * calcQuantityQtl : 0;
  const totalMspRevenue = selectedMandiForCalc ? selectedMandiForCalc.mspPrice * calcQuantityQtl : 0;
  const netDiffVsMsp = totalRevenue - totalMspRevenue;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {lang === 'en' ? 'Live APMC Mandi Rates & "When & Where to Sell"' : 'लाइव मंडी भाव एवं "कब और कहाँ बेचें" इंजन'}
          </h2>
          <p className="text-xs text-neutral-400">
            {lang === 'en'
              ? 'Real-time prices from e-NAM / Agmarknet markets with AI price trend intelligence'
              : 'प्रमुख मंडियों के दैनिक ताजा भाव, सरकारी एमएसपी तुलना और उचित समय पर बेचने की सलाह'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRates}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{lang === 'en' ? 'Refresh Rates' : 'भाव अपडेट करें'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'en'
                ? 'Search mandi, district, or crop...'
                : 'मंडी, जिला या फसल खोजें...'
            }
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Crop Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: lang === 'en' ? 'All Crops' : 'सभी फसलें' },
            { id: 'wheat', label: lang === 'en' ? 'Wheat' : 'गेहूं' },
            { id: 'basmati', label: lang === 'en' ? 'Basmati' : 'बासमती' },
            { id: 'mustard', label: lang === 'en' ? 'Mustard' : 'सरसों' },
            { id: 'cotton', label: lang === 'en' ? 'Cotton' : 'कपास' },
            { id: 'potato', label: lang === 'en' ? 'Potato' : 'आलू' },
            { id: 'soybean', label: lang === 'en' ? 'Soybean' : 'सोयाबीन' },
            { id: 'onion', label: lang === 'en' ? 'Onion' : 'प्याज' },
          ].map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCrop === crop.id
                  ? 'bg-emerald-500 text-black shadow'
                  : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              {crop.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Mandi Earnings Calculator */}
      {selectedMandiForCalc && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/30 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  {lang === 'en' ? 'Farm Crop Earnings Calculator' : 'कुल फसल कमाई कैलकुलेटर'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {lang === 'en' ? 'Selected:' : 'चुनी गई मंडी:'}{' '}
                  <span className="text-emerald-300 font-semibold">{selectedMandiForCalc.market}</span> ({selectedMandiForCalc.crop})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-300 font-semibold">
                {lang === 'en' ? 'Harvest Qty (Quintals):' : 'कुल उपज (क्विंटल):'}
              </label>
              <input
                type="number"
                min={1}
                max={2000}
                value={calcQuantityQtl}
                onChange={(e) => setCalcQuantityQtl(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-2 py-1 rounded bg-neutral-950 border border-neutral-700 text-xs text-center font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
              <p className="text-[11px] text-neutral-400">{lang === 'en' ? 'Mandi Payout' : 'मंडी से कुल भुगतान'}</p>
              <p className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                ₹{totalRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-neutral-400 font-mono">
                @ ₹{selectedMandiForCalc.modalPrice}/Qtl
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
              <p className="text-[11px] text-neutral-400">{lang === 'en' ? 'Govt MSP Baseline' : 'सरकारी एमएसपी पर'}</p>
              <p className="text-base sm:text-lg font-bold text-neutral-300 mt-0.5">
                ₹{totalMspRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-neutral-400 font-mono">
                @ ₹{selectedMandiForCalc.mspPrice}/Qtl
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40">
              <p className="text-[11px] text-emerald-400 font-semibold">
                {netDiffVsMsp >= 0
                  ? lang === 'en' ? 'Net Benefit Above MSP' : 'एमएसपी से अतिरिक्त मुनाफा'
                  : lang === 'en' ? 'Difference vs MSP' : 'एमएसपी से अंतर'}
              </p>
              <p className="text-base sm:text-lg font-black text-emerald-300 mt-0.5">
                {netDiffVsMsp >= 0 ? `+₹${netDiffVsMsp.toLocaleString()}` : `-₹${Math.abs(netDiffVsMsp).toLocaleString()}`}
              </p>
              <p className="text-[10px] text-emerald-400/80">
                {netDiffVsMsp >= 0 ? 'Profitable Market Window' : 'Below MSP Threshold'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {rates.map((item) => {
          const isSelected = selectedMandiForCalc?.id === item.id;
          const isUp = item.trend === 'up';
          const isDown = item.trend === 'down';

          return (
            <div
              key={item.id}
              onClick={() => setSelectedMandiForCalc(item)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-neutral-900 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                  : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800'
              }`}
            >
              <div>
                {/* Location & Crop Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{lang === 'en' ? item.crop : item.cropHindi}</span>
                      <span className="text-[11px] text-neutral-400 font-normal">({item.variety})</span>
                    </h3>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{item.market}, {item.district} ({item.state})</span>
                    </p>
                  </div>

                  {/* 7-Day Trend Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border ${
                      isUp
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : isDown
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-neutral-700 text-neutral-300 border-neutral-600'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    <span>{item.priceChange7d >= 0 ? `+₹${item.priceChange7d}` : `-₹${Math.abs(item.priceChange7d)}`}</span>
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-3 p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">
                      {lang === 'en' ? "Today's Modal Price" : 'आज का मॉडल भाव'}
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      ₹{item.modalPrice.toLocaleString()}
                      <span className="text-xs font-normal text-neutral-400">/Qtl</span>
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-neutral-300 font-mono space-y-0.5">
                    <div>
                      <span className="text-neutral-500">Range: </span>
                      ₹{item.minPrice} - ₹{item.maxPrice}
                    </div>
                    <div>
                      <span className="text-neutral-500">MSP: </span>
                      <span className="text-amber-300 font-semibold">₹{item.mspPrice}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Badge */}
                <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                  <p className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{lang === 'en' ? 'When & Where to Sell Advisory:' : 'बिक्री सलाह:'}</span>
                  </p>
                  <p className="text-[11px] text-neutral-200 mt-0.5 leading-snug">
                    {lang === 'en' ? item.aiRecommendation : item.aiRecommendationHindi}
                  </p>
                </div>
              </div>

              {/* Card Footer: Share & Select */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                <span className="text-[10px] text-neutral-400">
                  {lang === 'en' ? 'Arrivals:' : 'दैनिक आवक:'} {item.arrivalTonsToday} Tons
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    shareMandiRate(item);
                  }}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-emerald-600 hover:text-white text-neutral-300 text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  <Share2 className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rates.length === 0 && !loading && (
        <div className="p-8 text-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400">
          <p className="text-sm font-semibold">{lang === 'en' ? 'No mandi rates matching your query.' : 'आपकी खोज के अनुसार कोई भाव नहीं मिला।'}</p>
        </div>
      )}
    </div>
  );
};

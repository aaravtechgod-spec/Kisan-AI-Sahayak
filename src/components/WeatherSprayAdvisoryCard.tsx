import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Clock,
  PhoneCall,
  RefreshCw,
  Info,
  Thermometer,
} from 'lucide-react';
import { WeatherSprayAdvisory } from '../types';

interface WeatherSprayAdvisoryCardProps {
  lang: 'en' | 'hi';
}

export const WeatherSprayAdvisoryCard: React.FC<WeatherSprayAdvisoryCardProps> = ({ lang }) => {
  const [advisory, setAdvisory] = useState<WeatherSprayAdvisory | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather-advisory');
      const data = await res.json();
      if (res.ok && data.success) {
        setAdvisory(data.weather);
      }
    } catch (e) {
      console.error('Weather fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (!advisory && loading) {
    return (
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 animate-pulse text-neutral-400 text-xs text-center">
        Loading agricultural weather & spray window index...
      </div>
    );
  }

  if (!advisory) return null;

  const isSafe = advisory.spraySafetyStatus === 'SAFE';
  const isCaution = advisory.spraySafetyStatus === 'CAUTION';

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#121622] to-[#0e111a] border border-neutral-800 p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span>{lang === 'en' ? 'Hyperlocal Weather & Spray Advisory' : 'मौसम एवं दवा छिड़काव सुरक्षा खिड़की'}</span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              📍 {advisory.location} • {lang === 'en' ? advisory.condition : advisory.conditionHindi}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchWeather}
          disabled={loading}
          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          title="Refresh Weather"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-center">
          <div className="flex items-center justify-center gap-1 text-neutral-400 text-[11px] mb-0.5">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'Temperature' : 'तापमान'}</span>
          </div>
          <p className="text-lg font-bold text-white">{advisory.temperature}°C</p>
          <span className="text-[10px] text-neutral-500">{lang === 'en' ? 'Favorable' : 'अनुकूल'}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-center">
          <div className="flex items-center justify-center gap-1 text-neutral-400 text-[11px] mb-0.5">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>{lang === 'en' ? 'Humidity' : 'नमी / आर्द्रता'}</span>
          </div>
          <p className="text-lg font-bold text-white">{advisory.humidity}%</p>
          <span className="text-[10px] text-neutral-500">{lang === 'en' ? 'High absorption' : 'उत्कृष्ट अवशोषण'}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-center">
          <div className="flex items-center justify-center gap-1 text-neutral-400 text-[11px] mb-0.5">
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'en' ? 'Wind Speed' : 'हवा की गति'}</span>
          </div>
          <p className="text-lg font-bold text-white">{advisory.windSpeedKmH} km/h</p>
          <span className="text-[10px] text-emerald-400">{lang === 'en' ? 'Calm (Low drift)' : 'शांत (कम बहाव)'}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-center">
          <div className="flex items-center justify-center gap-1 text-neutral-400 text-[11px] mb-0.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'en' ? 'Rain Chance' : 'बारिश संभावना'}</span>
          </div>
          <p className="text-lg font-bold text-white">{advisory.rainProbability}%</p>
          <span className="text-[10px] text-emerald-400">{lang === 'en' ? 'Zero wash risk' : 'धुलने का शून्य खतरा'}</span>
        </div>
      </div>

      {/* Main Spray Window Safety Index Indicator */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isSafe
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : isCaution
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-red-950/30 border-red-500/40 text-red-200'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                isSafe
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : isCaution
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-red-500 text-white border-red-400'
              }`}
            >
              {isSafe
                ? lang === 'en' ? 'SAFE TO SPRAY' : 'छिड़काव के लिए सुरक्षित'
                : isCaution
                ? lang === 'en' ? 'CAUTION: MIDDAY HEAT' : 'सावधानी: तेज धूप'
                : lang === 'en' ? 'UNSAFE TO SPRAY' : 'छिड़काव न करें'}
            </span>
            <span className="text-xs font-semibold flex items-center gap-1 text-white">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{advisory.optimalSprayHours}</span>
            </span>
          </div>
          <p className="text-xs text-neutral-200 leading-snug">
            {lang === 'en' ? advisory.spraySafetyReason : advisory.spraySafetyReasonHindi}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
          <a
            href="tel:18001801551"
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-white font-semibold text-xs border border-neutral-700 flex items-center justify-center gap-1.5 transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>1800-180-1551</span>
          </a>
        </div>
      </div>

      {/* Extreme Weather & PMFBY Alerts */}
      <div className="space-y-2">
        {advisory.alerts.map((alert, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                {alert.severity === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{lang === 'en' ? alert.title : alert.titleHindi}</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                {alert.severity}
              </span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              {alert.message}
            </p>
            <p className="text-emerald-400 text-[11px] font-semibold">
              👉 {alert.actionableAdvice}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

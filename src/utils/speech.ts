// Speech Utility for Farmers with Low/No Literacy
// Uses Web Speech API (SpeechSynthesis & SpeechRecognition) with natural Indian accents

export interface SpeechState {
  isSpeaking: boolean;
  isListening: boolean;
  supported: boolean;
}

class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speak(
    text: string,
    lang: 'hi' | 'en' = 'hi',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) {
      if (onError) onError('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    this.stop();

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    // Clean text of markdown, asterisks, brackets, and extra punctuation for natural speech
    const cleanText = text
      .replace(/\[VERDICT:[^\]]*\]/gi, '')
      .replace(/FEASIBILITY:[^\n]*/gi, '')
      .replace(/[*#_~`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[📱🌾🚿🟢🔴🟡📞📷🎙️]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Slightly slower for crisp clarity outdoors
    utterance.pitch = 1.0;

    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      // Find Hindi voice if available
      const hiVoice = this.voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
      );
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const inVoice = this.voices.find(
        (v) => v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india')
      );
      if (inVoice) utterance.voice = inVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      this.currentUtterance = null;
      if (onError) onError(event);
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking);
  }
}

export const speechManager = new SpeechManager();

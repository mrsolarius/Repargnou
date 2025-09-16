import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TtsService {
  private readonly synthesis: SpeechSynthesis;
  private defaultVoice: SpeechSynthesisVoice | null = null;
  private isEnabled = true;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();

    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices(): void {
    const voices = this.synthesis.getVoices();

    // Try to find a French voice first
    this.defaultVoice = voices.find(voice =>
      voice.lang.startsWith('fr')
    ) || voices[0] || null;
  }

  speak(text: string): void {
    if (!this.isEnabled || !text.trim()) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure the utterance
    if (this.defaultVoice) {
      utterance.voice = this.defaultVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Add error handling
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    this.synthesis.speak(utterance);
  }

  stop(): void {
    this.synthesis.cancel();
  }

  toggle(): void {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
    }
  }

  isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  setVoice(voice: SpeechSynthesisVoice): void {
    this.defaultVoice = voice;
  }
}

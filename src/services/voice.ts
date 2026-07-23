export interface VoiceMessageMetadata {
  duration: string;
  waveform: number[];
  sampleRate: number;
}

export function generateVoiceMetadata(seconds: number): VoiceMessageMetadata {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const durationStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;
  
  // Generate a mock waveform array for premium visualization
  const waveform = Array.from({ length: 15 }, () => Math.floor(10 + Math.random() * 80));

  return {
    duration: durationStr,
    waveform,
    sampleRate: 44100
  };
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPCM16Blob, b64Decode, decodeAudioData } from './audioUtils';
import { LIVE_SYSTEM_INSTRUCTION } from '../constants';

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyzer: AnalyserNode | null = null;

  public onVolumeChange: ((vol: number) => void) | null = null;
  public onDisconnect: (() => void) | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connect() {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Setup Output Node
    const outputNode = this.outputAudioContext.createGain();
    outputNode.connect(this.outputAudioContext.destination);

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Connected");
          this.startAudioInput(sessionPromise);
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleMessage(message);
        },
        onclose: () => {
          console.log("Gemini Live Closed");
          this.cleanup();
          if (this.onDisconnect) this.onDisconnect();
        },
        onerror: (err) => {
          console.error("Gemini Live Error", err);
          this.cleanup();
          if (this.onDisconnect) this.onDisconnect();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: LIVE_SYSTEM_INSTRUCTION,
      },
    });

    this.session = sessionPromise;
    return sessionPromise;
  }

  private startAudioInput(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;

    this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    // Analyzer for visualizer
    this.analyzer = this.inputAudioContext.createAnalyser();
    this.analyzer.fftSize = 256;
    this.sourceNode.connect(this.analyzer);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPCM16Blob(inputData);
      
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });

      // Volume metering
      if (this.onVolumeChange && this.analyzer) {
        const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        this.onVolumeChange(average);
      }
    };

    this.sourceNode.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio && this.outputAudioContext) {
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
      
      try {
        const audioBuffer = await decodeAudioData(
          b64Decode(base64Audio),
          this.outputAudioContext,
          24000,
          1
        );
        
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputAudioContext.destination);
        
        source.addEventListener('ended', () => {
          this.sources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
      } catch (e) {
        console.error("Error decoding audio", e);
      }
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(src => src.stop());
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  disconnect() {
    if (this.session) {
       // There is no explicit disconnect on the session object in current docs that works cleanly in all cases,
       // but closing the stream and context stops it.
       // Ideally calling session.close() if it existed.
       // We will rely on cleanup.
    }
    this.cleanup();
  }

  private cleanup() {
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
    }
    if (this.sourceNode) this.sourceNode.disconnect();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.inputAudioContext) this.inputAudioContext.close();
    if (this.outputAudioContext) this.outputAudioContext.close();
    
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.session = null;
  }
}
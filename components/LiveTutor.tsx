import React, { useEffect, useState, useRef } from 'react';
import { GeminiLiveService } from '../services/geminiLive';
import { Mic, PhoneOff, Volume2 } from 'lucide-react';

export const LiveTutor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  const serviceRef = useRef<GeminiLiveService | null>(null);

  useEffect(() => {
    const service = new GeminiLiveService();
    serviceRef.current = service;
    
    service.onVolumeChange = (vol) => {
        // Normalize volume roughly 0-100
        setVolume(Math.min(vol * 2, 100)); 
    };

    service.onDisconnect = () => {
        setIsConnected(false);
    };

    return () => {
      service.disconnect();
    };
  }, []);

  const toggleConnection = async () => {
    if (isConnected) {
      serviceRef.current?.disconnect();
      setIsConnected(false);
    } else {
      try {
        await serviceRef.current?.connect();
        setIsConnected(true);
      } catch (e) {
        console.error("Failed to connect Live API", e);
        alert("Could not connect to Gemini Live. Check API Key.");
      }
    }
  };

  // Visualizer Bars
  const bars = Array.from({ length: 5 }).map((_, i) => {
     const height = isConnected ? Math.max(10, volume * (1 + Math.random())) : 10;
     return (
        <div 
            key={i} 
            className="w-4 bg-white rounded-full transition-all duration-75 ease-in-out"
            style={{ height: `${Math.min(height, 100)}%`, opacity: isConnected ? 1 : 0.3 }}
        ></div>
     );
  });

  return (
    <div className="h-full w-full flex flex-col relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      
      {/* Background Ambient Blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12 z-10 p-8">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Live Conversation</h2>
          <p className="text-white/80 text-sm">
            {isConnected ? "Listening & Speaking..." : "Tap the mic to start speaking German"}
          </p>
        </div>

        {/* Visualizer Container */}
        <div className="h-32 flex items-center justify-center space-x-3 w-full max-w-[200px]">
            {bars}
        </div>

        {/* Main Control Button */}
        <div className="relative">
           {isConnected && (
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
           )}
           <button
             onClick={toggleConnection}
             className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
               isConnected 
                 ? 'bg-red-500 hover:bg-red-600 rotate-0' 
                 : 'bg-white text-indigo-600 hover:scale-105'
             }`}
           >
             {isConnected ? <PhoneOff size={32} fill="currentColor" className="text-white" /> : <Mic size={32} />}
           </button>
        </div>
      </div>

      {/* Bottom Sheet Hint */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20 p-6 pb-24 rounded-t-3xl z-10">
         <div className="flex items-start space-x-4">
            <div className="bg-white/20 p-2 rounded-full">
                <Volume2 size={20} />
            </div>
            <div>
                <h4 className="font-bold text-sm">Conversation Tip</h4>
                <p className="text-xs text-white/80 mt-1">
                    Try asking: "Können wir bestellen?" (Can we order?) or describe your day. 
                    The AI will correct your pronunciation naturally.
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};
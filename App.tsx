import React, { useState } from 'react';
import Scene from './components/Scene';
import { fetchVavatchInfo } from './services/geminiService';
import { GeminiResponse } from './types';
import { BookOpen, Info, Scale, Loader2, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [scaleModeRatio, setScaleModeRatio] = useState<number>(0);
  const [aiData, setAiData] = useState<GeminiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(true);

  const handleFetchInfo = async () => {
    setLoading(true);
    const data = await fetchVavatchInfo();
    setAiData(data);
    setLoading(false);
  };

  // Helper text for slider
  const getScaleLabel = () => {
    if (scaleModeRatio < 0.1) return "Visual Comparison (Cheat Scale)";
    if (scaleModeRatio > 0.9) return "True Scale (1:350)";
    return `Interpolated Scale (${Math.round(scaleModeRatio * 100)}%)`;
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene scaleModeRatio={scaleModeRatio} />
      </div>

      {/* HUD Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
              VAVATCH ORBITAL
            </h1>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              <BookOpen size={14} /> Consider Phlebas Visualization
            </p>
          </div>
          
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
          >
            <Info size={24} />
          </button>
        </header>

        {/* Info Panel */}
        {showInfo && (
          <div className="absolute top-24 right-6 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 pointer-events-auto shadow-2xl transition-all duration-300">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-emerald-300">Orbital Data</h2>
                <button 
                  onClick={handleFetchInfo} 
                  disabled={loading}
                  className="flex items-center gap-2 text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full transition-colors"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Query Ship Mind
                </button>
             </div>
             
             {!aiData ? (
               <div className="space-y-4 text-sm text-gray-300">
                 <p>
                   Vavatch is a massive Orbital structure from the Culture series. 
                   Unlike a Ringworld which encircles a star, an Orbital is a smaller ring orbiting a star like a planet.
                 </p>
                 <p className="italic text-gray-500 text-xs">
                   "God, it was big..." — Horza
                 </p>
                 <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-200">Click "Query Ship Mind" to retrieve detailed analysis from the fleet database via Gemini.</p>
                 </div>
               </div>
             ) : (
               <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                 <p className="text-sm leading-relaxed text-gray-200">
                   {aiData.description}
                 </p>
                 <div className="space-y-2">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key Metrics</h3>
                   <ul className="space-y-2">
                     {aiData.facts.map((fact, idx) => (
                       <li key={idx} className="text-xs flex gap-2 text-gray-300">
                         <span className="text-emerald-500">•</span> {fact}
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
             )}
          </div>
        )}

        {/* Footer Controls */}
        <div className="pointer-events-auto max-w-md w-full bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Scale size={16} /> Scale Comparison
            </span>
            <span className="text-xs font-mono text-emerald-400">
              {getScaleLabel()}
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scaleModeRatio}
            onChange={(e) => setScaleModeRatio(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
          />
          
          <div className="flex justify-between mt-2 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
            <span>Visible</span>
            <span>True Scale</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

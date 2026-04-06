"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type RankApiResult = {
  iconUrl: string | null;
  rank: string;
  rr: number | null;
  rrChange?: number | null;
  shield?: number | null;
};
function getGlassStyle(rank: string, rrChange?: number | null) {
  let rankColorBg = "rgba(255, 255, 255, 0.05)";
  let rankColorBorder = "border-[rgba(255,255,255,0.1)]";

  const r = rank.toUpperCase();
  if (r.includes("IRON")) { rankColorBg = "rgba(161,157,148,0.25)"; rankColorBorder = "border-[#a19d94]/40"; }
  else if (r.includes("BRONZE")) { rankColorBg = "rgba(166,124,82,0.25)"; rankColorBorder = "border-[#a67c52]/40"; }
  else if (r.includes("SILVER")) { rankColorBg = "rgba(207,212,216,0.25)"; rankColorBorder = "border-[#cfd4d8]/40"; }
  else if (r.includes("GOLD")) { rankColorBg = "rgba(235,199,117,0.25)"; rankColorBorder = "border-[#ebc775]/40"; }
  else if (r.includes("PLATINUM")) { rankColorBg = "rgba(91,194,170,0.25)"; rankColorBorder = "border-[#5bc2aa]/40"; }
  else if (r.includes("DIAMOND")) { rankColorBg = "rgba(180,137,196,0.25)"; rankColorBorder = "border-[#b489c4]/40"; }
  else if (r.includes("ASCENDANT")) { rankColorBg = "rgba(46,191,127,0.25)"; rankColorBorder = "border-[#2ebf7f]/40"; }
  else if (r.includes("IMMORTAL")) { rankColorBg = "rgba(179,44,75,0.25)"; rankColorBorder = "border-[#b32c4b]/40"; }
  else if (r.includes("RADIANT")) { rankColorBg = "rgba(255,219,152,0.25)"; rankColorBorder = "border-[#ffdb98]/40"; }

  let actionColorBg = rankColorBg;
  if (rrChange !== null && rrChange !== undefined && rrChange !== 0) {
    actionColorBg = rrChange > 0 ? "rgba(74,222,128,0.25)" : "rgba(235,87,87,0.25)";
  }

  return {
    className: `flex items-center justify-start gap-5 p-4 pr-6 rounded-3xl backdrop-blur-md border ${rankColorBorder} shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10 animate-[reveal_500ms_ease-out]`,
    style: {
      background: actionColorBg !== rankColorBg 
          ? `linear-gradient(135deg, ${rankColorBg} 0%, ${actionColorBg} 100%)` 
          : rankColorBg
    }
  };
}

function OverlayContent() {
  const params = useSearchParams();
  const name = params.get("name") || "";
  const tag = params.get("tag") || "";
  const region = params.get("region") || "";

  const [data, setData] = useState<RankApiResult | null>(null);
  const [prevData, setPrevData] = useState<RankApiResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!name || !tag || !region) return;

      try {
        const queryParams = new URLSearchParams({ name, tag, region });
        const response = await fetch(`/api/mmr?${queryParams.toString()}`);

        if (!response.ok) return;

        const payload = (await response.json()) as RankApiResult;
        if (!mounted) return;
        
        setData((current) => {
          if (current !== null) {
            setPrevData(current);
            // Trigger animation if RR or RR Change is different
            if (current.rr !== payload.rr || current.rrChange !== payload.rrChange) {
              setIsAnimating(true);
              setTimeout(() => {
                if (mounted) setIsAnimating(false);
              }, 2000); // Animation duration
            }
          }

          // History tracking
          const storeKey = `valorank-history-v2-${name}-${tag}`;
          let historyData = { lastRr: null as number | null, changes: [] as number[] };
          try {
            const saved = window.localStorage.getItem(storeKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed) {
                historyData.lastRr = parsed.lastRr ?? null;
                historyData.changes = Array.isArray(parsed.changes) ? parsed.changes : [];
              }
            }
          } catch {}

          if (payload.rr !== null && payload.rr !== historyData.lastRr) {
            // Found a new match update!
            if (payload.rrChange !== null && payload.rrChange !== undefined && payload.rrChange !== 0) {
              historyData.changes = [payload.rrChange, ...historyData.changes].slice(0, 3);
            }
            historyData.lastRr = payload.rr;
            window.localStorage.setItem(storeKey, JSON.stringify(historyData));
          }

          if (mounted) {
            setHistory(historyData.changes);
          }

          return payload;
        });
      } catch {
        if (mounted) setData(null);
      }
    }

    // Load immediately
    loadData();

    // Auto-refresh mechanism for the stream overlay (every 3 mins)
    const intervalId = setInterval(loadData, 3 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [name, tag, region]);

  // If no data or still loading, render nothing to keep the stream overlay transparent
  if (!name || !tag || !region || !data || !data.iconUrl) return null;

  const glassStyle = getGlassStyle(data.rank, data.rrChange);

  return (
    <div className="absolute top-0 left-0 p-4 overflow-hidden bg-transparent">
      <main className={glassStyle.className} style={glassStyle.style}>
        <img 
          src={data.iconUrl} 
          alt="Valorant rank icon" 
          className="w-27.5 h-27.5 object-contain animate-[floatAndGlow_4s_ease-in-out_infinite] will-change-transform" 
        />
        <div className="flex flex-col justify-center gap-2 font-montserrat">
          <h2 className="text-[2.2rem] font-extrabold tracking-widest text-white m-0 leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] uppercase">
            {data.rank}
          </h2>
          <div className="flex flex-col gap-2 mt-1 w-72">
            {/* RR Progress Bar */}
            <div className="relative h-6 w-full bg-black/40 border border-white/20 rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {/* Current RR Base Fill */}
              <div 
                className={`absolute top-0 left-0 h-full bg-white ${isAnimating ? 'transition-all duration-1000 ease-out' : ''}`}
                style={{ 
                  width: `${Math.min(100, isAnimating && prevData ? prevData.rr || 0 : data.rr || 0)}%` 
                }}
              />
              
              {/* Negative RR Change Lost Chunk */}
              {data.rrChange !== null && data.rrChange !== undefined && data.rrChange < 0 && (
                <div 
                  className={`absolute top-0 h-full bg-[#eb5757] ${isAnimating ? 'transition-all duration-1000 ease-out' : ''} flex items-center justify-center overflow-hidden`}
                  style={{ 
                    left: `${Math.min(100, isAnimating && prevData ? prevData.rr || 0 : data.rr || 0)}%`,
                    width: `${Math.min(100 - Math.min(100, isAnimating && prevData ? prevData.rr || 0 : data.rr || 0), Math.abs(isAnimating && prevData ? prevData.rrChange || 0 : data.rrChange))}%` 
                  }}
                >
                </div>
              )}

              {/* Positive RR Change Gained Chunk */}
              {data.rrChange !== null && data.rrChange !== undefined && data.rrChange > 0 && (
                <div 
                  className={`absolute top-0 h-full bg-[#4ade80] ${isAnimating ? 'transition-all duration-1000 ease-out' : ''} flex items-center justify-center overflow-hidden`}
                  style={{ 
                    left: `${Math.max(0, (isAnimating && prevData ? prevData.rr || 0 : data.rr || 0) - (isAnimating && prevData ? prevData.rrChange || 0 : data.rrChange))}%`,
                    width: `${Math.max(0, Math.min(100, isAnimating && prevData ? prevData.rr || 0 : data.rr || 0) - Math.max(0, (isAnimating && prevData ? prevData.rr || 0 : data.rr || 0) - (isAnimating && prevData ? prevData.rrChange || 0 : data.rrChange)))}%` 
                  }}
                >
                </div>
              )}
              
              {/* Force final state immediately after animation timeout without visual jumping */}
              {!isAnimating && (
                <>
                  <div 
                    className="absolute top-0 left-0 h-full bg-white"
                    style={{ width: `${Math.min(100, data.rr || 0)}%` }}
                  />
                  {data.rrChange !== null && data.rrChange !== undefined && data.rrChange < 0 && (
                     <div 
                      className="absolute top-0 h-full bg-[#eb5757] flex items-center justify-center overflow-hidden"
                      style={{ 
                        left: `${Math.min(100, data.rr || 0)}%`,
                        width: `${Math.min(100 - Math.min(100, data.rr || 0), Math.abs(data.rrChange))}%` 
                      }}
                    >
                    </div>
                  )}
                  {data.rrChange !== null && data.rrChange !== undefined && data.rrChange > 0 && (
                     <div 
                      className="absolute top-0 h-full bg-[#4ade80] flex items-center justify-center overflow-hidden"
                      style={{ 
                        left: `${Math.max(0, (data.rr || 0) - data.rrChange)}%`,
                        width: `${Math.max(0, Math.min(100, data.rr || 0) - Math.max(0, (data.rr || 0) - data.rrChange))}%` 
                      }}
                    >
                    </div>
                  )}
                </>
              )}

              {/* Text Overlay */}
              <div className="absolute inset-0 z-10 flex items-center px-4 font-bold text-[0.95rem] tracking-wider text-white [text-shadow:0_2px_4px_rgba(0,0,0,1),0_0_8px_rgba(0,0,0,0.8)]">
                <span>{data.rr} RR</span>
              </div>
            </div>

            {/* RR Changes / History */}
            {history.length > 0 && (
              <div className="flex gap-2 items-center px-1 mt-0.5">
                <span className="text-[0.75rem] uppercase font-black text-white/90 tracking-wider mr-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">Match History</span>
                <div className="flex gap-1.5">
                  {history.map((val, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded text-[0.85rem] font-extrabold bg-black/60 border border-white/20 ${val > 0 ? "text-[#4ade80]" : "text-[#ffb3b3]"} shadow-[0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shield Indicator */}
            {data.rank.endsWith(" 1") && data.shield !== null && data.shield !== undefined && (
              <div className="self-start inline-flex items-center justify-center px-4 py-1 bg-white/10 border border-white/20 text-white rounded-full font-bold text-[1rem] tracking-wider shadow-lg gap-1.5">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
                </svg>
                {data.shield}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={null}>
      <OverlayContent />
    </Suspense>
  );
}

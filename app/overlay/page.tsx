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

function OverlayContent() {
  const params = useSearchParams();
  const name = params.get("name") || "";
  const tag = params.get("tag") || "";
  const region = params.get("region") || "";

  const [data, setData] = useState<RankApiResult | null>(null);
  const [prevData, setPrevData] = useState<RankApiResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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

  return (
    <div className="absolute top-0 left-0 p-4 overflow-hidden bg-transparent">
      <main className="flex items-center justify-start gap-4 p-4 bg-transparent relative z-10 animate-[reveal_500ms_ease-out]">
        <img 
          src={data.iconUrl} 
          alt="Valorant rank icon" 
          className="w-27.5 h-27.5 object-contain animate-[floatAndGlow_4s_ease-in-out_infinite] will-change-transform" 
        />
        <div className="flex flex-col justify-center gap-2 font-montserrat">
          <h2 className="text-[2.2rem] font-extrabold tracking-widest text-white m-0 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] uppercase">
            {data.rank}
          </h2>
          <div className="flex flex-col gap-2 mt-1 w-72">
            {/* RR Progress Bar */}
            <div className="relative h-8 w-full bg-black/40 border border-white/20 rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
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
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,black_4px,black_8px)]"></div>
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
                      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,black_4px,black_8px)]"></div>
                    </div>
                  )}
                </>
              )}

              {/* Text Overlay */}
              <div className="absolute inset-0 z-10 flex justify-between items-center px-4 font-bold text-[1.1rem] tracking-wider text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9),0_0_2px_rgba(0,0,0,0.9)]">
                <span>{data.rr} RR</span>
                {data.rrChange !== null && data.rrChange !== undefined && data.rrChange < 0 && (
                  <span className="text-[#ffb3b3]">{data.rrChange}</span>
                )}
              </div>
            </div>

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

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type RankApiResult = {
  iconUrl: string | null;
  rank: string;
  rr: number | null;
};

function OverlayContent() {
  const params = useSearchParams();
  const name = params.get("name") || "";
  const tag = params.get("tag") || "";
  const region = params.get("region") || "";

  const [data, setData] = useState<RankApiResult | null>(null);

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
        setData(payload);
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
      <main className="flex items-center justify-center gap-6 px-12 py-8 bg-transparent relative z-10 animate-[reveal_500ms_ease-out]">
        <img 
          src={data.iconUrl} 
          alt="Valorant rank icon" 
          className="w-[110px] h-[110px] object-contain animate-[floatAndGlow_4s_ease-in-out_infinite] will-change-transform" 
        />
        <div className="flex flex-col justify-center gap-2 font-montserrat">
          <h2 className="text-[2.2rem] font-extrabold tracking-widest text-white m-0 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] uppercase">
            {data.rank}
          </h2>
          <div>
            <span className="inline-flex items-center justify-center px-5 py-1.5 bg-white border border-[#eb5757]/30 rounded-full text-[#eb5757] font-bold text-[1.1rem] tracking-wider shadow-[0_4px_12px_rgba(235,87,87,0.1)] whitespace-nowrap">
              {data.rr} RR
            </span>
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

"use client";

import { useEffect, useState } from "react";

type RankApiResult = {
  iconUrl: string | null;
  rank: string;
  rr: number | null;
};

const fixedPlayer = {
  name: "悪魔 Akuma",
  tag: "DN07",
  region: "AP",
};

export default function Home() {
  const [data, setData] = useState<RankApiResult | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const params = new URLSearchParams(fixedPlayer);
        const response = await fetch(`/api/mmr?${params.toString()}`);

        if (!response.ok) return;

        const payload = (await response.json()) as RankApiResult;
        if (!mounted) return;
        setData(payload);
      } catch {
        if (mounted) setData(null);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (!data || !data.iconUrl) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
      <main className="flex items-center justify-center gap-6 px-12 py-8 bg-transparent relative z-10 animate-[reveal_500ms_ease-out]">
        <img 
          src={data.iconUrl} 
          alt="Valorant rank icon" 
          className="w-[110px] h-[110px] object-contain animate-[floatAndGlow_4s_ease-in-out_infinite] will-change-transform" 
        />
        <div className="flex flex-col justify-center gap-2 font-montserrat">
          <h2 className="text-[2.2rem] font-extrabold tracking-widest text-white m-0 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
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

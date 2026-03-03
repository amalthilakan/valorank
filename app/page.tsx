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
    <div className="page" style={{ background: 'transparent' }}>
      <main className="rank-wrapper" style={{ background: 'transparent', boxShadow: 'none', border: 'none', backdropFilter: 'none' }}>
        <img 
          src={data.iconUrl} 
          alt="Valorant rank icon" 
          className="animated-icon" 
        />
        <div className="rank-text-block">
          <h2 className="rank-title" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>{data.rank}</h2>
          <div>
            <span className="rank-badge" style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}>{data.rr} RR</span>
          </div>
        </div>
      </main>
    </div>
  );
}

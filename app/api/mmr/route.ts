import { NextRequest, NextResponse } from "next/server";

type Tier = {
  tierName?: string;
  largeIcon?: string | null;
};

type TierSet = {
  tiers?: Tier[];
};

type ParsedRank = {
  rank: string;
  rr: number | null;
  rrChange: number | null;
  shield: number | null;
};

let rankIconCache: Map<string, string> | null = null;
let rankIconCacheAt = 0;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function parseMmr(raw: string): ParsedRank {
  const value = raw.trim();
  const rank = value.split(",")[0]?.trim() || "Unknown";

  const rrMatch = value.match(/RR:\s*(-?\d+)/i);
  const rr = rrMatch ? Number(rrMatch[1]) : null;

  const parenNumbers = Array.from(value.matchAll(/\((-?\d+)\)/g)).map((match) => Number(match[1]));

  return {
    rank,
    rr,
    rrChange: parenNumbers[0] ?? null,
    shield: parenNumbers[1] ?? null,
  };
}

function normalizeRankName(rank: string): string {
  const normalized = rank
    .trim()
    .replace(/\s+#\d+\b/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase();

  if (normalized === "UNRATED") return "UNRANKED";
  return normalized;
}

async function loadRankIconMap(): Promise<Map<string, string>> {
  const now = Date.now();

  if (rankIconCache && now - rankIconCacheAt < CACHE_TTL_MS) {
    return rankIconCache;
  }

  const response = await fetch("https://valorant-api.com/v1/competitivetiers", {
    next: { revalidate: 21600 },
  });

  if (!response.ok) {
    throw new Error("Failed to load rank icon metadata");
  }

  const payload = (await response.json()) as { data?: TierSet[] };
  const allSets = payload.data ?? [];
  const latestSet = allSets.at(-1);
  const tiers = latestSet?.tiers ?? [];

  const iconMap = new Map<string, string>();

  for (const tier of tiers) {
    if (!tier.tierName || !tier.largeIcon) continue;
    iconMap.set(tier.tierName.toUpperCase(), tier.largeIcon);
  }

  rankIconCache = iconMap;
  rankIconCacheAt = now;
  return iconMap;
}

async function getRankIcon(rank: string): Promise<string | null> {
  const iconMap = await loadRankIconMap();
  const key = normalizeRankName(rank);
  return iconMap.get(key) ?? null;
}

function parseApiText(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "string" ? parsed : String(parsed);
  } catch {
    return text;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get("name")?.trim();
  const tag = searchParams.get("tag")?.trim();
  const region = searchParams.get("region")?.trim();

  if (!name || !tag || !region) {
    return NextResponse.json(
      { error: "Missing required query params: name, tag, region" },
      { status: 400 },
    );
  }

  const mmrUrl = `https://vaccie.pythonanywhere.com/mmr/${encodeURIComponent(name)}/${encodeURIComponent(tag)}/${encodeURIComponent(region)}`;

  try {
    const upstream = await fetch(mmrUrl, { cache: "no-store" });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream API failed with status ${upstream.status}` },
        { status: 502 },
      );
    }

    const rawBody = parseApiText(await upstream.text());
    const parsed = parseMmr(rawBody);

    const iconUrl = await getRankIcon(parsed.rank).catch(() => null);

    return NextResponse.json({
      player: { name, tag, region },
      raw: rawBody,
      ...parsed,
      iconUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [region, setRegion] = useState("AP");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tag || !region) return;

    // Clean up tag (remove # if user adds it)
    const cleanTag = tag.trim().replace(/^#/, "");
    const cleanName = name.trim();

    const url = new URL("/overlay", window.location.origin);
    url.searchParams.set("name", cleanName);
    url.searchParams.set("tag", cleanTag);
    url.searchParams.set("region", region);

    setGeneratedUrl(url.toString());
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1923] text-white flex items-center justify-center p-6 relative overflow-hidden font-montserrat">
      {/* Dynamic Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#ff4655] opacity-20 blur-[140px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#ff4655] opacity-10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative z-10 w-full max-w-xl bg-[#1f2326]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        
        {/* Header section */}
        <div className="text-center mb-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#ff4655] rounded-full shadow-[0_0_15px_rgba(255,70,85,0.8)]"></div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-black tracking-tighter mb-3 uppercase text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500">
            Valorank <span className="text-[#ff4655] drop-shadow-[0_0_8px_rgba(255,70,85,0.4)]">Overlay</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
            Generate a live MMR browser source for your stream
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">
                Riot ID
              </label>
              <input 
                type="text" 
                placeholder="Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">
                Tagline
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold group-focus-within:text-[#ff4655] transition-colors">#</span>
                <input 
                  type="text" 
                  placeholder="0000" 
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl pl-8 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition-all uppercase"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-1">
              Region
            </label>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition-all appearance-none cursor-pointer"
              >
                <option value="AP">Asia Pacific (AP)</option>
                <option value="NA">North America (NA)</option>
                <option value="EU">Europe (EU)</option>
                <option value="KR">Korea (KR)</option>
                <option value="BR">Brazil (BR)</option>
                <option value="LATAM">Latin America (LATAM)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full relative group overflow-hidden bg-[#ff4655] text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl shadow-[0_0_15px_rgba(255,70,85,0.4)] transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#ff4655] focus:ring-offset-2 focus:ring-offset-[#1f2326]"
          >
            <span className="relative z-10">Generate Overlay URL</span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
          </button>
        </form>

        {/* Result Area */}
        {generatedUrl && (
          <div className="mt-10 p-6 bg-black/30 border border-[#ff4655]/40 rounded-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#ff4655]">
                Browser Source URL
              </p>
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-[#ff4655]/50 animate-pulse delay-75"></span>
                <span className="w-2 h-2 rounded-full bg-[#ff4655]/25 animate-pulse delay-150"></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                readOnly 
                value={generatedUrl}
                className="flex-1 bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors selection:bg-[#ff4655]/30 selection:text-white"
                onClick={(e) => e.currentTarget.select()}
              />
              <button 
                onClick={handleCopy}
                className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all min-w-[120px] ${
                  copied 
                    ? "bg-green-500/10 text-green-400 border border-green-500/30" 
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            
            <p className="mt-5 text-xs text-gray-500 leading-relaxed max-w-sm flex items-start">
              <svg className="w-4 h-4 mr-2 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Add a new <span className="text-gray-300 font-semibold">Browser Source</span> in OBS. Paste this URL and set width to <span className="text-gray-300 font-semibold">400</span>, height to <span className="text-gray-300 font-semibold">150</span>.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

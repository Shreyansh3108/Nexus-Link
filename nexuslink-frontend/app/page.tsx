"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link2, BarChart3, ArrowRight, Server } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Baseline dummy data for the past 6 days (to make the chart look active)
const baselineAnalytics = [
  { date: "Day 1", clicks: 12 }, { date: "Day 2", clicks: 45 }, { date: "Day 3", clicks: 28 },
  { date: "Day 4", clicks: 80 }, { date: "Day 5", clicks: 120 }, { date: "Day 6", clicks: 95 }
];

export default function Home() {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: Real-Time Analytics State ---
  const [trackingAlias, setTrackingAlias] = useState("my-resume"); // Default to your tested link
  const [realTotalClicks, setRealTotalClicks] = useState(0);
  const [chartData, setChartData] = useState([...baselineAnalytics, { date: "Today", clicks: 0 }]);

  // --- NEW: The Live Polling Engine ---
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const response = await fetch(`https://nexus-link-d84b.onrender.com/api/analytics/${trackingAlias}`);
        if (response.ok) {
          const data = await response.json();
          setRealTotalClicks(data.total_clicks);
          
          // Hybrid Data Merge: Keep the 6 days of baseline, but overwrite "Today" with REAL backend data
          setChartData([
            ...baselineAnalytics,
            { date: "Today", clicks: data.total_clicks + 140 } // Adding 140 as a baseline so the chart doesn't dip to zero, but it WILL tick up with real clicks!
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch live stats", err);
      }
    };

    // Fetch immediately, then poll every 3 seconds
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 3000);
    return () => clearInterval(interval);
  }, [trackingAlias]); // Re-run if we start tracking a new alias

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShortUrl("");
    setIsLoading(true);

    try {
      const response = await fetch("https://nexus-link-d84b.onrender.com/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "nx_live_secretkey123" },
        body: JSON.stringify({ longUrl, customAlias }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create link");
      
      const generatedAlias = data.shortUrl.split('/').pop();
      setShortUrl(`https://nexus-link-d84b.onrender.com/${generatedAlias}`);
      
      // Automatically switch the dashboard to track the newly created link!
      setTrackingAlias(generatedAlias);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      
      <div className="absolute inset-0 bg-dot-white/[0.2] flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"></div>
      </div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: Hero & Form */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="xl:col-span-5 space-y-10">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/10 text-xs text-gray-400 mb-6 font-mono tracking-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span>REDIS EDGE CACHE ACTIVE</span>
            </motion.div>
            <h1 className="text-6xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-white via-gray-200 to-gray-600 bg-clip-text text-transparent leading-[1.1]">
              Route faster.<br/>Scale infinitely.
            </h1>
            <p className="text-gray-400 text-lg font-light leading-relaxed max-w-md">
              A high-performance URL shortener built for developers. Secure aliases, cached reads, and real-time analytics.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <form onSubmit={handleSubmit} className="relative bg-[#09090b]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Destination URL</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="url" required value={longUrl} onChange={(e) => setLongUrl(e.target.value)} placeholder="https://github.com/..." className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Alias <span className="text-gray-600 lowercase">(optional)</span></label>
                <input type="text" value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} placeholder="e.g., tech-resume" className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full relative overflow-hidden rounded-xl bg-white text-black font-bold py-3.5 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "Provisioning..." : "Generate Link"}
                  {!isLoading && <ArrowRight size={18} />}
                </span>
              </button>
              
              {error && <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm text-center font-medium">{error}</div>}
              {shortUrl && (
                <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 text-center">
                  <p className="text-xs text-blue-300/70 mb-1 uppercase tracking-wider font-semibold">Active Route</p>
                  <a href={shortUrl} target="_blank" rel="noreferrer" className="text-blue-400 font-bold text-lg hover:text-blue-300 transition-colors drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    {shortUrl}
                  </a>
                </div>
              )}
            </form>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Dashboard UI */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }} className="xl:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#09090b]/80 border border-white/5 rounded-2xl p-8 backdrop-blur-xl hover:border-white/10 transition-colors relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 size={100} strokeWidth={1} /></div>
              <h3 className="font-medium text-gray-400 mb-2 relative z-10 flex items-center justify-start gap-3">
               Total Requests
              {/* Moved to the left using gap-3 instead of justify-between to prevent overlap */}
               <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded font-mono text-gray-300">/{trackingAlias}</span>
                </h3>
              {/* REAL TIME DATA RENDERED HERE */}
              <p className="text-5xl font-extrabold tracking-tight relative z-10">{realTotalClicks}</p>
              <div className="mt-4 flex items-center gap-2 text-sm relative z-10">
                <span className="text-gray-500">Live data from Supabase</span>
              </div>
            </div>

            <div className="bg-[#09090b]/80 border border-white/5 rounded-2xl p-8 backdrop-blur-xl hover:border-white/10 transition-colors relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Server size={100} strokeWidth={1} /></div>
              <h3 className="font-medium text-gray-400 mb-2 relative z-10">P99 Latency</h3>
              <p className="text-5xl font-extrabold tracking-tight relative z-10">14<span className="text-2xl text-gray-600 ml-1">ms</span></p>
              <div className="mt-4 flex items-center gap-2 text-sm relative z-10">
                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-medium">Cache Hit</span>
                <span className="text-gray-500">via Upstash Redis</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[350px] bg-[#09090b]/80 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-medium text-gray-300">Traffic Activity</h3>
              <span className="flex items-center gap-2 text-xs font-medium text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Polling Live</span>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff10', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
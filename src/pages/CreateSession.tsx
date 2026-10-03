import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { ProcessPicker } from "../components/ProcessPicker";
import { DEFAULT_PRESET_BLACKLIST } from "../hooks/useSession";
import {
  Target,
  Clock,
  Sparkles,
  Play,
  Monitor,
  CheckCircle2,
} from "lucide-react";

interface CreateSessionProps {
  onStart: (goal: string, durationMinutes: number, blacklist: string[], blockedUrls: string[]) => void;
  useOverlay: boolean;
  onToggleOverlay: (val: boolean) => void;
}

const DURATION_PRESETS = [
  { minutes: 15, label: "15m", desc: "NÆ°á»›c rÃºt" },
  { minutes: 25, label: "25m", desc: "Pomodoro" },
  { minutes: 45, label: "45m", desc: "SÃ¢u" },
  { minutes: 60, label: "60m", desc: "1 Giá»" },
  { minutes: 90, label: "90m", desc: "ChuyÃªn sÃ¢u" },
];

const SUGGESTED_GOALS = [
  "Viáº¿t bÃ¡o cÃ¡o / TÃ i liá»‡u",
  "Ã”n thi & Äá»c sÃ¡ch",
  "Láº­p trÃ¬nh tÃ­nh nÄƒng má»›i",
  "Xá»­ lÃ½ email tá»“n Ä‘á»ng",
  "Luyá»‡n viáº¿t & Dá»‹ch thuáº­t",
];

export const CreateSession: React.FC<CreateSessionProps> = ({
  onStart,
  useOverlay,
  onToggleOverlay,
}) => {
  const [goal, setGoal] = useState(() => {
    return localStorage.getItem("focuslock_recent_goal_v1") || "";
  });

  const [duration, setDuration] = useState<number>(() => {
    const saved = localStorage.getItem("focuslock_duration_v1");
    return saved ? JSON.parse(saved) : 25;
  });

  const [customDuration, setCustomDuration] = useState<string>("");

  const [blockedUrls, setBlockedUrls] = useState<string[]>(() => {
    const saved = localStorage.getItem("focuslock_urls_v1");
    return saved ? JSON.parse(saved) : [];
  });

  const [blacklist, setBlacklist] = useState<string[]>(() => {
    const saved = localStorage.getItem("focuslock_blacklist_v1");
    return saved ? JSON.parse(saved) : DEFAULT_PRESET_BLACKLIST;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGoal = goal.trim() || "PhiÃªn táº­p trung chuyÃªn sÃ¢u";
    const finalDuration = customDuration ? parseInt(customDuration, 10) : duration;
    localStorage.setItem("focuslock_recent_goal_v1", finalGoal);
    localStorage.setItem("focuslock_duration_v1", JSON.stringify(finalDuration));
    localStorage.setItem("focuslock_blacklist_v1", JSON.stringify(blacklist));
    localStorage.setItem("focuslock_urls_v1", JSON.stringify(blockedUrls));
    onStart(finalGoal, Math.max(1, finalDuration), blacklist, blockedUrls);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Má»™t phiÃªn â€¢ Má»™t má»¥c tiÃªu â€¢ KhÃ´ng xao nhÃ£ng</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Thiáº¿t láº­p PhiÃªn Táº­p Trung
        </h1>
        <p className="text-slate-400 text-sm mt-1.5">
          KhÃ³a cháº·t sá»± táº­p trung, loáº¡i bá» hoÃ n toÃ n cÃ¡c á»©ng dá»¥ng gÃ¢y xao nhÃ£ng.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Single Goal */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            1. Má»¥c tiÃªu duy nháº¥t cá»§a phiÃªn nÃ y
          </label>
          <input
            type="text"
            required
            placeholder="Báº¡n muá»‘n hoÃ n thÃ nh viá»‡c gÃ¬? (VÃ­ dá»¥: HoÃ n thÃ nh bÃ i bÃ¡o cÃ¡o)"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
          />

          {/* Quick goal suggestions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 self-center mr-1">
              Gá»£i Ã½:
            </span>
            {SUGGESTED_GOALS.map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => setGoal(suggested)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Duration */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              2. Khoáº£ng thá»i gian táº­p trung
            </label>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {customDuration ? `${customDuration} phÃºt` : `${duration} phÃºt`}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {DURATION_PRESETS.map((p) => {
              const isSelected = !customDuration && duration === p.minutes;
              return (
                <button
                  key={p.minutes}
                  type="button"
                  onClick={() => {
                    setDuration(p.minutes);
                    setCustomDuration("");
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                      : "bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="text-sm font-bold">{p.label}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? "text-indigo-200" : "text-slate-500"
                    }`}
                  >
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom duration input */}
          <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
            <span>Hoáº·c tá»± Ä‘áº·t:</span>
            <input
              type="number"
              min="1"
              max="300"
              placeholder="Sá»‘ phÃºt..."
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <span>phÃºt</span>
          </div>
        </div>

        {/* Section 3: App Blacklist */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <ProcessPicker blacklist={blacklist} onChange={setBlacklist} blockedUrls={blockedUrls} onChangeUrls={setBlockedUrls} />
        </div>

        {/* Section 4: Overlay Widget Preference */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Monitor className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Cháº¿ Ä‘á»™ Mini Overlay Widget
              </div>
              <div className="text-[11px] text-slate-400">
                Thu nhá» á»©ng dá»¥ng thÃ nh thanh ná»•i gÃ³c mÃ n hÃ¬nh vÃ  luÃ´n ghim trÃªn cÃ¹ng
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleOverlay(!useOverlay)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              useOverlay ? "bg-indigo-600" : "bg-slate-800"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                useOverlay ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full text-base py-4 rounded-2xl shadow-xl shadow-indigo-600/25"
            icon={<Play className="w-5 h-5 fill-current" />}
          >
            Báº¯t Ä‘áº§u Táº­p trung ngay
          </Button>
        </div>
      </form>
    </div>
  );
};




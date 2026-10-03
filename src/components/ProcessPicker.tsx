import React, { useState, useEffect } from "react";
import { getRunningProcesses, ProcessItem } from "../services/tauri";
import {
  Plus,
  X,
  RefreshCw,
  Search,
  ShieldAlert,
  Flame,
  Check,
} from "lucide-react";

interface ProcessPickerProps {
  blacklist: string[];
  onChange: (blacklist: string[]) => void;
}

const COMMON_PRESETS = [
  { name: "discord.exe", label: "Discord" },
  { name: "steam.exe", label: "Steam" },
  { name: "epicgameslauncher.exe", label: "Epic Games" },
  { name: "telegram.exe", label: "Telegram" },
  { name: "spotify.exe", label: "Spotify" },
  { name: "riotclientservices.exe", label: "Riot Client" },
  { name: "leagueclient.exe", label: "League of Legends" },
  { name: "genshinimpact.exe", label: "Genshin Impact" },
];

export const ProcessPicker: React.FC<ProcessPickerProps> = ({
  blacklist,
  onChange,
}) => {
  const [runningApps, setRunningApps] = useState<ProcessItem[]>([]);
  const [loadingRunning, setLoadingRunning] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRunningModal, setShowRunningModal] = useState(false);

  // Normalize app name to .exe lowercase
  const normalizeName = (val: string) => {
    let name = val.trim().toLowerCase();
    if (!name.endsWith(".exe")) {
      name = `${name}.exe`;
    }
    return name;
  };

  const handleToggle = (rawName: string) => {
    const item = normalizeName(rawName);
    if (blacklist.includes(item)) {
      onChange(blacklist.filter((x) => x !== item));
    } else {
      onChange([...blacklist, item]);
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;
    const item = normalizeName(customInput);
    if (!blacklist.includes(item)) {
      onChange([...blacklist, item]);
    }
    setCustomInput("");
  };

  const fetchRunning = async () => {
    setLoadingRunning(true);
    try {
      const list = await getRunningProcesses();
      setRunningApps(list);
    } catch (e) {
      console.error("Failed to load running processes", e);
    } finally {
      setLoadingRunning(false);
    }
  };

  useEffect(() => {
    fetchRunning();
  }, []);

  const filteredRunning = runningApps.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Current Blacklist Badges */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Ứng dụng sẽ chặn ({blacklist.length})
          </label>
          {blacklist.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {blacklist.length === 0 ? (
          <div className="p-3 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            Chưa có ứng dụng nào được chọn. Chọn từ danh sách gợi ý hoặc ứng dụng đang chạy bên dưới.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            {blacklist.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/25 group hover:border-rose-500/50 transition-all"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleToggle(item)}
                  className="text-rose-400/70 hover:text-rose-200 transition-colors p-0.5 rounded hover:bg-rose-500/20"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preset distraction apps */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          Gợi ý ứng dụng dễ gây xao nhãng
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_PRESETS.map((preset) => {
            const isSelected = blacklist.includes(preset.name);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleToggle(preset.name)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 text-rose-400" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-500" />
                )}
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Running apps selector & Custom input */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex gap-2">
          <form onSubmit={handleAddCustom} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Nhập tên file .exe (vd: game.exe)"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setShowRunningModal(!showRunningModal);
              if (!showRunningModal) fetchRunning();
            }}
            className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-medium border border-indigo-500/30 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loadingRunning ? "animate-spin" : ""}`}
            />
            Chọn app đang mở ({runningApps.length})
          </button>
        </div>

        {/* Modal / Drawer of Running Apps */}
        {showRunningModal && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Lọc ứng dụng đang chạy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={fetchRunning}
                title="Làm mới danh sách tiến trình"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loadingRunning ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {filteredRunning.length === 0 ? (
                <div className="text-center text-xs text-slate-600 py-3">
                  Không tìm thấy tiến trình nào phù hợp.
                </div>
              ) : (
                filteredRunning.map((proc) => {
                  const normalized = normalizeName(proc.name);
                  const isSelected = blacklist.includes(normalized);
                  return (
                    <div
                      key={proc.pid + proc.name}
                      onClick={() => handleToggle(normalized)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-rose-500/15 border border-rose-500/30 text-rose-200"
                          : "hover:bg-slate-800/60 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono truncate">{proc.name}</span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          PID: {proc.pid}
                        </span>
                      </div>
                      <span className="text-xs font-semibold shrink-0">
                        {isSelected ? (
                          <span className="text-rose-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đã chặn
                          </span>
                        ) : (
                          <span className="text-slate-500 hover:text-indigo-400">
                            + Chặn
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

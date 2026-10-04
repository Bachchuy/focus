import React, { useState, useEffect } from "react";
import { getRunningProcesses, getInstalledApps, ProcessItem, InstalledAppItem } from "../services/tauri";
import { Plus, X, RefreshCw, Search, ShieldAlert, Flame, Check, Globe } from "lucide-react";
import { clsx } from "clsx";

interface ProcessPickerProps {
  blacklist: string[];
  onChange: (blacklist: string[]) => void;
  blockedUrls: string[];
  onChangeUrls: (urls: string[]) => void;
}

const COMMON_PRESETS = [
  { name: "discord.exe", label: "Discord" },
  { name: "steam.exe", label: "Steam" },
  { name: "epicgameslauncher.exe", label: "Epic Games" },
  { name: "telegram.exe", label: "Telegram" },
  { name: "spotify.exe", label: "Spotify" },
];

const WEB_PRESETS = [
  "facebook.com",
  "youtube.com",
  "tiktok.com",
  "instagram.com",
  "twitter.com",
  "reddit.com",
  "netflix.com"
];

const normalizeWebsiteHost = (rawUrl: string): string | null => {
  const input = rawUrl.trim();
  if (!input) return null;

  const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(input);
  if (hasScheme && !/^https?:\/\//i.test(input)) return null;

  try {
    const url = new URL(hasScheme ? input : `https://${input}`);
    return url.hostname.toLowerCase().replace(/^www\./, "").replace(/\.$/, "") || null;
  } catch {
    return null;
  }
};

export const ProcessPicker: React.FC<ProcessPickerProps> = ({ blacklist, onChange, blockedUrls, onChangeUrls }) => {
  const [runningApps, setRunningApps] = useState<ProcessItem[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledAppItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"installed" | "running" | "websites">("installed");

  const normalizeName = (val: string) => {
    let name = val.trim().toLowerCase();
    if (!name.endsWith(".exe")) {
      name = `${name}.exe`;
    }
    return name;
  };

  const handleToggleApp = (rawName: string) => {
    const item = normalizeName(rawName);
    if (blacklist.includes(item)) {
      onChange(blacklist.filter((x) => x !== item));
    } else {
      onChange([...blacklist, item]);
    }
  };
  
  const handleToggleUrl = (rawUrl: string) => {
    const url = normalizeWebsiteHost(rawUrl);
    if (!url) return;
    
    if (blockedUrls.includes(url)) {
      onChangeUrls(blockedUrls.filter((x) => x !== url));
    } else {
      onChangeUrls([...blockedUrls, url]);
    }
  };

  const handleAddCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handleToggleApp(customInput);
      setCustomInput("");
    }
  };
  
  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      const normalizedUrl = normalizeWebsiteHost(customUrlInput);
      if (!normalizedUrl) return;
      handleToggleUrl(normalizedUrl);
      setCustomUrlInput("");
    }
  };

  const fetchData = async () => {
    if (activeTab === "websites") return;
    
    setLoading(true);
    try {
      if (activeTab === "running") {
        const apps = await getRunningProcesses();
        setRunningApps(apps);
      } else if (activeTab === "installed") {
        const apps = await getInstalledApps();
        setInstalledApps(apps);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      fetchData();
    }
  }, [showModal, activeTab]);

  const filteredRunning = runningApps.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredInstalled = installedApps.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.executable.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Selected Box */}
      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            Danh sách đen ({blacklist.length} Apps, {blockedUrls.length} Web)
          </label>
          {(blacklist.length > 0 || blockedUrls.length > 0) && (
            <button type="button" onClick={() => { onChange([]); onChangeUrls([]); }} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Xóa tất cả</button>
          )}
        </div>
        
        {blacklist.length === 0 && blockedUrls.length === 0 ? (
          <div className="p-3 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">Chưa có ứng dụng hoặc trang web nào bị chặn.</div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            {blacklist.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/25 group hover:border-rose-500/50 transition-all">
                <span>{item}</span>
                <button type="button" onClick={() => handleToggleApp(item)} className="text-rose-400/70 hover:text-rose-200 transition-colors p-0.5 rounded hover:bg-rose-500/20"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {blockedUrls.map((url) => (
              <span key={url} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/25 group hover:border-purple-500/50 transition-all">
                <Globe className="w-3 h-3 text-purple-400/70" />
                <span>{url}</span>
                <button type="button" onClick={() => handleToggleUrl(url)} className="text-purple-400/70 hover:text-purple-200 transition-colors p-0.5 rounded hover:bg-purple-500/20"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preset distraction apps */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> Gợi ý ứng dụng & Web dễ xao nhãng</div>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_PRESETS.map((preset) => {
            const isSelected = blacklist.includes(preset.name);
            return (
              <button key={preset.name} type="button" onClick={() => handleToggleApp(preset.name)} className={clsx("inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all", isSelected ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700")}>
                {isSelected ? <Check className="w-3 h-3 text-rose-400" /> : <Plus className="w-3 h-3 text-slate-500" />}
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {WEB_PRESETS.map((url) => {
            const isSelected = blockedUrls.includes(url);
            return (
              <button key={url} type="button" onClick={() => handleToggleUrl(url)} className={clsx("inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all", isSelected ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700")}>
                {isSelected ? <Check className="w-3 h-3 text-purple-400" /> : <Globe className="w-3 h-3 text-slate-500" />}
                {url}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowModal(!showModal)} className="w-full px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-sm font-medium border border-indigo-500/30 flex items-center justify-center gap-2 transition-colors">
            <Search className="w-4 h-4" />
            Tìm và thêm Ứng dụng / Trang Web
          </button>
        </div>

        {/* Modal / Drawer of Apps */}
        {showModal && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button type="button" onClick={() => setActiveTab("installed")} className={clsx("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors", activeTab === "installed" ? "bg-indigo-500/20 text-indigo-300" : "text-slate-400 hover:bg-slate-800")}>App Đã Cài Đặt</button>
              <button type="button" onClick={() => setActiveTab("running")} className={clsx("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors", activeTab === "running" ? "bg-indigo-500/20 text-indigo-300" : "text-slate-400 hover:bg-slate-800")}>App Đang Chạy</button>
              <button type="button" onClick={() => setActiveTab("websites")} className={clsx("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1", activeTab === "websites" ? "bg-purple-500/20 text-purple-300" : "text-slate-400 hover:bg-slate-800")}><Globe className="w-3.5 h-3.5" /> Trang Web</button>
            </div>
            
            {activeTab !== "websites" && (
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Tìm ứng dụng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                </div>
                <button type="button" onClick={fetchData} title="Làm mới" className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"><RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} /></button>
              </div>
            )}
            
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {activeTab === "websites" ? (
                <div className="p-2 space-y-4">
                  <form onSubmit={handleAddCustomUrl} className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" placeholder="Nhập tên miền (vd: facebook.com)" value={customUrlInput} onChange={(e) => setCustomUrlInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors" />
                    </div>
                    <button type="submit" disabled={!customUrlInput.trim()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1"><Plus className="w-4 h-4" /> Thêm</button>
                  </form>
                  <p className="text-xs text-slate-400 italic">
                    Lưu ý: Tính năng chặn trang web sẽ sửa đổi file hosts của Windows và yêu cầu bạn chạy phần mềm với quyền Administrator. Tên miền nhập vào sẽ bị chặn trên tất cả trình duyệt (Chrome, Edge, Cốc Cốc...).
                  </p>
                </div>
              ) : loading ? (
                <div className="text-center text-xs text-slate-500 py-6">Đang tải danh sách...</div>
              ) : activeTab === "installed" ? (
                filteredInstalled.length === 0 ? <div className="text-center text-xs text-slate-600 py-3">Không có ứng dụng nào.</div> : filteredInstalled.map((app, idx) => {
                  const normalized = normalizeName(app.executable);
                  const isSelected = blacklist.includes(normalized);
                  return (
                    <div key={idx} onClick={() => handleToggleApp(normalized)} className={clsx("flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors", isSelected ? "bg-rose-500/15 border border-rose-500/30 text-rose-200" : "hover:bg-slate-800/60 text-slate-300")}>
                      <div className="flex flex-col gap-0.5 truncate"><span className="font-semibold truncate">{app.name}</span><span className="text-[10px] text-slate-500 font-mono truncate">{app.executable}</span></div>
                      <span className="text-xs font-semibold shrink-0">{isSelected ? <span className="text-rose-400 flex items-center gap-1"><Check className="w-3 h-3" /> Đã chặn</span> : <span className="text-slate-500 hover:text-indigo-400">+ Chọn</span>}</span>
                    </div>
                  );
                })
              ) : (
                filteredRunning.length === 0 ? <div className="text-center text-xs text-slate-600 py-3">Không có tiến trình nào.</div> : filteredRunning.map((proc) => {
                  const normalized = normalizeName(proc.name);
                  const isSelected = blacklist.includes(normalized);
                  return (
                    <div key={proc.pid + proc.name} onClick={() => handleToggleApp(normalized)} className={clsx("flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors", isSelected ? "bg-rose-500/15 border border-rose-500/30 text-rose-200" : "hover:bg-slate-800/60 text-slate-300")}>
                      <div className="flex items-center gap-2 truncate"><span className="font-mono truncate">{proc.name}</span><span className="text-[10px] text-slate-600 font-mono">PID: {proc.pid}</span></div>
                      <span className="text-xs font-semibold shrink-0">{isSelected ? <span className="text-rose-400 flex items-center gap-1"><Check className="w-3 h-3" /> Đã chặn</span> : <span className="text-slate-500 hover:text-indigo-400">+ Chọn</span>}</span>
                    </div>
                  );
                })
              )}
              
              {/* Thêm App thủ công ở tab chạy/cài đặt */}
              {activeTab !== "websites" && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <form onSubmit={handleAddCustomApp} className="flex gap-2">
                    <input type="text" placeholder="Nhập tên file .exe (vd: game.exe)" value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                    <button type="submit" disabled={!customInput.trim()} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-medium"><Plus className="w-3.5 h-3.5" /></button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

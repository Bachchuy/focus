import React from "react";
import { Timer } from "../components/Timer";
import { SessionStatus } from "../services/tauri";
import {
  ShieldAlert,
  Maximize2,
  Square,
  Lock,
  Sparkles,
} from "lucide-react";

interface OverlayProps {
  status: SessionStatus;
  recentAlert: { process: string; count: number } | null;
  onStop: () => void;
  onExpand: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  status,
  recentAlert,
  onStop,
  onExpand,
}) => {
  const totalSeconds = status.duration_minutes * 60;

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full min-h-[140px] bg-slate-950/95 border border-indigo-500/40 rounded-xl p-3 flex flex-col justify-between shadow-2xl backdrop-blur-md select-none overflow-hidden relative"
    >
      {/* Dynamic Alert Banner when an app is killed */}
      {recentAlert && (
        <div className="absolute inset-x-0 top-0 bg-rose-600 text-white text-[11px] font-bold py-1 px-3 flex items-center justify-center gap-1.5 animate-bounce z-50 shadow-md">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Đã tự động đóng: {recentAlert.process}</span>
        </div>
      )}

      {/* Top row: Drag header & Goal */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between gap-2"
      >
        <div
          data-tauri-drag-region
          className="flex items-center gap-1.5 truncate max-w-[220px]"
        >
          <div className="w-4 h-4 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Lock className="w-2.5 h-2.5" />
          </div>
          <span
            data-tauri-drag-region
            title={status.goal}
            className="text-xs font-semibold text-slate-200 truncate cursor-move"
          >
            {status.goal || "Đang tập trung"}
          </span>
        </div>

        {/* Expand & Close controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onExpand}
            title="Mở rộng cửa sổ chính"
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onStop}
            title="Dừng phiên"
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle row: Large Timer & Shield stats */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-1"
      >
        <Timer
          remainingSeconds={status.remaining_seconds}
          totalSeconds={totalSeconds}
          size="compact"
        />

        <div className="flex items-center gap-2">
          {status.blocked_count > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              {status.blocked_count} chặn
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              An toàn
            </span>
          )}
        </div>
      </div>

      {/* Bottom Progress Line */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-linear"
          style={{
            width: `${
              totalSeconds > 0
                ? Math.min(
                    100,
                    ((totalSeconds - status.remaining_seconds) / totalSeconds) * 100
                  )
                : 0
            }%`,
          }}
        />
      </div>
    </div>
  );
};

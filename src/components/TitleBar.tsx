import React from "react";
import { minimizeWindow, closeWindow } from "../services/tauri";
import { Lock, Minus, X } from "lucide-react";

interface TitleBarProps {
  isCompact?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ isCompact = false }) => {
  return (
    <div
      data-tauri-drag-region
      className={`flex items-center justify-between select-none ${
        isCompact
          ? "h-7 px-2.5 bg-slate-950/80 border-b border-slate-800/60"
          : "h-10 px-4 bg-slate-950/90 border-b border-slate-850"
      }`}
    >
      {/* Brand icon & title */}
      <div
        data-tauri-drag-region
        className="flex items-center gap-2 pointer-events-none"
      >
        <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-sm shadow-indigo-500/30">
          <Lock className="w-3 h-3 text-white" />
        </div>
        <span
          className={`font-semibold tracking-wide text-slate-200 ${
            isCompact ? "text-xs" : "text-sm"
          }`}
        >
          FocusLock
        </span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => minimizeWindow()}
          title="Thu nhỏ"
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => closeWindow()}
          title="Đóng ứng dụng"
          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

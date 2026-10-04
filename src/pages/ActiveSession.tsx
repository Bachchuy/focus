import React from "react";
import { Timer } from "../components/Timer";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";
import { SessionStatus } from "../services/tauri";
import {
  Target,
  Shield,
  ShieldAlert,
  Minimize2,
  Square,
  CheckCircle,
} from "lucide-react";

interface ActiveSessionProps {
  status: SessionStatus;
  recentAlert: { process: string; count: number } | null;
  onStop: () => void;
  onShrinkToOverlay: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  status,
  recentAlert,
  onStop,
  onShrinkToOverlay,
}) => {
  const totalSeconds = status.duration_minutes * 60;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col items-center justify-between min-h-[580px] animate-in fade-in duration-300">
      {/* Alert toast if process was killed */}
      {recentAlert && (
        <div className="w-full mb-4 bg-rose-500/15 border border-rose-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-rose-200 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Phát hiện và tự động đóng:{" "}
              <strong className="font-mono">{recentAlert.process}</strong>
            </span>
          </div>
          <span className="font-bold bg-rose-500/20 px-2 py-0.5 rounded text-[11px]">
            Lần {recentAlert.count}
          </span>
        </div>
      )}

      {/* Goal Title */}
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Target className="w-3.5 h-3.5" />
          Mục tiêu phiên hiện tại
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          "{status.goal}"
        </h2>
      </div>

      {/* Hero Circular Countdown Timer */}
      <div className="my-4">
        <Timer
          remainingSeconds={status.remaining_seconds}
          totalSeconds={totalSeconds}
          size="large"
        />
      </div>

      {/* Distraction Shield Stats */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              Lá chắn đang hoạt động ({status.blacklist.length} ứng dụng, {status.blocked_urls.length} trang web)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Đã ngăn chặn:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                status.blocked_count > 0
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {status.blocked_count} lần
            </span>
          </div>
        </div>

        <ProgressBar
          current={totalSeconds - status.remaining_seconds}
          total={totalSeconds}
          className="mt-3"
        />
        {status.blocked_urls.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Tên miền đã nhận để chặn">
            {status.blocked_urls.map((domain) => (
              <span key={domain} className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-1 font-mono text-[11px] text-purple-200">
                {domain}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 w-full">
        <Button
          type="button"
          variant="secondary"
          onClick={onShrinkToOverlay}
          icon={<Minimize2 className="w-4 h-4" />}
          className="flex-1 py-3 text-xs md:text-sm"
        >
          Thu nhỏ thành Overlay Widget
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={onStop}
          icon={<Square className="w-4 h-4" />}
          className="py-3 px-5 text-xs md:text-sm"
        >
          Dừng phiên
        </Button>
      </div>
    </div>
  );
};

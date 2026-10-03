import React from "react";
import { Button } from "../components/Button";
import { SessionSummary } from "../services/tauri";
import {
  Trophy,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Flame,
} from "lucide-react";

interface SessionSummaryModalProps {
  summary: SessionSummary;
  onClose: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  summary,
  onClose,
}) => {
  const focusedMinutes = Math.floor(summary.focused_seconds / 60);
  const focusedSeconds = summary.focused_seconds % 60;

  return (
    <div className="max-w-xl mx-auto px-6 py-8 animate-in fade-in duration-300">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-center">
        {/* Hero badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20">
          {summary.completed ? (
            <Trophy className="w-8 h-8 text-white" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-white" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {summary.completed
              ? "Tuyệt vời! Đã hoàn thành mục tiêu"
              : "Đã kết thúc phiên tập trung"}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            "{summary.goal}"
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Thời gian tập trung</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {focusedMinutes}m {focusedSeconds}s
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Lần ngăn xao nhãng</span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-300">
              {summary.blocked_count} lần
            </div>
          </div>
        </div>

        {/* Blocked events log if any */}
        {summary.blocked_events && summary.blocked_events.length > 0 && (
          <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 text-left space-y-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Nhật ký ứng dụng đã tự động đóng
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1 text-xs text-slate-300">
              {summary.blocked_events.map((evt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 border-b border-slate-800/40 last:border-0"
                >
                  <span className="font-mono text-rose-400">
                    {evt.process_name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(evt.timestamp * 1000).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close / Next session button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl text-sm"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Bắt đầu Phiên Mới
        </Button>
      </div>
    </div>
  );
};

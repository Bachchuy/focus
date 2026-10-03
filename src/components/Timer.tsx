import React from "react";

interface TimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  size?: "compact" | "normal" | "large";
}

export const Timer: React.FC<TimerProps> = ({
  remainingSeconds,
  totalSeconds,
  size = "normal",
}) => {
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const pad = (num: number) => num.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const formatted = formatTime(remainingSeconds);
  const progressPercent =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
      : 0;

  if (size === "compact") {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xl font-bold tracking-tight text-white drop-shadow-sm">
          {formatted}
        </span>
      </div>
    );
  }

  if (size === "large") {
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (progressPercent / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        {/* SVG Circular Ring */}
        <svg className="w-64 h-64 -rotate-90 transform" viewBox="0 0 240 240">
          <circle
            cx="120"
            cy="120"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="120"
            cy="120"
            r={radius}
            className="stroke-indigo-500 transition-all duration-1000 ease-linear"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Clock Text */}
        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-5xl font-black tracking-tight text-white drop-shadow-md">
            {formatted}
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-400 mt-2 font-medium">
            {Math.round(progressPercent)}% Hoàn thành
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono text-3xl font-extrabold tracking-tight text-indigo-400">
      {formatted}
    </div>
  );
};

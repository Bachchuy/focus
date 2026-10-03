import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  className = "",
  showLabel = false,
}) => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-medium">
          <span>Tiến độ phiên</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-0.5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-sm shadow-indigo-500/50"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

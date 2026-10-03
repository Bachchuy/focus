import React, { useState, useEffect } from "react";
import { TitleBar } from "./components/TitleBar";
import { CreateSession } from "./pages/CreateSession";
import { Overlay } from "./pages/Overlay";
import { ActiveSession } from "./pages/ActiveSession";
import { SessionSummaryModal } from "./pages/SessionSummaryModal";
import { useSession } from "./hooks/useSession";
import { setWindowMode } from "./services/tauri";

export const App: React.FC = () => {
  const {
    status,
    summary,
    recentBlockedAlert,
    useOverlayWidget,
    start,
    stop,
    toggleOverlayMode,
    clearSummary,
  } = useSession();

  // Track window size to adapt UI if resized into compact overlay widget
  const [isCompactWindow, setIsCompactWindow] = useState(() => {
    return window.innerHeight < 240;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsCompactWindow(window.innerHeight < 240);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When session is active and window is compact (Overlay mode)
  if (status.is_active && isCompactWindow) {
    return (
      <Overlay
        status={status}
        recentAlert={recentBlockedAlert}
        onStop={stop}
        onExpand={async () => {
          await setWindowMode("main");
        }}
      />
    );
  }

  // Normal Main Window Mode
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 select-none">
      {/* Sleek Custom Window TitleBar with Drag Region */}
      <TitleBar isCompact={false} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {summary ? (
          <SessionSummaryModal summary={summary} onClose={clearSummary} />
        ) : status.is_active ? (
          <ActiveSession
            status={status}
            recentAlert={recentBlockedAlert}
            onStop={stop}
            onShrinkToOverlay={async () => {
              await setWindowMode("overlay");
            }}
          />
        ) : (
          <CreateSession
            onStart={start}
            useOverlay={useOverlayWidget}
            onToggleOverlay={toggleOverlayMode}
          />
        )}
      </main>
    </div>
  );
};

export default App;

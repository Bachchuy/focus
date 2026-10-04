import { useState, useEffect, useCallback, useRef } from "react";
import {
  SessionStatus,
  SessionSummary,
  startBlocking,
  stopBlocking,
  getSessionStatus,
  setWindowMode,
  onAppBlocked,
  onSessionCompleted,
} from "../services/tauri";

const STORAGE_KEY_BLACKLIST = "focuslock_blacklist_v1";
const STORAGE_KEY_DURATION = "focuslock_duration_v1";
const STORAGE_KEY_GOAL = "focuslock_recent_goal_v1";
const STORAGE_KEY_OVERLAY_PREF = "focuslock_overlay_pref_v1";
const STORAGE_KEY_URLS = "focuslock_urls_v1";

export const DEFAULT_PRESET_BLACKLIST = [
  "discord.exe",
  "steam.exe",
  "epicgameslauncher.exe",
  "telegram.exe",
  "spotify.exe",
  "riotclientservices.exe",
  "leagueclient.exe",
  "genshinimpact.exe",
  "tiktok.exe",
];

export function useSession() {
  const [status, setStatus] = useState<SessionStatus>({
    is_active: false,
    goal: "",
    duration_minutes: 25,
    elapsed_seconds: 0,
    remaining_seconds: 1500,
    blocked_count: 0,
    blacklist: [],
    blocked_urls: [],
  });

  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [recentBlockedAlert, setRecentBlockedAlert] = useState<{
    process: string;
    count: number;
  } | null>(null);
  const [useOverlayWidget, setUseOverlayWidget] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OVERLAY_PREF);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const timerRef = useRef<number | null>(null);

  // Sync session status
  const refreshStatus = useCallback(async () => {
    try {
      const current = await getSessionStatus();
      setStatus(current);
      if (!current.is_active && status.is_active) {
        // Naturally ended
        const res = await stopBlocking();
        setSummary(res);
        await setWindowMode("main");
      }
    } catch (err) {
      console.error("Failed to fetch session status", err);
    }
  }, [status.is_active]);

  // Initial load & listeners
  useEffect(() => {
    refreshStatus();

    let unlistenBlocked: (() => void) | undefined;
    let unlistenCompleted: (() => void) | undefined;

    const setupListeners = async () => {
      unlistenBlocked = await onAppBlocked((proc, count) => {
        setRecentBlockedAlert({ process: proc, count });
        setStatus((prev) => ({
          ...prev,
          blocked_count: count,
        }));
        setTimeout(() => {
          setRecentBlockedAlert(null);
        }, 4000);
      });

      unlistenCompleted = await onSessionCompleted(async () => {
        try {
          const res = await stopBlocking();
          setSummary(res);
          await setWindowMode("main");
          setStatus((prev) => ({ ...prev, is_active: false }));
        } catch (e) {
          console.error("Error stopping after completed event", e);
        }
      });
    };

    setupListeners();

    return () => {
      if (unlistenBlocked) unlistenBlocked();
      if (unlistenCompleted) unlistenCompleted();
    };
  }, [refreshStatus]);

  // Local ticker when active to keep timer smooth
  useEffect(() => {
    if (status.is_active) {
      timerRef.current = window.setInterval(() => {
        setStatus((prev) => {
          if (!prev.is_active) return prev;
          if (prev.remaining_seconds <= 1) {
            return {
              ...prev,
              remaining_seconds: 0,
              elapsed_seconds: prev.elapsed_seconds + 1,
            };
          }
          return {
            ...prev,
            remaining_seconds: prev.remaining_seconds - 1,
            elapsed_seconds: prev.elapsed_seconds + 1,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status.is_active]);

  // Start Session
  const start = async (
    goal: string,
    durationMinutes: number,
    blacklist: string[],
    blockedUrls: string[] = []
  ) => {
    const res = await startBlocking(goal, durationMinutes, blacklist, blockedUrls);
    setStatus(res);
    setSummary(null);

    // Persist preferences
    localStorage.setItem(STORAGE_KEY_GOAL, goal);
    localStorage.setItem(
      STORAGE_KEY_DURATION,
      JSON.stringify(durationMinutes)
    );
    localStorage.setItem(STORAGE_KEY_BLACKLIST, JSON.stringify(blacklist));
    localStorage.setItem(STORAGE_KEY_URLS, JSON.stringify(blockedUrls));

    if (useOverlayWidget) {
      await setWindowMode("overlay");
    }
  };

  // Stop Session manually
  const stop = async () => {
    const res = await stopBlocking();
    setSummary(res);
    setStatus((prev) => ({ ...prev, is_active: false }));
    await setWindowMode("main");
  };

  // Toggle Overlay Mode during or before session
  const toggleOverlayMode = async (enable: boolean) => {
    setUseOverlayWidget(enable);
    localStorage.setItem(STORAGE_KEY_OVERLAY_PREF, JSON.stringify(enable));
    if (status.is_active) {
      await setWindowMode(enable ? "overlay" : "main");
    }
  };

  return {
    status,
    summary,
    recentBlockedAlert,
    useOverlayWidget,
    start,
    stop,
    toggleOverlayMode,
    clearSummary: () => setSummary(null),
    refreshStatus,
  };
}


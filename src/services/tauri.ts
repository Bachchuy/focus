import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface BlockedEvent {
  process_name: string;
  timestamp: number;
}

export interface SessionStatus {
  is_active: boolean;
  goal: string;
  duration_minutes: number;
  elapsed_seconds: number;
  remaining_seconds: number;
  blocked_count: number;
  blacklist: string[];
}

export interface SessionSummary {
  goal: string;
  duration_minutes: number;
  focused_seconds: number;
  completed: boolean;
  blocked_count: number;
  blocked_events: BlockedEvent[];
}

export interface ProcessItem {
  name: string;
  pid: number;
}

// Check if running within Tauri desktop environment
export const isTauri = (): boolean => {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

// Start focus session
export async function startBlocking(
  goal: string,
  durationMinutes: number,
  blacklist: string[]
): Promise<SessionStatus> {
  if (!isTauri()) {
    console.warn("Running in web mode. Mocking startBlocking.");
    return {
      is_active: true,
      goal,
      duration_minutes: durationMinutes,
      elapsed_seconds: 0,
      remaining_seconds: durationMinutes * 60,
      blocked_count: 0,
      blacklist,
    };
  }

  return await invoke<SessionStatus>("start_blocking", {
    goal,
    durationMinutes,
    blacklist,
  });
}

// Stop focus session & get summary
export async function stopBlocking(): Promise<SessionSummary> {
  if (!isTauri()) {
    console.warn("Running in web mode. Mocking stopBlocking.");
    return {
      goal: "Mục tiêu mẫu",
      duration_minutes: 25,
      focused_seconds: 1500,
      completed: true,
      blocked_count: 3,
      blocked_events: [
        { process_name: "steam.exe", timestamp: Date.now() / 1000 - 300 },
        { process_name: "discord.exe", timestamp: Date.now() / 1000 - 150 },
      ],
    };
  }

  return await invoke<SessionSummary>("stop_blocking");
}

// Get current session status
export async function getSessionStatus(): Promise<SessionStatus> {
  if (!isTauri()) {
    return {
      is_active: false,
      goal: "",
      duration_minutes: 25,
      elapsed_seconds: 0,
      remaining_seconds: 1500,
      blocked_count: 0,
      blacklist: [],
    };
  }

  return await invoke<SessionStatus>("get_session_status");
}

// Get currently running system processes
export async function getRunningProcesses(): Promise<ProcessItem[]> {
  if (!isTauri()) {
    return [
      { name: "chrome.exe", pid: 101 },
      { name: "discord.exe", pid: 102 },
      { name: "steam.exe", pid: 103 },
      { name: "spotify.exe", pid: 104 },
      { name: "telegram.exe", pid: 105 },
      { name: "code.exe", pid: 106 },
    ];
  }

  return await invoke<ProcessItem[]>("get_running_processes");
}

// Switch window mode (normal window or compact HUD widget)
export async function setWindowMode(mode: "main" | "overlay"): Promise<void> {
  if (!isTauri()) {
    console.log("Mock window mode:", mode);
    return;
  }
  await invoke("set_window_mode", { mode });
}

// Window minimize
export async function minimizeWindow(): Promise<void> {
  if (isTauri()) {
    await invoke("minimize_window");
  }
}

// Window close
export async function closeWindow(): Promise<void> {
  if (isTauri()) {
    await invoke("close_window");
  }
}

// Subscribe to app blocked events
export async function onAppBlocked(
  callback: (processName: string, count: number) => void
): Promise<() => void> {
  if (!isTauri()) {
    return () => {};
  }
  return await listen<[string, number]>("app-blocked", (event) => {
    callback(event.payload[0], event.payload[1]);
  });
}

// Subscribe to natural session completion
export async function onSessionCompleted(
  callback: () => void
): Promise<() => void> {
  if (!isTauri()) {
    return () => {};
  }
  return await listen("session-completed", () => {
    callback();
  });
}

export interface InstalledAppItem {
  name: string;
  executable: string;
}

export async function getInstalledApps(): Promise<InstalledAppItem[]> {
  if (!isTauri()) {
    return [
      { name: "Google Chrome", executable: "chrome.exe" },
      { name: "Discord", executable: "discord.exe" },
    ];
  }
  return await invoke<InstalledAppItem[]>("get_installed_apps");
}

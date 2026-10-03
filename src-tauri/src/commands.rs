use crate::blocking::{BlockingState, ProcessItem, SessionStatus, SessionSummary};
use std::collections::HashSet;
use sysinfo::{ProcessesToUpdate, System};
use tauri::{AppHandle, LogicalSize, Manager, Size, State};

// Ignore noisy or critical system processes when suggesting running apps
const IGNORED_PROCESSES: &[&str] = &[
    "svchost.exe",
    "explorer.exe",
    "smss.exe",
    "csrss.exe",
    "wininit.exe",
    "services.exe",
    "lsass.exe",
    "dwm.exe",
    "conhost.exe",
    "fontdrvhost.exe",
    "sihost.exe",
    "taskhostw.exe",
    "ctfmon.exe",
    "searchhost.exe",
    "startmenuexperiencehost.exe",
    "system",
    "registry",
    "idle",
    "memory compression",
    "runtimebroker.exe",
    "shellexperiencehost.exe",
    "textinputhost.exe",
    "securityhealthsystray.exe",
    "securityhealthservice.exe",
    "audiodg.exe",
    "spoolsv.exe",
    "focuslock.exe",
];

#[tauri::command]
pub fn start_blocking(
    goal: String,
    duration_minutes: u32,
    blacklist: Vec<String>,
    state: State<'_, BlockingState>,
    app_handle: AppHandle,
) -> Result<SessionStatus, String> {
    state.start(goal, duration_minutes, blacklist, app_handle)
}

#[tauri::command]
pub fn stop_blocking(
    state: State<'_, BlockingState>,
    _app_handle: AppHandle,
) -> Result<SessionSummary, String> {
    state.stop()
}

#[tauri::command]
pub fn get_session_status(state: State<'_, BlockingState>) -> SessionStatus {
    state.get_status()
}

#[tauri::command]
pub fn get_running_processes() -> Result<Vec<ProcessItem>, String> {
    let mut sys = System::new();
    sys.refresh_processes(ProcessesToUpdate::All, true);

    let ignored_set: HashSet<&str> = IGNORED_PROCESSES.iter().copied().collect();
    let mut seen_names: HashSet<String> = HashSet::new();
    let mut result: Vec<ProcessItem> = Vec::new();

    for (pid, process) in sys.processes() {
        let raw_name = process.name().to_string_lossy().to_string();
        let lower = raw_name.to_lowercase();

        if ignored_set.contains(lower.as_str()) {
            continue;
        }

        if !seen_names.contains(&lower) {
            seen_names.insert(lower);
            result.push(ProcessItem {
                name: raw_name,
                pid: pid.as_u32(),
            });
        }
    }

    result.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(result)
}

#[tauri::command]
pub fn set_window_mode(mode: String, app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        match mode.as_str() {
            "overlay" => {
                let _ = window.set_size(Size::Logical(LogicalSize {
                    width: 360.0,
                    height: 140.0,
                }));
                let _ = window.set_always_on_top(true);
                let _ = window.set_resizable(false);
            }
            "main" => {
                let _ = window.set_size(Size::Logical(LogicalSize {
                    width: 860.0,
                    height: 720.0,
                }));
                let _ = window.set_always_on_top(false);
                let _ = window.set_resizable(true);
                let _ = window.center();
            }
            _ => return Err("Invalid window mode".into()),
        }
        Ok(())
    } else {
        Err("Main window not found".into())
    }
}

#[tauri::command]
pub fn minimize_window(app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.minimize().map_err(|e| e.to_string())
    } else {
        Err("Main window not found".into())
    }
}

#[tauri::command]
pub fn close_window(app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.close().map_err(|e| e.to_string())
    } else {
        Err("Main window not found".into())
    }
}

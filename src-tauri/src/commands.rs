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
    blocked_urls: Vec<String>,
    state: State<'_, BlockingState>,
    app_handle: AppHandle,
) -> Result<SessionStatus, String> {
    state.start(goal, duration_minutes, blacklist, blocked_urls, app_handle)
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
use std::process::Command;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledApp {
    pub name: String,
    pub executable: String,
}

#[tauri::command]
pub fn get_installed_apps() -> Result<Vec<InstalledApp>, String> {
    let script = r#"
        $shell = New-Object -ComObject WScript.Shell
        Get-ChildItem -Path "$env:ProgramData\Microsoft\Windows\Start Menu\Programs", "$env:APPDATA\Microsoft\Windows\Start Menu\Programs" -Recurse -Filter *.lnk -ErrorAction SilentlyContinue | ForEach-Object {
            $target = $shell.CreateShortcut($_.FullName).TargetPath
            if ($target -match "\.exe$") {
                [PSCustomObject]@{
                    Name = $_.BaseName
                    Executable = [System.IO.Path]::GetFileName($target)
                }
            }
        } | Group-Object Executable | ForEach-Object { $_.Group[0] } | ConvertTo-Json -Compress
    "#;

    let output = Command::new("powershell")
        .args(&["-NoProfile", "-Command", script])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let apps: Vec<InstalledApp> = serde_json::from_str(&json_str).unwrap_or_else(|_| {
        if let Ok(single) = serde_json::from_str::<InstalledApp>(&json_str) {
            vec![single]
        } else {
            Vec::new()
        }
    });
    
    let mut apps = apps;
    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    
    Ok(apps)
}


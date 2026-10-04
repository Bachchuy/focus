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
                executable_path: process
                    .exe()
                    .map(|path| path.to_string_lossy().into_owned()),
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
                window.set_decorations(false).map_err(|e| e.to_string())?;
                window
                    .set_size(Size::Logical(LogicalSize {
                        width: 360.0,
                        height: 140.0,
                    }))
                    .map_err(|e| e.to_string())?;
                window.set_always_on_top(true).map_err(|e| e.to_string())?;
                window.set_resizable(false).map_err(|e| e.to_string())?;
            }
            "main" => {
                window.set_decorations(true).map_err(|e| e.to_string())?;
                window
                    .set_size(Size::Logical(LogicalSize {
                        width: 860.0,
                        height: 720.0,
                    }))
                    .map_err(|e| e.to_string())?;
                window.set_always_on_top(false).map_err(|e| e.to_string())?;
                window.set_resizable(true).map_err(|e| e.to_string())?;
                window.center().map_err(|e| e.to_string())?;
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
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledApp {
    pub name: String,
    pub executable: Option<String>,
    pub executable_path: Option<String>,
    pub icon_path: Option<String>,
    pub publisher: Option<String>,
    pub version: Option<String>,
    pub install_date: Option<String>,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum InstalledAppsJson {
    Many(Vec<InstalledApp>),
    One(InstalledApp),
}

#[tauri::command]
pub fn get_installed_apps() -> Result<Vec<InstalledApp>, String> {
    let script = r#"
        [Console]::OutputEncoding = New-Object -TypeName System.Text.UTF8Encoding -ArgumentList $false
        $OutputEncoding = [Console]::OutputEncoding
        $shell = New-Object -ComObject WScript.Shell
        $apps = @{}
        $shortcutPaths = @(
            "$env:ProgramData\Microsoft\Windows\Start Menu\Programs",
            "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
        )

        Get-ChildItem -Path $shortcutPaths -Recurse -Filter *.lnk -ErrorAction SilentlyContinue | ForEach-Object {
            $target = $shell.CreateShortcut($_.FullName).TargetPath
            if ($target -match "(?i)\.exe$" -and $_.BaseName -notmatch "(?i)^(uninstall|unins|remove)\b") {
                $executable = [System.IO.Path]::GetFileName($target)
                $key = $executable.ToLowerInvariant()
                if (-not $apps.ContainsKey($key)) {
                    $apps[$key] = [PSCustomObject]@{
                        name = $_.BaseName
                        executable = $executable
                        executablePath = $target
                        iconPath = $shell.CreateShortcut($_.FullName).IconLocation
                        publisher = $null
                        version = $null
                        installDate = $null
                    }
                }
            }
        }

        $registryPaths = @(
            'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
            'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
            'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
        )
        Get-ItemProperty -Path $registryPaths -ErrorAction SilentlyContinue | ForEach-Object {
            $registryApp = $_
            if (-not $registryApp.DisplayName -or $registryApp.SystemComponent -eq 1 -or $registryApp.ParentKeyName) { return }
            $displayName = [string]$registryApp.DisplayName
            if ($displayName -match '(?i)^(uninstall|unins|remove)\b') { return }

            $candidatePaths = @()
            $installLocation = [Environment]::ExpandEnvironmentVariables([string]$registryApp.InstallLocation)
            $shortcut = $apps.Values | Where-Object { $_.name -ieq $displayName } | Select-Object -First 1
            if ($shortcut -and $shortcut.executablePath) {
                $candidatePaths += $shortcut.executablePath
            }

            $iconPath = $null
            if ($registryApp.DisplayIcon) {
                $rawIcon = [Environment]::ExpandEnvironmentVariables([string]$registryApp.DisplayIcon)
                $iconPath = ($rawIcon -replace ',\s*-?\d+\s*$', '').Trim().Trim('"')
                if ($iconPath -match '(?i)\.exe$' -and (Test-Path -LiteralPath $iconPath)) {
                    try {
                        $iconVersion = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($iconPath)
                        $displayKey = ($displayName -replace '[^\p{L}\p{N}]', '').ToLowerInvariant()
                        $iconDescription = "$($iconVersion.ProductName) $($iconVersion.FileDescription)"
                        $iconKey = ($iconDescription -replace '[^\p{L}\p{N}]', '').ToLowerInvariant()
                        if ($displayKey.Length -ge 5 -and $iconKey.Contains($displayKey)) {
                            $candidatePaths += $iconPath
                        }
                    } catch { }
                }
            }

            if ($installLocation -and (Test-Path -LiteralPath $installLocation -PathType Container)) {
                Get-ChildItem -LiteralPath $installLocation -Filter *.exe -File -Recurse -Depth 5 -ErrorAction SilentlyContinue | ForEach-Object {
                    if ($_.Name -match '(?i)^(unins|uninstall|uninst)') { return }
                    try {
                        $fileVersion = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($_.FullName)
                        $displayKey = ($displayName -replace '[^\p{L}\p{N}]', '').ToLowerInvariant()
                        $fileDescription = "$($fileVersion.ProductName) $($fileVersion.FileDescription)"
                        $fileKey = ($fileDescription -replace '[^\p{L}\p{N}]', '').ToLowerInvariant()
                        if ($displayKey.Length -ge 5 -and $fileKey.Contains($displayKey)) {
                            $candidatePaths += $_.FullName
                        }
                    } catch { }
                }
            }

            if (-not $iconPath -and $shortcut) { $iconPath = $shortcut.iconPath }
            $candidatePaths = @($candidatePaths | Sort-Object -Unique)
            $installDate = $null
            $registryInstallDate = [string]$registryApp.InstallDate
            if ($registryInstallDate -match '^\d{8}$') {
                $installDate = '{0}/{1}/{2}' -f $registryInstallDate.Substring(4, 2), $registryInstallDate.Substring(6, 2), $registryInstallDate.Substring(0, 4)
            }
            if ($candidatePaths.Count -eq 0) {
                $key = "unresolved:$($displayName.ToLowerInvariant())"
                $apps[$key] = [PSCustomObject]@{
                    name = $displayName
                    executable = $null
                    executablePath = $null
                    iconPath = $iconPath
                    publisher = [string]$registryApp.Publisher
                    version = [string]$registryApp.DisplayVersion
                    installDate = $installDate
                }
            }

            foreach ($candidatePath in $candidatePaths) {
                $executable = [System.IO.Path]::GetFileName($candidatePath)
                $key = $executable.ToLowerInvariant()
                $apps[$key] = [PSCustomObject]@{
                    name = $displayName
                    executable = $executable
                    executablePath = $candidatePath
                    iconPath = $iconPath
                    publisher = [string]$registryApp.Publisher
                    version = [string]$registryApp.DisplayVersion
                    installDate = $installDate
                }
            }
        }

        $orderedApps = @($apps.Values | Sort-Object name)
        ConvertTo-Json -InputObject $orderedApps -Compress
    "#;

    let output = Command::new("powershell")
        .args(&["-NoProfile", "-NonInteractive", "-Command", script])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let parsed: InstalledAppsJson = serde_json::from_str(&json_str).map_err(|error| {
        format!("Could not parse installed apps from Windows: {error}")
    })?;
    let mut apps = match parsed {
        InstalledAppsJson::Many(apps) => apps,
        InstalledAppsJson::One(app) => vec![app],
    };

    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    
    Ok(apps)
}


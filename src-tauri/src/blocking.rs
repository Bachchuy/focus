use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use sysinfo::{ProcessesToUpdate, System};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockedEvent {
    pub process_name: String,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionStatus {
    pub is_active: bool,
    pub goal: String,
    pub duration_minutes: u32,
    pub elapsed_seconds: u64,
    pub remaining_seconds: u64,
    pub blocked_count: u32,
    pub blacklist: Vec<String>,
    pub blocked_urls: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionSummary {
    pub goal: String,
    pub duration_minutes: u32,
    pub focused_seconds: u64,
    pub completed: bool,
    pub blocked_count: u32,
    pub blocked_events: Vec<BlockedEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ProcessItem {
    pub name: String,
    pub pid: u32,
    pub executable_path: Option<String>,
}

#[derive(Clone)]
pub struct BlockingState {
    pub is_active: Arc<AtomicBool>,
    pub goal: Arc<RwLock<String>>,
    pub duration_minutes: Arc<AtomicU32>,
    pub start_time: Arc<Mutex<Option<Instant>>>,
    pub blacklist: Arc<RwLock<HashSet<String>>>,
    pub blocked_urls: Arc<RwLock<Vec<String>>>,
    pub blocked_count: Arc<AtomicU32>,
    pub blocked_events: Arc<Mutex<Vec<BlockedEvent>>>,
    pub stop_signal: Arc<AtomicBool>,
}

impl BlockingState {
    pub fn new() -> Self {
        Self {
            is_active: Arc::new(AtomicBool::new(false)),
            goal: Arc::new(RwLock::new(String::new())),
            duration_minutes: Arc::new(AtomicU32::new(25)),
            start_time: Arc::new(Mutex::new(None)),
            blacklist: Arc::new(RwLock::new(HashSet::new())),
            blocked_urls: Arc::new(RwLock::new(Vec::new())),
            blocked_count: Arc::new(AtomicU32::new(0)),
            blocked_events: Arc::new(Mutex::new(Vec::new())),
            stop_signal: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn start(
        &self,
        goal: String,
        duration_minutes: u32,
        blacklist_items: Vec<String>,
        blocked_urls_list: Vec<String>,
        app_handle: AppHandle,
    ) -> Result<SessionStatus, String> {
        if self.is_active.load(Ordering::SeqCst) {
            return Err("A focus session is already running.".to_string());
        }

        // Apply URL block and retain the normalized domains for the active-session status.
        let normalized_blocked_urls = crate::hosts::block_urls(&blocked_urls_list)?;

        // Normalize blacklist to lowercase
        let mut set = HashSet::new();
        for item in blacklist_items {
            let trimmed = item.trim().to_lowercase();
            if !trimmed.is_empty() {
                set.insert(trimmed.clone());
                if !trimmed.ends_with(".exe") {
                    set.insert(format!("{}.exe", trimmed));
                }
            }
        }

        {
            let mut g = self.goal.write().map_err(|e| e.to_string())?;
            *g = goal.clone();
        }
        self.duration_minutes.store(duration_minutes, Ordering::SeqCst);

        {
            let mut bl = self.blacklist.write().map_err(|e| e.to_string())?;
            *bl = set;
        }

        {
            let mut bu = self.blocked_urls.write().map_err(|e| e.to_string())?;
            *bu = normalized_blocked_urls;
        }

        {
            let mut st = self.start_time.lock().map_err(|e| e.to_string())?;
            *st = Some(Instant::now());
        }

        self.blocked_count.store(0, Ordering::SeqCst);
        {
            let mut events = self.blocked_events.lock().map_err(|e| e.to_string())?;
            events.clear();
        }

        self.stop_signal.store(false, Ordering::SeqCst);
        self.is_active.store(true, Ordering::SeqCst);

        let state_clone = self.clone();
        let app_handle_clone = app_handle.clone();

        // Spawn scanning thread
        std::thread::spawn(move || {
            let mut sys = System::new();
            let total_seconds = (duration_minutes as u64) * 60;

            while !state_clone.stop_signal.load(Ordering::SeqCst) {
                // Check session timer
                let elapsed = if let Ok(lock) = state_clone.start_time.lock() {
                    if let Some(started) = *lock {
                        started.elapsed().as_secs()
                    } else {
                        0
                    }
                } else {
                    0
                };

                if elapsed >= total_seconds {
                    // Session naturally completed!
                    let _ = crate::hosts::unblock_urls(); // Khôi phục hosts
                    state_clone.is_active.store(false, Ordering::SeqCst);
                    let _ = app_handle_clone.emit("session-completed", ());
                    break;
                }

                // Refresh processes
                sys.refresh_processes(ProcessesToUpdate::All, true);

                let current_blacklist = if let Ok(bl) = state_clone.blacklist.read() {
                    bl.clone()
                } else {
                    HashSet::new()
                };

                for (pid, process) in sys.processes() {
                    let proc_name = process.name().to_string_lossy().to_lowercase();

                    let is_match = current_blacklist.contains(&proc_name)
                        || (proc_name.ends_with(".exe")
                            && current_blacklist.contains(proc_name.trim_end_matches(".exe")));

                    if is_match {
                        let killed = process.kill();

                        // Fallback with taskkill on Windows if needed
                        #[cfg(target_os = "windows")]
                        if !killed {
                            let _ = std::process::Command::new("taskkill")
                                .args(["/PID", &pid.to_string(), "/F"])
                                .output();
                        }

                        let count = state_clone.blocked_count.fetch_add(1, Ordering::SeqCst) + 1;
                        let now_epoch = SystemTime::now()
                            .duration_since(UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs();

                        let event = BlockedEvent {
                            process_name: proc_name.clone(),
                            timestamp: now_epoch,
                        };

                        if let Ok(mut evts) = state_clone.blocked_events.lock() {
                            evts.push(event.clone());
                        }

                        // Emit notification event to Frontend
                        let _ = app_handle_clone.emit("app-blocked", (&proc_name, count));
                    }
                }

                // Sleep 1000ms between checks (Extremely low CPU usage: ~0.05%)
                std::thread::sleep(Duration::from_millis(1000));
            }

            state_clone.is_active.store(false, Ordering::SeqCst);
        });

        Ok(self.get_status())
    }

    pub fn stop(&self) -> Result<SessionSummary, String> {
        self.stop_signal.store(true, Ordering::SeqCst);
        self.is_active.store(false, Ordering::SeqCst);
        
        // Restore hosts file
        let _ = crate::hosts::unblock_urls();

        let goal = self
            .goal
            .read()
            .map(|g| g.clone())
            .unwrap_or_else(|_| "".to_string());
        let duration_minutes = self.duration_minutes.load(Ordering::SeqCst);
        let blocked_count = self.blocked_count.load(Ordering::SeqCst);

        let focused_seconds = if let Ok(lock) = self.start_time.lock() {
            if let Some(started) = *lock {
                started.elapsed().as_secs()
            } else {
                0
            }
        } else {
            0
        };

        let total_seconds = (duration_minutes as u64) * 60;
        let completed = focused_seconds >= total_seconds;

        let blocked_events = if let Ok(evts) = self.blocked_events.lock() {
            evts.clone()
        } else {
            Vec::new()
        };

        Ok(SessionSummary {
            goal,
            duration_minutes,
            focused_seconds,
            completed,
            blocked_count,
            blocked_events,
        })
    }

    pub fn get_status(&self) -> SessionStatus {
        let is_active = self.is_active.load(Ordering::SeqCst);
        let goal = self
            .goal
            .read()
            .map(|g| g.clone())
            .unwrap_or_else(|_| "".to_string());
        let duration_minutes = self.duration_minutes.load(Ordering::SeqCst);
        let blocked_count = self.blocked_count.load(Ordering::SeqCst);

        let elapsed_seconds = if is_active {
            if let Ok(lock) = self.start_time.lock() {
                if let Some(started) = *lock {
                    started.elapsed().as_secs()
                } else {
                    0
                }
            } else {
                0
            }
        } else {
            0
        };

        let total_seconds = (duration_minutes as u64) * 60;
        let remaining_seconds = if total_seconds > elapsed_seconds {
            total_seconds - elapsed_seconds
        } else {
            0
        };

        let blacklist = if let Ok(bl) = self.blacklist.read() {
            bl.iter().cloned().collect()
        } else {
            Vec::new()
        };
        
        let blocked_urls = if let Ok(bu) = self.blocked_urls.read() {
            bu.clone()
        } else {
            Vec::new()
        };

        SessionStatus {
            is_active,
            goal,
            duration_minutes,
            elapsed_seconds,
            remaining_seconds,
            blocked_count,
            blacklist,
            blocked_urls,
        }
    }
}

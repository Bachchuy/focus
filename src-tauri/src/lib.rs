#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod blocking;
pub mod commands;

use blocking::BlockingState;

pub fn run() {
    tauri::Builder::default()
        .manage(BlockingState::new())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::start_blocking,
            commands::stop_blocking,
            commands::get_session_status,
            commands::get_running_processes,
            commands::set_window_mode,
            commands::minimize_window,
            commands::close_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running FocusLock application");
}

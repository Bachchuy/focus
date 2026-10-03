use std::fs;
use std::path::Path;
use std::process::Command;

const HOSTS_PATH: &str = r#"C:\Windows\System32\drivers\etc\hosts"#;
const MARKER_START: &str = "# FOCUSLOCK START";
const MARKER_END: &str = "# FOCUSLOCK END";

pub fn block_urls(urls: &[String]) -> Result<(), String> {
    if urls.is_empty() {
        return Ok(());
    }

    let mut current_content = match fs::read_to_string(HOSTS_PATH) {
        Ok(c) => c,
        Err(_) => return Err("Không thể đọc file hosts. Hãy chạy ứng dụng với quyền Administrator.".into()),
    };

    // Remove existing FocusLock block if any
    current_content = remove_focuslock_block(&current_content);

    // Build new block
    let mut new_block = format!("\n{}\n", MARKER_START);
    for url in urls {
        let domain = url.trim().replace("https://", "").replace("http://", "").replace("www.", "");
        if !domain.is_empty() {
            new_block.push_str(&format!("127.0.0.1 {}\n", domain));
            new_block.push_str(&format!("127.0.0.1 www.{}\n", domain));
        }
    }
    new_block.push_str(&format!("{}\n", MARKER_END));

    current_content.push_str(&new_block);

    // Write back
    if fs::write(HOSTS_PATH, current_content).is_err() {
        return Err("Không thể sửa file hosts. Vui lòng mở ứng dụng với quyền Administrator (Run as Administrator).".into());
    }

    // Flush DNS
    flush_dns();

    Ok(())
}

pub fn unblock_urls() -> Result<(), String> {
    let current_content = match fs::read_to_string(HOSTS_PATH) {
        Ok(c) => c,
        Err(_) => return Err("Không thể đọc file hosts.".into()),
    };

    if current_content.contains(MARKER_START) {
        let cleaned = remove_focuslock_block(&current_content);
        if fs::write(HOSTS_PATH, cleaned).is_err() {
            return Err("Không thể khôi phục file hosts. Vui lòng mở ứng dụng với quyền Administrator.".into());
        }
        flush_dns();
    }
    
    Ok(())
}

fn remove_focuslock_block(content: &str) -> String {
    let mut result = String::new();
    let mut in_block = false;
    for line in content.lines() {
        if line.trim() == MARKER_START {
            in_block = true;
            continue;
        }
        if line.trim() == MARKER_END {
            in_block = false;
            continue;
        }
        if !in_block {
            result.push_str(line);
            result.push('\n');
        }
    }
    result.trim_end().to_string() + "\n"
}

fn flush_dns() {
    #[cfg(target_os = "windows")]
    let _ = Command::new("ipconfig").arg("/flushdns").output();
}

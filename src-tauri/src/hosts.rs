use std::fs;
use std::collections::BTreeSet;
use std::process::Command;

const HOSTS_PATH: &str = r#"C:\Windows\System32\drivers\etc\hosts"#;
const MARKER_START: &str = "# FOCUSLOCK START";
const MARKER_END: &str = "# FOCUSLOCK END";

pub fn block_urls(urls: &[String]) -> Result<(), String> {
    if urls.is_empty() {
        return Ok(());
    }

    let mut domains = BTreeSet::new();
    for url in urls {
        let domain = normalize_domain(url)?;
        domains.insert(domain.clone());
        domains.insert(format!("www.{}", domain));
    }

    let mut current_content = match fs::read_to_string(HOSTS_PATH) {
        Ok(c) => c,
        Err(_) => return Err("Không thể đọc file hosts. Hãy chạy ứng dụng với quyền Administrator.".into()),
    };

    // Remove existing FocusLock block if any
    current_content = remove_focuslock_block(&current_content);

    // Build new block
    let mut new_block = format!("\n{}\n", MARKER_START);
    for domain in domains {
        new_block.push_str(&format!("127.0.0.1 {}\n", domain));
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

fn normalize_domain(input: &str) -> Result<String, String> {
    let input = input.trim().to_ascii_lowercase();
    let without_scheme = match input.split_once("://") {
        Some(("http", rest)) | Some(("https", rest)) => rest,
        Some(_) => return Err("Chỉ hỗ trợ URL bắt đầu bằng http:// hoặc https://.".into()),
        None => input.as_str(),
    };

    let authority = without_scheme
        .split(|character| matches!(character, '/' | '?' | '#'))
        .next()
        .unwrap_or_default();
    let host = authority.rsplit('@').next().unwrap_or_default();
    let host = if host.starts_with('[') {
        return Err("Địa chỉ IP không được hỗ trợ; hãy nhập tên miền.".into());
    } else if let Some((host, port)) = host.rsplit_once(':') {
        if port.is_empty() || !port.chars().all(|character| character.is_ascii_digit()) {
            return Err("Tên miền hoặc cổng không hợp lệ.".into());
        }
        host
    } else {
        host
    };

    let mut domain = host;
    while let Some(without_www) = domain.strip_prefix("www.") {
        domain = without_www;
    }
    domain = domain.trim_end_matches('.');

    let valid = !domain.is_empty()
        && domain.len() <= 253
        && domain.split('.').all(|label| {
            !label.is_empty()
                && label.len() <= 63
                && !label.starts_with('-')
                && !label.ends_with('-')
                && label
                    .chars()
                    .all(|character| character.is_ascii_alphanumeric() || character == '-')
        });

    if !valid {
        return Err("Tên miền không hợp lệ.".into());
    }

    Ok(domain.to_string())
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

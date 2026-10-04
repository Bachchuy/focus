use std::collections::BTreeSet;
use std::fs;
#[cfg(target_os = "windows")]
use std::process::Command;

const HOSTS_PATH: &str = r#"C:\Windows\System32\drivers\etc\hosts"#;
const MARKER_START: &str = "# FOCUSLOCK START";
const MARKER_END: &str = "# FOCUSLOCK END";

pub fn block_urls(urls: &[String]) -> Result<Vec<String>, String> {
    let mut domains = BTreeSet::new();
    for url in urls {
        domains.insert(normalize_domain(url)?);
    }

    if domains.is_empty() {
        return Ok(Vec::new());
    }

    let mut hosts = BTreeSet::new();
    for domain in &domains {
        add_domain_and_variants(domain, &mut hosts);
    }

    let original = fs::read_to_string(HOSTS_PATH).map_err(|_| {
        "Không thể đọc file hosts. Hãy chạy ứng dụng với quyền Administrator.".to_string()
    })?;
    let mut content = remove_focuslock_block(&original)?;

    let mut block = format!("\n{}\n", MARKER_START);
    for host in &hosts {
        block.push_str(&format!("127.0.0.1 {host}\n::1 {host}\n"));
    }
    block.push_str(&format!("{}\n", MARKER_END));
    content.push_str(&block);

    if fs::write(HOSTS_PATH, &content).is_err() {
        let restore_error = restore_original(&original).err();
        if let Some(error) = restore_error {
            return Err(format!(
                "Không thể ghi file hosts và cũng không thể khôi phục bản trước: {error}"
            ));
        }
        return Err("Không thể sửa file hosts. Vui lòng mở ứng dụng với quyền Administrator (Run as Administrator).".into());
    }

    let verification = match fs::read_to_string(HOSTS_PATH) {
        Ok(content) => content,
        Err(_) => {
            if let Err(error) = restore_original(&original) {
                return Err(format!(
                    "Không thể đọc lại để xác minh và không thể khôi phục hosts: {error}"
                ));
            }
            return Err("Đã ghi hosts nhưng không thể đọc lại để xác minh; nội dung trước đó đã được khôi phục.".into());
        }
    };
    if !verification.contains(MARKER_START)
        || !verification.contains(MARKER_END)
        || hosts.iter().any(|host| {
            !verification
                .lines()
                .any(|line| line.trim() == format!("127.0.0.1 {host}"))
                || !verification
                    .lines()
                    .any(|line| line.trim() == format!("::1 {host}"))
        })
    {
        if let Err(error) = restore_original(&original) {
            return Err(format!(
                "Xác minh dòng chặn thất bại và không thể khôi phục hosts: {error}"
            ));
        }
        return Err("Đã ghi hosts nhưng các dòng chặn không vượt qua xác minh; nội dung trước đó đã được khôi phục.".into());
    }

    if let Err(error) = flush_dns() {
        let restore_error = restore_original(&original).err();
        if let Some(restore_error) = restore_error {
            return Err(format!(
                "Không thể làm mới DNS ({error}) và không thể khôi phục hosts: {restore_error}"
            ));
        }
        return Err(format!(
            "Không thể làm mới DNS: {error}. Nội dung hosts trước đó đã được khôi phục."
        ));
    }

    Ok(domains.into_iter().collect())
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
    let current_content =
        fs::read_to_string(HOSTS_PATH).map_err(|_| "Không thể đọc file hosts.".to_string())?;

    if !current_content.contains(MARKER_START) && !current_content.contains(MARKER_END) {
        return Ok(());
    }

    let cleaned = remove_focuslock_block(&current_content)?;
    fs::write(HOSTS_PATH, &cleaned).map_err(|_| {
        "Không thể khôi phục file hosts. Vui lòng mở ứng dụng với quyền Administrator.".to_string()
    })?;

    let verification = fs::read_to_string(HOSTS_PATH)
        .map_err(|_| "Đã khôi phục hosts nhưng không thể đọc lại để xác minh.".to_string())?;
    if verification.contains(MARKER_START) || verification.contains(MARKER_END) {
        return Err("Không thể xác minh việc gỡ các dòng hosts của FocusLock.".into());
    }

    flush_dns().map_err(|error| format!("Đã gỡ dòng chặn nhưng không thể làm mới DNS: {error}"))
}

fn add_domain_and_variants(domain: &str, hosts: &mut BTreeSet<String>) {
    hosts.insert(domain.to_string());
    hosts.insert(format!("www.{domain}"));

    if domain == "facebook.com" {
        for subdomain in [
            "m", "web", "mbasic", "touch", "business", "mobile", "free", "l", "lm",
        ] {
            hosts.insert(format!("{subdomain}.facebook.com"));
        }
    }

    if domain == "youtube.com" {
        for subdomain in ["m", "music", "kids", "gaming", "studio", "tv"] {
            hosts.insert(format!("{subdomain}.youtube.com"));
        }

        for alias in [
            "youtu.be",
            "youtube-nocookie.com",
            "youtubeeducation.com",
            "youtube.googleapis.com",
            "youtubei.googleapis.com",
            "youtubeembeddedplayer.googleapis.com",
            "ytimg.com",
            "googlevideo.com",
        ] {
            hosts.insert(alias.to_string());
            hosts.insert(format!("www.{alias}"));
        }
    }
}

fn remove_focuslock_block(content: &str) -> Result<String, String> {
    let mut result = String::new();
    let mut in_block = false;
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed == MARKER_START {
            if in_block {
                return Err("File hosts có marker FocusLock lồng nhau; không thay đổi file để tránh xóa nhầm dữ liệu.".into());
            }
            in_block = true;
            continue;
        }
        if trimmed == MARKER_END {
            if !in_block {
                return Err(
                    "File hosts có marker kết thúc FocusLock không khớp; không thay đổi file."
                        .into(),
                );
            }
            in_block = false;
            continue;
        }
        if !in_block {
            result.push_str(line);
            result.push('\n');
        }
    }

    if in_block {
        return Err("File hosts thiếu marker kết thúc FocusLock; không thay đổi file để tránh xóa nhầm dữ liệu.".into());
    }

    Ok(result.trim_end().to_string() + "\n")
}

fn restore_original(content: &str) -> Result<(), String> {
    fs::write(HOSTS_PATH, content).map_err(|error| error.to_string())?;
    let _ = flush_dns();
    Ok(())
}

fn flush_dns() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("ipconfig")
            .arg("/flushdns")
            .output()
            .map_err(|error| error.to_string())?;
        if !output.status.success() {
            let message = String::from_utf8_lossy(&output.stderr).trim().to_string();
            return Err(if message.is_empty() {
                format!("ipconfig kết thúc với mã {:?}", output.status.code())
            } else {
                message
            });
        }
    }

    #[cfg(not(target_os = "windows"))]
    {}

    Ok(())
}

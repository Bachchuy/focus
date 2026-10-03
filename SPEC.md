# Đặc tả dự án FocusLock (SPEC.md)

## 1. Mục tiêu
Ứng dụng Desktop giúp người dùng tập trung bằng cách:
1. Chặn (kill) các ứng dụng gây xao nhãng.
2. Chặn truy cập các trang web (mạng xã hội, giải trí) trực tiếp từ Desktop (không dùng Browser Extension).

## 2. Phạm vi chức năng
- **Quản lý Ứng dụng**: Liệt kê các ứng dụng có trên máy tính (đang chạy hoặc đã cài đặt) để người dùng chọn đưa vào danh sách đen (blacklist).
- **Quản lý Website**: Cung cấp danh sách hoặc ô nhập để chặn các tên miền (ví dụ: facebook.com, youtube.com).
- **Tạo phiên tập trung**: Thiết lập mục tiêu, thời gian, chọn app và website cần chặn.
- **Cơ chế chặn App**: Tự động phát hiện và tắt ứng dụng vi phạm trong lúc phiên đang chạy.
- **Cơ chế chặn Web**: Thay đổi file \hosts\ của Windows (C:\Windows\System32\drivers\etc\hosts) trong thời gian Focus Session để chặn truy cập.
- **Chế độ Overlay (Focus Widget)**: Cửa sổ thu nhỏ, không viền, nền trong suốt, luôn nổi (Always on top).
  - **Cá nhân hóa (Themes)**: Người dùng có thể thiết kế/chọn giao diện đếm ngược (VD: Lofi, Cyberpunk, Pixel Art).
  - **Âm thanh thư giãn**: Tích hợp phát nhạc trắng (tiếng mưa, lofi) trực tiếp trên Widget.
- **Gamification (Game hóa)**: Hệ thống điểm thưởng (xu/kinh nghiệm) tích lũy sau mỗi phiên tập trung thành công để mở khóa Theme mới, tạo động lực tích cực.

## 3. Kiến trúc
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite.
- **Backend**: Rust, Tauri v2.
- **Tương tác OS**: 
  - \sysinfo\ (Rust) & \	askkill\ (Windows) để chặn App.
  - Sửa file \hosts\ để chặn Web (Yêu cầu quyền Administrator).
  - \winreg\ hoặc PowerShell scripts để lấy danh sách app đã cài.

## 4. Constraints & Rủi ro
- **Quyền Admin**: Để chặn Web qua file \hosts\, ứng dụng (hoặc module backend) phải chạy dưới quyền Quản trị viên (Run as Administrator).
- **Chặn nhầm tiến trình hệ thống**: Đã có IGNORED_PROCESSES để bảo vệ Windows.
- **Bộ đệm DNS (DNS Cache)**: Trình duyệt có thể lưu cache IP, cần có cơ chế clear DNS cache (\ipconfig /flushdns\) khi bắt đầu chặn.

## 5. Ngoài phạm vi
- Phát triển Browser Extension (tuân thủ yêu cầu chỉ làm trên Desktop).

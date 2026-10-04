# Đặc tả dự án FocusLock (SPEC.md)

## 1. Mục tiêu
Ứng dụng Desktop giúp người dùng tập trung bằng cách:
1. Chặn (kill) các ứng dụng gây xao nhãng.
2. Chặn truy cập các trang web (mạng xã hội, giải trí) trực tiếp từ Desktop (không dùng Browser Extension).

## 2. Phạm vi chức năng
- **Quản lý Ứng dụng**: Liệt kê các ứng dụng có trên máy tính (đang chạy hoặc đã cài đặt) để người dùng chọn đưa vào danh sách đen (blacklist).
- **Quản lý Website**: Cung cấp danh sách hoặc ô nhập để chặn các tên miền (ví dụ: facebook.com, youtube.com).
- **Chế độ Chặn (Blocking Mode)**: 
  - Liên tục quét và tắt các phần mềm trong danh sách đen.
  - Chặn tên miền ở cấp hệ thống (modifying `hosts` file).
- **Session UI**: Màn hình thiết lập mục tiêu, thời gian (Pomodoro/Custom).
- **Overlay UI**: Giao diện Widget đếm ngược luôn nổi trên màn hình.

## 3. Nền tảng & Kiến trúc
- **Frontend**: React 19, TypeScript, TailwindCSS, Vite.
- **Backend/Desktop**: Tauri v2, Rust.
- **Hệ điều hành mục tiêu**: **Windows** (chỉ tập trung Windows theo yêu cầu).
- **Công cụ tương tác OS**: `sysinfo` (quản lý process), đọc/ghi file `C:\Windows\System32\drivers\etc\hosts`.

## 4. Constraint & Rủi ro
- **Rủi ro 1 - Quyền Administrator**: Việc chỉnh sửa file `hosts` bắt buộc ứng dụng phải chạy dưới quyền Admin (Elevated Privileges). Nếu không, Tauri/Rust sẽ văng lỗi Permission Denied.
- **Rủi ro 2 - Quản lý File Hosts**: Cần sao lưu trước khi sửa, và **bắt buộc** phải khôi phục file `hosts` về nguyên trạng khi kết thúc Session hoặc người dùng thoát ứng dụng đột ngột.
- **Constraint - Nhận diện App**: Việc lấy danh sách các phần mềm "đã cài đặt" trên Windows khá phức tạp (do Registry phân mảnh). Có thể dùng PowerShell script hoặc WMI để hỗ trợ Backend Rust.

## 5. Ngoài phạm vi (Out of Scope)
- Không làm cho MacOS / Linux ở giai đoạn này.
- Không dùng Browser Extension để chặn web.
- Không đồng bộ Cloud (hoạt động offline 100%).

## 6. Tiêu chí nghiệm thu
- App khởi động bình thường trên Windows.
- Lấy được danh sách app đang chạy/đã cài.
- Có thể chặn được phần mềm (như Chrome, Zalo, Game).
- Có thể chặn được trang web ở mức độ hệ thống.
- Yêu cầu và xử lý quyền Admin mượt mà.

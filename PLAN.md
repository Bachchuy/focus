# Kế hoạch thực hiện (PLAN.md)

## Mục tiêu hiện tại
Phát triển tính năng chặn trang web (mạng xã hội) qua file `hosts` và cải thiện cơ chế lấy danh sách ứng dụng trên máy tính để chặn.

## Danh sách Task (Giai đoạn 2)

- [x] **Task 1: Cải thiện danh sách chọn Ứng dụng (App Picker)**
  - Chi tiết: Nâng cấp hàm backend (Rust) để lấy danh sách ứng dụng rõ ràng hơn (có thể kết hợp lấy danh sách phần mềm đã cài đặt qua Registry hoặc cải thiện danh sách tiến trình). Cập nhật UI để người dùng dễ chọn.
  - Điều kiện kiểm tra: Người dùng thấy được danh sách các app cần chặn trên máy và chọn được.

- [x] **Task 2: Xây dựng cơ chế chặn Website bằng Rust (Backend)**
  - Chi tiết: 
    - Viết hàm Rust để đọc và sao lưu file `hosts`.
    - Viết hàm thêm các tên miền (domain) cần chặn trỏ về `127.0.0.1`.
    - Viết hàm khôi phục file `hosts` khi kết thúc hoặc hủy phiên.
    - Chạy lệnh `ipconfig /flushdns` để xóa cache trình duyệt.
  - Điều kiện kiểm tra: Có thể gọi hàm từ Frontend, file `hosts` thay đổi và truy cập web bị chặn.

- [x] **Task 3: Cập nhật Giao diện (Frontend) cho tính năng chặn Web**
  - Chi tiết: Thêm UI trong màn hình Create Session để người dùng nhập/chọn các trang web muốn chặn (VD: facebook.com, youtube.com). Gửi danh sách này xuống Backend khi bắt đầu.
  - Điều kiện kiểm tra: Giao diện trực quan, cho phép thêm/xóa website khỏi danh sách chặn trước khi chạy.

- [ ] **Task 4: Yêu cầu quyền Administrator (Elevate Privileges)**
  - Chi tiết: Cấu hình Tauri hoặc thêm cơ chế kiểm tra quyền Admin khi bắt đầu ứng dụng, vì sửa file `hosts` bắt buộc phải có quyền này trên Windows.
  - Điều kiện kiểm tra: Ứng dụng báo lỗi nếu không có quyền Admin, hoặc tự động xin quyền (`requireAdministrator` trong manifest).

## Danh sách Task (Giai đoạn 3: Nâng cấp Trải nghiệm & Widget)

- [ ] **Task 5: Xây dựng Cửa sổ Overlay Widget**
  - Chi tiết: Cấu hình Tauri Window (`alwaysOnTop`, `decorations: false`, `transparent: true`). Render UI đếm ngược đồng bộ với app chính.
  - Điều kiện kiểm tra: Widget hiển thị trong suốt, luôn nổi trên các app khác.

- [ ] **Task 6: Phát triển Hệ thống Theme & Âm thanh**
  - Chi tiết: Xây dựng UI thay đổi Theme cho Widget. Tích hợp Audio Player phát nhạc nền thư giãn (mưa, lofi) ngay trên Widget.
  - Điều kiện kiểm tra: Widget đổi giao diện realtime, phát/tắt được nhạc nền.

- [ ] **Task 7: Hệ thống Điểm thưởng (Gamification)**
  - Chi tiết: Lưu trữ local điểm thưởng. Cộng điểm sau mỗi phiên focus. Xây dựng UI "Cửa hàng" để dùng điểm mở khóa Theme.
  - Điều kiện kiểm tra: Tích lũy được điểm, dùng điểm đổi được Theme mới.

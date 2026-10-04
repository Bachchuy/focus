# Kế hoạch: danh sách ứng dụng và nhận diện game để chặn

## Đánh giá gợi ý Gemini

- `get_installed_apps` đã có, đã đăng ký trong `src-tauri/src/lib.rs`; TypeScript strict mode đang bật và frontend đã gọi lệnh qua `invoke` trong `src/services/tauri.ts`.
- Bản code đang sửa đã mở rộng lệnh này để đọc Registry Windows và shortcut, cùng metadata khi tìm được executable. Giao diện hiện mặc định mở tab tiến trình đang chạy; cần chọn tab **Đã cài đặt** để xem catalog cài đặt.
- Registry/shortcut không phải nguồn đầy đủ cho game cài trong thư viện riêng của launcher. `DisplayName` cũng không xác định chắc chắn tên tiến trình. Không suy đoán `foo.exe` từ tên ứng dụng vì có thể chặn nhầm hoặc không chặn được gì.
- Chưa cần thêm `winreg`: lệnh hiện tại dùng PowerShell có sẵn trên Windows. Giữ nguyên để tuân thủ giới hạn không thêm dependency.

## Kế hoạch đề xuất

1. **Làm rõ hai danh sách trong UI**
   - Đặt **Ứng dụng đã cài đặt** làm tab mặc định.
   - Giữ **Đang chạy trên máy** thành tab riêng để tìm executable thực tế của ứng dụng/game.
   - Giữ tìm kiếm, chọn/bỏ chọn và danh sách chặn hiện tại.

2. **Hoàn thiện catalog ứng dụng Windows**
   - Đọc uninstall entries từ Registry 64-bit, 32-bit, HKLM và HKCU; hợp nhất với shortcut Start Menu.
   - Lấy tên hiển thị, nhà phát hành, phiên bản, ngày cài và đường dẫn icon khi có.
   - Chỉ cho chọn để chặn khi xác định được executable đáng tin cậy; nếu chưa rõ thì ghi rõ trạng thái và hướng người dùng sang tab tiến trình, không tạo tên `.exe` từ `DisplayName`.
   - Khử trùng theo executable và giữ cách chặn tương thích hiện tại.

3. **Thêm cách nhận diện game từ tiến trình thật**
   - Bổ sung đường dẫn executable vào thông tin tiến trình đang chạy khi Windows cung cấp.
   - Cho phép chọn/lưu đúng tên tiến trình `.exe` để tái sử dụng trong các phiên sau.
   - Với Wargaming Game Center: chạy game một lần trước phiên, chọn executable của game từ tab đang chạy; có thể chọn thêm executable của launcher nếu muốn đóng cả launcher.
   - Không giả định chặn launcher sẽ chặn tiến trình game con. Chặn hiện tại đóng tiến trình khớp sau khi phát hiện, tối đa khoảng một chu kỳ quét (1 giây).

4. **Xác nhận bằng tình huống thực tế**
   - Kiểm tra app thường có trong Registry, game chỉ có shortcut, và game Wargaming đang chạy.
   - Xác nhận chọn game chặn đúng executable; chọn launcher riêng không bị hiểu nhầm thành chọn tất cả game cùng nhà phát hành.
   - Kiểm tra tìm kiếm, bỏ chọn và lưu blacklist qua lần mở lại.

## Giới hạn phạm vi

- Không thêm dependency hoặc đổi kiến trúc.
- Chưa dò thư mục riêng của Wargaming bằng đường dẫn cố định; nếu tiến trình thật không được liệt kê, sẽ bổ sung sau khi xác định đường dẫn/thông tin cài đặt thực tế trên máy.
- Chưa tự động chặn theo publisher hoặc suy diễn nhóm tiến trình.

## Quy trình

Đây là Giai đoạn 1 (tài liệu). Chờ người dùng duyệt trước khi bắt đầu Giai đoạn 2 (code).

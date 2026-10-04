# Kế hoạch: sửa nút bắt đầu và chặn app trước khi chạy

## Phát hiện

- `CreateSession` bọc toàn bộ giao diện trong một `<form>`, trong khi `ProcessPicker` lại có form con cho URL và `.exe`. HTML không hỗ trợ form lồng nhau; cần bỏ cấu trúc này để nút bắt đầu có một submit owner rõ ràng.
- Ô mục tiêu có `required`, nhưng submit handler đã tự dùng mục tiêu mặc định khi ô trống. Cần làm hai quy tắc nhất quán để trình duyệt không âm thầm chặn submit.
- Backend hiện quét blacklist mỗi giây và kết thúc tiến trình khớp tên executable. Nó có thể chặn app khi tiến trình xuất hiện mà không cần người dùng mở app trước, miễn là đã biết đúng executable.
- Registry scanner hiện chưa dùng `InstallLocation` để tìm executable thật. Dòng `wgc_api.exe` trong ảnh có thể là helper/uninstaller của Wargaming, không thể mặc định đó là game.

## Kế hoạch code

1. **Sửa submit phiên**
   - Thay form nhập URL và `.exe` lồng nhau bằng các vùng nhập không tạo form con; xử lý Enter và click bằng handler tương ứng.
   - Bỏ `required` cho mục tiêu vì đã có giá trị mặc định, hoặc nếu giữ bắt buộc thì bỏ fallback và báo lỗi rõ ràng. Ưu tiên giữ hành vi hiện tại: mục tiêu mặc định được dùng khi ô trống.
   - Đảm bảo lỗi khi bắt đầu phiên được hiển thị thay vì làm nút có vẻ không phản hồi.

2. **Tìm executable từ ứng dụng đã cài để chặn trước**
   - Đọc `InstallLocation` cùng các trường Registry hiện có.
   - Chỉ quét thư mục cài đặt đã biết để tìm `.exe`; đối chiếu `ProductName`/`FileDescription` với tên ứng dụng và hiển thị các executable ứng viên cho người dùng chọn.
   - Không tự suy tên `.exe` từ `DisplayName`; nếu không có ứng viên đáng tin cậy, hướng dẫn chọn từ tiến trình đang chạy.
   - Khi người dùng chọn game, thêm tên tiến trình `.exe` vào blacklist để backend hiện tại đóng tiến trình ngay lần quét sau khi game được khởi chạy. Chọn launcher riêng nếu muốn đóng cả launcher.

3. **Xác nhận**
   - Thử bắt đầu phiên khi mục tiêu có nội dung và khi để trống.
   - Xác nhận nhập URL/`.exe` không làm hỏng submit form.
   - Chọn executable của game trước khi chạy; mở game trong phiên và xác nhận tiến trình bị kết thúc ở chu kỳ quét tiếp theo.
   - Với Wargaming, kiểm tra các ứng viên lấy từ `InstallLocation` trước khi coi `wgc_api.exe` là executable của game.

## Giới hạn

- Không thêm dependency hoặc đổi kiến trúc.
- Cơ chế hiện tại kết thúc tiến trình sau khi Windows tạo nó; game có thể lóe lên trong tối đa khoảng một giây. Chặn trước khi Windows khởi tạo tiến trình cần cơ chế chính sách ứng dụng cấp hệ điều hành, nằm ngoài phạm vi này.

## Quy trình

Đây là Giai đoạn 1 (tài liệu). Chờ người dùng duyệt trước khi bắt đầu Giai đoạn 2 (code).

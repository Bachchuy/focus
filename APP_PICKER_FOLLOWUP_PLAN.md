# Kế hoạch sửa lỗi chữ và danh sách ứng dụng

## Phạm vi

Khắc phục chữ tiếng Việt bị lỗi mã hóa trên màn hình tạo phiên và trình chọn ứng dụng; đồng thời trình bày danh sách ứng dụng đã cài đặt theo bố cục gần với Windows Settings.

## Việc sẽ làm

1. Thay các chuỗi tiếng Việt bị mojibake trong `src/pages/CreateSession.tsx` và rà lại chuỗi giao diện liên quan trong `src/components/ProcessPicker.tsx` và `src/services/tauri.ts`. Lưu văn bản UTF-8 và giữ nguyên nội dung/chức năng.
2. Nâng dữ liệu ứng dụng cài đặt lấy từ Windows Registry để có tên hiển thị và thông tin nhà phát hành/phiên bản/ngày cài nếu Windows cung cấp; giữ khả năng chọn theo tên file thực thi để cơ chế chặn hiện tại tiếp tục hoạt động.
3. Sắp xếp lại tab ứng dụng đã cài thành các hàng kiểu Settings: biểu tượng nhận diện, tên ứng dụng, thông tin phụ có sẵn và thao tác chọn/bỏ chọn; giữ tìm kiếm, làm mới, thông báo lỗi và nhập `.exe` thủ công.
4. Không thêm thư viện, không đổi kiến trúc, không sửa phần chặn web/app ngoài mức cần thiết để giữ tương thích với dữ liệu mới.

## Tiêu chí hoàn tất

- Chữ tiếng Việt trên màn hình tạo phiên và bộ chọn ứng dụng hiển thị đúng dấu.
- Tab ứng dụng đã cài hiển thị dạng danh sách dễ quét giống Windows Settings, tìm kiếm được và chọn/bỏ chọn được.
- Thông tin Windows không cung cấp được thì ẩn, không bịa nội dung; ứng dụng vẫn chặn theo executable như trước.
- `npm run build` thành công.

## Trình tự

Giai đoạn 1 (tài liệu): kế hoạch này. Chờ người dùng duyệt trước khi bắt đầu Giai đoạn 2 (code).

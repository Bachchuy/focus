# Quy tắc làm việc của AI Agent (AGENTS.md)

## 1. Quy tắc quy trình
- Luôn làm việc theo 2 giai đoạn: Lập tài liệu (Giai đoạn 1) -> Code (Giai đoạn 2).
- Luôn dừng và chờ người dùng duyệt giữa các task và các giai đoạn.
- Không tự chuyển sang task tiếp theo.

## 2. Giới hạn phạm vi
- Không tự ý thêm sửa thư viện (npm/cargo) hoặc đổi kiến trúc.
- Tôn trọng code cũ, không refactor ngoài phạm vi.

## 3. Bảo vệ an toàn & dữ liệu
- Không tự xóa file, không kill process hệ thống Windows (duy trì whitelist an toàn).
- Không log thông tin nhạy cảm.

## 4. Git & Release
- Không tự commit, push, tạo release nếu không được ủy quyền.
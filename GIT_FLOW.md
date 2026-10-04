# Hướng dẫn Git Flow & Conventional Commits

Dự án này sử dụng mô hình nhánh **Git Flow** kết hợp với **Conventional Commits** để quản lý mã nguồn. AI Agent và Lập trình viên cần tuân thủ tuyệt đối các quy tắc dưới đây.

## 1. Mô hình nhánh (Git Flow)

- main (hoặc master): Nhánh chứa code ổn định, sẵn sàng release. Không bao giờ commit trực tiếp lên nhánh này.
- develop: Nhánh chứa code đang phát triển cho phiên bản tiếp theo. 
- eature/*: Nhánh tạo ra từ develop để phát triển tính năng mới (ví dụ: eature/app-picker, eature/web-blocker). Sau khi xong sẽ merge về develop.
- ugfix/* hoặc hotfix/*: Nhánh sửa lỗi.

**Quy trình làm việc của AI Agent:**
1. Khi bắt đầu một Task mới (ví dụ Task 3), Agent phải tạo và chuyển sang nhánh eature/... tương ứng: git checkout -b feature/ten-task
2. Thực hiện các thay đổi và commit trên nhánh này.
3. Khi xong Task và được duyệt, sẽ merge nhánh feature vào develop (hoặc main nếu dự án đang làm việc trực tiếp trên main cho MVP, tuy nhiên mặc định ưu tiên dùng branch feature).

## 2. Quy tắc Commit (Conventional Commits)

Mỗi thông điệp commit phải tuân theo cấu trúc:
<type>[optional scope]: <description>

**Các <type> được phép sử dụng:**
- eat: Thêm tính năng mới.
- ix: Sửa lỗi.
- docs: Cập nhật tài liệu (README, PLAN.md, GIT_FLOW.md, v.v.).
- style: Sửa định dạng code (khoảng trắng, dấu phẩy, v.v.) không thay đổi logic.
- efactor: Viết lại code nhưng không thêm tính năng hay sửa lỗi.
- perf: Cải thiện hiệu năng.
- 	est: Thêm hoặc sửa test cases.
- chore: Các công việc bảo trì, cập nhật thư viện, build tools, cấu hình.

**Ví dụ:**
- eat(ui): add website blocking input in process picker
- docs: update PLAN.md for task 3
- ix(backend): fix unblock_urls logic for hosts file

## 3. Quy tắc Push và Merge
- Chỉ push lên Remote repository khi người dùng yêu cầu.
- Khi merge một feature, luôn sử dụng merge hoặc squash merge để giữ lịch sử rõ ràng.

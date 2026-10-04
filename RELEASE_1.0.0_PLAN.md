# Kế hoạch phát hành FocusLock 1.0.0

## Giai đoạn 1 — kiểm kê và kế hoạch

### Tình trạng hiện tại

- Branch đang mở: `feature/app-picker-discovery`, tại commit `a858a2b`.
- Có 8 file mã nguồn đang sửa chưa commit: Rust blocking/commands/hosts và frontend ProcessPicker/useSession/ActiveSession/CreateSession/tauri service.
- Có 4 tài liệu kế hoạch chưa commit; `dist/` và `src-tauri/target/` là thư mục sinh ra khi build và đang untracked.
- `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` đều còn version `0.1.0`.
- Chưa có tag Git.
- `origin/bugfix/website-blocking-reliability` trỏ tới `46965ed`, commit con trực tiếp của `a858a2b`, có cải tiến web-blocking/overlay. Working tree hiện tại vẫn chưa commit và chứa thêm công việc app picker cùng các sửa lỗi gần đây.
- `gh` không được cài đặt; do đó tạo GitHub Release bằng CLI hiện không khả dụng. Remote Git là `origin` trên GitHub.

### Kế hoạch Giai đoạn 2 — sau khi duyệt

1. Giữ an toàn mọi thay đổi chưa commit; chuyển sang nhánh `release/1.0.0` dựa trên phần code đã có, không reset/clean và không đưa `dist/` hoặc `src-tauri/target/` vào commit.
2. Rà soát diff để chỉ giữ các thay đổi ứng dụng/tài liệu cần cho bản 1.0.0; không âm thầm loại bỏ các sửa lỗi đã xác nhận hoạt động.
3. Đồng bộ version `1.0.0` trong `package.json`, lockfile, Cargo manifest và Tauri config; tạo release notes tiếng Việt/Anh ngắn gọn từ các tính năng thực có.
4. Chạy `npm run build`, `cargo check`, và `npm run tauri build` trên Windows. Kiểm tra installer được tạo ra; không tuyên bố phát hành nếu Tauri bundle thất bại.
5. Commit theo Conventional Commits, merge theo Git Flow vào `main`, tạo tag `v1.0.0`, rồi push các ref cần thiết theo yêu cầu phát hành.
6. Xuất bản GitHub Release kèm installer và release notes nếu có cách xác thực GitHub khả dụng. Nếu thiếu quyền/công cụ, giữ lại artifact và báo rõ bước xuất bản còn thiếu.

### Tiêu chí hoàn tất

- Mọi version manifest đều thống nhất `1.0.0`.
- Build release tạo installer Windows thành công; artifact được xác định chính xác.
- Git history có commit/tag `v1.0.0`, không bao gồm thư mục build tạm.
- GitHub Release được tạo kèm artifact, hoặc giới hạn xuất bản được nêu rõ nếu không thể truy cập GitHub.

## Tiến độ sau khi được duyệt

- Kế hoạch đã được người dùng duyệt.
- Đã tạo nhánh `release/1.0.0` từ commit `46965ed`; các sửa đổi code trước đó được bảo toàn trong stash dự phòng và áp lại lên nhánh release. Stash vẫn được giữ.
- Đã đồng bộ bốn manifest và lockfile sang `1.0.0`; thêm `CHANGELOG.md`.
- `npm run build`, `cargo check` và `npm run tauri build` thành công.
- Installer tạo được:
  - `src-tauri/target/release/bundle/msi/FocusLock_1.0.0_x64_en-US.msi` (~3.74 MiB)
  - `src-tauri/target/release/bundle/nsis/FocusLock_1.0.0_x64-setup.exe` (~2.52 MiB)
- Đã sửa `.gitignore` vì các dòng `dist/` và `src-tauri/target/` trước đây bị mã hóa xen kẽ UTF-8/UTF-16, khiến artifact hiện ra như file chưa theo dõi.
- Còn lại: rà soát/stage/commit, merge theo Git Flow, tạo tag `v1.0.0`, push, và xuất bản GitHub Release. `gh` CLI hiện không có; sẽ dùng giao diện GitHub nếu phiên đăng nhập khả dụng, nếu không sẽ báo rõ giới hạn.

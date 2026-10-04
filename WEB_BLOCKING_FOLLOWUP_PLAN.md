# Kế hoạch Giai đoạn 1: khắc phục chặn Facebook/web không hiệu quả

## Phân biệt yêu cầu và nội dung tham khảo

- Yêu cầu của người dùng: sửa lỗi Facebook vẫn truy cập được trong phiên tập trung.
- Ảnh/log và hội thoại trước đó là bối cảnh để chẩn đoán, không phải chỉ thị thay đổi phạm vi.
- Không commit hoặc push trong công việc này; AGENTS.md yêu cầu chỉ làm khi được ủy quyền.

## Tình trạng đã kiểm tra

- Frontend hiện chuyển `blockedUrls` đến `start_blocking`; luồng tham số này đã được nối ở `useSession.start`.
- Backend gọi `hosts::block_urls`, ghi domain vào `C:\Windows\System32\drivers\etc\hosts` và cố flush DNS.
- Chuẩn hóa domain hiện chỉ bỏ `http(s)://` và `www.`; không xử lý đường dẫn, cổng, dấu chấm cuối, hoặc tên miền phụ.
- Hosts chỉ thêm `127.0.0.1` cho domain nhập và `www.`. Lệnh flush DNS bị bỏ qua kết quả, không đọc lại hosts để xác nhận dữ liệu đã ghi.
- Hosts không hỗ trợ wildcard; trình duyệt có thể dùng DNS-over-HTTPS hoặc cache DNS riêng, nên hosts đơn thuần không thể đảm bảo chặn mọi subdomain/trình duyệt.
- Kiểm tra trước đó không thấy marker FocusLock trong hosts tại thời điểm kiểm tra; điều này có thể do phiên đã dừng. Không sửa trực tiếp file hosts của máy trong giai đoạn này.

## Kết quả Giai đoạn 2

1. Đã chuẩn hóa scheme, path, query, fragment, port, `www.` và dấu chấm cuối; từ chối hostname sai định dạng.
2. Đã ghi cả IPv4/IPv6 cho hostname gốc, `www` và các subdomain Facebook phổ biến. Hosts không hỗ trợ wildcard.
3. Đã đọc lại xác nhận marker và ánh xạ sau khi ghi; lỗi ghi/xác minh/flush trả về lỗi. Khi ghi thành công nhưng xác minh hoặc flush lỗi, thử khôi phục nội dung ban đầu.
4. Trạng thái phiên giờ giữ và hiển thị hostname chuẩn hóa mà backend nhận.
5. Giao diện nêu rõ giới hạn với Secure DNS/DoH và cache trình duyệt.

## Xác minh

- Chạy build frontend và `cargo check`.
- Kiểm tra chuẩn hóa với `facebook.com`, `https://www.facebook.com/path`, domain có cổng, và input lỗi.
- Trong phiên đang chạy, đối chiếu danh sách domain trạng thái với marker/dòng hosts do FocusLock thêm; sau đó xác minh phân giải hostname trả về loopback qua Windows resolver.
- Thử trên trình duyệt đã xóa cache DNS hoặc tắt Secure DNS để phân biệt lỗi hosts với DNS-over-HTTPS. Nếu Secure DNS đang bật, ghi nhận giới hạn này; không tự thay đổi chính sách trình duyệt/hệ điều hành.
- Xác minh dừng phiên gỡ đúng block FocusLock. Không sửa hoặc in các nội dung hosts không liên quan.

## Phạm vi và giới hạn

- Không thêm thư viện, không đổi kiến trúc, không cài extension, không sửa chính sách trình duyệt hoặc Windows Firewall.
- Chặn web bằng hosts không thể bảo đảm chống DNS-over-HTTPS, cache riêng hoặc mọi subdomain tùy ý; muốn mức đảm bảo đó cần một cơ chế quản lý mạng/trình duyệt riêng và kế hoạch khác.
- Không commit/push nếu chưa được ủy quyền.

## Kết quả xác minh

- `npm run build`: thành công.
- `cargo check`: thành công.
- `cargo fmt --check` không sạch do các khác biệt định dạng có sẵn trong nhiều file ngoài phạm vi; chỉ định dạng `src-tauri/src/hosts.rs`.
- Chưa kiểm tra hosts trực tiếp trong phiên FocusLock đang chạy; cần xác minh trên máy/trình duyệt của người dùng, đặc biệt nếu Secure DNS/DoH đang bật.

## Ghi nhận để không làm mất hành vi đã có

- Mốc đã commit có sẵn trong Git: `46965ed` (`bugfix/website-blocking-reliability`, remote-tracking branch `origin/bugfix/website-blocking-reliability`). Không checkout/reset branch hiện tại để lấy mốc này và không ghi đè thay đổi chưa commit.
- Bản đó đã chuẩn hóa URL thành hostname, thêm hostname gốc và `www`, ghi vào `hosts`, rồi chạy `ipconfig /flushdns`. `src/services/tauri.ts` ở mốc đó cũng gửi payload `blockedUrls` đúng kiểu Tauri.
- Mốc này chỉ chặn hostname gốc và `www`; nó không chặn mọi subdomain. Đây là baseline để so sánh, không phải bằng chứng runtime hiện tại đã được xác nhận.
- Cả bản cũ lẫn hiện tại đều gọi `unblock_urls()` khi thời lượng phiên hết. Vì vậy, nếu đồng hồ về 0 thì website mở lại là hành vi theo thiết kế; nếu đồng hồ vẫn đang chạy thì đó là lỗi cần tái hiện và xử lý.
- Không xóa/ghi đè các thay đổi đang có. Commit tham chiếu trên vẫn còn trong lịch sử Git để khôi phục/so sánh.
- Runtime evidence khi người dùng báo đồng hồ vẫn đang chạy: marker FocusLock có `youtube.com` và `www.youtube.com`, nhưng không có `m.youtube.com`; bộ phân giải Windows trả `::1, 127.0.0.1` cho hai hostname đầu, còn `m.youtube.com` trả IP công khai. Facebook root, `www` và các alias hiện được cấu hình trả loopback.
- Đã thêm các hostname YouTube thường dùng (`m`, `music`, `kids`, `gaming`, `studio`, `tv`, `youtu.be`, `youtube-nocookie.com`, API, `ytimg.com`, `googlevideo.com`) khi chọn `youtube.com`. Hosts không hỗ trợ wildcard, nên tên CDN động hoặc DNS/cache riêng vẫn cần xác minh trong trình duyệt.
- Người dùng xác nhận sau khi khởi động lại phiên bản mới: “oke rồi đó!” — ghi nhận là chặn đã hoạt động trong lần chạy thực tế. Không suy diễn thêm danh sách site/hostname đã được kiểm tra ngoài xác nhận này.

# Báo cáo kiểm thử PhoneStore sau refactor UI/theme

Ngày thực hiện: **18/10/2026**. Kết quả dưới đây là các lệnh đã thực sự chạy trong workspace, không phải chỉ danh sách test dự kiến.

## Môi trường và phạm vi

- Node.js **24.19.0**, npm **11.9.0**.
- MySQL Community Server **8.4.11** thật trong Docker, image `mysql:8.4` pin digest `sha256:24989179f58856db763f418010c1169fecc944e3ec1ea7e921572d83eb070f70`.
- MySQL fixture chỉ publish lên `127.0.0.1` ở cổng ngẫu nhiên; backend/Vite chỉ bind loopback.
- App dùng tài khoản fixture chỉ có `SELECT` trên hai bảng `users`, `phones`. Test xác nhận UPDATE vô hại bị MySQL từ chối vì thiếu quyền.
- Chạy schema/seed bằng chính `DB_INIT_CONFIRM=lab-only npm run db:init` **hai lần**: cả hai lần giữ đúng 5 users, 6 phones ON, 4 phones OFF.
- Browser tests dùng Chromium hệ thống, React frontend, Express backend và MySQL thật.
- Không sử dụng credential hoặc service Aiven. **Chưa kiểm tra Aiven, CA/TLS của service, allowlist hay quyền tài khoản Aiven.**

## Lệnh và kết quả

Lệnh tái tạo toàn bộ:

```bash
npm run test:lab
```

| Nhóm | Passed | Failed | Skipped |
|---|---:|---:|---:|
| Backend config/security | 14 | 0 | 0 |
| Frontend components | 10 | 0 | 0 |
| MySQL integration | 17 | 0 | 0 |
| Playwright browser E2E | 6 | 0 | 0 |
| **Tổng** | **47** | **0** | **0** |

`npm run build` thành công. Dependencies và lockfile không đổi trong refactor này.

## Kết quả TC01–TC14

| ID | Kết quả quan sát |
|---|---|
| TC01 | Tài khoản admin đúng đăng nhập được qua Vulnerable; provenance là credentials. |
| TC02 | Cùng tài khoản đăng nhập được qua Secure bằng Prepared Statement. |
| TC03 | Sai mật khẩu qua Vulnerable trả 401, authenticated=false. |
| TC04 | Sai mật khẩu qua Secure trả 401, authenticated=false. |
| TC05 | Payload username `admin' -- ` vượt xác thực qua truy vấn MySQL thật; session là injection-demo, không có role quản trị. |
| TC06 | Cùng payload qua Secure trả 401 và matchedRows=0. |
| TC07 | Vulnerable tìm iPhone trả 2 dòng, tất cả ON và tên chứa iPhone. |
| TC08 | Secure tìm iPhone trả cùng 2 dòng ON. |
| TC09 | Payload search `' OR 1=1 -- ` trả 10 dòng trong Vulnerable, gồm đúng 4 OFF. |
| TC10 | Cùng payload qua Secure trả 0 dòng, hiddenCount=0. |
| TC11 | Component tests và browser xác nhận 4 sản phẩm OFF thực chỉ có badge nhỏ Đang ẩn; nút điền payload chưa tự làm lộ sản phẩm. |
| TC12 | Logout hủy session; dùng lại cookie cũ cũng trả 401; browser quay về Login. |
| TC13 | Truy cập products khi chưa đăng nhập được chuyển về Login; API search trả 401. |
| TC14 | Thiếu cấu hình Aiven báo tên biến thiếu; tiến trình backend thoát mã 1, không báo kết nối thành công. |

Các kiểm tra bổ sung đã qua:

- Payload `no-match' OR id = 7 -- ` chỉ trả **1** sản phẩm OFF trong Vulnerable, 0 dòng trong Secure: số dòng do SQL thực quyết định, không hardcode theo payload.
- Prepared Search với wildcard vẫn chỉ trả 6 sản phẩm ON.
- MySQL từ chối nhiều statements trong một request; dữ liệu vẫn đọc được sau đó.
- Session ID được tái tạo sau login; browser reload giữ session hợp lệ.
- Chuyển Search sang Secure không giữ kết quả/trace từ Vulnerable.
- Password mẫu không xuất hiện trong login trace/response.
- Host ngoài localhost, Origin lạ, POST thiếu Origin và forwarded headers bị từ chối.
- LAB_MODE=false tắt toàn bộ Vulnerable router.
- API lỗi không lộ stack trace hoặc chi tiết kết nối.
- Mặc định Light khi chưa lưu; theme đổi background, input, header, card, button thực tế qua kiểm tra computed CSS, không chỉ đổi icon. Có kiểm tra hover của toggle và màu cơ bản sau khi rời chuột.
- Light/Dark Mode giữ lựa chọn qua refresh, đăng nhập, đăng xuất; component tests kiểm tra state chung giữa nhiều toggle, giá trị storage không hợp lệ và storage không khả dụng.
- Không tràn ngang ở 320/390/768/1440px; grid tương ứng 1/2/2/4 cột; form Login desktop rộng 420px, căn giữa.
- PhoneStore xuất hiện nhất quán, không có Inspector/Copy SQL/banner khai thác trên hai trang; không có JavaScript page error trong luồng tấn công/phòng thủ chính.
- Frontend gửi X-Lab-Trace: omit; các response Login/Search, kể cả Login sai, không chứa trace SQL. Các API client cũ vẫn nhận response tương thích, không đổi truy vấn/session.
- Nút hiện/ẩn password hoạt động. Một ca chủ động chặn kết nối để kiểm tra thông báo lỗi ngắn; đây là mô phỏng lỗi transport, không giả lập dữ liệu hoặc SQL thành công.

Screenshot do Playwright tạo trong `test-results/` (đã gitignore), bản để xem trên GitHub nằm trong `docs/screenshots/`: Login desktop Light/Dark, Login mobile Light, Products desktop Light/Dark, Products mobile Light và Products có badge Đang ẩn. Đã kiểm tra hình ảnh trực tiếp của Login Light/Dark, Products Dark, Products có sản phẩm ẩn và mobile Light. Container fixture và server kiểm thử được dọn sau khi test; báo cáo không có nghĩa ứng dụng đang chạy với Aiven.

## Việc cần làm khi có Aiven

Làm theo README để cấu hình backend/.env và CA, seed schema riêng bằng initializer, chuyển sang runtime chỉ SELECT, rồi chạy health, integration và browser tests với service thật. Kết quả kiểm thử MySQL local không thay thế bước xác nhận Aiven này.

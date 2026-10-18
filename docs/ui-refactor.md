# Refactor UI/UX PhoneStore

## Phạm vi thay đổi

Giao diện cũ có sidebar, nội dung kỹ thuật và Query Viewer. Bản mới dùng header PhoneStore, màu xanh dương, form đăng nhập 420px và danh sách sản phẩm 4/2/1–2 cột theo kích thước màn hình. Card đơn giản, dùng lại minh họa điện thoại SVG có sẵn; bản ghi OFF chỉ có badge nhỏ **Đang ẩn**. Không thêm giỏ hàng hoặc nghiệp vụ mới.

Đã xóa component QueryViewer, toàn bộ render Inspector, state trace trong AuthContext và các banner/provenance kỹ thuật trong giao diện. Username, session, mẫu tài khoản, mẫu SQLi, route guard, loading/error/empty state và hai chế độ vẫn hoạt động qua API thật.

## Theme: kiểm tra và sửa

Trong mã cũ, theme là state local trong ThemeToggle, mặc định Dark, ghi trực tiếp vào html.dataset.theme. CSS variables đã có cơ chế đổi màu; không có bằng chứng để kết luận phiên bản này chỉ đổi icon trên mọi môi trường. Các vấn đề xác nhận được là mặc định Dark không đúng yêu cầu mới, state không được quản lý chung và Tailwind 4 chưa có custom dark variant theo attribute đó.

Bản mới dùng ThemeContext làm nguồn state runtime duy nhất, chỉ chấp nhận light/dark và mặc định Light. Giữ key localStorage cũ để bảo toàn lựa chọn người dùng, xử lý trường hợp storage không khả dụng. ThemeContext cập nhật html[data-theme] và theme-color; CSS variables định nghĩa đầy đủ màu surfaces, text, input, button, border và toast. Tailwind 4 dùng custom variant theo cùng data-theme. Script public/theme.js chỉ đọc cùng preference trước paint để tránh nháy theme, không có hệ state thứ hai.

Kiểm thử browser xác nhận màu computed CSS của body, header, form, input, nút, card và search panel; kiểm tra cả hover và trạng thái bình thường, refresh, đăng nhập và đăng xuất.

## API và database

Không đổi endpoint, truy vấn, Prepared Statements, kiểm tra credentials, session, cấu hình Aiven/TLS, schema, seed hay .env. File controllerFactory.js chỉ thêm lựa chọn serialize response: frontend gửi **X-Lab-Trace: omit** để không nhận SQL trace/debug; lab clients cũ giữ response mặc định để tương thích. Các cột dữ liệu sản phẩm và user trả về vẫn lấy từ MySQL thật.

Đã kiểm thử MySQL 8.4.11 thật với tài khoản chỉ SELECT. Chưa có credential/CA Aiven trong workspace nên **chưa xác thực kết nối service Aiven**; mã cấu hình kết nối được giữ nguyên.

## File đã sửa hoặc thêm

| File | Thay đổi |
|---|---|
| frontend/src/App.jsx | Bọc ứng dụng bằng ThemeProvider; toast dùng màu theme. |
| frontend/src/contexts/ThemeContext.jsx | Thêm state theme chung, mặc định Light và lưu/khôi phục preference. |
| frontend/src/contexts/AuthContext.jsx | Bỏ trace và banner kết nối khỏi state UI, giữ session/login/logout. |
| frontend/src/components/common/ThemeToggle.jsx | Dùng ThemeContext, nhãn thể hiện chế độ sắp chuyển. |
| frontend/src/components/common/Logo.jsx | Thêm wordmark PhoneStore tái sử dụng. |
| frontend/src/components/common/Layout.jsx | Thay sidebar/dashboard bằng header, navigation, account/logout, footer gọn. |
| frontend/src/components/common/SecurityTabs.jsx | Tab trung tính, underline xanh, bỏ icon/badge kỹ thuật. |
| frontend/src/components/common/QueryViewer.jsx | Xóa component không còn sử dụng. |
| frontend/src/components/auth/LoginForm.jsx | Form gọn, nút tiếng Việt, lỗi ngắn, bỏ inspector và mô tả kỹ thuật. |
| frontend/src/pages/LoginPage.jsx | Form giữa màn hình, bỏ hero/banner/SQL trace. |
| frontend/src/pages/ProductsPage.jsx | Catalog đơn giản, bỏ inspector/banner; giữ xử lý request mới nhất và xóa kết quả khi đổi tab. |
| frontend/src/components/phones/SearchBar.jsx | Thanh tìm kiếm gọn, nút Tìm kiếm mẫu/Điền mẫu SQLi. |
| frontend/src/components/phones/PhoneCard.jsx | Card ảnh/tên/hãng/giá VND/dung lượng, badge Đang ẩn. |
| frontend/src/components/phones/PhoneGrid.jsx | Empty state ngắn; giữ skeleton/loading. |
| frontend/src/routes/ProtectedRoute.jsx | Thông báo tải ngắn, giữ redirect kiểm tra session. |
| frontend/src/api/axiosClient.js | Yêu cầu response không chứa debug, ánh xạ lỗi UI ngắn. |
| frontend/src/index.css | Thay stylesheet dashboard bằng tokens Light/Dark và layout e-commerce responsive. |
| frontend/index.html | Title/meta PhoneStore và nạp theme trước paint. |
| frontend/public/theme.js | Khôi phục cùng preference trước khi vẽ trang. |
| frontend/public/favicon.svg | Icon điện thoại xanh dương. |
| backend/src/controllers/controllerFactory.js | Chỉ thêm compact response theo header; giữ nguyên nghiệp vụ. |
| backend/test/mysql.integration.test.js | Thêm kiểm chứng response compact và kết quả SQL thực. |
| frontend/src/test/components.test.jsx | Cập nhật badge/tabs và kiểm thử theme/storage/error. |
| tests/e2e/lab.spec.js | Cập nhật theo UI mới, thêm kiểm tra theme/responsive/không còn SQL debug. |
| README.md | Cập nhật branding, nút thao tác, theme, API compact và ảnh. |
| docs/verification.md | Kết quả kiểm thử thực tế sau refactor. |
| docs/ui-refactor.md | Danh sách thay đổi và giới hạn xác thực. |
| docs/screenshots/*.png | Cập nhật ảnh Light/Dark, desktop/mobile, badge Đang ẩn từ browser tests. |

Dependencies, package-lock.json, vite.config.js và database files không thay đổi.

## Kết quả

`npm run test:lab`: **47 passed, 0 failed, 0 skipped** (14 backend config/security, 10 frontend, 17 integration, 6 browser E2E). `npm run build` thành công. Các ca TC01–TC14 vẫn được bao phủ; chi tiết ở verification.md. Không đưa lab lên hosting public.

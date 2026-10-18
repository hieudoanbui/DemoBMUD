-- Fictional lab data. Plaintext passwords are intentional for this SQL lesson.
-- Stable IDs make re-running this seed idempotent in this dedicated schema.
INSERT INTO users (id, username, password, role) VALUES
(1, 'admin', 'admin123', 'admin'),
(2, 'manager', 'manager123', 'user'),
(3, 'demo', 'demo123', 'user'),
(4, 'minh', 'minh123', 'user'),
(5, 'linh', 'linh123', 'user')
ON DUPLICATE KEY UPDATE username = VALUES(username), password = VALUES(password), role = VALUES(role);

INSERT INTO phones (id, name, brand, price, storage, color, quantity, status, description) VALUES
(1, 'iPhone 16 Pro', 'Apple', 28990000, '256 GB', 'Titan tự nhiên', 18, 'on', 'Thiết kế titan. Chip A18 Pro. Camera chuyên nghiệp trong tầm tay.'),
(2, 'Galaxy S25 Ultra', 'Samsung', 30990000, '256 GB', 'Titan xám', 12, 'on', 'S Pen tích hợp, màn hình sống động và bộ công cụ Galaxy AI.'),
(3, 'Xiaomi 14', 'Xiaomi', 16990000, '256 GB', 'Xanh ngọc', 24, 'on', 'Ống kính Leica và hiệu năng mạnh mẽ trong thiết kế nhỏ gọn.'),
(4, 'OPPO Find X8', 'OPPO', 22990000, '256 GB', 'Đen không gian', 15, 'on', 'Camera Hasselblad, pin bền bỉ và trải nghiệm ColorOS mượt mà.'),
(5, 'Pixel 9', 'Google Pixel', 18990000, '128 GB', 'Hồng mẫu đơn', 9, 'on', 'Nhiếp ảnh thông minh cùng trải nghiệm Android thuần Google.'),
(6, 'iPhone 15', 'Apple', 17990000, '128 GB', 'Xanh dương', 30, 'on', 'Dynamic Island và camera 48 MP cho những khoảnh khắc thường ngày.'),
(7, 'iPhone 16 Pro Max — Prototype', 'Apple', 34990000, '512 GB', 'Titan sa mạc', 3, 'off', 'DỮ LIỆU GIẢ: sản phẩm nội bộ chưa được công bố trong cửa hàng lab.'),
(8, 'Galaxy Z Fold6 — Internal', 'Samsung', 41990000, '512 GB', 'Bạc', 2, 'off', 'DỮ LIỆU GIẢ: mẫu thử nội bộ, không được xuất hiện trong tìm kiếm công khai.'),
(9, 'Xiaomi 14 Ultra — Preview', 'Xiaomi', 25990000, '512 GB', 'Trắng', 4, 'off', 'DỮ LIỆU GIẢ: bản xem trước thuộc danh mục đang ẩn.'),
(10, 'Pixel 9 Pro — Unreleased', 'Google Pixel', 24990000, '256 GB', 'Đen obsidian', 2, 'off', 'DỮ LIỆU GIẢ: hàng thử nghiệm chỉ dành cho bài thực hành SQL Injection.')
ON DUPLICATE KEY UPDATE name = VALUES(name), brand = VALUES(brand), price = VALUES(price),
storage = VALUES(storage), color = VALUES(color), quantity = VALUES(quantity),
status = VALUES(status), description = VALUES(description);

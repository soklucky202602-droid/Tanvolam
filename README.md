# volamh5.top — mã trình duyệt, tài nguyên game và trang admin

Gói này gộp tất cả tệp công khai đã tải từ volamh5.top trong chat này: trang chủ, /play01 và /admin.html. Game được tải ngày 10/10/2026; trang admin được bổ sung ngày 11/10/2026. Hai bản chụp có thể thuộc phiên bản phát hành khác nhau.

## Xem bản tải trên máy

Giải nén toàn bộ ZIP, vào thư mục `volamh5-top`, rồi chạy:

```sh
python3 preview.py
```

- Trang chủ: http://127.0.0.1:8000/
- Trang game: http://127.0.0.1:8000/play01
- Trang admin: http://127.0.0.1:8000/admin.html

Công cụ này chỉ phục vụ tệp tĩnh và trả thông báo JSON cho API chưa có. Không chuyển yêu cầu đăng nhập hoặc quản trị tới website gốc. Trang game đợi đăng nhập và dữ liệu nhân vật từ backend trước khi nạp phần chơi.

## Nội dung

- `site/index.html`, `site/play01.html`, `site/admin.html`: các trang HTML gốc.
- `site/assets/`, `site/js/`, `site/img/`, `site/fx/`, `site/snd/`, `site/music/`, `site/ui/` và các tệp gốc tại `site/`: mã, dữ liệu, ảnh và âm thanh tải được.
- `site/js/server-admin.js`: mã giao diện quản trị.
- `site/data.js`, `site/account-box.js`, `site/account-box.css`: dữ liệu và giao diện tài khoản được admin sử dụng.
- `manifest.json`: danh mục thống nhất, URL nguồn, ngày bản chụp, dung lượng và SHA-256.
- `docs/game/`, `docs/admin/`: hướng dẫn và danh mục gốc của từng lần tải.
- `download_public.py`, `download_dynamic.py`: công cụ tải tiếp tài nguyên được tham chiếu; cần mạng khi chạy.

Nội dung tệp gốc được giữ nguyên. Tên tệp trên đĩa không chứa query phiên bản. Không có tệp trùng đường dẫn khác nội dung giữa hai bản tải.

## Phần cần có để dựng máy chủ game độc lập

**ZIP này chưa phải toàn bộ source máy chủ.** Website công khai không cung cấp backend, cơ sở dữ liệu, cấu hình triển khai hoặc kho source trước khi đóng gói JavaScript. Chỉ giải nén và host tệp tĩnh sẽ chưa chạy được game online và quản trị độc lập.

Bạn cần source backend từ chủ sở hữu hoặc tự triển khai tương thích các nhóm API mà client gọi:

- Đăng ký, đăng nhập, đăng xuất và phiên người dùng (`/api/auth/*`).
- Đọc/lưu nhân vật (`/api/game/state`).
- Chat, hiện diện online, xếp hạng, giftcode và thông tin mở server.
- Quản trị tài khoản, cấp vật phẩm, reset tiến độ, giftcode, bảo trì, mở server và bot (`/api/admin/*`).

Các API quản trị cần kiểm tra quyền ở backend; giao diện admin tải được không bao gồm quyền hay tài khoản quản trị. URL API tìm từ các JavaScript được lưu trong danh mục gốc ở `docs/`.

Nhiều URL ảnh `doll/...` trong dữ liệu trả 404 từ website gốc; danh sách URL ứng viên tải lỗi nằm trong manifest. Bộ ảnh `img/jx/...` tải thành công đã được giữ đầy đủ theo lần thu thập. Font Google và liên kết ngoài website không đóng gói. Tài nguyên chỉ xuất hiện sau đăng nhập hoặc được sinh từ dữ liệu server có thể chưa được phát hiện.

## Kiểm tra gói

Tất cả tệp gốc đã được kiểm tra kích thước và SHA-256 theo danh mục tải. File ZIP đã được kiểm tra CRC sau khi đóng gói. Gói này phản ánh những tệp đã thu thập, không khẳng định có toàn bộ mã và dữ liệu cần để tái tạo máy chủ gốc.

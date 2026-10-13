# Bản tải tài nguyên công khai Võ Lâm H5

Nguồn: https://www.volamh5.top/ và https://www.volamh5.top/play01
Ngày tải: 10/10/2026.

Đây là bản sao các tệp website cung cấp công khai: HTML, CSS, JavaScript đã đóng gói, ảnh, hoạt họa, âm thanh và dữ liệu phía trình duyệt. **Đây chưa phải toàn bộ source gốc hoặc một game online có thể triển khai độc lập.**

## Xem trên máy

Trong thư mục này chạy:

```sh
python3 preview.py
```

Mở trang chủ tại http://127.0.0.1:8000/ và trang game tại http://127.0.0.1:8000/play01.

Trang chủ có thể xem bằng máy chủ tĩnh. Trang game có màn đăng nhập và đợi API trước khi nạp phần chơi; bản xem cục bộ sẽ báo chưa có backend. Máy chủ xem thử trả thông báo JSON cho `/api/*` và không chuyển các yêu cầu đó tới website gốc.

## Cấu trúc

- `site/index.html`: HTML trang chủ gốc.
- `site/play01.html`: HTML trang game gốc; `preview.py` ánh xạ URL `/play01` tới tệp này.
- `site/assets/`, `site/js/`, `site/img/`, `site/fx/`, `site/snd/`, `site/music/`, `site/ui/`: tài nguyên tải thành công.
- `manifest.json`: URL, đường dẫn, kích thước và SHA-256 của tệp; các lượt tải lỗi và tham chiếu ngoài website.
- `api-references.json`: các URL API đọc từ mã phía trình duyệt, dùng làm điểm bắt đầu khi viết backend của bạn.
- `download_public.py`, `download_dynamic.py`: công cụ tải lại các tài nguyên được tham chiếu, gồm URL ảnh ghép động từ bảng trong JavaScript.

Các tệp trong `site/` giữ nguyên nội dung tải được. Đường dẫn nội bộ giữ cấu trúc website; query phiên bản không nằm trong tên tệp trên đĩa. Phông chữ Google và các liên kết ngoài website được liệt kê riêng, chưa đóng gói.

## Phần phải bổ sung để dựng game riêng

Website công khai không cung cấp mã máy chủ, cơ sở dữ liệu, cấu hình triển khai hay kho source trước khi đóng gói. Không thấy chỉ dẫn source map trong bundle game đã tải.

Mã trình duyệt sử dụng các nhóm API đăng nhập/đăng ký/phiên người dùng, đọc và lưu nhân vật, chat, hiện diện online, bảng xếp hạng, giftcode và thông tin mở server. Bạn cần source backend từ chủ sở hữu hoặc tự triển khai backend tương thích. Ví dụ, `auth.js` đợi `/api/auth/me`, rồi `/api/game/state`, trước khi cho phép nạp game.

Danh mục `doll-data.js` tham chiếu nhiều ảnh `doll/...` trả HTTP 404 từ website gốc. Các URL này được ghi trong manifest; bộ ảnh `img/jx/...` được tìm từ bảng nhúng `window.JXLOOK` và tải riêng. Những tệp thiếu không thể phục hồi từ một URL không cung cấp chúng.

Danh sách thu thập dựa trên hai trang và tham chiếu trong các tệp công khai, bao gồm danh mục ảnh ghép động đã nhận diện. Tài nguyên chỉ xuất hiện trong phiên đăng nhập, ở màn chơi khác hoặc sinh từ dữ liệu máy chủ có thể chưa được phát hiện.

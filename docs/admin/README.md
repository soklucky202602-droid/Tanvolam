# Mã phía trình duyệt trang admin Võ Lâm H5

Nguồn: https://www.volamh5.top/admin.html · Tải ngày 11/10/2026.

Đã tải nguyên bản HTML trang admin và bốn tệp được trang tham chiếu: account-box.css, account-box.js, data.js và js/server-admin.js. Mã giao diện chính nằm trong site/js/server-admin.js; giao diện và CSS nội tuyến nằm trong site/admin.html.

Đây là phần mã công khai phía trình duyệt. Không chứa mã máy chủ, cơ sở dữ liệu, tài khoản hoặc quyền quản trị. Các chức năng quản trị gọi /api/admin/* và cần backend cùng phiên đăng nhập hợp lệ. Việc tải được giao diện không có nghĩa là khôi phục được backend hoặc vận hành các chức năng quản trị trên máy chủ riêng.

manifest.json liệt kê tệp, SHA-256 và các URL API đọc từ JavaScript. Không thực hiện đăng nhập hoặc gọi API quản trị trong quá trình thu thập. Các ảnh được trả về trong catalog hoặc dữ liệu tài khoản không nằm trong gói mã này.

Để xem giao diện tĩnh, chạy `python3 -m http.server 8003 --bind 127.0.0.1 --directory site`, rồi mở http://127.0.0.1:8003/admin.html. API chưa được triển khai trên máy chủ xem thử.

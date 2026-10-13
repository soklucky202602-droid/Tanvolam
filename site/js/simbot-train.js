/* ============================================================================
   SIMBOT VÕ LÂM TRUYỀN KỲ (PORTED & ENHANCED FROM D:\jxvokhanh\1 SIMCITY)
   - 737 Hiệp khách giang hồ (names.txt)
   - 2,719 Câu thoại kinh điển (chat.txt: fighting, general, rep_chao, solo, tantinh, giaodich)
   - 10 Môn phái chuẩn Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ)
   - TỰ ĐỘNG SĂN QUÁI KHẮP BẢN ĐỒ NHƯ NGƯỜI CHƠI THẬT (AUTONOMOUS AUTO-TRAIN AI):
     * Tự động quét tìm quái vật còn sống trên bản đồ (A.enemies)
     * Chạy tới tiếp cận, tung chiêu phái, hạ quái, nhận exp
     * Diệt xong con này -> lập tức quét tìm con tiếp theo để săn
     * Khi xung quanh hết quái: tự chạy tuần tra khám phá bản đồ để tìm bãi quái mới
     * Hoàn toàn độc lập, không đi theo người chơi, không bám đuôi người chơi
     * Tự uống bình máu khi yếu máu, có câu thoại chiến đấu/giao lưu chân thực
   ============================================================================ */
'use strict';

const SIMBOT_NAMES = ["Thẩm Yến","Lệnh Hồ Chi","Mộc Liên Diễm","Thượng Quan Chi","Chí Tín Công Tử","Sở Trúc Vô","Công Tôn Lãnh","Lâm Dao","Mạc Thanh Cốc","Mộ Dung Phỉ","Bạch Mỹ","Vân Huyền Tử","Lăng Sương Hoa","Mộc Băng Lục Y","Liễu Tử Linh","Lục Tiểu Phụng","Gia Cát Dược","Hư Trúc","Hư Nham","Hoa Lục Y","Mộ Dung Nhi","Hoa Lâm Khai","Tống Tịnh","Thanh Thiên Dao","Liễu Phi Nhiên","Sở Bác Mãn","Lâm Vũ Trần","Hàn Thư Nữ Hiệp","Nhược Khâm Mãn","Cung Tiêu Thiên","Lạc Chí Dao","Tư Mã Anh","Mộc Uyển Thanh","Bạch Hải","Mai Kiều","Mộ Dung Lê","Liễu Hương","Nhan Phá","Tư Mã Tĩnh","Diệp Tịch Thúy","Cố Trần","Nhậm Diễm","Vương Ngữ Yên","Hạ Phượng Nhi","Hoa Bích","Thượng Quan Tâm","Vô Xung","Y Thản Đình","Vân Hoa Tài Nữ","Công Tôn Vũ","Tiêu Ngọc Loan","Dương Quá","Trúc Mỹ Nhu","Viên Thừa Chí","Minh Trác Nhất","âu Dương Nhi","Huyền Hạo Tuyệt","Văn Thu","Tiểu Kiều Thư","Hoa Linh","A Tử","Diệp Dao","Mặc Thiên Hiếu","Tần Thúy Lục Y","Đoàn Dự","Gia Cát Chỉ","Tôn Tiểu Hồng","Gia Cát Kỵ","Hổ Viễn","Tư Mã Ngữ","Mộc Lệ Tuyết","Tần Ly Lạc","Đao Phi Long","Vô Kỵ Nữ Vương","Cố Ngọc Thanh","Lệnh Hồ Tầm","Độc Cô Nhã","Thẩm Trúc Bác","Yến Lệ Nữ Hiệp","Cô Hạo San","Bạch Châu Khê","Hàn Lệ","Lăng Hiếu","Công Tôn Thư","Trương Thúy Sơn","Tử Lễ Phong Lưu","Lệnh Hồ Tuyệt","Công Tôn Trần","Tuyết Anh","Thẩm Thi Thi","Nhậm Lục Y","Hân Tố Tố","Sở Lưu Hương","Mai Nguyệt Yến","Nhiếp Hạo Huyền","Mạc Như Đao","Độc Cô Nguyệt","Lục Tuấn Tín","Tống Vũ Tuyệt","Hạc Thiên Kiếm","Lăng Tuyết Kiều","Cung Tuấn","Thạch Phá Thiên","Tạ Hạo","Lâm Hùng","Chung Tâm","Gia Cát Sơn","Đoàn Thần","Khả Hoa Nữ Hiệp","Gia Cát Hương","Gia Cát Văn","Độc Cô Dật","âu Dương Dao","Gia Cát Lệ","Lệnh Hồ Dao","Công Tôn Hiểu","Kiếm Trác","Tần Hồng Miên","Tử Sơn Đại Hiệp","Đào Lê Hạo","Kim Cô Đình","Kỷ Hiểu Phù","âu Dương Tuyết","Sở Mỹ","Minh Trác","Mộ Dung Bác","Trương Phi","Hồ Phỉ","Lệnh Hồ Bác","Hoa Yên Nhiên","Tiết Ngọc Thiên","Lệnh Hồ Tố","Mộ Dung Đồng","Thiên Dược","Lăng Tâm Tuyết","Mộ Dung Ngọc","Công Tôn Kiều","Tô Yến Hồng","Địch Vân","Hoắc Hoan Mộ","Lâm Văn","Chu Nguyệt Kiếm","Mộ Dung Yến","Gia Cát Tịnh","Cố Ngọc Thảo","Tư Mã Lâu","Hạ Thi Hân","Cung Tiêu Văn","Gia Cát Thuyên","Yên Nhi Thục Nữ","Lạc Diễm","Kiều Phong","Độc Cô Hân","Trương Nguyệt","Lệnh Hồ Trần","Độc Cô Tịnh Nhi","Lệnh Hồ Hà","Lệnh Hồ Kiệt","Lâm Vũ Minh","Hư Mộc","Tư Mã Phù Dự","Độc Cô Thiên","Bạch Khả Lam","A Châu","Hồ Hàn Nghi","Du Liên Châu","Nhiếp Ngọc Lễ","Tiểu Long Nữ","Gia Cát Nhu","Sở Kiếm Thần","Vân Nguyệt","Lục Chí Phi","Tư Mã Mẫn Đao","Băng Nham Thành","Thẩm Thi","Công Tôn Thành","Diệp Cô Phàm","Độc Cô Tín","Sở Uyển","Tần Khả Nguyệt","Sở Phi","Độc Cô Thừa","Du Thản Chi","Lục Tuyết Vân","Thượng Quan Hân","Độc Cô Mỹ Nhi","Chu Thừa Di Dự","Hạc Bình","Trần Cô Khai","Trúc Vân Linh","Lan Bích","Mộ Dung Tuyết","Sở Oanh Nhu","Vân Tử Vũ","Hoàng Dung Lam","Hoa Đại Khê Tố","Lục Tuyệt Dao","Tiết Tiêu Khiêm","Tiểu Chiêu","Kim Bác Kỵ Tĩnh","Lục Dật Tuyết","Thượng Quan Dật","Thanh Tử Tuấn","Lăng Nhược Hạc","Chu Long","Tạ Như Tố","Gia Cát Nhiên","Chu Thương Trác","Hạ Yên","Cúc Thông","Mộ Dung Yên","Du Đại Nham","Mộ Dung Mỹ Nhi","Viên Ngữ Cô","Vũ Ngọc Thiên","Lạc Mỹ Thúy","Công Tôn Phi","Đào Oanh Lệ","Cố Vô Tiêu","Tiểu Như Nhã","Lệnh Hồ Hiếu","Hàn Sương","Hổ Hiệp","Công Tôn Nghĩa","Mộ Dung Tuyệt","Tử Thúy","Hoa Lam","Lý Như Tuyết","Đào Dao","Sở Khả","Công Tôn Tuấn","Tử Thi Thi","Tiêu Oanh","Thanh Mộng","Quách Phù","Đoàn Trác","Thủy Sinh","Cố Mi Chỉ","Tuyết Mộc Tĩnh","Thiên Tịnh Hiệp","Phó Chỉ Trúc","Hạo Vô Khách","Huyền Liên","âu Dương Nhu","Độc Cô Hoa","Công Tôn Phù","Hoàng Dung Phù","Lâm Cốc","âu Dương Mẫn","Tần Phượng","Nhạc Ngọc Hùng","Cố Dương","Hạo Dao","Lạc Mỹ Nhi","Hư Chí","Vân Dao Giang","Gia Cát Phong","Lệnh Hồ Nhược","Công Tôn Loan","Du My","Đào Hàn Bích","Chu Mộ Hải","Công Tôn Hồng","Độc Cô Ngọc","Phương Nhi","Liễu Phi Nhi","Lệnh Hồ Quá","Tuyết Đồng","Lâm Kiếm","Phương Chấn Mi","Mộ Dung Văn","Lục Phàm","Mộ Thanh ẩn Sĩ","Hoàng Dung Công","Tư Mã Thu","Lâm Thúy","Lăng Mỹ Linh","Diệp Cô Thành","Gia Cát Thi Thi","Vương Chí Thư","Mai Tầm Châu","Hoàng Dung Ngọc","Mộ Dung Lục","Lăng Vân Phi","Độc Cô Vân","âu Dương Phi","Trương Tùng Khê","Gia Cát Mỹ","Mộc Thành Chỉ","Hoàng Dung Thi","Trần Tĩnh","âu Dương Mỹ","Trúc Châu Phụng","Nguyên Tịnh Hạc","Gia Cát Dự Sư","Gia Cát Khả","Thượng Quan Lam","Diệp Tâm Lam","Lệnh Hồ Trí","Tần Như Bác","Tần Gia Bích","Văn Tử Du Tử","Tiêu Uyển","Công Tôn Khả","Trương Trí","Trần Gia Lạc","Hoàng Dung Bác","Hàn Như Thi","Gia Cát Kiệt","Quách Tương","Mộ Dung Lục Y","Thanh Thảo","Triệu Huyền","Tư Mã Lạc Cô","Hạ Ngọc Hân","Tạ Anh","Lý Vũ","Chung Băng","Đào Tịnh Nhi","ân Mộng Yên","Cô Dược Mộc","Tư Mã Nguyệt","A Nhã","Du Phàm","âu Dương Nguyệt","Lý Tuyệt Trần","Hạc Như","Chung Phượng","Lâm Khiêm Thất","Triệu Tịch Uyển","Thượng Quan Phù","Tần Trường Kiếm","Tô Thuyên","Lan Mạc Chỉ Dự","Lan Oanh","Thẩm Kiều Hoa","Trúc Nguyệt Nhi","Hoàng Dung Bình","Hoàng Dung Bích","Cúc Tịnh Nhi","Thạch Tùng","Chí Bá Vân Du","Lý Mạc Sầu","âu Dương Oanh","Chí Thu My","Thượng Quan Thu","Liễu Gia Sư Chỉ","Mặc Mộ Kiệt","Lâm Tuấn Sơn","Cúc Oanh","Lâm Mỹ Nhi","Dương Hạc Lãnh","Hồng Bích","Hân Kiều Hoa","Lý Dao Tử","Thượng Quan Nhi","Đào Phượng Linh","Công Tôn Tịnh","Độc Cô Tử","Trương Tịch Thu","Tần Gia Quá","âu Dương Cô Dự","Hạ Tiêu Long","Lệnh Hồ Minh","Phó Hồng Tuyết","Thượng Quan Phi","Triệu Mẫn","Triệu Yên Loan","Tiêu Viễn Sơn","Băng Tâm","Lâm Trí","Phong Long Dũng","Công Tôn Ngọc","Diệp Tâm Hồng","Mỹ Nhã Tuyết Cơ","Tư Mã Mãn","Độc Cô Tuấn","Mặc Thanh","Đao Thư","Cố Phi Mỹ","Độc Cô Hạc","Đào Vân","Lệnh Hồ Đình","Minh Tín Du Tử","Nhậm Yến","Hạ Nhược Hoan","Độc Cô Trường","Tiết Chiêu Lan","Nhạc Bác Phá","Cố Tịnh Dật","Lan Thanh Vân","Liễu Vô My","Gia Cát Thúy","Công Tôn Vân","Đinh Miên Trúc","Công Tôn Kiếm","Hoàng Dung Tịch","Lạc Vân Tiêu","âu Dương Mộng","Chu Công Thu","Nhiếp Tịnh Long","ân Thúy Hồng","Triệu Yên Hồng","Mộ Dung Phục","Lệnh Hồ Khiêm","ân Ly","Tư Mã Tuyết","Hổ Dũng","Lâm Hạo","Thiên Ngọc Lễ","Lý Tuyết Phong","Mộ Dung Thừa","Hoàng Dung Tâm","Hàn Oanh","Trình Anh","Tần Thi Hương","Triệu Tâm","Trúc Dao Loan","Nghi Lâm","A Linh","Nhạc Linh San","Vương Di Lê","Mộ Dung San","Lăng Dao Thư","Diệp Linh San","Độc Cô Nhược Hi","Diệp Khai","Viễn Vô Linh","Tạ Thiên Tuyệt","Cung Long Huyền","Độc Cô Anh","Gia Cát Sầu","Nhạc Châu","Công Tôn Oanh","Nhiếp Hạo Phi","Hổ Tuấn","Bạch Linh Văn","Cúc Nham","Lâm Dật Trí","Lăng Văn Tử","Độc Cô Lãnh","Sở Thanh Vân","Gia Cát Tâm","Độc Cô Mộ","Lệnh Hồ Phụng","Chu Chỉ Nhược","Vân Thương Linh","Dương Nhược Hạo","Gia Cát Yến","Y Thúy Nữ Vương","Hoàng Dung Dao","Huyền Phi Trác","Dương Hiệp","Hồng Thất Công","Du Thất Mộ","Gia Cát Trường","ân Lê Đình","âu Dương Linh","Lạc Tiêu Minh","Diệp Vân Tín","A Phi","Nhan Như Oanh","Trúc Thúy Thảo","Độc Cô Khâm","Mộ Dung Phượng","Tạ Tại Cô","Công Tôn Mỹ","Phương Di","Công Tôn Mộ","Thượng Quan Nhu","Triệu Diễm Băng","Mộ Dung Nhã","Lạc Thanh","Hạ Yến Tâm","Gia Cát Sầu Mộ","Công Tôn Mỹ Nhi","Độc Cô Khả","Công Tôn Hương","Tư Mã Thần","Lệnh Hồ Đao","Tiết Linh","Hạo Tử Linh","Bạch Phong Sơn","Đoàn Trí Hưng","Lạc Tịch Sương","Lục Y Linh","âu Dương Chỉ","Thượng Quan Bá","Lý Y Lục Y","Hân Đồng Tầm","Kỷ Công Ly","Hồng Chỉ Mạc","Mộ Dung Sương","Hạ Huyền Minh","Công Tôn Anh","Đoàn Kỵ","Nhiếp Bá","Bạch Mộ Linh","Công Tôn Tiêu","Công Tôn Viễn","A Băng Thúy","Chung Thi Thi","âu Dương Phong","Kiếm Tịnh Kiệt","Đoàn Phàm Sư","Hổ Sơn","Liễu Tiểu Hàn","Hồ Nhất Đao","Nhược Hi","Bạch Hùng","Tử Hiệp","Công Tôn Hà","Tử Di Châu","Nhạc Hiếu","Liễu Nguyệt","Văn Trường Trúc","Lệnh Hồ Bá","Gia Cát Uyển","Diệp Phi Khách","Tử Miên Diễm","Nhiếp Linh Linh","Lan Diễm Băng","Lý Khâm","Tư Mã Lãnh","Tuyết Nghi","Nhậm Linh Lục Y","Tạ Linh Thi Thi","Lý Thương Vũ","âu Dương Tịch","Thượng Quan Yên","Minh Kiếm","âu Dương Thanh","Nhậm Nhược Hi","Chung Sương Tâm","âu Dương Dũng","Liễu Long Dương","âu Dương Mỹ Nhi","Thanh Kiếm","Nguyên Lâu Khai","Lục Tịnh Hương","Chung Linh","Hoàng Dung","Hoa Mãn Lâu","Tiết Dao","Minh Kiếm Huyền","Bạch Lãnh Dật","Kim Xung My","Đinh Công","Tư Mã Hạo","Chu Anh","Mộ Dung Lam","Hàn Thanh Lam","Tần Mộ Ngọc","Mộ Dung Thanh","Trúc Đình Công","Nguyệt Dật","Lục Vô Song","Lam Thương Bá","Độc Cô Xuân","Kỷ Đồng Thản","Tịch Mỹ Tài Nữ","Trần Ly Mạc","Mộ Dung Dao","Lệnh Hồ Kiếm","Hồng Mi San","Diệp Nguyệt","Y Mạc Tịch","Quách Tĩnh","Hạ Băng Vân","Tống Viễn Kiều","Nhạc Dao Linh","Đào Yến Khả","Trúc Thông Phỉ","Tống Gia Tương","Thiên Dao","Chu Diễm Thành","Thượng Quan Mộ","Lăng Tử Minh","Thanh Nhiên","Nhan Thúy","Tư Mã Khai","Hoắc Tầm Chi","Tư Mã Dật","Đào Châu Khiêm","Mộc Hạo Bác","Chung Thản Lê","Hạc Trác","Độc Cô Loan","Vũ Tử Sơn","Phương Sư Uyển","Tô Hiểu","Lăng Tịnh Hùng","Tần Tâm Thi","Hoàng Dung Mạc","Chung Mỹ Thi","Nhan Nhi","Trương Tín","Mặc Tịnh Phong","Vân Tại Thiên","Cúc Thanh Vân","Bạch Nghĩa","Độc Cô Diễm","Mộ Dung Bình","Liễu Thanh Tâm","Mộ Dung Giang","Hàn Phượng Nhu","Lý Tầm Hoan","Tư Mã Di","Hân Lục Nhược","Lan Mộc Tịch","Hạc Thần ẩn Sĩ","Tiết Long","Lâm Mộ Phong","âu Dương Thần","Hoàng Dung Hưng","Lăng Tuyết","Lệnh Hồ Khách","Thủy Trác Đao","Triệu Đao Nhược","Mộc Oanh Lam","Lục Tịch Dũng","Hàn Diễm","Lăng Hân","Y Sương Kiếm Nữ","Chung Diễm","Nhiếp Như Sầu","Hàn Hàn Hiếu","Hạc Thanh","Triệu Cốc","Trương Thiên Lễ","Trương Vô Kỵ","Tư Mã Uyển","Liễu Mỹ Băng","Mộ Dung Công","Nguyệt Ngữ Mộ","Mỹ Nhi Thần Nữ","Lăng Dật","Kim Linh Chi","Vân Nhi Nữ Hiệp","A Thanh Vân","Hoa Lãnh","Thượng Quan Hà","Nhan Kỵ Lâu","Nguyệt Mộc Nghi","Cúc Nguyệt Nhi","Trương Chiêu Vô","Tư Mã Tuyệt","Cung Dật Minh","Cung Trần","Công Tôn Phụng","Thẩm Yên Loan","Tạ Tử Phong","Hoàng Dung Nhi","Tư Mã Dao","Hoa Mộc Lan","Hoàng Dung Thư","Mộ Dung Mộ","Hoàng Dược Sư","âu Dương Đao","Mai Thông Hiểu","Cố Nhược Hi","Vũ Kiếm Viễn","Lệnh Hồ Xung","Triệu Lục Y","Cúc Vân","Quách Tương","Gia Cát Kiều","Thanh Trác","Hoắc Thanh Đồng","Mộ Dung Vân","Hạo Nhược Nghi","Công Tôn Mộng","Quách Hàn","Trương Lục","Nghi Trác Sầu","Hoa Huyền Phong","Vũ Nguyệt Du Tử","Hàn Tiểu Dự","Lâm Tiên Nhi","Đinh Xuân Thu","Hàn Vân Minh","Hoàng Dung Tĩnh","Sở Yến Bích","Vân Ly Hưng","Lệnh Hồ Hiệp","Tư Mã Hiệp","Lệnh Hồ Dũng","Tô Tử Khả","Độc Cô Trúc","Độc Cô Chi","Du Mẫn Sương","Cố Yến Dao","Chu Hoa Thi","Hoàng Dung Hoan","Lăng Phàm Dược","Diệp Thi Mộng","Hạo Ngọc","Lục Thi Thúy","Cô Cô","Chu Bá Thông","Mộ Dung Nghĩa","Tử Lãnh ẩn Sĩ","Kiếm Hiểu Mi","Thủy Nhất","Tuyết Vân Kiếm","Lan Tịnh Thảo","Bạch Phượng","Hoa Tử Lễ","Liên Thành Bích","Hoa Thừa Lục","Nguyên Vũ Huyền","âu Dương Giang","Mộ Dung Lệ","Mộ Dung Lãnh","Phong Xung","Long Trường Dao","Diệp Trác","Công Tôn Hân","Tư Mã Trúc","Lăng Phi Khả","Độc Cô Thi Thi","Mộ Dung Kiếm","Trương Trần","Độc Cô Lam","Tiêu Bích","Tử Bá Nho Sĩ","Hạ Vũ Viễn","Hổ Thần Phi","Lệnh Hồ Mãn","Độc Cô Đình","Hạ Tuyết Nghi","ân Tố Tố","Gia Cát Tuyết","Viên Hải My","âu Dương Cô","Hổ Khai Đồng","Chu Phi Dao"];
const SIMBOT_CHATS = {"fighting":["Ngon nhào vô!","Đường này do ta mở!","Mau đóng tiền bảo kê!","Cho xin tí bánh mì!","A thằng này láo!","Thằng nào dám đánh tao!","Đứa nào cắn lén ông!","Nguy hiểm! Chạy lẹ!","Mày hả nhóc!","Đứa nào dám qua đây kiếm ăn!","Anh em đâu xông lên !","Hốt nó!","Trên đời này không có thuốc hối hận!","Quánh chết cụ mài","Cmm","Đít t nè, cắn đi","Anh ơi, nó quánh em","Múc!","Thằng này láo","Chết mài với anh","CúT","Không cần nói nhiều!","Dám móc lốp tau hả","Tau thích, mài làm gì tau?","Ngon thì kéo cả bang mài đến đây","Mài thắng được anh sao?","í da! Sợ quá cơ!","Trâu vl","Hấp nó","Đại ca, tha em","Tha mạng","Chắc tau sợ","Bố chấp cả họ nhà mài","Dám giành gái với bố","Chết nè","Xem chiêu!","Biết bố mài là ai không","Xuống địa ngục đi","Này thi cắn","Bỏ tật nghe chưa","Thích thì cứ nhích","Thích thì chiều","KS = đồ cmn sát","Ngu mà còn nguy hiểm","Quánh tao hả mại","Bớt nghe chưa","Láo nha láo nháo","Nhớ mặt tao nghe chưa","Làm gì nhau?","Thiến nó!","Đường này là do ta mở","Một lời không hợp, khai làm","Bày đặt này nọ","Sống cho tử tế vào","Mình anh chấp hết","Gà!","Đập vào mặt","Đừng có chọc tao","Định mệnh","Đồ sát!","Coi chừng tao à","Đừng ép ta","Đừng có giỡn mặt","Yếu mà còn ra gió","Ta không vào địa ngục, ai dám vào?","Anh mài thích","Rồi sao?","Này thì quánh em tao","Đừng nói nữa","Chấp 10 thằng như mài","Sẽ dùng mạng của mình đổi mạng của hắn","Đánh phủ đầu, không cho địch kịp phản ứng","Thập tử vô sinh","Còn kém rất xa","Ngươi là rụt đầu ô quy","Chưa hề thua ai","Không dám ló đầu","Thật bội phục","Đến! Tiếp tục!","Không dám lên tiếng?","Quá mẹ nó quỷ dị","Ra luyện 1 chút a","Ngu xuẩn","Kim cương bất hoại","Càng đánh càng thuận tay","Không chỉ một lần ăn thiệt thòi","Không thể chống lại","Không có chút nào đau đớn","Ai chịu, ai khó chịu?","Đạo hữu, nắm đấm của ta cứng hơn","Vẫn là không ngăn được bước tiến của hắn","Ngươi, chọc giận đến ta","Không thèm để ý","Chỉ mới thăm dò","Ta còn chưa động toàn lực","Quyền chưởng va chạm","Ngươi vẫn là sâu kiến","Uy lực cũng rất bá đạo","Trực tiếp đưa vào Quỷ Môn Quan","Dứt khoác cũng lưu loát","Không phải tất cả đều là phế vật","Gào vang dội, không có gì dùng","Rất là chói mắt!","Con hàng này từ đâu xông tới","Ngươi sẽ chết rất thê thảm","Chống đỡ!","Thật còn sống","Ngươi đoán không sai","Đánh cho thiên băng địa liệt","Ngươi nhận ra ta","Đứng cũng ko vững","A!","Trở về","Không sợ bị đánh chết","Còn tốt?","Ai sợ ai","Muốn ngươi 1 chút huyết","Đợi ngươi rất lâu","Cậy mạnh a","Cùng nhau lên đi","Không phải trò đùa!","Trò vui kết thúc","Còn chưa đã ngứa","ở đâu ra lực lượng","Ván này ngươi thua","Coi là thật bá đạo","Chưa hẳn là hắn đối thủ!","Đỉnh phong nhất 1 quyền","Ta nói qua, ngươi không diệt được ta","Ngăn không được hắn!","1 kiếm tiếp 1 kiếm","1 đao tiếp 1 đao","1 thương tiếp 1 thương","1 côn tiếp 1 côn","4 phương 8 hướng đều có địch","Mặt mũi của ngươi không phải bình thường lớn","Như 1 cục đá mài đao","Không thể đùa giỡn","Đến chết đều là phiền muộn","Ngắm quá chuẩn","Chạy? Cái nào chạy?","Không dám khinh thường","Sức mạnh cấm kị bay múa","Không dám nói nhảm","Đều đáng sợ như vậy sao","Hơn phân nữa sẽ chết","Không cho ngươi thở dốc cơ hội","Khó gặp được 1 cái lạc đàn","Đến đánh a","Đại triển thần uy","Là ai đều vô dụng","Một chưởng thường thường không có gì lạ","Nhất kiếm trảm đoạn","Ngươi đổi ý?","Ngươi uy hiếp ta","Lôi đình 1 kích","Nhìn ra mánh khóe","Rất tốt","1 chưởng vỗ toái","Một kiếm một cái","Cũng quá dễ dàng","Đánh ngươi thành cám","Tìm người phát tiết","Không dám chiến?","Cố ý, ngươi chính là cố ý","Kia là sát cơ","Ngươi có thể ngậm miệng không","Cực không an phận","Thật có một chút không chịu nỗi","Sẽ sớm kết thúc","Đừng vội, còn chưa xong","Ngược lại là tốt","Không đơn giản như vậy","Mốt chỉ khai vị","Hủy thiên diệt địa công phạt","Ai đến đều vô dụng","Đằng sau còn có","Ta không có địch thủ","Chiến lực giảm bớt đi nhiều","Tuyệt đối chiếm thượng phong","Bất tử bất diệt lực lượng","Quả nhiên không tầm thường","Bá thiên tuyệt địa a","1 đầu tuyệt lộ","Tĩnh đến đáng sợ","Trong mắt đều khắc tơ máu","Ta không bằng ngươi","Ngươi lật đổ ta nhận biết","Chấn kinh ngươi thủ đoạn","Ngươi thật sự nghịch thiên","Thật là đáng sợ","Dùng ngươi hiến tế","Trấn!","Không biết xảy ra chuyện gì","Cam nguyện làm kia quân cờ","Xem ngươi sợ","Có chút hoảng hốt","Không thể nói?","Uy áp thật đáng sợ","Mày phải trả giá","Tán cho bộp tay nè","Anh thứ 2 thì ai thứ nhất","Heo lửa xong vô chảo","Bóp dzú long trảo thủ","Xem chiêu nè","Không đánh mặt","Buồn nôn ghê","à há","Quân tử động thủ không động khẩu","Quân tử động khẩu không động thủ","Chúng ta không thuộc về nhau","Chúng ta không là của nhau","Giờ em hối hận chưa","Đồ cái thứ ngu","ồ thế à","Dám phản bội ta","Ngươi gan lắm","Đồ thỏ đế","Chỉ cần một chiêu","Phải ráng xíu nữa","Đồ sâu kiến","Thứ giống ôn","Nhãi ranh","Cho ta diệt","Thừa dịp bệnh, đòi mạng ngươi","Nợ máu phải trả bằng máu","Ra lẫn vào, đều phải trả giá","Ta không ngu","Tỷ thí không","Ngươi thật lợi hại","Vũ khí của ngươi xịn quá","Da mặt ngươi thật dày","Nhức hết cả trứng đây này","Đứng im đó cho ta","Ngon thì đánh nữa đi","Ơ kìa?","Đừng dừng lại","Quyết không đầu hàng","Dám nghịch ta","Nghịch là chết","Cho ngươi 1 cái thông khoái","Cho ta 1 cái thống khoái","Chừa nghe chưa","Tổ tông 18 đời nhà ngươi","Giác ngộ đi","Cái thứ gì","Cẩn thận","Coi chừng","Ăn ta 1 đao","Quân tử trả thù, 10 năm không muộn","Ta cần một cây thương mới","Ta cần một cây kiếm mới","Ta cần một phi đao mới","Ta cần một cây côn mới","Ta cần một vũ khí mới","Đao của ta mẻ hết rồi","1 chiêu tuyệt mệnh","Mệt chết đi được","Sống đến bây giờ đã là kỳ tích","Ta sẽ không ngã xuống","Ta sẽ không tha cho ngươi","Đầu hàng đi","Ngươi chạy không thoát a","Không đường về rồi","Mẹ nó chứ","Tức quá mà","Đù mé","Tẩn nhau đê","Có chút phấn khởi","Không sai","Đến lúc rồi","Ngươi chờ đó, ta gọi đệ","Vận mệnh ta là do ta nắm giữ","Không có lửa sao có khói","Hận a!","Nếu biết trước thì đừng có làm","Ta không xong rồi","Chắc không qua nổi con trăng này","Ngươi tự sát đi","Thà chết chứ không chịu nhục","Đồ sở khanh","Ngươi dám qua cầu rút ván a","Ta thu thập ngươi","Phần lễ này ngươi có thích","Ngươi thật ngưu bức a","Ta là cái mang thù người","Ta sẽ dạy ngươi cách làm người","Thật là nghiệp chướng","Nghiệt súc","Thắng ta, dễ vậy sao","Đường đường là nam nhi, sợ sao?","Tiện nhân, ngươi cái tiện nhân","Siêu quân bạt tụy a","Đồ gian lận","Dám công bằng 1 trận chiến?","Tiếp ta 1 chiêu!","Qua 3 chiêu không?","Trong 10 chiêu, tất bại ngươi","Nực cười thật","Ngươi giết không được ta","Ta giết không được ngươi?","Ta không thể thua được","ồ vậy sao","Nhục mặt chưa?","Nhục nhã, thật là nhục nhã","Ta khi ngươi, thì sao?","Đừng hòng chạy trốn","Thắng hay bại, chưa biết được","Cớ sao lại quánh ta","Ngươi thật độc ác","Mạng ngươi, ta lấy","Miệng ngươi thật là tiện","Ta thay ngươi hổ thẹn","Không sợ ngươi","Đừng có nói nhảm nữa","Để xem có ai cứu được ngươi không","Thắng ta, vật này là của ngươi","Vật này vốn không thuộc về ngươi","Cứu, cứu ta a","Có gan thì đừng chạy","Nói nhiều quá","Đập phát chết luôn","Đùa với anh à","Ngươi không thể so sánh với ta","Dụng tốc bất đạt","Cứ từ từ","Thật bá đạo","Tất cả là do ngươi","Dừng tay lại","Muốn nữa không","Ngươi thật nham hiểm","Từ bỏ đi","Ta không sai","Ta không tin","Hự hự","Xay da da, cà na xí mụi","Đừng giả vờ nữa","Thật bi thảm","Đừng nhìn ta","Ngươi gan đấy","Gan ngươi thật mập","Ngày sau tất diệt ngươi","Yếu còn ra gió","Để xem ai lợi hại hơn","Ta ngưu hay ngươi ngưu","Ngươi không vong thì ta vong","Hự!","Đau quá!","Toang rồi","May quá xá","Ngươi chết không thể nghi ngờ","Thắng bằng niềm tin à","Ngươi điên thật rồi","Không phải do ngươi yếu, mà là ta quá cường","Quyết không hối hận","Ngươi tay to hay ta tay to","Để mạng ngươi lại","Mạng đổi mạng","Mạng đền mạng","Có thù tất báo","Đánh chưa thống khoái","Có thành ma cũng không bỏ qua","Ta sẽ thay huynh ta báo thù","Ngươi không đáng là ta huynh đệ","Mạng ngươi tất là của ta","Nhớ mặt ta đó","Đồ khốn nạn","Ngươi là ta thiên địch","Ta có hứng thú với ngươi","Trồng rau 18 năm, để rồi cho heo ủi","Ngươi dám đánh ta","1 mình ngươi, không đủ ta đánh","Của ngươi là của ta","Thiện tay, thiện tay","Lòng tham sẽ giết ngươi","Đấy không phải là sự thật","Tin hay không tùy ngươi","Dừng tay lại a","Bình sa lạc nhạn, chổng mông ra sau","Tư thế này hơi kì lạ","Bối rối quá","Tạm nghỉ 2 phút","Ngươi sao lại mạnh như vậy","Chuyện ngươi nói thật nực cười","Quay đầu là bờ, suy nghĩ lại đi","ý ta đã quyết, không thể thay đổi","Ngươi là đồ vong ơn phụ nghĩa","Đó là lỗi của ta","Bại ta, mặc ngươi xử lý","Thắng ngươi, ngươi là của ta","Ngươi bại, theo ta đi","Ngươi còn non và xanh lắm","Nợ cha, con trả","Cha làm, ta chịu","Không phải xoắn","Cược người hay cược mạng","Mạng ngươi, không đáng giá","Hơn nhau, chỉ nhất chiêu","Ngươi luyện công thêm 10 năm nữa đi","Ngươi không đủ tư cách","Ta đã có người khác","Ta yêu ngươi, vì sao lại phản bội","Thật muốn không chết không thôi?","Ngươi có tư cách đó sao","Đừng để cá chết lưới rách","Ta và ngươi đồng quy ư tận","Trận chiến này sẽ mở ra kỷ nguyên mới","Bất ngờ thật","Thời đại này là của ta","Thay mặt đại ca, ta trảm ngươi","Nhất định chém ngươi","Tự kết liễu đi","Đừng nằm mơ","Ngươi tỉnh lại đi","Đừng để ta phải ra tay","Trận chiến này nên kết thúc","Ta chỉ có thể nói lời xin lỗi","Ngươi quá xem thường ta rồi","Xem thường ngươi","Nghiêm trọng đánh giá thấp ngươi a","Là ta quá xem trọng ngươi","Không biết trân quý tính mạng","Mạng ta không thuộc về ngươi","Đừng mơ tưởng nữa","Ta cho ngươi thống khoái","Hiểu chuyện đến đau lòng","Chúng ta có thù giết cha sao","Có thù sao?","Sao lại đánh ta","Tha thiếu nợ ngươi hả","Đừng hòng thoát","Đưa tiền bảo kê đây","Đánh nhau cược mệnh","Ta thưởng thức ngươi","Đánh hay lắm","Tới, tới a","Hôm nay ngươi tốt chứ?","Thà chết vinh hơn sống nhục","Đấm vào mặt mi","Mệt chưa?","Bở cả hơi tay","Dừng lại a, ta đầu hàng","Cóc có sợ","Mạnh có chút ngoài dự kiến","Không quánh nữa, không quánh nữa","Quánh a, ngon quánh a","Cha ta là tướng quân","Tỷ ta là hoàng hậu","Quân tử phạm pháp, xử như thứ dân","Tiền trảm hậu tấu","Ngươi có năng lực đó sao","Ta có năng lực đó","Ta không quan tâm","Ta không hứng thú đánh với ngươi","Đừng nhây nữa","Ngươi đã hài lòng","Vừa lòng ngươi chưa","Hối hận cũng muôn rồi","Tha cho ta a","Bớ người ta, quánh người","Bớ người ta, cứu","Không ai có thể cứu ngươi","Vì ngươi, ta sẽ hóa ác quỷ","Ta mạnh hơn ngươi","Đồ yếu đuối","Thắng thua là chuyện bình thường","Ta không cầu danh vọng","Cút ra đây","Xa ta ra","Cút khỏi đây","Ta sẽ hủy diệt ngươi","Ngươi thử xem","Ngươi không biết nhục à","Ta sẽ không bỏ qua","Giỏi thì cứ cắn","Ăn tao đi","E hèm!","Báo ứng a","Muốn mang người đó đi, trước bại ta","Không cần phải giải thích","Đã hiểu","Đánh trước nói sau","Chỉ giỏi võ mồm","Có thể ngươi mạnh hơn ta","Phục hay không phục","Hàng hay không","Cầu bại một lần","Ta chưa bao giờ sợ ai","Ta chưa ngán 1 ai","Đời này ta chỉ bại 1 lần","Hắn nhập ma rồi","Mạng ta bởi ta, không do trời","Ta phục! Ta phục a!","Võ công các hạ thật cao thâm","Thâm khả mạc trắc a","Long có vảy ngược, ngươi chắc chắn phải chết","Chết không phải là ta, mà là ngươi","Không chờ được nữa","Ngươi ta bất phân thắng bại","Không thể thắng được hắn","Nhất định phải thắng","Ta thua, tông môn sẽ diệt","Tông môn ta sẽ không tha cho ngươi","Tới chết ta cũng không quên","Ngày này 10 năm trước, ngươi diệt ta cả nhà","Giết a!","Bại ta, phóng ngươi người thân","Người của ngươi, trong tay ta","Đồ bỉ ổi","Oan gia nên giải, không nên kết","Ta đây một thế anh danh, đã hủy","Nội lực của ngươi đã hết, kết thúc thôi","Chỉ là mới làm nóng người","Tự gây nghiệt, không thể sống","Có người nhờ ta giết ngươi","Muốn chém muốn giết, tùy ý","Ta đây mạnh hay yếu","Ngươi thật mạnh","Mạnh được yếu thua","Trai cò đánh nhau, ngư ông hưởng lợi","Ngươi chết, đó vĩnh viễn là bí mật","1 chữ: CHIếN","Đến 1 người, giết 1 người","Đồ lì lợm","Tại sao ngươi lại biết chiêu thức ấy","Tại sao ngươi lại biết chuyện đó","Rõ ràng ngươi yếu hơn ta","Không đành lòng a","Ngươi dám khi nhục muội ta","Ngươi đã thay đổi rồi","Ngươi không còn là ngươi nữa","Trang cái bức","Từng một thời, chúng ta là huynh đệ","Đánh đi","Ta đã đi trước ngươi một bước","Thế giới này không dành cho kẻ yếu","Ngươi trách ta sao","Hãy xưng tên ngươi ra","Sủa lớn lên","Sủa nữa đi","Ngươi cũng chỉ là con tốt trên bàn cờ","Ai thắng ai thua, chưa biết được","Vật ấy nhất định thuộc về ta","Ngươi không có cửa","Làm màu nữa đi","Lòng tham đã che mờ lí trí của ngươi","Có chuyện sao?","Ngăn cản hắn","Từ khi chia tay đến giờ không có về gì chứ","Chuyện gì?","Chưởng vừa rồi không tệ","Ngươi cũng không tệ","Thật bá khí","Ngươi mạnh, ta mạnh hơn","Chấp ngươi một tay","Cho ngươi quánh trước 3 chiêu","Mạnh như chó","Mạnh như cha ngươi còn không làm gì được ta","Ngươi giống hắn như đúc","Số phận trêu ngươi a","Không hiểu gì hết vậy?","Ngươi không phải thổi","Xưa đâu bằng nay","Ta đã khác xưa rồi","Ta đến đòi nợ","Thù cũ nợ mới, hôm nay thanh toán","Muội, hãy cho ta sức mạnh","Ca, ta thay ngươi báo thù","Có gan đơn đấu","Giọt nước mà đòi so với đại dương","Hạt gạo mà đòi so với nhật nguyệt","Ta hướng ngươi khiêu chiến","Sinh tử chiến","Ta là ai mà không dám","Không biết thương hương tiếc ngọc a","Hiện tại đã hiểu sao?","Thật cứng cỏi","Ta thân, đao thương bất nhập","Làm cho gọn gàng vào","Thể hiện đi","Chưởng này đủ hung mãnh","Thật là sâu a","Kiếm gãy người mất","Vì sao ngươi thật cường đại","Thiên hạ này, ta là đệ nhất","Sát khí thật mạnh","Ngươi hãy để cho ta đi","Kẻ như ngươi, không đáng để sống","Ngươi chết cũng không đền hết tội","Biết sai mà không sửa","Không cam lòng","Bại quá thảm liệt","Ngươi mau dừng tay a","Không ổn","Không xong rồi","3 tuổi, tiểu hài nhi","Chắc không qua khỏi","Hắn thật kiên cường","Bản lĩnh thật lớn","Ta bại không phải do ta yếu","Lui lui","Ngươi sẽ chết rất khó coi","Đồ phế vật","Đồ vô dụng","Chuông tang vì ngươi mà gõ","Rãnh quá","Đấm lòi 2 con mắt","Vô địch tín niệm","Có chút đạo hạnh","Một chiêu phân thắng bại đi","Kinh ngạc sao?","Ngươi không bằng hắn","Ta không phải hắn","Ta lợi hại không","Dạng chó hình người a","Tài năng thật xuất chúng","Vẫn là ngươi ngưu bức","Dám mắng ta","Đừng làm rộn","Ta có lời muốn nói","Không có tâm tình a","Đã lâu không gặp","Đóng cửa thả chó","ấn đường ngươi có màu đen a","Ai thua làm cháu trai","Não ngươi nhúng nước sao","Đáng tiếc a","Hắn là hắn, ta là ta","Hẹn ngày tái chiến","Hãy xem như đây là một bài học","Một đời này, chết không tiếc","Run rẩy đi","Lập trường khác nhau, tất xung đột","Thân pháp thật nhanh","Chiêu thức thật mạnh","Ngươi lợi hại!","Tại sao lại như vậy","Tới quá muộn","Tiếc nuối sao?","Ta như chết, ngươi còn nhớ đến ta sao","Ngươi chết sẽ không ai vì ngươi mà khóc","Trên tay ngươi là thần binh sao","Thật xin lỗi, ta cần vật ấy","Trả lại ngọc bội cho gia gia ta","Ngươi còn nhớ ngày đó sao","Ta cả đời này, sống chỉ để giết ngươi","Diệu hay không diệu","Xem đòn sát thủ","Đỡ chiêu","Hèn hạ!","Quá mạnh","Ta có thể nhận thua sao","Thắng ta 1 lần, không có nghĩa có lần 2","Có thể dừng tại đây","Các ngươi trên trời có linh, tất vui mừng","Sinh tử, mệnh do trời","ác với tui quá vậy","Là ta","Thay đổi thật lớn","Thần tiên đến cũng không cứu được ngươi","1 trong 2 ta phải chết","Là do ngươi hại ta","Ta chính là hung thủ","Mở mắt ra xem cho kỹ","Sống phải thấy người, chết phải thấy xác","Ngươi thật treo a","Bí mật ý sẽ cùng ngươi chôn cùng","Bí mật ấy sẽ cùng ta chôn cùng","Nếu ngươi là ta, ngươi sẽ làm thế nào","Nếu ngươi là ta, ngươi có dám","Vì saooooo","Ta thật vô dụng","Ngươi thật vô dụng","Ngươi không phải ta","Ta không phải ngươi","Tu vi của ngươi không đủ","Tu vi của ta không đủ","Tất cả do ngươi mà ra","Lần này là cảnh cáo","Chớ đi","Cơm có thể ăn bậy, làm không thể làm bậy","Lúng túng a","Không thể lại nháo","Không phục, đến chiến","Hé hé hé","Cái gì cũng không biết","Ư ư ư","Hảo tiểu tử","Thật làm được","Trang bức a","Ngươi diễn kịch rất giỏi","Vở kịch này là do ta viết","Ngươi thích chứ","Tự tìm kích thích","Không thể vượt qua rồi","Kiếm tiền sống qua ngày","Ngươi đang nhìn cái gì","Tuyệt không bôi nhọ tiền bối uy danh","Ngươi cản được ta sao","Hớ hớ hớ","Đừng có cậy già","Đạo đức, ngươi không có","Hậu sinh khả úy","Thật khó nuốt a","Ngươi cách xa hắn vạn dặm","Người không vì mình, trời tru đất diệt","Đáng tiếc thật","Triệt để kết thúc","Có chút cảm ngộ","Tiếc cho một nhân tài","Ngày này năm sau là ngày giỗ của ngươi","Cuồng, ta để cho ngươi cuồng","Không đành lòng nhìn thẳng","Không đáng để ngươi làm như vậy","Đứng còn không vững","Hiểu bao nhiêu?","Đáng để đánh đổi sao","Đáng a!","Đắng a!","Một khối tới","Đánh cho ngươi tàn phế","Ngươi là ngu xuẩn","Tất cả là tại ngươi","Ta có lỗi với liệt tổ, liệt tông","Mọi người, vĩnh biệt","Mọi người, ta đi trước 1 bước","Kiếp sau gặp lại","Nghiệp chướng, nghiệp chướng!","Ta già rồi sao","Thật đáng nghi ngờ","Đừng lừa dối nữa","Tiểu lưu manh","Có ý tứ","Ngươi tột cùng đang làm gì","Thời gian đúng là không tha một ai","Hi vọng a!","Hồng nhan họa thủy","Hồng nhan bạc phận","Ta thật hối hận","Ta không hối hận","Ta không thể chết","Chết không phải là hết","Chết cũng không hết tội của ngươi","Việc ác ngươi làm... thiếu sao","ọc ọc ọc","ừm hửm","Giấu đầu lòi đuôi","Ngươi đã bị phát hiện","Hiện nguyên hình đi","Chẳng bao giờ thấy làm việc tử tế","Đại tạo hóa a","Đồ thất nhân ác đức","Miệng ngươi thật thối","Nhất kiếm định sinh tử","Ca này ta không cứu nổi","Thật bệnh hoạn","Bớt gào thét đi","Không có đường lui","Hoặc là thành, hoặc là bại","ách... ách... ách","Ngươi dám tiến tới?","Ngược lại ta muốn thử xem","Ngược lại ngươi thử xem","Không còn gì để nói","Không đáng để nói","Vi sư không có đồ đệ như ngươi","Đừng mà","Không thể tin được","Nước cờ này, ta có thể đi lại không","Nước cờ này không thể đi lại","Ngươi không có sự lựa chọn","Bản lãnh thật lớn","Cách tốt nhất là giết ngươi","Thế nào lại như thế","Ngươi là cái biến số, cần diệt","Đừng để ta thất vọng","Phải như thế chứ","Tới phiên ta","Quá đủ rồi","Ta thách ngươi","Đừng thách thức ta","Năm nào nhất định chém ngươi","Sự chịu đựng của ta là có hạn","Đau tim quá","Né được chiêu rồi","Tất cả đã là quá khứ","Ngươi còn dám giấu diếm sao","Phát hỏa rồi à","Tạch cmnr","Năng lực của ngươi chỉ thế sao?","Còn không chạy?","Cách ngươi làm là sai","Ngươi chỉ là chó săn","Thật không dễ chịu","Hơn phân nữa là chết","Đau quá đau","Lực bất tòng tâm a","Có thể","Tư thế thật đẹp","Hảo chiêu","Thường thôi... thường thôi","Nói như thế nào đây","Cứ vậy mà phát huy","Chóng mặt quá","Bây giờ mới biết sợ sao?","Ta không cam lòng","Hữu tâm vô lực","Liều chết đánh cuộc 1 lần","Như thế nào như thế","Liền như vậy","Thật nghịch thiên","Thời đại này thật hỗn loạn","Vô pháp nghịch chuyển","Ân tình này, kiếp sau trả","Cái giá phải trả là quá đắt","Ngươi không làm được","Có chút không chịu được","Nóng hết cả mặt","Quỷ dị thật!","Ngươi sẽ không thấy ngày mai","Ngươi đang làm cái gì?","Mùi máu thật tanh","Ta thích máu","Hỗn loạn không chịu nổi","Mùi máu nóng quá","Đồ máu lạnh","Thì ra chính là ngươi","Vì ngươi mà ta mất tất cả","Sặc","Ta mới chỉ dùng 1 thành công lực","Hoài nghi nhân sinh a","Giết ngươi, chỉ cần 1 ngón tay","Không đúng","Ngươi từng nghĩ đến ngày này?","Không sớm thì muộn cũng kết thúc","Ngày này cuồi cùng cũng đến","Ta khinh thường ngươi","Không như trong tưởng tượng","Không đáng chú ý","Ngươi dám làm người ấy buồn","1 mình ta là đủ","Kinh nghiệm chiến đấu thật phong phú","Vô cùng yếu đuối","Ngươi đáng là đối thủ của ta","Lười nhát nói nhảm","Đã như vậy, không cần phải giấu nữa","Nghiền ép a","Thực lực của ngươi","Làm gì mà dễ ăn như vậy...","Làm sao?","Ngươi thật khó nhai","Quá khen... quá khen","Ta không phải là đối thủ của ngươi","Tin hay không","Đã không phải là việc trọng yếu","Hộ giá, hộ giá","Tại sao các ngươi lại đứng nhìn","Có chuyện gì đó không đúng","Giác ngộ chưa?","Ngươi gánh không nổi","Muốn thử một lần","Ngươi không còn cơ hội","Thật cảm động","Định số rồi","Ngươi đã bỏ qua thời cơ","Khí thế thật bàng bạc","Thật vô song","Ta còn lạ gì ngươi","Thừa nước đục thả câu","Ta có thể nói một câu được không?","Quỳ xuống!","Phản nghịch!","Phản tặc!","Thật là ngông cuồng","Đồ ngạo mạn","Vậy thì chết đi","Tu vi lại không thấp","Người so với người, tức chết người a","Thế cờ đã định, không thể thay đổi","Cứ cho là như thế","Ngươi cái tiện nhân","Kết thúc rồi!","Xong!","Vô ơn, bội nghĩa","Tránh xa ta ra","Bỏ tay ra","Ngươi đang hù dọa ta sao","Thần cản giết thần","Phật cản giết phật","Không có cái gì gọi là công bằng","Nhân thần cộng phẫn vì ngươi","Vô dụng thôi","Bọn chuột nhắt","Không lẽ ta sẽ chết tại đây sao","Không may, ngươi đụng phải ta","Đá phải tấm sắt rồi","Tưởng dễ ăn à","Thấy chuyện bất bình, ra tay tương trợ","Người tốt không làm như vậy","Mạnh, thật mạnh a!","Ngươi không có lương tâm","Lương tâm ngươi bị cẩu tha sao?","Tiền là tất cả","Ta hối hận rồi","Đánh bại ngươi","Ta cược là ngươi thua","Yên chí an nghỉ đi ha","Ngươi còn dám đến gặp ta sao?","Sao lại không dám","Ngươi quản không được ta","Không thể tha thứ được","Không thể thế được","Tức chết ta","Xin hãy buông tha ta","Cầu xin ngươi","Hãy để ta yên"],"general":["Chà, đông quá nhỉ!","Thèm ăn kẹo hồ lô quá :L","Đừng chọc tao","Mợ nó, hết tiền rồi","Hey, cho em ít vàng","Ước gì mình có con Chiếu Dạ","Ê mài, gái kìa","Tui đẹp quá mà","Chút xíu đi săn boss HK ko?","Nước sôi! Nước sôi","Đẹp trai có gì sai","Ước gì mình có bồ nhỉ","Thằng An thiếu tiền chưa trả","Kỳ này kéo hội đánh nó mới được","Thằng kia có tiền đấy","Trốn đằng nào với ông","Hôm nay trời mát nhỉ","Quán cháo lòng ngon quá :)","Thằng nào đánh lén tao :@","ks = ds","Dang ra! Dang ra!","Không biết quan binh ở đâu","Cô nương kia xinh thật","ủa gì dạ","Hủ tiếu ngon nhỉ","Tương Dương này có gì vui?","Đừng để tao gặp :@","Tôi bị móc túi rồi :L","Hết tiền rồi sao giờ?","Đường xa mệt quá","Tiệm vũ khí ở đâu nhỉ ?","Làm sao luyện skill ta?","Nghe nói Dương Châu đang mưa","Mình bị bệnh rồi","Thành Đô Lâm An Đại Lý ta tìm nàng","Tìm em giữa Dương Châu chiều mưa","Đi đu đưa đi","Con Siêu Quang kia đẹp quá","Bộ HKMP kia vip nhỉ","ép 6 dòng mà xịt hoài :L","Đánh hoài không thắng nổi","Mua võ lâm mật tịch đây!!!!","Ai bán bk NMC ko?","Bán Thủy Tinh đây!!!","Thèm nước mía quá!!!","Nguy hiểm! Chạy lẹ!","Tôi không thể hát live!","Buồn làm chi em ơi !","Ai ve chai dép đứt thao nhôm bán hôn ?","Xin đừng hôn tôi","Tao ghim nó nãy giờ","Hay là mình giật tiền nó nhỉ","Mùa đào năm nay đẹp thật","Lại hết tiền rồi","Nha môn tháng này chưa phát lương","Quán trà Ô Long thật nhạt nhẽo","Đường hôm nay vắng các cô nương nhỉ","Nghe nói Liễu Thanh Thanh đang ở gần đây","Hình như Huyền Giác Đại Sư mới vừa đi qua","Có nên cướp nha môn không nhỉ ?","Tình hình Tống Kim có vẻ căng đây","Giang hồ đồn rằng có kẻ thành lập ác Nhân Cốc","Thèm bánh bao quá","Đau bụng quá","Đào của nhỏ kia bự ghê mài","Cô nương à, cho sờ cái ấy được khum?","Mình thiệt là biến thái mà, hí hí hí","Ăn dép không?","Đồ khó ưa","Tiểu nhị, tính tiền!","Đậu xanh rau muống nó","Yêu em là anh sai","Mẹ ơi, con muốn lấy nhỏ kia","Dạo này nghèo quá","Con gái sáng nắng, chiều mưa","Tình là bụi, phủi là bay","Dân chơi thì sợ mèo gì mưa rơi","Yêu vội là ngu vl","Má dặn còn nhỏ không cho yêu","Bớt cà khịa đi nha","Nhan sắc có hạn, thủ đoạn thì có thừa","Tiền không phải là tất cả nha","Sai thì sửa, mà chửa thì đẻ...","Muốn thành cao thủ, nhất định phải cày đêm","Mua kích HSL >5% đâyyyy","Ai bán phi phong pmmmmm","Chiều đi câu cá không mài","Tuyển người vào bang","Còn tiền không? Cho tau vay ít đi","Tối nay nhậu nha!","Đau bao tử quá, làm sao giờ","Đôi khi muốn giết thằng đẹp trai nhất thế giới","Mắc ói ghê!","Bánh bao đi cô bác ơi","Hihihi!","Tao còn có 5Kv à","Mới bị bồ tát vào mặt, huhuhu","Tui khổ quá mà","Đang thất tình","Tối nay ăn cơm với cá","Tối nay ăn cơm với trứng","Làm 1 xị không mài","Hế lô!","Hát một bài nghe chơi đi!","ú là la","Nghe nói Tương Dương có hội chợ","Tiền đâu mà nạp đây","Trời lạnh quá","Bây giờ phải làm sao, haizz","Haizzzz!!!","Tau đi báo quan","Đói bụng ghê","Tránh ra, người yêu kiu tau về gấp","Làm nháy đi mà","Không sợ chó","Loa loa loa, mất hết cái loa","Máu của tau ít quá, sốc dame","Ngon thì ra Nam Biện Kinh múc nhau nè","Mua nhẫn hệ mộc kháng cao, ai có pm","Cô đơn quá","Côn Lôn có gái đẹp!","Pty em vớiiiii","Đường nào đi Lâm Du Quan vậy?","Tau đi săn boss sát thủ rồi","Bán dây chuyền KTC 18, ai quan tâm pm","Bán giày tốc độ 40 - hệ thổ, 1k2v!!!","Mua bí kíp Cái Bang Rồng, ai có hú em cáiiii","Mua Ô Vân Đạp Tuyết!","Mua Đường Nghệ Giáp ngon, hệ Thổ","Mua bao tay nam hệ Hỏa, PTVL > 15%","Hồng nhan họa thủy","Nợ nầng chồng chất, huhuhu","Tống Kim kìa!","Mua tiền vàng SLL, ai bán hú em","Tình yêu không có lỗi, lỗi do tau xấu","Dã Tẩu khắm vl","Về Thành Đô Tây giao dịch!","Bác sĩ bảo cưới","Lên Mạc Cao Quật train đi","Sa Mạc 3 đồng người quá, đổi chỗ khác","Con TVB kia nó quánh em","Đúng rồi","Tối đi ăn ốc không?","Tau hết tiền rồi","Là lá la","Đồ con người ác độc","Đồ máu lạnh","Hết thổ địa phù rồi","Chết cha, quên mua Thổ Địa Phù","Anh ơi, cho em ít tiền đi xa phu với","Tìm sư phụ, hứa sẽ ngoan","Tìm người yêu","Chút nữa báo danh bên Tống nha","Tau đi bên Kim","Nhớ em!","Nhớ anh!","Cuộc đời sẽ lạc trôi về đâu?","Tránh đường cho quan","Cười xấu vl","Trời ơi là trời","Xu cà na rồi","Nghèo còn hơn con mèo nữa, hic","Ước gì anh ở đây giờ này","Đến khuya rồi vẫn còn đếm sao","Hôm nay về sớm cúng mùng 1","Mới bị vợ chửi","Bị thằng kia lừa hết 1kv","Bang tuyển mem công thành","Ô cê con dê","Mè nheo vl","Chúc bạn may mắn lần sau","Em muốn cắt đôi nỗi sầu","Người ấy yêu tôi chỉ vì tiền","Chỉ có cái miệng là giỏi","Bán đồ Dã Tẩu, quẹo lựaaaaa","Mua vũ khí LSNC giá cao","Đường nào đi Khỏa Lang Động?","Mới quánh rớt bí kíp NMK nè!","Mẹ cái con Côn Lôn Bùa","Mua bổng BS >30, ai có pm!","Mai lại phải đi làm, mệt ghê","Nhớ bồ cũ quá","Rồi mài sẽ gặp quả báo thôi con ạ","Liều ăn nhiều","Chiều nay chắc làm con lô","Tuyển Nga Mi VIP đi vượt ải, team ngon!","Còn 1 slot săn boss sát thủ","Xin 1 slot săn boss sát thủ","Mua đao cấp 10, hệ kim HNL","Mua KNB đây","Về Tương Dương coi mua lân đi","Tau đang qua Trường Bạch lượm ve chai","Mới nằm mơ thấy rớt được cái nhẫn Vô Danh","Trời lạnh ghê!","Mai chắc nghỉ ở nhà","Sắp bệnh rồi","Thôi đi về ngủ","Ta lạc trôi giữa trời","Đông sang anh nhớ em","Không say không dìa","Say đến điên dại, say hết kiếp người","Tháng năm thăng trầm, dòng đời ngả nghiêng","Mình chẳng cùng với nhau, đi hết quãng đường","Ngày xưa tôi cũng yêu người tôi yêu đẹp xinh","Tại sao giờ chúng ta lại lìa đôi","Là do ai vô tâm?","Đã rất lâu không có ai bên cạnh","Muốn được ai đó ôm","Ngày xưa ấy đôi ta bên nhau không rời","Ta muốn làm Võ Lâm Minh Chủ","Đừng khóc, đừng buồn nha em","Tàn đêm nay là mình chia tay","Tình đôi ta hôm nao, bao thiết tha mặn nồng","Chưa yêu lần nào biết ra làm sao","Lỡ yêu người ta gieo trái ngang","Bao năm qua rồi còn gối chiếc","Em sẽ là người ra đi","Hôm nay có mưa, mưa rơi rất nhiều","Mong ánh sao trời kia ngừng mãi nơi đây","Cho xin 2 vạn anh ơi","Mới bị trộm ghé nhà","Mới bị ba quánh","Gia trưởng mới lo được cho em","Khát nước ghê","Có công mài sắt có ngày nên kim","Đường môn quánh kinh vl","Lương tâm cắn rứt quá","Cần vay tiền","Em nghèo quá, huhu","huhuhu","Không thể chấp nhận sự thật này","Thấy tận mắt, bắt tận tay","hahaha","Cần tìm đệ tử","Nghe nói muồn lập bang phải có Nhạc Vương Kiếm","35 tuổi mà còn ế nè","Buồn làm chi lệ hoen bờ mi","Tiền lương không đủ trả tiền nhà. hic","Xin lỗi. Con bất hiếu","Coi chừng bị cắn lén","Quần ẩu mới là vương đạo","Soái hay không soái?","Đừng solo giống như Võ Dang Kiếm, nếu không tự tin","Coi chừng bị hấp","Cô đơn giữa chốn ao hồ","Méo hiểu gì cả","Luyện skill lâu vãi lọ","Cần mua Tiên Thảo Lộ","Cần bán Quế Hoa Tửu","Bán Lục Thủy Tinh đây","Bán 5 Tinh Hồ Bảo Thạch, xin cái giá","500 anh em đến Dương Châu xem đánh nhau nè","Shop đồ max Kháng mở tại Hiệu Thuốc Thành Đô","Hôm nay đẹp trời, thích hợp để nói chia tay","Ai bán phúc Duyên không?","ép cây vũ khí bị xịt mất tiêu","Nhìn mặt ta thấy có tiền hả?","Hẹn gặp lại","Chạy lẹ","Trễ giờ rồi","Đang cảm thấy không được khỏe","Có cái mùi gì đó là lạ, ngộ ngộ","Hắc xì hơi","Tiền đâu mà mua gạo đây","ồn ào quá","Oan uống quá, bao Đại Nhân","Cóc ghẻ mà đòi ăn thịt thiên nga","30 năm hà đông, 30 năm hà tây","Người ta sinh ra ở vạch đích","Đường vào tim sao băng giá","Xin đừng yêu tôi","Có chuyện gì thì từ từ nói, bình tĩnh","Yêu hay không yêu?","Hay là mình cứ bất chấp yêu nhau đi","Bắt con kiến bỏ trong quần","Tiểu đệ đệ của ta thật hùng tráng a","Đo xem của ai to hơn không","Mình thật ngốc nghếch","Sau cơn mưa là cầu vòng","Sự thật mất lòng thôi","Người yêu mới cắm sừng tao","Thôi đừng buồn nữa mà","Buồn làm chi em ơi","Giờ tí canh ba, cần thận củi lửa","Đúng là tiền nào của đó mà","Ăn phải đồ ăn cũ... bị trúng thực","Nghe nói, có thần thiết sẽ đúc được thần binh","Ta đến từ Thần Binh Sơn Trang","Nơi đây thật đẹp","Yên bình quá","Thật là an nhiên","Cảm thấy dễ chịu","Tới giờ đón con rồi","Biện kinh có biến","Thành Đô thật giàu có","Ai mà chẳng muốn cuộc sống giàu sang","Một ngày là huynh đệ, một đời là huynh đệ","Tạm biệt, ta sẽ bế quan 10 năm","Người lạ ơi, cho tôi mượn bờ vai","Mệt quá đê","Cứ thế mà triển","Bán nghệ không bán thân","Bán thân không bán nghệ","Đừng xa em đêm nay","Thế gian này nguy hiểm nhất là lòng người","Bang mình nhất định có nội gián","Đêm nay ngủ ở đâu?","Cô cô, ta yêu ngươi","Không bự nhưng mà múp","Có thể giảm cho ta chút ít?","Ngươi có lương tâm không?","Cuộc đời lên voi xuống chó","Ta hận thiên","Anh khạc hay em khạc","Thật chói chang","Sau cơn mưa trời lại sáng","Mua 2 tặng 1 đây","Tan chợ cmnr","Chiếc dép rớt đâu mất tiêu rồi","Người yêu yếu sinh lí quá","Các hạ cho ta hỏi thăm...","Zè zé ze","Chuyện này tất có mờ ám","Có việc gì cho ta làm không?","Thiếu thiếu cái gì đó","Có máu có thịt, vì sao vô tình","Thật là thấm thía","Khóc không thành tiếng","Việc vui không chỉ có một","Lại 10 năm trôi qua","Giận rồi!","Tau thích mi","Đang mệt nha, đừng có chọc","Tiên tử, xin tự trọng","Con đường tương lai thật tươi sáng","Ngươi có lòng tự trọng sao?","Ca, ta nhớ ngươi","Thèm chua quá trời","Ai đánh em ta?","3 ngày rồi chưa tắm, thúi quắc luôn","Cả ngày chưa được ăn gì","Mới bị giật hụi","Huynh đệ, cho ta chút mặt mũi","Chuyện lạ có thật","Gạo nấu thành cơm mất rồi","Còn không trễ","Làm sao để tìm được nàng?","Hắt xì hơiiii","Đứng im, đừng nhúc nhích","Ca này khó!","Có sao thì sống vậy","Nhà giàu mà keo kiệt","Thật hâm mộ Doãn Chí Bình","Ta muốn đi ngủ","Cờ bạc là bác thằng bần","Bần cùng sinh đạo tặc a","Biết vậy ta gia nhập Võ Đang","Biết vậy ta gia nhập Thúy Yên","Biết vậy ta gia nhập Nga Mi","Biết vậy ta gia nhập Thiếu Lâm","Biết vậy ta gia nhập Thiên Vương Bang","Biết vậy ta gia nhập Ngũ Độc Giáo","Biết vậy ta gia nhập Đường Môn","Biết vậy ta gia nhập Cái Bang","Biết vậy ta gia nhập Thiên Nhẫn Giáo","Biết vậy ta gia nhập Côn Lôn Phái","Biết vậy ta gia nhập Hoa Sơn","Biết vậy ta gia nhập Vũ Hồn","Biết vậy ta gia nhập Tiêu Dao","Cái Bang thiên hạ vô địch thủ","Thiếu Lâm thiên hạ vô địch thủ","Thiên Vương Bang thiên hạ vô địch thủ","Ngũ Độc Giáo thiên hạ vô địch thủ","Đường Môn thiên hạ vô địch thủ","Thiên Nhẫn thiên hạ vô địch thủ","Nga Mi thiên hạ vô địch thủ","Võ Đang thiên hạ vô địch thủ","Côn Lôn thiên hạ vô địch thủ","Tiêu Dao thiên hạ vô địch thủ","Vũ Hồn thiên hạ vô địch thủ","Hoa Sơn thiên hạ vô địch thủ","Nghe nói, ngày mai có Hoa Sơn luận kiếm","Thèm Mì Vịt Tiềm quá","Thèm Hủ Tiếu quá","Thèm Phở quá","Thèm Heo Quay quá","Thèm Cua quá","Thèm gái quá","Thèm Sầu Riêng ghê","Muốn ăn xiên que","Muốn ăn thịt nướng","Răng sâu mất rồi","Đang bị viêm họng","Thèm gà nướng quá","Lâu rồi chưa đi nhậu","Tối nay có rãnh không","Định tối nay đi ăn trộm","Làm như vậy đủ rồi","Võ công dạo này tiến bộ chậm quá","10 năm rèn sách lại thi rớt","Tuột hết cả hứng","Để vợ lên đầu chết a","Để vợ lên đầu trường sinh bất tử nha","Dạo này không có đi làm","Cha ta dạo này vẫn khỏe","Mẹ ta vẫn tốt","Nào rảnh ghé nhà ta chơi","Tỷ của ta ngày càng xinh đẹp","Đi bộ mỏi chân thật","Vật giá ngày càng leo thang","Lương càng ngày cang ít","Kinh tế thật khó khăn","Ngươi vẫn ổn đó chứ","Đại sư tỷ, ngươi ở đâu","Sư phụ tha thứ cho ngươi","Đệ đệ, đi thanh lâu không?","1 đêm, 2 xị","Dượng ta ngoại tình, dì ta đang khóc","Vợ ta đang có thai","Tìm khắp thiên hạ không thấy Hợp Hoan Tán","Hoa Sơn Tuyết Liên lại xuất hiện","Hoàng Kim Quả ở tại núi Trường Bạch","Đào Hoa Nguyên xuất hiện cao thủ","Yến Tử Động xuất hiện cao thủ","Kiếm Các Thục Đạo xuất hiện cao thủ","Cái Bang xuất hiện cao thủ","Nga Mi xuất hiện cao thủ","Thiếu Lâm xuất hiện cao thủ","Thiên Vương xuất hiện cao thủ","Ngũ Độc xuất hiện cao thủ","Đường Môn xuất hiện cao thủ","Thúy Yên xuất hiện cao thủ","Thiên Nhẫn xuất hiện cao thủ","Côn Lôn xuất hiện cao thủ","Vũ Hồn xuất hiện cao thủ","Tiêu Dao xuất hiện cao thủ","Hoa Sơn xuất hiện cao thủ","Ngựa quý tìm thấy tại Ba Lăng Huyện","Ngựa quý tìm thấy tại Long Tuyền Thôn","Ngựa quý tìm thấy tại Giang Tân Thôn","Ngựa quý tìm thấy tại Vĩnh Lạc Thôn","Ngựa quý tìm thấy tại Long Môn Trấn","Ngựa quý tìm thấy tại Chu Tiên Trấn","Có đánh nhau lớn tại Biện Kinh","Có đánh nhau lớn tại Thành Đô","Có đánh nhau lớn tại Dương Châu","Có đánh nhau lớn tại Đại Lý","Có đánh nhau lớn tại Phượng Tường","Có đánh nhau lớn tại Lâm An","Có đánh nhau lớn tại Tương Dương","Chỉ là tiểu đả tiểu nháo","Thu mua Huyền Thiết!","Thu mua Tinh Hồng Bảo Thạch!","Thu mua Thủy Tinh Các Loại!","Thu mua Bí Kíp các phái!","Thu mua Huyền Tinh!","Thu mua Tàng Bảo Đồ!","Thu mua Vũ Khí Hút Hít!","Thu mua Giày TDDC!","Thu mua Ngựa Quý!","Thu mua đồ PTVL!","Thu mua đan dược!","Thu mua đồ Hoàng Kim Các Phái!","Bán Huyền Thiết, ai quan tâm đến xem!","Bán Tinh Hồng Bảo Thạch, ai quan tâm đến xem!","Bán Thủy Tinh Các Loại, ai quan tâm đến xem!","Bán Bí Kíp các phái, ai quan tâm đến xem!","Bán Huyền Tinh, ai quan tâm đến xem!","Bán Tàng Bảo Đồ, ai quan tâm đến xem!","Bán Vũ Khí Hút Hít, ai quan tâm đến xem!","Bán Giày TDDC, ai quan tâm đến xem!","Bán Ngựa Quý, ai quan tâm đến xem!","Bán đồ PTVL, ai quan tâm đến xem!","Bán đan dược, ai quan tâm đến xem!","Bán đồ Hoàng Kim Các Phái, ai quan tâm đến xem!","Ngươi thật giàu có","Cái ta thiếu nhất là thời gian","Đừng đùa nữa","Hảo huynh đệ","Không say không về","Chỉ lo chơi, không lo làm ăn","Ngươi thật lười biếng","Suốt ngày đệ ta chỉ lo ăn chơi","Già rồi mà không nên nết","Bớ người ta, ăn vạ","Sao ngươi đụng ta","Cô nương, ta muốn trên ngươi","Đừng giở giọng lưu manh","Thiên hạ này không còn chỗ dung ta","Có thể là do ta mệt mỏi","Sống tích cực lên mới được","Miệt mài quay tay, vận may sẽ đến","Không tồi... không tồi","Mình thật may mắn","Ta sẽ hảo hảo chiếu cố đệ","Ta chỉ có 1 người sư tỷ","Mẫu thân, ta mướn lập gia đình a","Đi tìm cái nàng dâu","Ta tự hào về gia đình của mình","Sống phải biết tiết kiệm","Cái gì không cần thì đừng mua","Huynh để tốt, đừng để mất đi","Nghe nói thần tiên là có thật","Ta muốn tu tiên","Ta muốn mạnh hơn","Tiêu cực... đó không phải là cách của ta","Hồng trần muôn màu a","Bàn tay của ngươi thật lạnh","Hôm nay Hiệu Thuốc nghỉ","Hôm nay Tiệm Tạp Hóa nghỉ","Hôm nay Xa Phu nghỉ","Hôm nay Tiền Trang nghỉ","Hôm nay Dã Tẩu nghỉ","Hôm nay Võ Sư nghỉ","Hôm nay Tiêu Sư nghỉ","Như vậy là quá đủ rồi","Hôm nay ta cùng ngươi tới sáng","Cày hoài mà không xong","Ngươi tu luyện đến đâu rồi","Đi mua 3 cân gạo","Đi mua 1 miếng thịt ba chỉ","Đi mua 2 con cá","Đi mua 3 con gà","Đi mua ít đường","Đi mua bình rượu","Rượu Nữ Nhi Hồng thật thơm","Tửu lâu Biện Kinh mới mở","Tửu lâu Dương Châu mới mở","Tửu lâu Tương Dương mới mở","Tửu lâu Đại Lý mới mở","Tửu lâu Thành Đô mới mở","Tửu lâu Phượng Tường mới mở","Tửu lâu Lâm An mới mở","Đừng vì một chuyện không đáng để nhớ","Một khi đã quyết, đừng hối hận","Mắt ta mờ rồi","Mới đây đã gần tối rồi sao","Mới đây đã gần sáng rồi sao","Mùa đông đã đến","Mùa hạ đã đến","Mùa thu đã đến","Mùa xuân đã đến","Đường phố thật sạch sẽ","Nước sôi, tránh ra","Cấp báo, cấp báo...","Nhanh nhanh, tranh đường","Bà mụ nhanh lên a","Không thể làm như vậy được","Ta vốn không định làm vậy","Ta muốn mua áo mới","Ta muốn mua ngựa mới","Ta muốn mua nón mới","Ta muốn mua hộ uyển mới","Ta muốn mua đai lưng mới","Ta muốn mua vũ khí mới","Ta muốn mua ngọc bội mới","Ta muốn mua dây chuyền mới","Ta muốn mua phi phong mới","Ta muốn mua Thổ Địa Phù mới","Ta thích cái áo đó","Ta thích cái ngựa đó","Ta thích cái nón đó","Ta thích cái hộ uyển đó","Ta thích cái đai lưng đó","Ta thích cái vũ khí đó","Ta thích cái ngọc bội đó","Ta thích cái dây chuyền đó","Ta thích cái phi phong đó","Ta thích cái Thổ Địa Phù đó","Quá tuyệt vời!","Máu này không đủ xài","Tiền đâu mà để dành","Tiền đâu mà cưới nàng đây","Tiền đâu mà mua áo mới","Tiền đâu mà mua ngựa mới","Tiền đâu mà mua nón mới","Tiền đâu mà mua hộ uyển mới","Tiền đâu mà mua đai lưng mới","Tiền đâu mà mua vũ khí mới","Tiền đâu mà mua ngọc bội mới","Tiền đâu mà mua dây chuyền mới","Tiền đâu mà mua phi phong mới","Tiền đâu mà mua Thổ Địa Phù mới","Thật khó xử a","Ngươi có bán áo của ngươi không?","Ngươi có bán ngựa của ngươi không?","Ngươi có bán nón của ngươi không?","Ngươi có bán hộ uyển của ngươi không?","Ngươi có bán đai lưng của ngươi không?","Ngươi có bán vũ khí của ngươi không?","Ngươi có bán ngọc bội của ngươi không?","Ngươi có bán dây chuyền của ngươi không?","Ngươi có bán phi phong của ngươi không?","Ngươi có bán Thổ Địa Phù của ngươi không?","Nói không chịu nghỉ luôn","Mới bị sư phụ phạt diện bích","Cửu chỉ cầm ma thật là lợi hại","Thiếu Lâm Đao thật là lợi hại","Thiếu Lâm Quyền thật là lợi hại","Thiếu Lâm Bổng thật là lợi hại","Thiên Vương Thương thật là lợi hại","Thiên Vương Đao thật là lợi hại","Thiên Vương Chùy thật là lợi hại","Đường Môn Bẫy thật là lợi hại","Đường Môn Phi Đao thật là lợi hại","Đường Môn Phi Tiêu thật là lợi hại","Ngũ Độc Chưởng thật là lợi hại","Ngũ Độc Đao thật là lợi hại","Thúy Yên Đao thật là lợi hại","Thúy Yên Song Đao thật là lợi hại","Nga Mi Kiếm thật là lợi hại","Nga Mi Chưởng thật là lợi hại","Cái Bang Bổng thật là lợi hại","Cái Bang Chưởng thật là lợi hại","Thiên Nhẫn Đao thật là lợi hại","Thiên Nhẫn Thương thật là lợi hại","Võ Đang Kiếm thật là lợi hại","Võ Đang Chưởng thật là lợi hại","Côn Lôn Bùa thật là lợi hại","Côn Lôn Kiếm thật là lợi hại","Côn Lôn Đao thật là lợi hại","Vũ Hồn Đao thật là lợi hại","Vũ Hồn Thuẫn thật là lợi hại","Hoa Sơn Kiếm thật là lợi hại","Hoa Sơn Chưởng thật là lợi hại","Tiêu Dao Kiếm thật là lợi hại","Tiêu Dao Cầm thật là lợi hại","Mạc cao Quật phong cảnh hữu tình a","Hoa Sơn phong cảnh hữu tình a","Mạn Bắc Thảo Nguyên phong cảnh hữu tình a","Đào Hoa Nguyên phong cảnh hữu tình a","Đảo Tẩy Tủy phong cảnh hữu tình a","Hỏa Lang Động phong cảnh hữu tình a","Tiền bạc là vật ngoài thân","Trời không phụ lòng người","Thỉnh thoảng cần tĩnh tâm","Không quan tâm","Mặc kệ tất cả","Chắc gác kiếm từ đây","Thiếu ý chí chiến đấu","Cuộc sống thật buồn chán","Cứ hay giận hờn vu vơ","Không biết làm thế nào cho đúng","Kèo nhậu nhiều quá","Không thích lắng nghe","Giải quyết những sai lầm đã xảy ra","Cảm ơn mọi người rất nhiều","Nguyên nhân chính là như thế","Muốn sụp đổ","Đã không biết lần thứ mấy hỏi","Nàng sớm muộn gì cũng nghĩ đến","Bầu trời hôm nay thật nhiều sao","Ngươi đang nhìn cái gì","Đáng tiếc, ngươi không phải ta","Chưa tới giờ mở cửa","Gió mát quá","Đi Tiểu Trúc Lâm","Vô tình thượng thiên a","Ngươi tới đây làm gì","Ta sợ ngươi lạnh","Ta không sợ lạnh","Nữ đế khóc, 2 mắt đẫm lệ","Tay hắn thật ấm áp","Không phải do ta nói","Thật khó xử","Thật xấu hổ","Điềm tỉnh đến không nói gì","Tâm sẽ không đổi","Cần 1 cơ hội","Cái này đêm thật dài","Cơm này thật ngon a","Đang mơ màng cái gì đó","Bầu không khí có chút quỷ dị","Sắc mặt đen tối vô cùng","Chớp đôi mắt đẹp","Có khả năng!","Ngươi thật là một cái nhân tài a","Chỉ còn 30 năm","Mặt ta không ít nếp nhăn a","Càn khôn muốn thay đổi","Cái này đây là thế nào","Đại khí bàng bạc","Uy chấn cửu thiên","Nghĩ đến mớ đầu, không ngờ đến kết quả","Thật nghịch thiên cấm kỵ","Không phải là ngẫu nhiên","Đến tột cùng là thiếu thứ gì","Làm sao hắn có thể tính xa như vậy","Hết thảy đã không trọng yếu","Luân hồi triệt để đoạn tuyệt","1 người không làm được","Hắn chính là chủ động, ta lại bị động","Trả giá chính là loại nào đại giới đâu","Ta muốn đánh phá cấm kỵ","Chớ sợ","Bây giờ mới biết cái gì gọi là hi vọng","Đã không xác định","Tang thương không chịu nổi","Tiền bối, ta có tài đức gì","Thật không dám tin tưởng","Chẳng qua là hi vọng kéo dài","Đẹp như thái dương","Hắn cuối cùng đã hóa diệt","Dần dần đi hướng kết thúc","Làm sao có thể","Đều hoảng sợ","Là có bao nhiêu đáng sợ","1 không đủ, liền 2","Đều không trọn vẹn","Giọt nước mắt đều chưa hong khô","Không biết đang hỏi ai","Chưa bao giờ bình tĩnh như vậy","Vì cái gì ta không thể làm đế","Bình tĩnh hắn là đáng sợ nhất","Làm người run sợ","Cuối cùng cũng thành công","Khó trách a","Xem xét mà giật mình","Không cần như vậy phiền toái","Vạn chúng chú mục a","Càng già càng mạnh","Vạn cổ không một","Quá cường thịnh","ảo quá ảo","Vấn đề không lớn","Không có chút nào hoài nghi","Hắn chính là thần thoại sống","Đều ở trên đường đến","Tâm thần nói nhói","Lên như diều gặp gió","Với hắn mà nói là cơ duyên tạo hóa","Coi thường chúng sinh a","Có trời mới biết","Là thật không biết","Ai cũng chưa thấy qua","Chưa chừng còn có ác hơn","Đều như vậy dọa người","Thần sắc cũng đều hoảng hốt","Như trong dự liệu","Quá quen thuộc bóng lưng","Luôn có cảm giác kỳ quái","Bóng người kia thật xinh đẹp","Xem như chấp nhận","Cần có ý tư","Thế nhân đều chờ mong","Mọi người đều đến","Thế nhân ánh mắt đều rạng rỡ","Cái này đều có chút mộng bức","Có chút bí mật","Không có tư cách để biết","Không thể nghi ngờ","Tựa như nhìn ra mánh khóe","Như thế nào như thế","Nước mắt lưng tròng","Nên minh bạch","Lại vô thần trí","Đại biểu thượng thiên ý chí","Thổn thức thì thổn thức","Không thế nào tự nhiên được","Tuổi thọ đang cạn dần","Phong hoa tuyệt đại","Rất có sắc thái truyền kì","Thật thật đẹp mắt","Cảm giác có phần không chân thật","Thật thật nể tình","Là hắn ta quá kinh diễm","Vô cùng náo nhiệt","Ai đến đều không tốt dùng","Làm lòng người run sợ","Đi kia đợi thôi","Đừng làm rộn, cái này đủ","Tuyệt lần đầu tiên nhìn thấy","Chỉ vì hắn quá kinh diễm","Song quyền nan địch tứ thủ","Triệt để hỗn loạn","Không biết có nhiều ít người gặp nạn","Sẽ chân chính an ổn","Không thấy không rõ ai là ai","1 người độc chiến trăm người","Quần ẩu có quần ẩu đâu pháp","Độc chiến có độc chiến đấu pháp","Thật là có bao nhiêu cường đại","Quân lâm thiên hạ","Thật lúng túng","Sao ngươi lại hỏi ta","Không biết đã về nhà chưa","Thành thật đi","Hát cho ta nghe đi","Mặt ngươi dính gì kìa","Tâm ý ngươi, ta nhận","Mang về nhà dùng đi","Tưởng không yêu nhưng yêu không tưởng","Xấu hổ thì xấu hổ","Cuối cùng là đến","Nhu tình như nước","Vạn niệm bên trong có vĩnh hằng","Toàn cảnh là tang thương","Tựu nhớ rõ","Trong mắt tràn đầy lệ quang","Còn sẽ có 1 trận chiến","Đằng sau còn có kiếp số","Đè nén thở không nổi","1 tiếng nghẹn ngào","Bị cho leo cây rồi","Lời này nói rất có trình độ","Không đủ số a","Cái này được nè","Đang trên đường tới","Ta muốn ăn kem","Ta muốn ăn xoài","Ta muốn ăn dưa hấu","Ta muốn ăn tàu hủ","Ta muốn ăn kẹo","Ta muốn ăn mứt quả","Ta muốn ăn cơm","Ta khát nước","Ta thèm ngọt","Ta muốn ăn trái cây","Ta muốn ăn ngươi","Ta muốn ăn lẩu","Ta muốn ăn mì","Ta muốn ăn mì khô","Ta muốn ăn dâu","Ta muốn ăn trái đào","Ta muốn ăn chuối","Ta muốn ăn chân gà","Ta muốn ăn xôi","Ta muốn ăn hột vịt lộn","Ta muốn ăn khô cá","Ta muốn ăn hột gà nướng","Ta muốn ăn khô mực","Ta muốn ăn canh chua","Ta muốn ăn đồ nướng","Ta muốn ăn cá chiên","Ta muốn ăn rau luộc","Ta muốn ăn kim chi","Ta muốn ăn cà pháo","Ta muốn ăn thịt chó","Ta muốn ăn gà ủ muối","Ta muốn ăn gà luộc","Ta muốn ăn vịt quay","Ta muốn ăn gà rán","Ta muốn ăn trứng chiên","Ta muốn ăn tôm nướng","Ta muốn ăn tôm luộc","Ta muốn ăn thịt heo xông khói","Ta muốn ăn thịt trâu gác bếp","Ta muốn ăn mật ong","Ta muốn ăn măng cụt","Ta muốn ăn chôm chôm","Ta muốn ăn trứng luộc","Ta muốn ăn bánh tráng trộn","Ta muốn ăn xôi mặn","Ta muốn ăn cơm nếp","Ta muốn ăn bắp luộc","Ta muốn ăn bún bò","Ta muốn ăn bún cá","Ta muốn ăn nem nướng","Ta muốn ăn cơm sườn","Ta muốn ăn bánh canh cua","Ta muốn ăn cua hấp","Ta muốn ăn cua rang muốn","Ta muốn ăn mực chiên ước mắm","Ta muốn ăn nghê hấp xả","Ta muốn ăn cua hoàng đế","Ta muốn ăn ốc len hấp dừa","Ta muốn ăn ốc bưu luộc","Ta muốn ăn ốc gạo","Ta muốn ăn lẩu bò","Ta muốn ăn phá lấu","Ta muốn ăn ruột khìa","Ta muốn ăn thịt kho tiêu","Ta muốn ăn canh cải trắng","Ta muốn ăn bánh mì thịt","Ta muốn ăn bánh mì xíu mại","Ta muốn ăn bánh mì ốp la","Ta muốn ăn thịt muối chiên","Ta muốn ăn cá kho tiêu","Ta muốn ăn Thiên Sơn Tuyết Liên","Ta muốn ăn quả Huy Hoàng","Ta muốn ăn rau xào","Ta muốn uống nước","Ta muốn uống rượu","Ta muốn uống nước ép","Ta muốn uống sữa","Ta muốn uống trà","Ta muốn uống sâm bổ lượng","Ta muốn uống yến chưng","Ta muốn uống nước mía","Ta muốn uống Tiên Thảo Lộ","Ta muốn uống nước suối","Ta muốn uống nước gạo","Ta muốn uống nước canh","Ta muốn uống Nữ Nhi Hồng","Ta muốn uống Bách Hoa Tửu","Ta muốn uống Quỳnh Hoa Ngọc Lộ","Ta muốn uống nước tiểu đồng tử","Ta muốn uống nước ngọt","Ta muốn uống nước chanh","Ta muốn uống nước lạnh","Ta muốn uống nước nóng","Ta muốn uống cà phê","Ta muốn uống cà phê sữa","Ta muốn uống bạc xỉu","Tạm biệt người yêu trong tiềm thức","Tạm biệt người yêu mình nhất","Nén cay đắng!","Phát sầu a","Chắc đi cửa sao","Đường đường chính chính mà làm","Lối đi của riêng ta","Xin đừng làm ta buồn","Nếu như...","Làm 1 lần, ăn một đời","Làm mãi chẳng giàu","Độc thân có gì sai","Xin 1 tràn vỗ tay","Đến đây đi","Mấy giờ rồi","Sắp tối rồi","Sắp sáng rồi","Còn gì để nói nữa không","Hỏi đi cưng","Hãy cho ta biết cảm xúc của ngươi","Xui quá xui","Nói cho rõ ràng","Nói cho xong đi","Ngươi không ngại, ta ngại","Thôi bây giờ như vầy","Nhìn thật say đắm","Vậy được không ta?","Ngươi muốn hỏi gì?","Bực bội, bực bội quá à","Đang đi mua gạo","Đang đi mua thuốc","Đang đi mua thịt heo","Đang đi mua thịt bò","Quá nhiều người đang nhìn","Đang đi mua rượu","Đang đi mua dưa hấu","Đang đi mua rau","Thật ngoài ý muốn","Điều không ngoại lệ","Đang đi mua ngựa","Không giết chết hắn mới là lạ","Linh hồn đang run rẩy","Trái với pháp tắc a","Đang đi mua đồ ăn","Đang đi mua đồ nhắm","Đang đi mua mồi nhậu","Đang đi rước con","Tiếp xuống đại chiến sẽ vô cùng thảm liệt","Giặc đã bị đẩy lui","Dương Châu đang tuyển quân a","Biện Kinh đang tuyển quân a","Đại Lý đang tuyển quân a","Tương Dương đang tuyển quân a","Phượng Tường đang tuyển quân a","Thành Đô đang tuyển quân a","Lâm An đang tuyển quân a","Khó lòng mà phòng bị","Ca, đợi ta!","Tỷ, đợi ta!","Muội, đợi ta!","Cha, đợi ta!","Nương, đợi ta!","Sư Phụ, đợi ta!","Chưởng Môn, đợi ta!","Trưởng lão, đợi ta!","Sư Huynh, đợi ta!","Sư Tỷ, đợi ta!","Sư Muội, đợi ta!","Chúng ta là đồng môn!","Phong Lăng Độ, đã mở","Mạn Bắc Thảo Nguyên, đã mở","No quá","Không nhịn được nữa","Võ công sắp tiến giai","Không trọng yếu nữa rồi","Xem đều hít khí lạnh","Sắc mặt đều đen","Không phải trò đùa","1 đường truy, 1 đường đánh","Cái kia còn đánh cọng lông","Cái kia đáng chết thượng thiên","Thật không dễ dàng vượt qua","Nhân sinh muôn màu a","Đẹp mắt a","Tâm ý của ngươi, ta lĩnh","Không phải vậy, tất tổn thất","Dạo này không nhàn rỗi","Hôm nay không có gì để làm","Hôm nay nóng quá","Hôm nay lạnh quá","Hôm nay ấm quá","Hôm nay mát quá quá","Hôm nay khô quá","Hôm nay mưa quá","Hôm nay gió quá","Hôm nay nhiều mây quá","Đó cũng không phải là xinh đẹp phong cảnh","Thật là xinh đẹp phong cảnh","Thiên thời, địa lợi, nhân hòa","Hình tượng đẹp mắt","Đại khai, đại hợp","1 trận tạo hóa","Có có người có thể sánh vai","Tùy ý xách ra 1 cái đều là chí tôn","Dù sao cũng phải có thời hạn đi","Rất là cói mắt","Có thể cùng ta sóng vai","Không người có thể đưa ra đáp án","Thời gian như dừng lại","Tự hành diễn hóa chiêu thức","Kích động đều muốn nhảy lên","Cười tràn ngập nhu tình","Cực kỳ nào nhiệt","Khong hề bận tâm","Kiềm chế a","Truyền thuyết đã thành thần thoại","Đất rung núi chuyển","An tâm đi","Vẫn là lần đầu gặp","Cần phải nói rõ","Không nói được, không tả được","Lão bối, tiểu bối đều có","Đó chính là tạo hóa","Thánh địa, cũng không phải là thánh địa sao","Mua vé vào cửa","Con hàng này không thành thật","Muốn đi bộ 1 chút","Đến trả tiền","1 lòng tu đạo","Chí cường đỉnh phong cũng đến","Chặc lưỡi không thôi","1 ngày lặng yên mà qua","Vẫn cảm thấy nhỏ bé","Nhìn không thấu","Muốn nhìn lén","Không thể tới sánh vai","Mặt 1 cái so 1 cái đen","Tỉnh không đến","Ngoài núi không bình tĩnh","Có người 1 câu phá quan","Không gian, thời gian đều dừng lại","Không ngôn ngữ","Lão Đại!","Bình thường một ngày lặng yên mà qua","Trời sắp mưa rồi","Trời sắp nắng rồi","Tuyết sắp rơi","Mùa xuân sắp đến","Mùa hạ sắp đến","Mùa thu sắp đến","Mùa đông sắp đến","Không người biết","Trường tồn tại thế gian","Như một giấc mộng","Tâm cảnh không giống nhau","Theo một ý nghĩa nào đó","Không nên nói lời nào","Tối nay chớ đi","Không ngủ được","Mở miệng đều rất có học vấn","Quá tưởng niệm","Ngươi quá là một cái nhân tài","Cuối cùng là cá gì đồ chơi","Thổi lên tới 9 tầng mây","Đến lặng yên, đi lặng yên","Ta cấp bậc không đủ","Ta còn là cái kia","Nhu hòa mà ôn nhu","Gọi cái gì đều không có tâm bệnh","Nhân quả tuần hoàn","Cực kỳ bội phục a","Ta hôm nay hoàn toàn làm được","Không cần quá lâu","Năm đó làm không được, bây giờ có thể","Ngày tốt cảnh đẹp","Hình tượng nên vô cùng hương diễm","Từ khi chia tay đến giờ không có vấn đề gì chứ","Ngươi nhận ra hắn","Ta vốn không biết","Thật khó tái tạo","Không thể giải thích","Đến tột cùng là cái gì địa phương","Nó cất giấu gì bí mật","Không khỏi chấn kinh a","Thế giới này thật đáng sợ","Quá nhiều điều chưa biết","Hắn so ta may mắn","Con đường kia...","Có thế 1 ít sự tình đều không biết","Có thể nghĩ minh bạch","Thật khó tưởng tượng","Sở kiến lược đồng","Đồng cảm a","Hẳn là còn có","Còn tại trên đường lang thang","Có 1 loại dự cảm bất thường","Biết ít còn thêm ít","Ngươi cho rằng ta không muốn đi","Đường nào đi","Ai có thể khai","Ta cần thời gian","Còn phải chờ...","Có rất nhiều người đến bái phỏng","Đông như trẫy hội","Không biết đang nhìn cái gì","Dùng cưỡng ép xuyên thẳng qua","Đều mẹ nó không tới","Đi đường tư thế có phần phách lối","Cho ta mấy phần mặt mũi","Là tổ đội tới","Cũng đều tới","Tâm bỗng nhiên 1 trận đau","Tuế nguyệt như đao a","Có vẻ càng thêm đẹp mắt","Muốn nhìn một chút hương diễm","Tiểu nha đầu này ngày càng bất phàm","Ngươi là ai trẻ con","Lại cực kỳ bất phàm","Ai có thể so sánh được nàng","Chính là phung phí của trời","Nói chuyện rất có thâm ý","Đó là ví dụ rất tốt","Đều là kẻ không còn nhiều tuổi thọ","Cũng tuổi thọ không nhiễn","Cũng bất đắc dĩ","Món này có chút đắt","Giảm giá đi","Đừng có chém nữa","Khó có thể nghịch chuyển","Bán hàng có lương tâm không","Bán mắc quá vậy","Không kia lực lượng","Người quan minh chính đại","Không nói lời mờ ám","Cái này làm sao có ý tứ?","ừng ực, nuốt nước bọt","Tiền không có","Không có tiền","Hút thuốc không?","Cảm giác vừa vặn rất tốt","Đồ tốt!","Lờ mờ còn nhớ rõ","Đáng tiếc, đạo hạnh ta còn chưa đủ","Cười có phần vui vẻ","Có bóng người!","Có thích khách","Bảo vệ hắn!","Bảo vệ ta!","Đuổi theo hắn!","Thôi bỏ đi","Đoạt thiên tạo hóa a","Chậm rãi mà đi","Không tiễn","Sắc trời thật u ám","Cực kỳ chắc chắn","Cuộc đời thật mong lung","Không có phản hồi","Đích thật là nó","Không ngoài ý muốn","Thật có quan hệ","1 bước lên trời","Bất hữu truyên thuyết a","Viện binh đang đến","Suýt nữa thì bị hủy nhà","Không nhìn thấy là ai","Thấy không rõ chân dung","Người xuất thủ kia có bao nhiêu cường đại","Nguyên nhân chính là nhìn ra","Không thể vĩnh cửu trường tồn","Hậu sinh khả quý a!","Hoàn toàn chính xác có biến cố","Tựa như ta năm đó","Suy nghĩ bị đánh gãy...","Tên kia... mạng đủ lớn","Thổn thức không thôi","Ta bỏ lỡ rất nhiều chuyện đặc sắc","So với tưởng tượng, nghiêm trọng hơn","Hơn phân nữa là không tại","Không nên đến","Không còn có khả năng còn sống","Rất khó làm được","Đều chú định không thể quay về","Phải nhắm chuẩn mới được","Rất tiếc vận khí không tốt","Vận khí rất cần thiết","Đã bặc vô âm tín","Phần lớn đã bị diệt","Có thể nói như vậy","Đã tiêu hao hầu như không còn","Tiền bối, trước nghỉ ngơi đi","Phản Thanh - Phục Minh","Hắn không có cái kia bản lĩnh","Hội sẽ lúng túng hơn","Có thể bị diệt","Không thấy có bóng người","Đi lần này chính là dăm ba tháng","Có sát khí mãnh liệt","Còn xem không rõ lắm","Biến mất?","Ai? Cút ra đây","Chạy cũng không chậm","Xuất thủ người thật là đáng sợ","Có thể ta sẽ không nhìn lầm","Như vậy, vấn đề tới","Có phần là êm tai","Cùng ta, cùng nhau lên đường","Trở về tại chỗ!","Tư cách đều là không có","Cũng phải thiệt thòi","Tụu vô cùng thê thảm","Không thể so","Cũng không tốt gì","Liền là cái kỳ tích","Cũng coi là một cái lối đi","Đó không phải là hang chuột","Chờ người ra","Bức cách không là bình thường cao","Chết rất phiền muộn","Đó là cái chân lý","Trở tay không kịp!","Ôm cây đợi thỏ","Trúng kế rồi","Điệu hổ ly sơn","Dương đông kích tây","Đâu chỉ chói mắt","Đã có 3-5 ngày","Gánh nặng đường xa","Lại rất tự giác","Tuyệt đối không phải là bình thường","Có chút tương tự","Đều đi đâu rồi","Tiền bối, tìm cái gì đâu","Nhìn điệu bộ này...","Ngươi, vì sao mà cười?","Đợi được một con cá lớn","Không phải là hàng phổ thông","Kinh ngạc thì kinh ngạc","Ngày mai ta trở lại","Ta đi lấy thêm tiền","Không có đủ tiền mua","Khách quan muốn thứ gì","Ta có thể giúp gì ngươi?","Có thể mua cho ta một cái bánh bao không?","Có thể mua cho ta một ít thức ăn không?","Có thể mua cho ta một bình rượu không?","Gương mặt kia dữ tợn không chịu nỗi","Tiếng nhạc thật hay","Thần bí mà bá đạo","Thế nào lại có cái này thao tác","Khó lòng phòng bị","Tìm không ra","Tên kia tuyệt đối là 1 cái ẩn nấp cao thủ","Nhìn về phía trước, 1 mảnh hư vô","Phía trước mông lung 1 mảnh","Hơn phân nữa, đều phải quỳ","Kia có bao nhiêu lợi hại a","Chơi trốn tìm?","Không dám ngoi đầu lên","Thật không còn cách nào khác","Từ bỏ tìm kiếm","Còn chưa hiểu thấu đáo","Phương pháp này càng trực tiếp","Người kia đã bặc vô âm tín","Đi dạo 1 vòng","Khống xấu hổ người đều chung chí hướng","Xem như bế quan","Nàng là yêu nghiệt","Hắn ta còn áp chế","Một đường đều tại ngộ đạo","Còn vì năm đó sự tình mà sám hối","Tên rất hay","Có một loại cảm giác quen thuộc","Có thể chúng ta chưa từng gặp mặt","Tuyệt đối là trẻ tuổi nhất cao thủ","Ngươi cái này bản lĩnh không thế nào tốt","Đại ca! Ta theo ngươi","Tiểu tử! Ta theo ngươi","Cha! Ta theo ngươi","Nương! Ta theo ngươi","Tỷ phu! Ta theo ngươi","Sư đệ! Ta theo ngươi","Sư mẫu! Ta theo ngươi","Muội! Ta theo ngươi","Sư muội! Ta theo ngươi","Bang Chủ! Ta theo ngươi","Sư huynh! Ta theo ngươi","Huynh đệ! Ta theo ngươi","Bá bá! Ta theo ngươi","A Di! Ta theo ngươi","Mong được mọi người giúp đỡ","Chào anh em, ai làm nhiệm vụ chung không?","Chào bang hội, hôm nay mọi người thế nào?","Nhiệm vụ này làm sao để hoàn thành nhanh nhất?","Mình bị kẹt ở nhiệm vụ này, ai giúp với","Anh em tập trung, chuẩn bị đi săn boss","Cần thêm người để đi phó bản","Mọi người tập trung để bảo vệ lãnh thổ","Ai bán đồ này không? Mình cần gấp","Mình có dư đồ này, ai cần thì liên hệ","Đổi đồ, ai có trang bị này thì mình muốn đổi","Hôm nay đông vui quá mọi người nhỉ","Ai có mẹo gì thì chia sẻ","Mình nghĩ nên tập trung nâng kỹ năng này trước","Hôm nay có kế hoạch gì không?","Cần phân chia nhiệm vụ rõ ràng hơn","Mọi người tập trung ở lãnh địa bang nhé","Người si nói mộng","Có việc quan trọng, Bang Chủ nói tập trung","Phải có người giữ cửa, ai tình nguyện?","Cẩn thận, có mai phục!","Kẻ địch đang đến gần, chuẩn bị sẵn sàng!","Mình bị kẹt ở đây, ai giúp mình với","Ta vừa học được chiêu mới, ai muốn thử không?","Có ai tham gia sự kiện này không?","Lập nhóm đi!","Nên tập trung vào kỹ năng phòng thủ trước","Kinh nghiệm của ngươi thật phong phú","Chơi phái này cần chú ý gì?","Ai có kinh nghiệm chia sẻ với","Ai có chuyện gì vui kể nghe chơi","Hôm nay có gì mới không?","Ai solo không?","Thách đấu 1vs1, ai tự tin thì bước lên","Ta đến từ bang hội khác","Muốn giao lưu kết bạn","Ta sẵn sàng chia sẻ","Ai có thể bảo vệ ta không?","Bị bắt cóc, cần cứu giúp","Làm sao để thắng đây?","Cảm ơn vì đã giúp đỡ","Ta sẽ nhớ ơn ngươi","Ngươi rất giỏi","Hãy cố gắng","Chúng ta sẽ vượt qua thử thách","Ai cũng có thể làm được","Hãy tin vào bản thân","Hồi hộp  quá","Hồi hộp ghê","Sắp tới lượt ta rồi","Ngươi đang chờ điều gì?","Cảm giác thật thăng hoa","A! Lên cấp rồi","Vừa mới bị đánh","Mọi người cùng nhau chia vui","Chia buồn nha","Ai có thuốc hồi máu không","Cần tập trung vào điểm yếu của boss","Cần làm chậm nó","Cần làm choáng nó","Cần đốt nó","Ta sẽ đi dò đường trước","Mọi người theo sau hỗ trợ","Ngươi bảo vệ, ta tấn công","Nhiệm vụ này khó quá","Cần giúp đỡ","Chúng ta làm tốt lắm","Hãy chuẩn bị cho nhiệm vụ tiếp theo","Kiểm tra kỹ nhé","Kiểm tra trang bị và đan được trước khi chiến đấu","Chúng ta đã thắng!","Mọi người thật tuyệt vời","Sự kiện sẽ diễn ra vào tối nay","Thư giãn đi","Sự kiện sẽ có phần thưởng, đừng bỏ lỡ","Đừng từ bỏ","Ta cần mua kiếm cao cấp","Ta cần mua đao cao cấp","Ta cần mua Thương cao cấp","Ta cần mua Côn cao cấp","Ta cần mua đàn cao cấp","Ta cần mua áo cao cấp","Ta cần mua hộ uyển cao cấp","Ta cần mua ngọc bội cao cấp","Ta cần mua dây chuyền cao cấp","Ta cần mua giày cao cấp","Ta cần mua nhẫn cao cấp","Ta cần mua phi phong cao cấp","Ta cần mua ngựa cao cấp","Ai có đồ thừa cho ta với","Ta cần tìm một số vật phẩm nhiệm vụ","Ai có thể cho ta mượn ít vàng không","Ta nên làm gì","Có gì đặc biệt không?","Trận đấu rất gay cấn","Chúng ta đang dẫn đầu, mọi người cố lên","Chúng ta đang có lợi thế","Ai còn chưa nộp tài nguyên bang hội?","Ai cần hỗ trợ về trang bị thì nói ta","Nếu cần giúp đỡ gì thì cứ hỏi nhé","Chúng ta đã chiếm được cổng chính","Tiếp tục tiến lên","Ai biết chỗ nào tìm được cái này không?","Mới tìm được kho báu","Ai đi tìm kho báu chung không?","Ai cần gì, ta có thể chia sẻ","Tập trung, đừng để bị phân tán","Cẩn thận có cạm bẫy","Mọi người tập hợp tại đấu trường","Chuẩn bị vào trận","Ta sẽ tấn công từ bên trái","Mọi người theo sát nhé!","Ai dám tham gia thử thách cùng nhau không?","Ngày mai gặp lại","Ta phải đi rồi, ở lại vui vẻ","Đừng buồn khi thua ta","Trận này sẽ thú vị hơn","Đến đây mà thử sức","Trận chiến hạng nặng, ai dám?","Ta đã học hỏi rất nhiều từ ngươi","Cảm giác thật tuyệt vời","Ta cần mua một món đồ đặc biệt","Ai có bán không?","Đổi đồ không?","Cho ta trả lại đồ","Ta không thể hoàn thành nhiệm vụ","Cần người làm chung nhiệm vụ","Ai bán Tiên Thảo Lộ không?","Ai bán Quế Hoa Tửu không?","Ai bán Nữ Nhi Hồng không?","Ai bán Thiên Sơn Tuyết Liên không?","Ai bán Chùy HSL không?","Ai bán Đao HNL không?","Ai bán Thương HSL không?","Ai bán Kiếm HNL không?","Ai bán Kiếm HSL không?","Ai bán vũ khí tốc độ xuất chiêu không?","Ai bán ngựa Chiếu Dạ không?","Giá bí kíp Thiếu Lâm Đao bao nhiêu vậy?","Giá bí kíp Thiếu Lâm Quyền bao nhiêu vậy?","Giá bí kíp Thiếu Lâm Bổng bao nhiêu vậy?","Giá bí kíp Thiên Vương Thương bao nhiêu vậy?","Giá bí kíp Thiên Vương Chùy bao nhiêu vậy?","Giá bí kíp Thiên Vương Đao bao nhiêu vậy?","Giá bí kíp Ngũ Độc Chưởng bao nhiêu vậy?","Giá bí kíp Ngũ Độc Đao bao nhiêu vậy?","Giá bí kíp Thúy Yên Song Đao bao nhiêu vậy?","Giá bí kíp Thúy Yên Đao bao nhiêu vậy?","Giá bí kíp Đường Môn Bẫy bao nhiêu vậy?","Giá bí kíp Đường Môn Phi Tiêu bao nhiêu vậy?","Giá bí kíp Đường Môn Phi Đao bao nhiêu vậy?","Giá bí kíp Cái Bang Bổng bao nhiêu vậy?","Giá bí kíp Cái Bang Chưởng bao nhiêu vậy?","Giá bí kíp Thiên Nhẫn Đao bao nhiêu vậy?","Giá bí kíp Thiên Nhẫn Thương bao nhiêu vậy?","Giá bí kíp Vũ Hồn Đao bao nhiêu vậy?","Giá bí kíp Vũ Hồn Thuẫn bao nhiêu vậy?","Giá bí kíp Tiêu Dao Kiếm bao nhiêu vậy?","Giá bí kíp Tiêu Dao Chưởng bao nhiêu vậy?","Giá bí kíp Hoa Sơn Kiếm bao nhiêu vậy?","Giá bí kíp Hoa Sơn Chưởng bao nhiêu vậy?","Giá này hơi cao, có thể giảm được không?","Đao này có thuộc tính gì đặc biệt?","Kiếm này có thuộc tính gì đặc biệt?","Thương này có thuộc tính gì đặc biệt?","Bổng này có thuộc tính gì đặc biệt?","Phi đao này có thuộc tính gì đặc biệt?","Phi tiêu này có thuộc tính gì đặc biệt?","Cầm này có thuộc tính gì đặc biệt?","Thuẫn này có thuộc tính gì đặc biệt?","áo này có thuộc tính gì đặc biệt?","Ngựa này có thuộc tính gì đặc biệt?","Phi Phong này có thuộc tính gì đặc biệt?","Nón này có thuộc tính gì đặc biệt?","Dây chuyền này có thuộc tính gì đặc biệt?","Hộ Uyển này có thuộc tính gì đặc biệt?","Nhẫn này có thuộc tính gì đặc biệt?","Ngọc bội này có thuộc tính gì đặc biệt?","Thắt lưng này có thuộc tính gì đặc biệt?","Giày này có thuộc tính gì đặc biệt?","Vũ khí này có thuộc tính gì đặc biệt?","Đao này đã nâng cấp chưa?","Kiếm này đã nâng cấp chưa?","Thương này đã nâng cấp chưa?","Bổng này đã nâng cấp chưa?","Phi đao này đã nâng cấp chưa?","Phi tiêu này đã nâng cấp chưa?","Cầm này đã nâng cấp chưa?","Thuẫn này đã nâng cấp chưa?","áo này đã nâng cấp chưa?","Ngựa này đã nâng cấp chưa?","Phi Phong này đã nâng cấp chưa?","Nón này đã nâng cấp chưa?","Dây chuyền này đã nâng cấp chưa?","Hộ Uyển này đã nâng cấp chưa?","Nhẫn này đã nâng cấp chưa?","Ngọc bội này đã nâng cấp chưa?","Thắt lưng này đã nâng cấp chưa?","Giày này đã nâng cấp chưa?","Vũ khí này đã nâng cấp chưa?","Đồng ý mua, chúng ta giao dịch ở Thành Đô nha","Đồng ý mua, chúng ta giao dịch ở Biện Kinh nha","Đồng ý mua, chúng ta giao dịch ở Dương Châu nha","Đồng ý mua, chúng ta giao dịch ở Tương Dương nha","Đồng ý mua, chúng ta giao dịch ở Địa Lý nha","Đồng ý mua, chúng ta giao dịch ở Phượng Tường nha","Đồng ý mua, chúng ta giao dịch ở Lâm An nha","Chuyển tiền rồi, kiểm tra và gửi đồ giúp mình","Chúng ta gặp nhau ở Thành Đô nha","Chúng ta gặp nhau ở Biện Kinh nha","Chúng ta gặp nhau ởDương Châu nha","Chúng ta gặp nhau ở Tương Dương nha","Chúng ta gặp nhau ở Địa Lý nha","Chúng ta gặp nhau ở Phượng Tường nha","Chúng ta gặp nhau ở Lâm An nha","Vật phẩm này kiếm ở đâu vậy?","Đao này kiếm ở đâu vậy?","Kiếm này kiếm ở đâu vậy?","Thương này kiếm ở đâu vậy?","Bổng này kiếm ở đâu vậy?","Phi đao này kiếm ở đâu vậy?","Phi tiêu này kiếm ở đâu vậy?","Cầm này kiếm ở đâu vậy?","Thuẫn này kiếm ở đâu vậy?","áo này kiếm ở đâu vậy?","Ngựa này kiếm ở đâu vậy?","Phi Phong này kiếm ở đâu vậy?","Nón này kiếm ở đâu vậy?","Dây chuyền kiếm ở đâu vậy?","Hộ Uyển kiếm ở đâu vậy?","Nhẫn này kiếm ở đâu vậy?","Ngọc bội nkiếm ở đâu vậy?","Thắt lưng này kiếm ở đâu vậy?","Giày này kiếm ở đâu vậy?","Vũ khí này kiếm ở đâu vậy?","Có ai làm trung gian giao dịch không?","Ta cần mua 1 cây vũ khí cấp 10, ai bán không?","Ta cần mua 1 cây đao cấp 10, ai bán không?","Ta cần mua 1 cây thương cấp 10, ai bán không?","Ta cần mua 1 cây bổng cấp 10, ai bán không?","Ta cần mua 1 cây phi đao cấp 10, ai bán không?","Ta cần mua 1 cây phi tiêu cấp 10, ai bán không?","Ta cần mua 1 áo giáp cấp 10, ai bán không?","Ta cần mua 1 nón cấp 10, ai bán không?","Ta cần mua 1 hộ uyển cấp 10, ai bán không?","Ta cần mua 1 nhẫn cấp 10, ai bán không?","Ta cần mua 1 ngọc bội cấp 10, ai bán không?","Ta cần mua 1 đai lưng cấp 10, ai bán không?","Ta cần mua 1 giày cấp 10, ai bán không?","Ta cần mua 1 ngựa cấp 10, ai bán không?","Ta cần mua 1 phi phong cấp 10, ai bán không?","Ai bán thuốc hồi máu loại mạnh không?","Ai bán thuốc hồi nội lực loại mạnh không?","Ai bán thuốc hồi thể lực loại mạnh không?","Ai bán thuốc giải độc loại mạnh không?","Đang có vài Tinh Hồng Bảo Thạch cần bán, ai mua?","Đang có vài Tiên Thảo Lộ cần bán, ai mua?","Đang có vài Thủy Tinh cần bán, ai mua?","Đang có vài Bí Kíp Võ Công cần bán, ai mua?","Đang có vài Thiết La Hán cần bán, ai mua?","Đang có vài Bát Nhã Kinh cần bán, ai mua?","Đang có vài Tàng Bảo Đồ cần bán, ai mua?","Đang có vài Võ Lâm Mật Tịch cần bán, ai mua?","Đang có vài vũ khí xịn cần bán, ai mua?","Đang có vài nhẫn xịn cần bán, ai mua?","Đang có vài áo xịn cần bán, ai mua?","Đang có vài mũ xịn cần bán, ai mua?","Đang có vài dây chuyền xịn cần bán, ai mua?","Đang có vài hộ uyển xịn cần bán, ai mua?","Đang có vài ngọc bội xịn cần bán, ai mua?","Đang có vài đai lưng xịn cần bán, ai mua?","Đang có vài giày cần bán, ai mua?","Đang có vài ngựa xịn cần bán, ai mua?","Đang có vài phi phong xịn cần bán, ai mua?","Ta muốn mua bí kíp này, nhưng giá hơi cao","Ta muốn mua trân bảo này, nhưng giá hơi cao","Ta muốn mua bạch cầu hoàn này, nhưng giá hơi cao","Ta muốn mua kiếm này, nhưng giá hơi cao","Ta muốn mua đao này, nhưng giá hơi cao","Ta muốn mua thương này, nhưng giá hơi cao","Ta muốn mua bổng này, nhưng giá hơi cao","Ta muốn mua phi đao này, nhưng giá hơi cao","Ta muốn mua phi tiêu này, nhưng giá hơi cao","Ta muốn mua cầm này, nhưng giá hơi cao","Ta muốn mua thuẫn này, nhưng giá hơi cao","Ta muốn mua áo này, nhưng giá hơi cao","Ta muốn mua mũ này, nhưng giá hơi cao","Ta muốn mua dây chuyền này, nhưng giá hơi cao","Ta muốn mua hộ uyển này, nhưng giá hơi cao","Ta muốn mua nhẫn này, nhưng giá hơi cao","Ta muốn mua ngọc bội này, nhưng giá hơi cao","Ta muốn mua giày này, nhưng giá hơi cao","Ta muốn mua ngựa này, nhưng giá hơi cao","Ta muốn mua phi phong này, nhưng giá hơi cao","Ta muốn mua thủy tinh này, nhưng giá hơi cao","Ta muốn mua tinh hồng bảo thạch này, nhưng giá hơi cao","Bí kíp này, có thể thương lượng được không?","Trân bảo này, có thể thương lượng được không?","Bạch cầu hoàn này, có thể thương lượng được không?","Kiếm này, có thể thương lượng được không?","Đao này, có thể thương lượng được không?","Thương này, có thể thương lượng được không?","Bổng này, có thể thương lượng được không?","Phi đao này, có thể thương lượng được không?","Phi tiêu này, có thể thương lượng được không?","Cầm này, có thể thương lượng được không?","Thuẫn này, có thể thương lượng được không?","áo này, có thể thương lượng được không?","Mũ này, có thể thương lượng được không?","Dây chuyền này, có thể thương lượng được không?","Hộ uyển này, có thể thương lượng được không?","Nhẫn này, có thể thương lượng được không?","Ngọc bội này, có thể thương lượng được không?","Giày này, có thể thương lượng được không?","Ngựa này, có thể thương lượng được không?","Phi phong này, có thể thương lượng được không?","Thủy tinh này, có thể thương lượng được không?","Tinh hồng bảo thạch này, có thể thương lượng được không?","Bí kíp này, đã qua sử dụng chưa?","Trân bảo này, đã qua sử dụng chưa?","Bạch cầu hoàn này, đã qua sử dụng chưa?","Kiếm này, đã qua sử dụng chưa?","Đao này, đã qua sử dụng chưa?","Thương này, đã qua sử dụng chưa?","Bổng này, đã qua sử dụng chưa?","Phi đao này, đã qua sử dụng chưa?","Phi tiêu này, đã qua sử dụng chưa?","Cầm này, đã qua sử dụng chưa?","Thuẫn này, đã qua sử dụng chưa?","áo này, đã qua sử dụng chưa?","Mũ này, đã qua sử dụng chưa?","Dây chuyền này, đã qua sử dụng chưa?","Hộ uyển này, đã qua sử dụng chưa?","Nhẫn này, đã qua sử dụng chưa?","Ngọc bội này, đã qua sử dụng chưa?","Giày này, đã qua sử dụng chưa?","Ngựa này, đã qua sử dụng chưa?","Phi phong này, đã qua sử dụng chưa?","Thủy tinh này, đã qua sử dụng chưa?","Tinh hồng bảo thạch này, đã qua sử dụng chưa?","Ta đã chuẩn bị đủ tiền!","Có thể giao dịch chưa?","Ngươi có biết đây là gì?","Ngươi bán bí kíp này, giá bao nhiêu vậy?","Ngươi bán trân bảo này, giá bao nhiêu vậy?","Ngươi bán bạch cầu hoàn này, giá bao nhiêu vậy?","Ngươi bán kiếm này, giá bao nhiêu vậy?","Ngươi bán đao này, giá bao nhiêu vậy?","Ngươi bán thương này, giá bao nhiêu vậy?","Ngươi bán bổng này, giá bao nhiêu vậy?","Ngươi bán phi đao này, giá bao nhiêu vậy?","Ngươi bán phi tiêu này, giá bao nhiêu vậy?","Ngươi bán cầm này, giá bao nhiêu vậy?","Ngươi bán thuẫn này, giá bao nhiêu vậy?","Ngươi bán áo này, giá bao nhiêu vậy?","Ngươi bán mũ này, giá bao nhiêu vậy?","Ngươi bán dây chuyền này, giá bao nhiêu vậy?","Ngươi bán hộ uyển này, giá bao nhiêu vậy?","Ngươi bán nhẫn này, giá bao nhiêu vậy?","Ngươi bán ngọc bội này, giá bao nhiêu vậy?","Ngươi bán giày này, giá bao nhiêu vậy?","Ngươi bán ngựa này, giá bao nhiêu vậy?","Ngươi bán phi phong này, giá bao nhiêu vậy?","Ngươi bán thủy tinh này, giá bao nhiêu vậy?","Ngươi bán tinh hồng bảo thạch này, giá bao nhiêu vậy?","Ai muốn đổi bí kíp này không?","Ai muốn đổi trân bảo này không?","Ai muốn đổi bạch cầu hoàn này không?","Ai muốn đổi kiếm này không?","Ai muốn đổi đao này không?","Ai muốn đổi thương này không?","Ai muốn đổi bổng này không?","Ai muốn đổi phi đao này không?","Ai muốn đổi phi tiêu này không?","Ai muốn đổi cầm này không?","Ai muốn đổi thuẫn này không?","Ai muốn đổi áo này không?","Ai muốn đổi mũ này không?","Ai muốn đổi dây chuyền này không?","Ai muốn đổi hộ uyển này không?","Ai muốn đổi nhẫn này không?","Ai muốn đổi ngọc bội này không?","Ai muốn đổi giày này không?","Ai muốn đổi ngựa này không?","Ai muốn đổi phi phong này không?","Ai muốn đổi thủy tinh này không?","Ai muốn đổi tinh hồng bảo thạch này không?"],"rep_ok":["Ngon! Gap o Ba Lang di!","Chot! Ra Bien Kinh tao cho biet tay!","Duoc, di thoi dao huu!","Ok luon, theo ta!","Hay, vay quyet nhe!"],"rep_no":["He, so a? Hen the!","Thoi vay, ga gan de bat nat.","Tiec nhi, lan sau vay.","Ko sao, hen dip khac nhe.","Nhat, di cho khac choi day."],"rep_chao":["Chao dao huu!","E, di dau day ban?","Alo, khoe ko?","Chao huynh dai!","Lau ngay ko gap ta!","gi do, t nghe ne :)","co gi ko ban?","alo, sao do?","ban can gi ha?","co viec gi the ban?"],"rep_giaodich":["Do nay 5 van, lay ko?","Ban re cho ne, mua di!","Co bi kip xin, doi gi ko?","Hang ngon gia tot, ghe xem!","Mua ban gi noi di dao huu."],"rep_boss":["Di, ta dan duong san boss!","Sat thu gan day ne, di ko?","Ru them nguoi danh boss nao!","Ok ta ho tro, chia do song phang!","Theo ta vat con boss kiem do!"],"rep_chung":["Nguoi noi gi ta nghe ko ro?","Ha? Noi lai coi.","Uk uk, the a...","Gi co dao huu?","Ta dang ban, tinh sau nhe."],"solo":["E, dam solo 1 tran ko? Ra Ba Lang!","Nhin manh do, ti thi o Bien Kinh ko?","So gi, len Ba Lang tao cho biet tay!","Tim doi thu lau roi, solo ko?","Ranh ko? Quynh 1 keo cho vui."],"tantinh":["Dao huu nhin xinh qua~","Lam quen nhe, ta bao bao tieu!","Di dau ma voi the my nhan?","Co don ghe, di choi voi ta ko?","Nguoi nay ta thuong roi day =))"],"hoatdong":["Di Tong Kim voi ta ko?","Ru vuot ai ne, thieu 1 chan!","Lien dau sap mo, lap doi ko?","Di san boss chia do nao!","Gia nhap to doi ta di, vui lam!"],"giaodich":["Ban bi kip gia re, mua ko?","Co do xin muon doi, ghe xem!","Cho nguoi cuon nay, huu duyen!","Thanh ly do gia tot, lai mua!","Co tien ko, ta co hang ngon!"],"rep_solo":["OK! May` dan~ duong` di, tao theo ra ngoai danh luon! :T","Solo ha? Di truoc di, t di theo!","Duoc, ra ngoai thanh roi tinh :T","Duoc day' dat' tao ra ngoai` roi biet tay :)"],"rep_chui":["Diem thui! Ngon ra ngoai day!","Do` hen`, chay vo thanh ha? con!","So roi` ha? Vo thanh` nup' di!","Ra ngoai choi di chu, chay nhanh ghe vay :)","Chuot nhat! Ra day tao cho mot tran!","Chay di dau con, ra day! :T"],"rep_cho":["ok t co do ne, chon giao dich di t cho :)","co ne, mo giao dich di t dua cho :)","duoc, chon giao dich t cho lien :)","co do, bam giao dich di t gui qua :)","ok co day, chon giao dich nha t cho","de t cho, mo giao dich len di ban :)","co san ne, chon giao dich t dua cho","ok t cho duoc, mo cua so giao dich di :)","duoc thoi, chon giao dich di t bo qua cho","co ma, bam giao dich t cho ngay :)"],"rep_tuchoi":["thoi do nay t dang xai, hoi nguoi khac nha :)","tiec ghe t het do du roi, bua khac nha","de t giu xai da, thong cam nha ban :)","do t cung it, ko cho duoc, xin loi nha","thoi t can dung, ban hoi ng khac xem :)","het do dua roi ban oi, lan sau nha","cai nay t dang can, ko nhuong duoc :(","thong cam nha, do nay t giu lai xai","t cung dang thieu do ma, hihi","thoi de hom khac t cho, gio chua co du"],"rep_camon":["ok ko co gi, co gang cay di nhe :)","co gi dau, vui ma :)","ko co chi, ace giup nhau thoi :)","uh nhe, choi vui ve :)","co gi dau ban, dung khach sao :)","ko sao, lan sau can cu noi t :)","nho cay cho gioi vao nhe :)","duoc roi, di cay tiep di :)","ko co gi dau, hihi :)","ko co chi, chuc ban choi vui :)"],"rep_vonhom":["ok cho t vo nhom voi nha :)","duoc, t vo nhom cho vui :)","ok vo nhom di, cay chung cho khoe","ngon, t tham gia nhom nha :)","duoc do, co nhom dong vui ma :)","ok t vo, dan t di cay nhe","vo lien, t khoai di nhom :)","oke vo nhom, di dau dan t voi :)","duoc thoi, them t cho dong :)","ok chot, t vo nhom nha ban"],"rep_tuchoinhom":["thoi t quen solo roi, ko vo nhom dau :)","hong, t thich di mot minh hon :)","thoi t dang ban, bua khac nha","t di tu do quen roi, thong cam nha :)","thoi nhom dong t ngai, di solo thoi","de hom khac nha, gio t ko tien","t ko thich vo nhom dau, xin loi :)","thoi t cay mot minh cho nhanh :)","hong dau, t di bui quen roi :)","thoi de khi khac, gio t co viec"],"rep_nhomfull":["nhom ban full 7 nguoi roi, moi gi nua :)","full cho roi ban oi, het slot roi :)","nhom day 7 mang roi, ko nhan nua dau :)","het cho roi, nhom du 7 nguoi roi :)","thoi full mat roi, du 7 nguoi roi :)","nhom kin cho roi, moi sao duoc nua :)","day cho roi ban oi, lan sau nha :)","nhom 7 mang full roi, ko them duoc :)"]};

// Danh mục câu thoại chiến đấu
const FIGHTING_QUOTES = (SIMBOT_CHATS.fighting && SIMBOT_CHATS.fighting.length) ? SIMBOT_CHATS.fighting : [
  "Ngon nhào vô!", "Ăn một kiếm của ta!", "Đỡ lấy chiêu này!",
  "Bãi này quái đông train sướng thật!", "Ai ks quái của tui đó nha :D",
  "Bảo đao bất lão!", "Cắn miếng máu đã...", "Đánh mỏi cả tay mà chưa rớt đồ!"
];

// Danh mục câu thoại giao lưu / thành thị
const TOWN_QUOTES = [
  ...(SIMBOT_CHATS.general || []),
  ...(SIMBOT_CHATS.rep_chao || []),
  ...(SIMBOT_CHATS.tantinh || []),
  ...(SIMBOT_CHATS.giaodich || []),
  ...(SIMBOT_CHATS.hoatdong || [])
];
if (!TOWN_QUOTES.length) {
  TOWN_QUOTES.push(
    "Thời tiết hôm nay đẹp thật!",
    "Biện Kinh hôm nay đông vui quá!",
    "Ai có bí kíp xịn bán không?",
    "Chuẩn bị đồ đạc tối nay Tống Kim thôi anh em!",
    "Chào các vị đại hiệp hữu lễ!",
    "Thu mua Huyền Tinh số lượng lớn ai bán pm!"
  );
}

// Bảng thuộc tính và chiêu thức 10 môn phái
const FACTION_SKILL_TIERS = {
  shaolin: {
    key: 'shaolin', n: 'Thiếu Lâm', title: 'Thiếu Lâm Tự', series: 0, sex: 0, color: '#ffcf48',
    skills: [
      { minLv: 80, id: 321, n: 'Vô Tướng Trảm', reach: 90 },
      { minLv: 50, id: 11, n: 'Hoành Tảo Lục Hợp', reach: 80 },
      { minLv: 1, id: 10, n: 'Kim Cang Phục Ma', reach: 75 }
    ]
  },
  tianwang: {
    key: 'tianwang', n: 'Thiên Vương', title: 'Thiên Vương Bang', series: 0, sex: 0, color: '#ffcf48',
    skills: [
      { minLv: 80, id: 323, n: 'Truy Tinh Trục Nguyệt', reach: 85 },
      { minLv: 60, id: 41, n: 'Huyết Chiến Bát Phương', reach: 85 },
      { minLv: 30, id: 35, n: 'Dương Quan Tam Điệp', reach: 80 },
      { minLv: 1, id: 30, n: 'Hồi Phong Lạc Nhạn', reach: 75 }
    ]
  },
  tangmen: {
    key: 'tangmen', n: 'Đường Môn', title: 'Đường Môn', series: 1, sex: 0, color: '#50e878',
    skills: [
      { minLv: 80, id: 302, n: 'Bạo Vũ Lê Hoa', reach: 230 },
      { minLv: 60, id: 249, n: 'Tiểu Lý Phi Đao', reach: 220 },
      { minLv: 30, id: 54, n: 'Mạn Thiên Hoa Vũ', reach: 210 },
      { minLv: 1, id: 45, n: 'Phích Lịch Đơn', reach: 200 }
    ]
  },
  wudu: {
    key: 'wudu', n: 'Ngũ Độc', title: 'Ngũ Độc Giáo', series: 1, sex: 0, color: '#68ff88',
    skills: [
      { minLv: 80, id: 355, n: 'Huyền Âm Trảm', reach: 210 },
      { minLv: 60, id: 74, n: 'Chu Cáp Thanh Minh', reach: 210 },
      { minLv: 30, id: 64, n: 'Băng Lam Huyền Tinh', reach: 210 },
      { minLv: 1, id: 63, n: 'Độc Sa Chưởng', reach: 190 }
    ]
  },
  emei: {
    key: 'emei', n: 'Nga My', title: 'Nga My Phái', series: 2, sex: 1, color: '#58d8ff',
    skills: [
      { minLv: 80, id: 380, n: 'Phong Sương Toái Ảnh', reach: 230 },
      { minLv: 60, id: 91, n: 'Phật Quang Phổ Chiếu', reach: 220 },
      { minLv: 30, id: 82, n: 'Tứ Tượng Đồng Quy', reach: 210 },
      { minLv: 1, id: 80, n: 'Phiêu Tuyết Xuyên Vân', reach: 190 }
    ]
  },
  cuiyan: {
    key: 'cuiyan', n: 'Thúy Yên', title: 'Thúy Yên Môn', series: 2, sex: 1, color: '#78e8ff',
    skills: [
      { minLv: 80, id: 336, n: 'Băng Tung Vô Ảnh', reach: 230 },
      { minLv: 60, id: 108, n: 'Mục Dã Lưu Tinh', reach: 210 },
      { minLv: 30, id: 105, n: 'Vũ Đả Lê Hoa', reach: 210 },
      { minLv: 1, id: 99, n: 'Phong Hoa Tuyết Nguyệt', reach: 190 }
    ]
  },
  gaibang: {
    key: 'gaibang', n: 'Cái Bang', title: 'Cái Bang', series: 3, sex: 0, color: '#ff6848',
    skills: [
      { minLv: 80, id: 357, n: 'Phi Long Tại Thiên', reach: 230 },
      { minLv: 50, id: 128, n: 'Kháng Long Hữu Hối', reach: 210 },
      { minLv: 1, id: 122, n: 'Kiến Nhân Thần Thủ', reach: 190 }
    ]
  },
  tianren: {
    key: 'tianren', n: 'Thiên Nhẫn', title: 'Thiên Nhẫn Giáo', series: 3, sex: 0, color: '#ff7848',
    skills: [
      { minLv: 80, id: 361, n: 'Vân Long Kích', reach: 90 },
      { minLv: 60, id: 148, n: 'Ma Diệm Thất Sát', reach: 210 },
      { minLv: 30, id: 140, n: 'Phi Hồng Vô Tích', reach: 190 },
      { minLv: 1, id: 136, n: 'Hỏa Liên Phần Hoa', reach: 80 }
    ]
  },
  wudang: {
    key: 'wudang', n: 'Võ Đang', title: 'Võ Đang Phái', series: 4, sex: 0, color: '#ffdd68',
    skills: [
      { minLv: 80, id: 368, n: 'Nhân Kiếm Hợp Nhất', reach: 240 },
      { minLv: 60, id: 267, n: 'Tam Hoàn Thao Nguyệt', reach: 230 },
      { minLv: 30, id: 158, n: 'Kiếm Phi Kinh Thiên', reach: 220 },
      { minLv: 1, id: 153, n: 'Nộ Lôi Chỉ', reach: 210 }
    ]
  },
  kunlun: {
    key: 'kunlun', n: 'Côn Lôn', title: 'Côn Lôn Phái', series: 4, sex: 0, color: '#ffdd68',
    skills: [
      { minLv: 80, id: 375, n: 'Lôi Động Cửu Thiên', reach: 240 },
      { minLv: 60, id: 182, n: 'Ngũ Lôi Chánh Pháp', reach: 230 },
      { minLv: 30, id: 172, n: 'Thiên Tế Tấn Lôi', reach: 220 },
      { minLv: 1, id: 169, n: 'Hô Phong Pháp', reach: 210 }
    ]
  }
};

const FACTION_KEYS_LIST = Object.keys(FACTION_SKILL_TIERS);

const SIMBOTS = {
  list: [],
  targetCount: 16,
  enabled: true,
  lastStateKey: '',
  lastEntsTime: 0,
  tickedThisFrame: false,
  worldChatTimer: 18 + Math.random() * 10
};
if (typeof window !== 'undefined') {
  window.SIMBOTS = SIMBOTS;
}

// Kiểm tra trạng thái Simbot trực tiếp từ server
async function updateSimbotStatusFromServer() {
  try {
    const res = await fetch('/api/public/simbot-status', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.enabled === 'boolean') {
        window.SIMBOT_ENABLED = data.enabled;
        SIMBOTS.enabled = data.enabled;
        if (!data.enabled) {
          window.NO_SIMBOT = true;
          if (SIMBOTS.list && SIMBOTS.list.length > 0) {
            SIMBOTS.list = [];
          }
        } else {
          window.NO_SIMBOT = false;
        }
      }
    }
  } catch (err) {}
}

if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem('jx_simbot_enabled');
    if (cached === '0') {
      window.SIMBOT_ENABLED = false;
      window.NO_SIMBOT = true;
      SIMBOTS.enabled = false;
      SIMBOTS.list = [];
    }
  } catch (e) {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'jx_simbot_enabled') {
      const en = e.newValue !== '0';
      window.SIMBOT_ENABLED = en;
      SIMBOTS.enabled = en;
      if (!en) {
        window.NO_SIMBOT = true;
        SIMBOTS.list = [];
      } else {
        window.NO_SIMBOT = false;
      }
    }
  });
}

updateSimbotStatusFromServer();
setInterval(updateSimbotStatusFromServer, 1500);

function getArena() {
  if (typeof window !== 'undefined') return window.A || window.R || null;
  return null;
}

function getPlayer() {
  if (typeof window !== 'undefined') return window.P || window.S || null;
  return null;
}

function getHero() {
  if (typeof window !== 'undefined') return window.M || window.H || null;
  return null;
}

function isTownMode() {
  const arena = getArena();
  if (arena && arena.town) return true;
  if (typeof window !== 'undefined') {
    if (window.A && window.A.town) return true;
    if (window.R && window.R.town) return true;
  }
  if (typeof document !== 'undefined') {
    const tb = document.getElementById('townBar');
    if (tb && !tb.classList.contains('hidden') && !tb.hidden) return true;
  }
  return false;
}

function simbotActive() {
  if (typeof window !== 'undefined') {
    if (window.NO_SIMBOT === true || window.SIMBOT_ENABLED === false) return false;
  }
  if (SIMBOTS && SIMBOTS.enabled === false) return false;
  const arena = getArena();
  if (!arena) return false;
  if (arena.dg || arena.tower || arena.songkim || arena.tk) return false;
  // BỎ HẾT BOT Ở TRONG THÀNH:
  if (isTownMode()) return false;
  return true;
}

function isHoaSonMap() {
  if (typeof window !== 'undefined') {
    if (window.OBS && (window.OBS.key == 2 || window.OBS.key === '2')) return true;
    if (window.Dt && window.Dt.g && (window.Dt.key == 2 || window.Dt.key === '2')) return true;
    if (window.R) {
      if (window.R.zoneShown == 2 || window.R.zoneShown === '2') return true;
      if (window.R.bgImg && window.R.bgImg.src && (window.R.bgImg.src.includes('/2.jpg') || window.R.bgImg.src.endsWith('2.jpg'))) return true;
      if (window.R.field && (window.R.field.key == 2 || String(window.R.field.key).startsWith('2|') || String(window.R.field.key).includes('|2|'))) return true;
    }
    if (window.A) {
      if (window.A.zoneShown == 2 || window.A.zoneShown === '2') return true;
      if (window.A.bgImg && window.A.bgImg.src && (window.A.bgImg.src.includes('/2.jpg') || window.A.bgImg.src.endsWith('2.jpg'))) return true;
      if (window.A.field && (window.A.field.key == 2 || String(window.A.field.key).startsWith('2|') || String(window.A.field.key).includes('|2|'))) return true;
    }
  }
  const arena = getArena();
  if (arena) {
    if (arena.zoneShown == 2 || arena.zoneShown === '2') return true;
    if (arena.bgImg && arena.bgImg.src && (arena.bgImg.src.includes('/2.jpg') || arena.bgImg.src.endsWith('2.jpg'))) return true;
    if (arena.field) {
      if (arena.field.key == 2 || String(arena.field.key).startsWith('2|') || String(arena.field.key).includes('|2|')) return true;
    }
  }
  const p = getPlayer();
  const stage = p ? Number(p.stage || 1) : 1;
  if (stage <= 10) return true;
  return false;
}

function getCurrentZoneRange() {
  if (isHoaSonMap()) {
    return { lo: 1, hi: 10, name: 'Hoa Sơn' };
  }
  const p = getPlayer();
  const stage = p ? (Number(p.stage) || 1) : 1;
  if (typeof window !== 'undefined' && window.JW && Array.isArray(window.JW.zones)) {
    const zone = window.JW.zones.find(z => stage >= z.lo && stage <= z.hi);
    if (zone) return { lo: zone.lo, hi: zone.hi, name: zone.n || '' };
  }
  const lo = Math.max(1, Math.min(180, Math.floor((stage - 1) * 1.5) + 1));
  const hi = Math.max(lo, Math.min(180, lo + 9));
  return { lo, hi, name: '' };
}

function getSkillForBot(facKey, level) {
  const facCfg = FACTION_SKILL_TIERS[facKey] || FACTION_SKILL_TIERS.wudang;
  for (const sk of facCfg.skills) {
    if (level >= sk.minLv) {
      return { skillId: sk.id, reach: sk.reach, skillName: sk.n };
    }
  }
  const fallback = facCfg.skills[facCfg.skills.length - 1];
  return { skillId: fallback.id, reach: fallback.reach, skillName: fallback.n };
}

// Bảng tọa độ 24 bãi luyện công thoáng đãng, rộng mở 100% tại Hoa Sơn (x >= 2200, TUYỆT ĐỐI XA RẶNG CÂY TRÁI VÀ NÚI)
const HOA_SON_PRESET_CAMPS = [
  { x: 2920, y: 1800 }, { x: 3368, y: 1672 }, { x: 3208, y: 1416 }, { x: 3112, y: 2056 },
  { x: 3112, y: 1800 }, { x: 3240, y: 1224 }, { x: 3080, y: 1608 }, { x: 2728, y: 2344 },
  { x: 2824, y: 2664 }, { x: 2696, y: 2984 }, { x: 2696, y: 3304 }, { x: 3432, y: 3240 },
  { x: 3304, y: 2280 }, { x: 2280, y: 2024 }, { x: 2472, y: 1992 }, { x: 2568, y: 1608 },
  { x: 2376, y: 1768 }, { x: 2568, y: 1800 }, { x: 2504, y: 2952 }, { x: 2536, y: 2280 },
  { x: 2472, y: 3144 }, { x: 2440, y: 3336 }, { x: 2216, y: 3240 }, { x: 2344, y: 2216 }
];

// Tìm bãi luyện công thoáng đãng gần nhất để tự động giải thoát kẹt
function getNearestOpenCamp(bx, by, isHoaSon) {
  if (isHoaSon) {
    let best = HOA_SON_PRESET_CAMPS[0];
    let bestDist = Infinity;
    for (const c of HOA_SON_PRESET_CAMPS) {
      const d = Math.hypot(c.x - bx, c.y - by);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    return best;
  }
  const arena = getArena();
  if (arena && arena.field && Array.isArray(arena.field.slots) && arena.field.slots.length) {
    let best = arena.field.slots[0];
    let bestDist = Infinity;
    for (const s of arena.field.slots) {
      if (!s || !s.x || !s.y) continue;
      const d = Math.hypot(s.x - bx, s.y - by);
      if (d < bestDist) {
        bestDist = d;
        best = s;
      }
    }
    return best;
  }
  return { x: 2600, y: 2000 };
}

// Kiểm tra vị trí đi được an toàn (tuyệt đối không đi vào x < 1750 ở Hoa Sơn)
function canBotWalkTo(nx, ny, isHoaSon) {
  if (isHoaSon && nx < 1750) return false;
  if (typeof window !== 'undefined' && typeof window.Nt === 'function') {
    return window.Nt(nx, ny);
  }
  return true;
}

// Kiểm tra tầm nhìn thẳng thông suốt không bị che khuất bởi vách núi hay rặng cây
function botHasLineOfSight(x1, y1, x2, y2) {
  if (typeof window !== 'undefined' && typeof window.Nt === 'function') {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.ceil(dist / 20);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (!window.Nt(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) {
        return false;
      }
    }
  }
  return true;
}

// Di chuyển thông minh có lách vật cản và trượt mép
function botMoveTowards(bot, tx, ty, speed, dt, isHoaSon, dirOfFn) {
  const dist = Math.hypot(tx - bot.x, ty - bot.y);
  if (dist <= 6) {
    bot.moving = false;
    return false;
  }
  const dx = (tx - bot.x) / dist;
  const dy = (ty - bot.y) / dist;
  const step = speed * dt;
  if (dirOfFn) bot.dir = dirOfFn(dx, dy);

  // 1. Đi thẳng
  if (canBotWalkTo(bot.x + dx * step, bot.y + dy * step, isHoaSon)) {
    bot.x += dx * step;
    bot.y += dy * step;
    bot.act = 'run';
    bot.moving = true;
    return true;
  }
  // 2. Trượt theo phương ngang
  if (canBotWalkTo(bot.x + dx * step, bot.y, isHoaSon)) {
    bot.x += dx * step;
    bot.act = 'run';
    bot.moving = true;
    return true;
  }
  // 3. Trượt theo phương dọc
  if (canBotWalkTo(bot.x, bot.y + dy * step, isHoaSon)) {
    bot.y += dy * step;
    bot.act = 'run';
    bot.moving = true;
    return true;
  }
  // 4. Lách góc xiên 45 độ
  const tx1 = -dy, ty1 = dx;
  if (canBotWalkTo(bot.x + tx1 * step, bot.y + ty1 * step, isHoaSon)) {
    bot.x += tx1 * step;
    bot.y += ty1 * step;
    bot.act = 'run';
    bot.moving = true;
    return true;
  }
  if (canBotWalkTo(bot.x - tx1 * step, bot.y - ty1 * step, isHoaSon)) {
    bot.x -= tx1 * step;
    bot.y -= ty1 * step;
    bot.act = 'run';
    bot.moving = true;
    return true;
  }

  // Không đi được
  bot.moving = false;
  return false;
}

// Tạo danh sách vị trí xuất phát ngẫu nhiên khắp bản đồ (rải đều các hướng, có bot gần lẫn bot xa)
function generateInitialSpawnPoints(hx, hy) {
  const isHoaSon = isHoaSonMap();
  const arena = getArena();

  let candidates = [];

  if (isHoaSon) {
    candidates = HOA_SON_PRESET_CAMPS.slice();
  }

  if (arena && arena.field && Array.isArray(arena.field.slots) && arena.field.slots.length) {
    for (const sl of arena.field.slots) {
      if (!sl || !sl.x || !sl.y) continue;
      // Tuyệt đối không lấy điểm ở vùng núi/rặng cây Hoa Sơn (x < 1800)
      if (isHoaSon && sl.x < 1800) continue;
      candidates.push({ x: sl.x, y: sl.y });
    }
  }

  if (!candidates.length) {
    candidates = HOA_SON_PRESET_CAMPS.slice();
  }

  // Xáo trộn ngẫu nhiên
  const shuffled = candidates.slice().sort(() => Math.random() - 0.5);
  const spawns = [];

  // 1. Ưu tiên chọn 3-4 điểm ở cự ly vừa phải quanh người chơi (120px - 280px)
  for (const pt of shuffled) {
    if (isHoaSon && pt.x < 1800) continue;
    if (!canBotWalkTo(pt.x, pt.y, isHoaSon)) continue;
    const d = Math.hypot(pt.x - hx, pt.y - hy);
    if (d >= 100 && d <= 320) {
      if (spawns.every(s => Math.hypot(s.x - pt.x, s.y - pt.y) >= 110)) {
        spawns.push({ x: pt.x, y: pt.y });
        if (spawns.length >= 4) break;
      }
    }
  }

  // 2. Các bot còn lại phân bổ rộng ra các bãi khắp bản đồ (Đông, Nam, Bắc)
  for (const pt of shuffled) {
    if (isHoaSon && pt.x < 1800) continue;
    if (!canBotWalkTo(pt.x, pt.y, isHoaSon)) continue;
    if (spawns.every(s => Math.hypot(s.x - pt.x, s.y - pt.y) >= 140)) {
      spawns.push({ x: pt.x, y: pt.y });
      if (spawns.length >= 16) break;
    }
  }

  // Nếu vẫn chưa đủ 16 điểm, nới lỏng khoảng cách
  if (spawns.length < 16) {
    for (const pt of shuffled) {
      if (isHoaSon && pt.x < 1800) continue;
      if (!canBotWalkTo(pt.x, pt.y, isHoaSon)) continue;
      if (spawns.every(s => Math.hypot(s.x - pt.x, s.y - pt.y) >= 70)) {
        spawns.push({ x: pt.x, y: pt.y });
        if (spawns.length >= 16) break;
      }
    }
  }

  return spawns;
}

function simbotCreate(index = 0, isTown = false, spawnPos = { x: 2400, y: 1800 }) {
  const facKey = FACTION_KEYS_LIST[index % FACTION_KEYS_LIST.length];
  const facCfg = FACTION_SKILL_TIERS[facKey];
  const name = SIMBOT_NAMES[Math.floor(Math.random() * SIMBOT_NAMES.length)];

  let level = 1;
  const z = getCurrentZoneRange();
  level = Math.floor(z.lo + Math.random() * (z.hi - z.lo + 1));
  const maxHp = 800 + level * 28;
  const skInfo = getSkillForBot(facKey, level);

  const isHoaSon = isHoaSonMap();
  let sx = spawnPos.x || 2400;
  let sy = spawnPos.y || 1800;

  if (isHoaSon && sx < 1800) {
    const safeCamp = HOA_SON_PRESET_CAMPS[index % HOA_SON_PRESET_CAMPS.length];
    sx = safeCamp.x;
    sy = safeCamp.y;
  }

  const isMoving = Math.random() < 0.8;
  const initialAct = isMoving ? 'run' : (Math.random() < 0.5 ? 'at' : 'st');

  return {
    id: 'sb_' + Math.random().toString(36).slice(2, 9),
    name,
    fac: facCfg.key,
    facName: facCfg.n,
    facTitle: facCfg.title,
    series: facCfg.series,
    sex: facCfg.sex,
    color: facCfg.color,
    skillId: skInfo.skillId,
    reach: skInfo.reach,
    skillName: skInfo.skillName,
    level,
    x: sx,
    y: sy,
    lastX: sx,
    lastY: sy,
    stuckTimer: 0,
    idleAtSpotTimer: 0,
    dir: Math.floor(Math.random() * 8),
    act: initialAct,
    actT: Math.random() * 0.4,
    animT: Math.random() * 3,
    moving: isMoving,
    spd: 125 + Math.random() * 25,
    hp: maxHp,
    maxHp,
    atkCd: 0.1 + Math.random() * 0.4,
    target: null,
    roamTx: sx + (Math.random() * 200 - 100),
    roamTy: sy + (Math.random() * 200 - 100),
    roamT: 1.5 + Math.random() * 3.5,
    kills: Math.floor(Math.random() * 8),
    chatText: '',
    chatT: 0,
    nextChatIn: 8 + Math.random() * 25,
    isTownBot: false
  };
}

// Tìm quái gần nhất mà bot có thể tiếp cận (có đường đi thẳng rõ ràng, không xuyên cây/núi)
function botFindTarget(bot, enemies, isHoaSon) {
  if (!enemies || !enemies.length) return null;

  let bestEnemy = null;
  let bestDist = 550; // Quét quái trong bán kính 550px quanh bot

  for (const e of enemies) {
    if (!e || e.dead || e.hp <= 0) continue;
    // Bỏ qua tuyệt đối quái ở góc trái Hoa Sơn (x < 1750)
    if (isHoaSon && e.x < 1750) continue;
    // Bỏ qua quái người chơi đang đánh để tránh bot KS quái của người chơi
    if (e.hitByPlayer) continue;

    const d = Math.hypot(e.x - bot.x, e.y - bot.y);
    if (d < bestDist) {
      // BẮT BUỘC kiểm tra đường nhìn thẳng: Nếu có cây cối hoặc vách chắn ngang thì KHÔNG target!
      if (!botHasLineOfSight(bot.x, bot.y, e.x, e.y)) {
        continue;
      }
      bestDist = d;
      bestEnemy = e;
    }
  }

  return bestEnemy;
}

// Cập nhật vòng lặp trí tuệ nhân tạo của từng bot
function updateBots(dt, isWarmup = false) {
  const arena = getArena();
  const hero = getHero() || { x: 2400, y: 1800 };
  const hx = hero.x || 2400;
  const hy = hero.y || 1800;
  const isHoaSon = isHoaSonMap();

  const enemies = (arena && Array.isArray(arena.enemies)) ? arena.enemies : [];
  const dirOfFn = (typeof window !== 'undefined' && typeof window.dirOf === 'function') ? window.dirOf : null;
  const skillFxFn = (typeof window !== 'undefined' && typeof window.skillFx === 'function') ? window.skillFx : null;
  const addTextFn = (typeof window !== 'undefined' && typeof window.addText === 'function') ? window.addText : null;

  // Xử lý kênh chat thế giới mô phỏng (chỉ khi không ở chế độ warmup)
  if (!isWarmup) {
    SIMBOTS.worldChatTimer -= dt;
    if (SIMBOTS.worldChatTimer <= 0) {
      SIMBOTS.worldChatTimer = 180 + Math.random() * 120; // 3 đến 5 phút (180s - 300s)
      if (SIMBOTS.list.length && arena && Array.isArray(arena.logs)) {
        const luckyBot = SIMBOTS.list[Math.floor(Math.random() * SIMBOTS.list.length)];
        const quotePool = FIGHTING_QUOTES;
        const msg = quotePool[Math.floor(Math.random() * quotePool.length)];
        if (msg) {
          const fullLog = '<span style="color:' + luckyBot.color + '"><b>Đại Hiệp ' + luckyBot.name + ':</b></span> <span style="color:#f2e6cb">' + msg + '</span>';
          arena.logs.unshift(fullLog);
          if (arena.logs.length > 50) arena.logs.pop();
          arena.logDirty = true;
          if (typeof window !== 'undefined' && typeof window.syncWorldChatSystem === 'function') {
            window.syncWorldChatSystem(arena.logs);
          }
        }
      }
    }
  }

  for (const bot of SIMBOTS.list) {
    bot.actT = (bot.actT || 0) + dt;
    bot.animT = (bot.animT || 0) + dt;

    // VÙNG AN TOÀN TUYỆT ĐỐI HOA SƠN (CHẶN ĐỨNG X < 1750):
    // Nếu bot đi vào mép trái (x < 1750 bất kể y nào): LẬP TỨC ĐƯA RA BÃI THOÁNG TRUNG TÂM / ĐÔNG HOA SƠN
    if (isHoaSon && bot.x < 1750) {
      const safeCamp = getNearestOpenCamp(bot.x, bot.y, true);
      bot.x = safeCamp.x + Math.floor(Math.random() * 40 - 20);
      bot.y = safeCamp.y + Math.floor(Math.random() * 40 - 20);
      bot.lastX = bot.x;
      bot.lastY = bot.y;
      bot.target = null;
      bot.stuckTimer = 0;
      bot.idleAtSpotTimer = 0;
      bot.roamT = 1.0 + Math.random() * 2.0;
      bot.act = 'run';
      bot.moving = true;
    }

    // Tắt hoàn toàn bong bóng chat trên đầu bot
    bot.chatText = '';
    bot.chatT = 0;

    // Tự hồi máu khi bị quái đánh yếu máu
    if (bot.hp < bot.maxHp * 0.45) {
      bot.hp = Math.min(bot.maxHp, bot.hp + bot.maxHp * 0.35);
      if (!isWarmup && addTextFn) {
        addTextFn(bot.x, bot.y - 45, '+Bình Máu', '#7cff79', 12);
      }
    }

    // CƠ CHẾ CHỐNG KẸT TOÀN DIỆN (ANTI-STUCK AUTO-UNSTUCK):
    // Đo quãng đường di chuyển thực tế của bot
    const movedDist = Math.hypot(bot.x - (bot.lastX ?? bot.x), bot.y - (bot.lastY ?? bot.y));
    if (movedDist < 3.0) {
      bot.idleAtSpotTimer = (bot.idleAtSpotTimer || 0) + dt;
      if (bot.moving) {
        bot.stuckTimer = (bot.stuckTimer || 0) + dt;
      }
      if (bot.stuckTimer > 0.8) {
        bot.target = null;
        bot.roamT = 0;
      }
      // Kẹt khi đang chạy > 1.8s hoặc đứng 1 chỗ quá 2.5s (kể cả đang đánh hay đứng im):
      // LẬP TỨC THOÁT KẸT - Đưa ngay bot về bãi dã ngoại thoáng đãng gần nhất!
      if (bot.stuckTimer > 1.8 || bot.idleAtSpotTimer > 2.5) {
        const safeCamp = getNearestOpenCamp(bot.x, bot.y, isHoaSon);
        bot.x = safeCamp.x + Math.floor(Math.random() * 40 - 20);
        bot.y = safeCamp.y + Math.floor(Math.random() * 40 - 20);
        bot.lastX = bot.x;
        bot.lastY = bot.y;
        bot.target = null;
        bot.stuckTimer = 0;
        bot.idleAtSpotTimer = 0;
        bot.roamT = 2.0 + Math.random() * 3.0;
        bot.act = 'run';
        bot.moving = true;
      }
    } else {
      bot.stuckTimer = Math.max(0, (bot.stuckTimer || 0) - dt * 2);
      bot.idleAtSpotTimer = 0;
      bot.lastX = bot.x;
      bot.lastY = bot.y;
    }

    // 1. Kiểm tra mục tiêu hiện tại: Nếu quái đã chết hoặc biến mất hoặc chạy sang x < 1750 thì bỏ ngay
    if (bot.target) {
      if (bot.target.dead || bot.target.hp <= 0 || (isHoaSon && bot.target.x < 1750)) {
        bot.target = null;
      }
    }

    // 2. Nếu chưa có mục tiêu: Tự động quét tìm quái còn sống trên map (có đường đi thẳng thông suốt)
    if (!bot.target) {
      bot.target = botFindTarget(bot, enemies, isHoaSon);
      if (bot.target) bot.target.botClaimed = true;
    }

    // 3. Nếu đã có quái: Chạy tới tấn công
    if (bot.target) {
      const target = bot.target;
      const dist = Math.hypot(target.x - bot.x, target.y - bot.y);
      const reach = bot.reach || 120;

      if (dist > reach) {
        // Chưa vào tầm đánh -> Chạy lại gần có lách vật cản thông minh
        const moved = botMoveTowards(bot, target.x, target.y, bot.spd, dt, isHoaSon, dirOfFn);
        if (!moved) {
          bot.stuckTimer = (bot.stuckTimer || 0) + dt;
          if (bot.stuckTimer > 0.6) {
            bot.target = null;
            bot.roamT = 0;
          }
        }
      } else {
        // Đã vào tầm xuất chiêu!
        if (dirOfFn) bot.dir = dirOfFn(target.x - bot.x, target.y - bot.y);
        bot.moving = false;
        bot.atkCd = (bot.atkCd || 0) - dt;

        if (bot.atkCd <= 0) {
          bot.atkCd = 0.8 + Math.random() * 0.45;
          bot.act = 'at';
          bot.actT = 0;

          if (!isWarmup) {
            const heroDist = Math.hypot(hx - bot.x, hy - bot.y);
            if (heroDist < 650 && typeof skillSfx === 'function' && bot.skillId) {
              try { skillSfx(bot.skillId); } catch (e) {}
            }
            if (skillFxFn) {
              try { skillFxFn(bot, target, { id: bot.skillId, rate: 1 }); } catch (e) {}
            }
          }

          target.botClaimed = true;
          target.hitByBot = true;
          const dmg = Math.max(16, Math.round((target.max || 180) * (0.16 + Math.random() * 0.18)));
          target.hp -= dmg;
          target.hitT = 0.12;
          if (target.act !== 'at') {
            target.act = 'hurt';
            target.actT = 0;
          }

          if (!isWarmup && addTextFn) {
            const rx = target.x + (Math.random() * 16 - 8);
            const ry = target.y - (target.r || 15) - 10;
            addTextFn(rx, ry, String(dmg), '#ffe07a', 13);
          }

          // Khi quái chết: Đánh dấu chết bởi bot để người chơi KHÔNG nhận kinh nghiệm / vàng / đồ rơi / nhiệm vụ
          if (target.hp <= 0 && !target.dead) {
            target.hp = 0;
            target.dead = true;
            target.killedByBot = true;
            target.hitByBot = true;
            target.botClaimed = true;

            // Xử lý giải phóng slot hồi sinh cho bãi quái
            if (target.fieldSlot) {
              target.fieldSlot.enemy = null;
              target.fieldSlot.wait = 2.0;
            }

            // Xử lý xác quái chết và hiệu ứng âm thanh tự nhiên
            if (!isWarmup) {
              try {
                if (typeof npcSfx === 'function' && typeof MON !== 'undefined' && target.tid && MON[target.tid]) {
                  npcSfx(MON[target.tid].anim, 'die', 0.5);
                }
              } catch (e) {}
              if (arena && !arena.quiet && Array.isArray(arena.corpses)) {
                target.act = 'die';
                target.actT = 0;
                arena.corpses.push(target);
              }
            }

            // TUYỆT ĐỐI KHÔNG gọi onKill(target) hay tăng arena.field.quest.kills ở đây!
            // Bot đánh quái là mô phỏng độc lập, người chơi không được hưởng kinh nghiệm từ bot.

            bot.target = null;
            bot.kills = (bot.kills || 0) + 1;
            if (bot.kills % 12 === 0 && bot.level < 150) {
              bot.level++;
              bot.maxHp += 28;
              bot.hp = bot.maxHp;
              if (!isWarmup && addTextFn) addTextFn(bot.x, bot.y - 45, 'Thăng Cấp Lv' + bot.level, '#ffd24a', 13);
            }
          }
        }
      }
    } else {
      // 4. Nếu xung quanh tạm thời chưa có quái: Tự chạy tuần tra tìm bãi quái mới trên map
      bot.roamT = (bot.roamT || 0) - dt;
      if (bot.roamT <= 0 || !bot.roamTx) {
        bot.roamT = 3.5 + Math.random() * 4.0;
        let foundSpot = false;

        // Ưu tiên chạy về phía một bãi quái trong field.slots của game (chỉ chọn bãi thoáng x >= 1800 ở Hoa Sơn)
        if (arena && arena.field && Array.isArray(arena.field.slots) && arena.field.slots.length) {
          const validSlots = isHoaSon 
            ? arena.field.slots.filter(s => s && s.x >= 1800)
            : arena.field.slots;
          if (validSlots.length) {
            const randomSlot = validSlots[Math.floor(Math.random() * validSlots.length)];
            bot.roamTx = randomSlot.x;
            bot.roamTy = randomSlot.y;
            foundSpot = true;
          }
        }

        if (!foundSpot) {
          const safeCamp = HOA_SON_PRESET_CAMPS[Math.floor(Math.random() * HOA_SON_PRESET_CAMPS.length)];
          bot.roamTx = safeCamp.x;
          bot.roamTy = safeCamp.y;
        }
      }

      // Đảm bảo điểm roam tại Hoa Sơn luôn ở khu vực an toàn x >= 1800
      if (isHoaSon && (!bot.roamTx || bot.roamTx < 1800)) {
        const safeCamp = HOA_SON_PRESET_CAMPS[Math.floor(Math.random() * HOA_SON_PRESET_CAMPS.length)];
        bot.roamTx = safeCamp.x;
        bot.roamTy = safeCamp.y;
      }

      const moved = botMoveTowards(bot, bot.roamTx, bot.roamTy, bot.spd * 0.85, dt, isHoaSon, dirOfFn);
      if (!moved) {
        bot.roamT = 0; // Đổi hướng tuần tra nếu vướng đường
      }
    }
  }
}

// Khởi tạo các bot cho một map dã ngoại (phân bổ ngẫu nhiên và warmup)
function initMapBots(stage, curStateKey, hx, hy) {
  SIMBOTS.lastStateKey = curStateKey;
  if (!simbotActive()) {
    SIMBOTS.list = [];
    return;
  }
  const initialSpawns = generateInitialSpawnPoints(hx, hy);
  SIMBOTS.list = [];
  for (let i = 0; i < SIMBOTS.targetCount; i++) {
    const sp = initialSpawns[i % initialSpawns.length] || { x: 2400, y: 1800 };
    SIMBOTS.list.push(simbotCreate(i, false, sp));
  }

  // Khởi tạo mục tiêu cho các bot
  const arena = getArena();
  const enemies = (arena && Array.isArray(arena.enemies)) ? arena.enemies : [];
  const isHoaSon = isHoaSonMap();
  for (const bot of SIMBOTS.list) {
    bot.target = botFindTarget(bot, enemies, isHoaSon);
  }

  // Giả lập 15 nhịp warmup (khoảng 2.7 giây gameplay) để bot tự động chạy và đánh trước
  // Người chơi khi vào map sẽ thấy bot ĐÃ ĐANG ĐÁNH QUÁI KHẮP BẢN ĐỒ, KHÔNG BỊ CHẾT TRÂN
  for (let step = 0; step < 15; step++) {
    updateBots(0.18, true);
  }
}

function simbotTick(dt) {
  SIMBOTS.tickedThisFrame = true;
  if (!simbotActive()) {
    if (SIMBOTS.list.length > 0) SIMBOTS.list = [];
    return;
  }

  const arena = getArena();
  const hero = getHero() || { x: 1536, y: 1536 };
  const hx = hero.x || 1536;
  const hy = hero.y || 1536;
  const isTown = isTownMode();

  // BỎ HẾT BOT Ở TRONG THÀNH:
  if (isTown) {
    // KHÔNG xóa SIMBOTS.list và KHÔNG set lastStateKey = 'town'!
    // Bot vẫn ở nguyên trên map dã ngoại (không hiển thị trong thành vì simbotEnts return []).
    return;
  }

  const p = getPlayer();
  const stage = p ? Number(p.stage || 1) : 1;
  const curStateKey = 'field_' + String(stage);

  // Chỉ khi đổi sang map dã ngoại khác (ví dụ từ Hoa Sơn sang map Lv10-20), hoặc lần đầu vào game:
  if (SIMBOTS.lastStateKey !== curStateKey || !SIMBOTS.list.length) {
    initMapBots(stage, curStateKey, hx, hy);
  }

  updateBots(dt, false);
}

function simbotEnts() {
  if (!simbotActive() || isTownMode()) {
    if (SIMBOTS.list.length > 0) SIMBOTS.list = [];
    return [];
  }

  // Bảo đảm bot luôn được cập nhật kể cả khi engine chưa gọi tick
  const now = performance.now();
  if (SIMBOTS.lastEntsTime) {
    const dt = Math.min(0.08, (now - SIMBOTS.lastEntsTime) / 1000);
    if (!SIMBOTS.tickedThisFrame && dt > 0.008) {
      simbotTick(dt);
    }
  }
  SIMBOTS.lastEntsTime = now;
  SIMBOTS.tickedThisFrame = false;

  return SIMBOTS.list.map(b => ({ simbot: b, y: b.y }));
}

function simbotDraw(c, bot, dt) {
  const ctx = c || (typeof CX !== 'undefined' ? CX : null);
  if (!ctx || !bot) return;
  if (!simbotActive()) return;

  // 1. Bóng đổ dưới chân
  ctx.fillStyle = '#0007';
  ctx.beginPath();
  ctx.ellipse(bot.x, bot.y, 16, 6, 0, 0, 7);
  ctx.fill();

  // 2. Hoạt ảnh nhân vật
  const wHero = (typeof window !== 'undefined' && window.JW && window.JW.hero) ? window.JW.hero : null;
  const g = (wHero && wHero[bot.fac])
    || (wHero && (wHero.shaolin || Object.values(wHero)[0]))
    || (typeof heroGfx === 'function' ? heroGfx(bot.fac, bot.sex) : null);

  const curAct = (bot.act === 'at' && bot.actT < 0.45) ? 'at' : (bot.moving ? 'run' : 'st');
  const heroScale = (typeof window !== 'undefined' && window.HERO_SCALE) ? window.HERO_SCALE : 1.35;

  let height = 0;
  const drawAnimFn = (typeof window !== 'undefined' && typeof window.drawAnim === 'function') ? window.drawAnim : null;

  if (g && g.anim && drawAnimFn) {
    try {
      height = drawAnimFn(g.anim, curAct, bot.dir || 0, bot.animT || 0, bot.x, bot.y, heroScale);
    } catch (e) {
      height = 0;
    }
  }

  const drawSpriteFn = (typeof window !== 'undefined' && typeof window.drawSprite === 'function') ? window.drawSprite : null;
  const imgFn = (typeof window !== 'undefined' && typeof window.img === 'function') ? window.img : null;
  if (!height && g && drawSpriteFn && imgFn) {
    try {
      drawSpriteFn(imgFn(g.img), g.sz, bot.x, bot.y, heroScale, false);
      height = 55;
    } catch (e) {
      height = 0;
    }
  }

  if (!height) {
    ctx.fillStyle = bot.color || '#ffbb33';
    ctx.beginPath();
    ctx.arc(bot.x, bot.y - 20, 14, 0, 7);
    ctx.fill();
    height = 50;
  }

  const topY = bot.y - (height ? Math.min(height, 90) * 0.9 : 52) - 6;

  // 3. Tên nhân vật, danh hiệu môn phái và thanh máu
  const labelFn = (typeof window !== 'undefined' && typeof window.label === 'function') ? window.label : null;
  if (labelFn) {
    labelFn(bot.x, topY, bot.name + ' · Lv' + bot.level, bot.color, 12, bot.hp / bot.maxHp, '#7cff79', bot.facTitle, '#aaccff');
  }

  // 4. Bong bóng chat trên đầu
  if ((bot.chatT || 0) > 0 && bot.chatText) {
    bot.chatT -= dt;
    if (bot.chatT <= 0) {
      bot.chatText = '';
    } else {
      const bubbleTopY = topY - (bot.facTitle ? 32 : 18);
      const alpha = Math.min(1, Math.max(0, bot.chatT / 0.5));
      if (typeof window.drawSpeechBubble === 'function') {
        window.drawSpeechBubble(ctx, bot.x, bubbleTopY, bot.chatText, '#ffd24a', alpha);
      }
    }
  }
}

function drawSpeechBubble(ctx, x, topY, text, col = '#ffd24a', alpha = 1) {
  if (!ctx || !text) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.font = '12px "IBM Plex Mono", "Noto Sans", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxLineLen = 22;
  const words = String(text).split(' ');
  const lines = [];
  let curLine = '';
  for (const w of words) {
    if (!curLine) curLine = w;
    else if ((curLine + ' ' + w).length <= maxLineLen) curLine += ' ' + w;
    else { lines.push(curLine); curLine = w; }
  }
  if (curLine) lines.push(curLine);
  if (lines.length > 3) { lines.length = 3; lines[2] += '…'; }

  const lineH = 16;
  let maxW = 36;
  for (const l of lines) {
    const w = ctx.measureText(l).width;
    if (w > maxW) maxW = w;
  }
  const padX = 10, padY = 5;
  const bw = Math.min(maxW + padX * 2, 260);
  const bh = lines.length * lineH + padY * 2;
  const bx = Math.round(x - bw / 2);
  const by = Math.round(topY - bh - 8);

  ctx.fillStyle = 'rgba(10, 14, 18, 0.94)';
  ctx.strokeStyle = col || '#ffd24a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 4);
  else ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(10, 14, 18, 0.94)';
  ctx.beginPath();
  ctx.moveTo(x - 5, by + bh);
  ctx.lineTo(x, by + bh + 5);
  ctx.lineTo(x + 5, by + bh);
  ctx.fill();

  ctx.strokeStyle = col || '#ffd24a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 5, by + bh);
  ctx.lineTo(x, by + bh + 5);
  ctx.lineTo(x + 5, by + bh);
  ctx.stroke();

  ctx.fillStyle = 'rgba(10, 14, 18, 0.94)';
  ctx.fillRect(x - 4, by + bh - 1, 8, 2);

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 3;
  const startY = by + padY + lineH / 2;
  lines.forEach((l, idx) => {
    ctx.fillText(l, x, startY + idx * lineH);
  });
  ctx.restore();
}

// Xuất ra window toàn cục
if (typeof window !== 'undefined') {
  if (typeof window.heroGfx !== 'function') {
    window.heroGfx = function(fac, sex) {
      const wHero = (window.JW && window.JW.hero) ? window.JW.hero : null;
      if (!wHero) return null;
      return wHero[fac] || wHero.shaolin || Object.values(wHero)[0] || null;
    };
  }
  if (typeof window.drawSpeechBubble !== 'function') window.drawSpeechBubble = drawSpeechBubble;
  window.SIMBOTS = SIMBOTS;
  window.simbotTick = simbotTick;
  window.simbotEnts = simbotEnts;
  window.simbotDraw = simbotDraw;
}

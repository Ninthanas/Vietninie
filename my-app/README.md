# Vietninie React

React + TypeScript + Vite. Cấu trúc thư mục theo feature; `products/cart` trong mẫu được thay bằng nghiệp vụ học ngoại ngữ.

## Chạy dự án

Yêu cầu Node.js 22 trở lên.

```sh
npm ci
npm run dev
npm run build
npm run preview
npm run lint
```

Sao chép `.env.example` thành `.env` khi cần thay đổi địa chỉ API. Không đặt khóa Gemini vào biến `VITE_*`: mọi biến này đều xuất hiện trong frontend. Khóa Gemini được lưu riêng trên Render, dịch vụ chạy bằng `../backend/chat-server.mjs`.

## Kiến trúc

- `assets`: hình ảnh và bảng tra phồn thể; thư mục `fonts/icons` sẵn để thêm tài nguyên riêng.
- `components/ui`: Button dùng CSS module, Card.
- `components/layout`: MainLayout và điều hướng chung.
- `features`: auth, vocabulary, grammar, practice, progress, chat; mỗi feature xuất public API từ `index.ts`.
- `pages`: mỗi trang tương ứng một route.
- `routes`: HashRouter và ProtectedRoute để dùng cho các trang cần tài khoản.
- `hooks`: lưu trữ và debounce; `services`: API client/endpoints.
- `store`: Zustand; `context`: theme.
- `utils`: chuẩn hóa tìm kiếm, làm sạch HTML, phát âm.
- `styles`: theme, responsive và CSS toàn cục.
- `public/data`: toàn bộ JSON thật từ website gốc.

HashRouter giúp trang con hoạt động khi tải lại trên GitHub Pages. `base: './'` cho phép chạy build tại thư mục con.

## Các luồng đã chuyển sang React

Trang tổng quan, tìm/lọc từ vựng, từ yêu thích, từ đã học, flashcard, chi tiết và phồn thể, ngữ pháp có câu hỏi luyện tập, hội thoại song ngữ, luyện nghe theo cấp độ, quiz có chấm điểm, thuật ngữ chuyên ngành, phỏng vấn và cẩm nang PM/công cụ, tiến độ, sao lưu/khôi phục, giao diện tối và hộp chat Gemini.

Tiến độ dùng lại khóa `sentruc_learned_zh/vi`, `sentruc_favorites_zh/vi`, `sentruc_daily_log`. Cùng origin GitHub Pages sẽ đọc lại tiến độ cũ. Localhost có bộ nhớ riêng; dùng xuất/nhập để chuyển. Kết quả quiz React dùng khóa riêng `vietninie_react_quiz_history`.

## Phạm vi chuyển đổi còn lại

Bản website cũ được giữ nguyên ở thư mục cha. Khóa học bốn bước, kiểm tra đầu vào, lịch SRS, CMS và các chế độ quiz mở rộng của bản cũ chưa được viết lại trong bản React. Các công cụ này vẫn có thể dùng trên website gốc. Bản React hiện là bản thiết kế lại các luồng học chính, không thay thế toàn bộ website cũ.

Backend Java/Spring Boot mới nằm trong `../backend-java`. Đặt `VITE_API_URL` trỏ tới dịch vụ này để dùng tài khoản JWT, lấy dữ liệu từ database, đồng bộ tiến độ và chat có đăng nhập. Để trống biến này thì bản công khai tiếp tục dùng dữ liệu tĩnh và dịch vụ chat Node hiện tại. Hướng dẫn đầy đủ ở `../backend-java/README.md`. Không mang cầu nối Turso có thông tin truy cập trong JavaScript cũ sang bản React.

## Xuất bản xem thử

```sh
npm run build
node scripts/publish-preview.mjs
```

Đưa thư mục `../react` lên GitHub để mở tại `/Vietninie/react/`. Website gốc và dịch vụ Gemini vẫn giữ địa chỉ hiện tại. Script sao chép không xóa tệp để tránh tác động nhầm dữ liệu; các asset cũ không được tham chiếu có thể dọn thủ công khi cần.

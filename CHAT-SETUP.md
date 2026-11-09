# Chat AI Vietninie

Chat đã được gắn vào trang chủ và 9 trang học. Hội thoại chỉ giữ trong bộ nhớ trang, không lưu vào localStorage. Nội dung được hiển thị dưới dạng văn bản để tránh chèn HTML.

## Chạy dịch vụ AI

Yêu cầu Node.js 22 trở lên. Không cần cài thêm thư viện hoặc chạy cơ sở dữ liệu.

1. Sao chép `backend/chat.env.example` thành `backend/chat.env` (tệp này bị git bỏ qua).
2. Điền `GEMINI_API_KEY` lấy từ https://aistudio.google.com/api-keys và `GEMINI_MODEL` (mặc định `gemini-3.5-flash`). Khóa chỉ nằm ở máy chủ.
3. Từ thư mục dự án chạy:

```
node --env-file=backend/chat.env backend/chat-server.mjs
```

Phục vụ website tại http://localhost:8080 để thử kết nối tự động với dịch vụ chat cổng 8787.

## Đưa lên website

GitHub Pages chỉ chạy giao diện, cần triển khai `backend/chat-server.mjs` trên máy chủ Node có HTTPS. Đặt các biến môi trường trên máy chủ, cấu hình cổng theo nền tảng triển khai, rồi sửa `js/chat-config.js`:

```
window.VIETNINIE_CHAT_URL = 'https://YOUR-CHAT-HOST/api/chat';
```

Đặt `CHAT_ALLOWED_ORIGINS` thành các nguồn website thực tế, phân cách bằng dấu phẩy. Không đưa khóa API vào JavaScript hoặc GitHub. Hiện giới hạn toàn dịch vụ 20 yêu cầu/phút và 3 yêu cầu đồng thời trong mỗi tiến trình; khi mở rộng nhiều tiến trình cần giới hạn dùng chung ở cổng dịch vụ. Origin không phải cơ chế xác thực. Thiết lập giới hạn ngân sách tại nhà cung cấp trước khi mở công khai.

## Kiểm tra

```
node --test backend/chat-server.test.mjs
```

Kiểm tra tự động dùng dịch vụ giả lập, không tiêu tốn API. Chưa thử gọi AI thật vì chưa có khóa/model được cấu hình. Chưa kiểm tra trực quan trong trình duyệt và chưa triển khai dịch vụ.

API tham khảo: https://ai.google.dev/api/generate-content

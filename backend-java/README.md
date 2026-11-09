# Vietninie — Java Spring Boot backend

Java 21, Spring Boot 3.5.16, Spring Security, JWT HS256, Spring Data JPA/Hibernate. Backend riêng với frontend React trong `../my-app`.

## Cấu trúc

```text
src/main/java/com/vietninie/api/
├── controller/        # HTTP API, validation, lấy danh tính từ JWT
├── request/           # DTO nhận dữ liệu
├── response/          # DTO trả dữ liệu, không trả entity/password
├── model/             # JPA entities
├── service/           # Service interfaces
│   └── impl/          # Implementations
├── repository/        # Spring Data JPA repositories
├── enums/             # Role, LearningLanguage, ContentType...
├── security/          # JWT, RBAC, CORS, giới hạn đăng nhập
├── config/            # Seed dữ liệu, giới hạn JSON
└── exception/         # Xử lý lỗi thống nhất
```

Dùng `enums` vì `enum` là từ khóa Java; service interface ở `service`, implementation ở `service/impl`.

## Chạy trên máy

1. Cài Java 21 hoặc đặt `JAVA_HOME` trỏ tới JDK 21. Maven Wrapper đã có sẵn.
2. Sao chép `.env.example` thành `.env`.
3. Tạo khóa ký JWT ngẫu nhiên, lưu vào `JWT_SECRET` trong `.env`:

```sh
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

4. Điền `GEMINI_API_KEY` nếu cần chat. Khóa này chỉ nằm ở backend.
5. Build và kiểm thử:

```powershell
./mvnw.cmd verify
./run.ps1
```

Trên macOS/Linux dùng `./mvnw verify`, xuất các biến môi trường rồi chạy `java -jar target/vietninie-api-1.0.0.jar`.

`run.ps1` đọc `.env`, chạy profile `local`. Mặc định H2 dạng file tại `backend-java/data/vietninie.mv.db`, không cần cài database. Không bật H2 Console. `.env`, database và thư mục build đều bị Git bỏ qua. Spring không tự đọc `.env` khi chạy trực tiếp bằng `java`; cần export biến hoặc dùng script.

## Hibernate và PostgreSQL

`spring.jpa.hibernate.ddl-auto=${DDL_AUTO:update}` tự tạo/cập nhật các **bảng, cột và ràng buộc** từ entity, không xóa dữ liệu mỗi lần chạy. Hibernate không tự tạo một PostgreSQL database/server mới.

Docker Compose bên dưới tạo PostgreSQL database `vietninie`, sau đó Hibernate tự tạo schema. Chạy từ thư mục repository:

```sh
docker compose --env-file backend-java/.env -f backend-java/compose.yml up --build
```

Điền `DB_PASSWORD` và `JWT_SECRET` trước khi chạy. PostgreSQL có volume riêng để giữ dữ liệu. Nếu dùng PostgreSQL đã có, cấu hình `DB_URL` dạng `jdbc:postgresql://host:5432/database`, `DB_USERNAME`, `DB_PASSWORD`, rồi chạy `./run.ps1 -Profile postgres`.

Các JSON gốc được sao chép vào `src/main/resources/seed` và đóng gói vào JAR để backend chạy độc lập và seed vào database cho lần đầu mỗi bộ dữ liệu. Không ghi đè dữ liệu đã có mỗi lần restart. Bản này không tự chuyển tài khoản/mật khẩu hoặc tiến độ từ Turso cũ; không có truy cập hay sửa database cũ. Khi schema sản xuất phức tạp hơn, có thể chuyển `DDL_AUTO=validate` và dùng migration có phiên bản.

## JWT và RBAC

- Đăng ký chỉ tạo `USER`; DTO không nhận role. Mật khẩu tối thiểu 10 ký tự, tối đa 72 byte UTF-8; lưu bằng BCrypt cost 12.
- JWT ký HS256, khóa tối thiểu 32 byte sau giải mã Base64; bắt buộc có issuer, audience, hạn sử dụng và token version. Mặc định 15 phút, cấu hình 1–60 phút.
- Header: `Authorization: Bearer <access_token>`. Không truyền token bằng URL và không dùng cookie/session HTTP.
- Mỗi request xác thực còn kiểm tra trạng thái tài khoản, role và token version từ database. Đăng xuất vô hiệu **tất cả JWT của tài khoản**. Đổi quyền vô hiệu token cũ ngay.
- ADMIN quản lý nội dung và vai trò. Không thể tự đổi quyền của chính mình. Không có mật khẩu admin mặc định trong mã nguồn.
- Muốn tạo admin đầu tiên: điền `BOOTSTRAP_ADMIN_USERNAME` và `BOOTSTRAP_ADMIN_PASSWORD` (tối thiểu 12 ký tự) trong biến môi trường. Bootstrap chỉ tạo khi username chưa tồn tại, không tự nâng quyền tài khoản có sẵn. Gỡ hai biến này sau lần khởi tạo đầu tiên.
- Progress dùng `/me`, lấy user ID từ JWT; client không được chọn user ID khác.
- Tắt CSRF vì API stateless chỉ nhận bearer token trong header; CORS giới hạn origin cụ thể. Khi triển khai phải dùng HTTPS.
- Giới hạn đăng nhập/đăng ký 20 yêu cầu/phút theo IP kết nối trực tiếp. Chat 20 yêu cầu/phút/tài khoản, tối đa 3 yêu cầu đồng thời mỗi tiến trình. Khi chạy nhiều instance, thay bằng limiter chung ở gateway/Redis; không tin trực tiếp `X-Forwarded-For` từ client.

## API

Request/response JSON dùng `snake_case` để phù hợp frontend hiện tại.

| API | Quyền | Công dụng |
| --- | --- | --- |
| `GET /health` | Public | Kiểm tra dịch vụ |
| `POST /api/auth/register` | Public | Đăng ký |
| `POST /api/auth/login` | Public | Nhận JWT |
| `GET /api/auth/me` | USER/ADMIN | Thông tin tài khoản |
| `POST /api/auth/logout` | USER/ADMIN | Thu hồi token |
| `GET /api/vocabulary?language=zh&level=HSK%202&page=0&size=36` | Public | Tìm/lọc/phân trang |
| `GET /api/vocabulary/{sourceId}?language=zh` | Public | Chi tiết từ |
| `GET /api/grammar?language=zh` | Public | Ngữ pháp |
| `GET /api/conversations`, `GET /api/conversations/{sourceId}` | Public | Hội thoại |
| `GET /api/specialized` | Public | Thuật ngữ và cẩm nang |
| `GET /api/data/{filename}` | Public | Bộ dữ liệu JSON cho React |
| `GET /api/progress/me?language=zh` | USER/ADMIN | Tiến độ cá nhân |
| `PUT /api/progress/me/vocabulary/{id}?language=zh` | USER/ADMIN | Lưu trạng thái từ |
| `POST /api/progress/me/quiz-scores` | USER/ADMIN | Lưu kết quả luyện tập |
| `GET /api/progress/me/quiz-scores` | USER/ADMIN | 50 kết quả gần nhất |
| `POST /api/chat` | USER/ADMIN | Hỏi Gemini |
| `GET /api/admin/users` | ADMIN | Danh sách tài khoản |
| `PUT /api/admin/users/{id}/roles` | ADMIN | Đổi vai trò |
| `POST /api/admin/content` | ADMIN | Tạo nội dung |
| `PUT /api/admin/content/{id}` | ADMIN | Cập nhật nội dung |
| `DELETE /api/admin/content/{id}` | ADMIN | Xóa nội dung |

Đăng ký: `{"username":"learner","password":"your-strong-password","display_name":"Người học"}`.

Lưu từ: `{"learned":true,"favorite":false}`. Lưu quiz: `{"language":"zh","score":8,"total":10}`. Điểm quiz là kết quả luyện tập do client báo cáo, không dùng làm điểm thi/chứng chỉ có tính xác thực.

Chat: `{"messages":[{"role":"user","content":"Giải thích từ 你好"}]}`. Không nhận role `system`, giới hạn 12 lượt; câu cuối phải là câu hỏi user tối đa 2000 ký tự. Khóa Gemini và lỗi chi tiết từ nhà cung cấp không trả ra client.

Nội dung quản trị: `{"content_type":"VOCABULARY","language":"zh","source_id":"10001","title":"学习","level":"HSK 1","topic":"education","payload":{"id":10001,"word":"学习","pinyin":"xuéxí","meaning_vi":"Học tập","level":"HSK 1"}}`.

## Nối frontend React

Trong `my-app/.env.development.local`:

```dotenv
VITE_API_URL=http://127.0.0.1:8080
```

Chạy `npm run dev` trong `my-app`. Khi có `VITE_API_URL`, dữ liệu, tài khoản, chat và tiến độ dùng Spring Boot. JWT chỉ gắn vào request tới backend đã cấu hình; lưu token theo phiên tab bằng sessionStorage. Logout gọi backend để thu hồi JWT. Hết hạn cần đăng nhập lại; chưa có refresh token.

Khi không cấu hình `VITE_API_URL`, bản React vẫn dùng dữ liệu tĩnh và chat Node hiện tại. Không đổi địa chỉ live sang Java trước khi có máy chủ Java và PostgreSQL được triển khai. Cấu hình frontend production phải dùng HTTPS, không dùng địa chỉ localhost.

## Kiểm thử và triển khai

Kiểm thử tích hợp dùng H2 thật và Spring Security filter chain: seed/tạo schema, băm mật khẩu, chống tự gán ADMIN, RBAC, JWT bị sửa/hết hạn/sai audience, thu hồi token khi logout/đổi quyền, cách ly progress, validation và CORS. Docker/PostgreSQL cần chạy trên máy có Docker; máy thực hiện hiện không có Docker, nên không tuyên bố đã kiểm thử PostgreSQL thực tế.

Backend Java đã được build và chạy local. Dịch vụ Java chưa triển khai lên Render; backend Node đang phục vụ website công khai được giữ nguyên.

Tham khảo: [Spring Security JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html), [Hibernate schema initialization](https://docs.spring.io/spring-boot/how-to/data-initialization.html).

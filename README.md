# AutoWeb CMS - Cloudflare Multi-Site Deployer & Manager

**AutoWeb CMS** là một hệ thống quản lý và tự động hóa triển khai các trang web chạy trên nền tảng **Next.js** lên hạ tầng serverless của **Cloudflare (Workers & Pages)**. Hệ thống cho phép bạn tạo mới website, tự động thiết lập cơ sở dữ liệu D1, cấu hình R2 storage và triển khai chỉ với một nút bấm trực quan từ Dashboard quản trị.

---

## 🚀 Tính Năng Nổi Bật

- **Quản lý đa trang (Multi-tenant):** Quản lý và theo dõi trạng thái của nhiều website độc lập trên cùng một giao diện.
- **Mẫu giao diện đa dạng (Templates):** Hỗ trợ triển khai nhanh các mẫu trang web khác nhau:
  - `commandcode`: Landing Page tiếng Anh hiện đại tối ưu hóa cho AI Agent, hỗ trợ cập nhật thay đổi (changelog).
  - `ngo-quyen`: Cổng thông tin điện tử trường học/doanh nghiệp đầy đủ phân hệ tin tức, bình chọn, tài liệu...
- **Hệ thống dữ liệu kép:** Tự động sử dụng MySQL khi chạy local phát triển và tự động chuyển đổi sang Cloudflare D1 khi chạy thực tế trên Cloudflare.
- **Hỗ trợ media thông minh:** 
  - Tải lên ảnh gốc và tự động tạo thumbnail nén nhẹ (`_thumb.webp`) để tối ưu hóa tốc độ tải trang.
  - Tương thích tốt với API WordPress (`/wp-json/wp/v2/media`) giúp kết nối với các ứng dụng viết bài bên thứ ba.
  - **Database Storage Fallback:** Tự động lưu trữ ảnh an toàn vào Database và cung cấp link truy cập sạch nếu Cloudflare R2 chưa kích hoạt hoặc ổ đĩa server ở chế độ Read-Only.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Local

### 1. Clone Dự Án từ Git
Mở terminal ở máy tính của bạn và thực hiện clone dự án về máy:
```bash
git clone https://github.com/tubecreate/autoweb-cms.git
cd autoweb-cms
```

### 2. Cài Đặt Các Thư Viện Liên Quan (Dependencies)
Cài đặt các gói thư viện cần thiết cho server quản lý:
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường (Environment Variables)
Tạo file `.env` ở thư mục gốc của dự án (`autoweb-cms/`) và điền thông tin tài khoản Cloudflare mặc định của bạn:
```env
CLOUDFLARE_ACCOUNT_ID=mã_tài_khoản_cloudflare_của_bạn
CLOUDFLARE_API_KEY=mã_global_api_key_của_bạn
CLOUDFLARE_EMAIL=email_đăng_nhập_cloudflare_của_bạn
```

*Lưu ý: API Key, Email và Account ID này sẽ được hệ thống sử dụng làm mặc định để tự động tạo Worker, Database D1, R2 Bucket trên tài khoản Cloudflare của bạn khi bạn chọn tích "Sử dụng thông tin mặc định".*

### 4. Khởi Chạy Server Quản Trị
```bash
npm run dev
```
Sau khi chạy, giao diện dashboard quản lý triển khai sẽ khả dụng tại địa chỉ:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🖥️ Hướng Dẫn Triển Khai Một Website Mới

1. Truy cập vào **[http://localhost:3000](http://localhost:3000)**.
2. Bấm vào nút **`Tạo Website Mới`** ở góc trên cùng bên phải giao diện.
3. Nhập các thông tin bắt buộc:
   - **Tên Website:** (Viết liền không dấu, không khoảng cách, ví dụ: `my-site`). Tên này sẽ dùng để đặt tên Worker, D1 DB và Subdomain trên Cloudflare.
   - **Mẫu Website (Template):** Chọn mẫu bạn muốn khởi tạo (Ví dụ: `Landing Page tiếng Anh (Command Code)`).
   - **Thông tin Cloudflare:** Nhập thông tin tài khoản Cloudflare cần triển khai tới, hoặc tích chọn **Sử dụng thông tin mặc định từ hệ thống** (nếu bạn đã điền sẵn ở file `.env`).
4. Bấm **`Build & Deploy`**.
5. Giao diện console log real-time sẽ hiển thị. Server sẽ tự động thực hiện:
   - Khởi tạo thư mục dự án Next.js tương ứng từ template.
   - Tạo mới database Cloudflare D1 và chạy script khởi tạo dữ liệu (`schema.sql`).
   - Biên dịch Next.js sang định dạng tương thích Cloudflare Pages/Workers (sử dụng OpenNext).
   - Triển khai lên Cloudflare và cấp phát đường dẫn truy cập miễn phí dạng `https://[tên-web].zhenfai.workers.dev`.

---

## 📂 Cấu Trúc Dự Án

```text
autoweb-cms/
├── public/                 # Giao diện dashboard quản trị chạy local (HTML/CSS/JS)
├── sites/                  # Thư mục chứa các website Next.js đã được khởi tạo
├── templates/              # Thư mục chứa các mẫu website mẫu (Next.js boilerplate)
│   ├── commandcode/        # Template Landing Page AI Agent
│   └── ngo-quyen/          # Template Cổng thông tin trường học
├── logs/                   # Log chi tiết quá trình build & deploy của từng site
├── db.json                 # File lưu trữ danh sách và trạng thái các website ở local
├── server.js               # Express server chính xử lý các API build/deploy/wrangler
├── .gitignore              # Danh sách các file/thư mục được Git bỏ qua
└── README.md               # Tài liệu hướng dẫn sử dụng này
```

---

## 🛡️ Bảo Mật Lưu Ý

- Không commit và đẩy file `.env` lên GitHub hoặc các công cụ lưu trữ công cộng.
- Global API Key của Cloudflare có toàn quyền thay đổi tài khoản của bạn, hãy bảo mật nó tuyệt đối.

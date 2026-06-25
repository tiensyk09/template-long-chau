-- D1 SQLite Schema for Command Code Landing Page

CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  "key" TEXT NOT NULL PRIMARY KEY,
  "value" TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  tier TEXT NOT NULL DEFAULT 'Free',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image TEXT,
  author_id INTEGER,
  author_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings ("key", "value") VALUES
  ('site_title', 'Nhà thuốc FPT Long Châu - Chuyên thuốc theo đơn, thực phẩm chức năng chính hãng'),
  ('site_description', 'FPT Long Châu là chuỗi nhà thuốc bán lẻ uy tín hàng đầu Việt Nam. Cung cấp thuốc kê đơn, dược mỹ phẩm, thực phẩm chức năng chính hãng.'),
  ('site_keywords', 'nhà thuốc long châu, fpt long châu, mua thuốc trực tuyến, thực phẩm chức năng'),
  ('header_logo_text', 'FPT Long Châu'),
  ('header_logo_icon', '💊'),
  ('header_links', '[{"label":"Danh mục","href":"/#categories"},{"label":"Flash Sale","href":"/#flashsale"},{"label":"Kiểm tra sức khỏe","href":"/#healthchecks"},{"label":"Góc sức khỏe","href":"/#posts"}]'),
  ('footer_copyright', '© 2026 FPT Long Châu. Thành viên Tập đoàn FPT. GPDKKD số 0314811806 do Sở KHĐT TP.HCM cấp ngày 28/12/2017.'),
  ('footer_columns', '[{"title":"Về chúng tôi","links":[{"label":"Hệ thống cửa hàng","href":"#"},{"label":"Giấy phép kinh doanh","href":"#"},{"label":"Liên hệ","href":"#"}]},{"title":"Hỗ trợ khách hàng","links":[{"label":"Hướng dẫn mua hàng","href":"#"},{"label":"Chính sách đổi trả","href":"#"},{"label":"Chính sách vận chuyển","href":"#"}]}]');

INSERT OR IGNORE INTO users (username, password, display_name, email, role, tier, active) VALUES
  ('admin', 'pbkdf2:ba86cd946ef4872972b5b58bc72dee91:d89cd4903d993287843393306a21dc0e25c5ef5ea77d8bf6be0b64fe8af3c597', 'Administrator', 'admin@commandcode.ai', 'admin', 'Enterprise', 1),
  ('moderator', 'pbkdf2:fd926e499b50e58e8c906b115c2e2964:c8317e5d8c82f4e281a2914d3d0604aeb0326b3547b87e4c41ed170caca8cf63', 'Staff Moderator', 'mod@commandcode.ai', 'mod', 'Pro', 1);

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  layout TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO pages (slug, title, description, layout, status) VALUES (
  'about',
  'Giới thiệu Nhà thuốc FPT Long Châu',
  'Giới thiệu về FPT Long Châu - thành viên Tập đoàn FPT - chuỗi nhà thuốc hàng đầu Việt Nam.',
  '[{"id":"b_about_hero","type":"hero","visible":true,"configs":{"title":"Hệ thống nhà thuốc FPT Long Châu","description":"Thành viên tập đoàn FPT, chúng tôi cam kết cung cấp thuốc chất lượng cao, phục vụ chuyên nghiệp tận tâm với giá cả tốt nhất cho người dân Việt Nam.","buttonText":"Xem danh sách cửa hàng","buttonLink":"/#stores"}},{"id":"b_about_feat","type":"features","visible":true,"configs":{"tag":"GIÁ TRỊ CỐT LÕI","title":"Cam kết của chúng tôi","description":"Chuỗi nhà thuốc vì sức khỏe cộng đồng.","items":[{"title":"Thuốc Chính Hãng 100%","desc":"Nhập khẩu trực tiếp từ các hãng dược hàng đầu thế giới."},{"title":"Dược Sĩ Tư Vấn Tận Tâm","desc":"Đội ngũ trình độ cao, tư vấn đúng thuốc, đúng liều lượng."},{"title":"Giá Cả Tốt Nhất","desc":"Chính sách bình ổn giá, hỗ trợ tối đa cho bệnh nhân."}]}}]',
  'published'
);

INSERT OR IGNORE INTO pages (slug, title, description, layout, status) VALUES (
  'index',
  'Trang chủ',
  'Nhà thuốc FPT Long Châu - Chuyên thuốc theo đơn bác sĩ.',
  '[{"id":"b_hero_index","type":"hero","visible":true,"configs":{"title":"Nhà thuốc FPT Long Châu","description":"Chuyên thuốc theo đơn · Tư vấn dược sĩ 24/7 · Giao hàng nhanh 3h","searchPlaceholder":"Tìm tên thuốc, biệt dược, thực phẩm chức năng...","hotline":"1800 6928","shippingText":"Giao hàng hỏa tốc trong 3 giờ · Miễn phí giao đơn từ 150k"}},{"id":"b_flashsale_index","type":"flashsale","visible":true,"configs":{"title":"FLASH SALE GIÁ TỐT","duration":7200,"items":[{"name":"Sữa bột Abbott Grow 4 Hương Vani 900g","price":380000,"salePrice":329000,"discount":"-13%","sold":45,"total":50,"image":"https://nhathuoclongchau.com.vn/images/grow.png"},{"name":"Viên uống Puritan\'s Pride Vitamin C 1000mg","price":280000,"salePrice":199000,"discount":"-29%","sold":22,"total":30,"image":"https://nhathuoclongchau.com.vn/images/vitaminc.png"},{"name":"Nước nhỏ mắt Rohto Nhật Bản Cool 12ml","price":65000,"salePrice":49000,"discount":"-25%","sold":80,"total":100,"image":"https://nhathuoclongchau.com.vn/images/rohto.png"},{"name":"Dầu cá Omega 3 Fish Oil 1000mg Kirkland","price":450000,"salePrice":349000,"discount":"-22%","sold":15,"total":40,"image":"https://nhathuoclongchau.com.vn/images/fishoil.png"}]}},{"id":"b_feat_index","type":"categories","visible":true,"configs":{"title":"DANH MỤC NỔI BẬT","items":[{"title":"Thực phẩm chức năng","desc":"Hỗ trợ đề kháng, tim mạch, xương khớp","icon":"💊"},{"title":"Dược phẩm kê đơn","desc":"Thuốc đặc trị theo đơn bác sĩ","icon":"🏥"},{"title":"Thiết bị y tế","desc":"Máy đo huyết áp, tiểu đường, khẩu trang","icon":"🩺"},{"title":"Chăm sóc cá nhân","desc":"Sữa tắm, dầu gội, kem đánh răng","icon":"🧴"},{"title":"Dược mỹ phẩm","desc":"Trị mụn, chống nắng, phục hồi da","icon":"🧴"},{"title":"Sản phẩm cho mẹ & bé","desc":"Sữa công thức, bỉm, vitamin cho bé","icon":"🍼"}]}},{"id":"b_healthchecks_index","type":"healthchecks","visible":true,"configs":{"title":"KIỂM TRA SỨC KHỎE","description":"Sàng lọc sức khỏe trực tuyến nhanh chóng với kết quả tức thì cùng khuyến nghị y khoa thích hợp.","items":[{"title":"Sàng lọc tim mạch","desc":"Đánh giá nguy cơ xơ vữa động mạch & huyết áp","action":"Khảo sát ngay"},{"title":"Đánh giá tiểu đường","desc":"Nhận biết sớm nguy cơ tiểu đường tuýp 2","action":"Kiểm tra ngay"},{"title":"Khảo sát giấc ngủ","desc":"Đo lường mức độ rối loạn giấc ngủ & stress","action":"Bắt đầu"}]}},{"id":"b_audiences_index","type":"audiences","visible":true,"configs":{"title":"XEM THEO ĐỐI TƯỢNG","items":[{"name":"Người cao tuổi","desc":"Tim mạch, trí nhớ, khớp xương","tag":"Xem thuốc ➔"},{"name":"Trẻ em","desc":"Tăng đề kháng, phát triển chiều cao","tag":"Xem thuốc ➔"},{"name":"Nam giới","desc":"Tăng cường sinh lực, bổ thận","tag":"Xem thuốc ➔"},{"name":"Phụ nữ","desc":"Đẹp da, điều hòa nội tiết tố","tag":"Xem thuốc ➔"}]}},{"id":"b_brands_index","type":"brands","visible":true,"configs":{"title":"THƯƠNG HIỆU NỔI BẬT","items":[{"name":"Abbott","logo":"https://nhathuoclongchau.com.vn/images/brand-abbott.png"},{"name":"Puritan\'s Pride","logo":"https://nhathuoclongchau.com.vn/images/brand-puritan.png"},{"name":"Rohto","logo":"https://nhathuoclongchau.com.vn/images/brand-rohto.png"},{"name":"Kirkland Signature","logo":"https://nhathuoclongchau.com.vn/images/brand-kirkland.png"},{"name":"Sanofi","logo":"https://nhathuoclongchau.com.vn/images/brand-sanofi.png"},{"name":"Dược Hậu Giang (DHG)","logo":"https://nhathuoclongchau.com.vn/images/brand-dhg.png"}]}},{"id":"b_posts_index","type":"posts","visible":true,"configs":{"title":"GÓC SỨC KHỎE","description":"Kênh kiến thức y khoa chính thống từ dược sĩ & bác sĩ chuyên khoa FPT Long Châu.","limit":5,"layoutStyle":"list"}}]',
  'published'
);

CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS file_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  file_type TEXT,
  url TEXT NOT NULL,
  file_size TEXT,
  folder TEXT DEFAULT 'general',
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  uploaded_by INTEGER,
  description TEXT,
  is_public INTEGER DEFAULT 1,
  downloads INTEGER DEFAULT 0,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS post_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  name TEXT NOT NULL,
  original_name TEXT,
  file_type TEXT,
  file_size INTEGER DEFAULT 0,
  file_size_label TEXT,
  url TEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  uploaded_by INTEGER,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS download_tokens (
  token TEXT PRIMARY KEY,
  use_count INTEGER DEFAULT 0,
  expires_at INTEGER NOT NULL
);





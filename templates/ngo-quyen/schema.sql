-- D1 (SQLite) Schema for Trường Tiểu học Ngô Quyền Portal
-- Compatible with @cloudflare/next-on-pages

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  display_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  active INTEGER NOT NULL DEFAULT 1,
  join_date TEXT,
  avatar TEXT,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  image TEXT,
  author TEXT DEFAULT 'Ban Biên tập',
  category_id TEXT,
  category_name TEXT,
  tags TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  featured INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  date_display TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info',
  priority INTEGER DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS poll_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  votes INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  file_type TEXT,
  url TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  category TEXT DEFAULT 'other',
  description TEXT,
  downloads INTEGER DEFAULT 0,
  uploaded_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS post_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  name TEXT NOT NULL,
  original_name TEXT,
  file_type TEXT,
  url TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  caption TEXT,
  big_text TEXT,
  image_url TEXT,
  link TEXT DEFAULT '#',
  bg_color TEXT DEFAULT 'linear-gradient(135deg,#c8001a,#e31837)',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  "key" TEXT NOT NULL PRIMARY KEY,
  "value" TEXT
);


-- Seed categories
INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES
  ('hoat-dong-dang-uy', 'Tin tức - Sự kiện', 1),
  ('chi-dao-dieu-hanh', 'Thông báo nhà trường', 2),
  ('chinh-quyen-nha-nuoc', 'Hoạt động chuyên môn', 3),
  ('mat-tran-doan-the', 'Phong trào Đoàn - Đội', 4),
  ('cai-cach-hanh-chinh', 'Tuyển sinh đầu cấp', 5),
  ('chuyen-doi-so', 'Ứng dụng CNTT - Chuyển đổi số', 6),
  ('van-hoa-xa-hoi', 'Góc Phụ huynh', 7),
  ('kinh-te-moi-truong', 'Tài nguyên học tập', 8),
  ('lich-lam-viec', 'Lịch công tác tuần', 9),
  ('an-ninh-quoc-phong', 'Gương sáng học sinh', 10),
  ('thong-bao', 'Thông báo chung', 11);

-- Seed banners
INSERT OR IGNORE INTO banners (id, title, caption, big_text, image_url, link, bg_color, active, sort_order) VALUES
  (1, 'Trường Tiểu học Ngô Quyền - Nâng cánh ước mơ', 'Chào mừng quý phụ huynh và các em học sinh đến với website chính thức', '', '', '#', 'linear-gradient(135deg, #1a6bb5, #003380)', 1, 1),
  (2, 'Xây dựng trường học xanh - sạch - đẹp - an toàn', 'Thi đua dạy tốt - học tốt, xây dựng môi trường học đường thân thiện', '', '', '#', 'linear-gradient(135deg, #059669, #1b4332)', 1, 2),
  (3, 'Đẩy mạnh chuyển đổi số học đường', 'Ứng dụng hiệu quả công nghệ thông tin trong dạy học và quản lý giáo dục', '', '', '#', 'linear-gradient(135deg, #d32f2f, #8B0000)', 1, 3);

-- Seed default notification
INSERT OR IGNORE INTO notifications (id, title, content, type, priority, active) VALUES
  (1, 'Kế hoạch kiểm tra định kỳ cuối học kỳ II năm học 2025 - 2026', 'Thông báo chi tiết thời gian và đề cương ôn tập cuối học kỳ II', 'info', 1, 1);

-- Seed default users
INSERT OR IGNORE INTO users (username, password, display_name, email, role, active, join_date) VALUES
  ('admin', '$2b$10$gD2HEpWzRL2/B6JuOMUjy.3y31Uergnbi2pHaHDe/pfu8qS2yvusC', 'Quản trị viên', 'admin@ngo-quyen.edu.vn', 'admin', 1, '2026-01-01'),
  ('moderator', '$2b$10$IljSc3bvlNS.RSkdJRvSseiSWQhspzt7u.jJw0BZw1OEZNTIxZB/S', 'Điều hành viên', 'mod@ngo-quyen.edu.vn', 'mod', 1, '2026-01-15');

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  layout TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);



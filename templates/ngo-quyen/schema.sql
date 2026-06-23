-- D1 (SQLite) Schema for Trường Tiểu học Ngô Quyền Portal
-- Compatible with @cloudflare/next-on-pages

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  avatar TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  join_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug VARCHAR(500) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  content LONGTEXT,
  category_id VARCHAR(100),
  category_name VARCHAR(200),
  image LONGTEXT,
  author VARCHAR(200),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  featured INTEGER NOT NULL DEFAULT 0,
  views INT NOT NULL DEFAULT 0,
  post_date TEXT,
  date_display VARCHAR(100),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by INT,
  seo_title VARCHAR(500),
  seo_description TEXT,
  tags TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS poll_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INT NOT NULL,
  option_text VARCHAR(500) NOT NULL,
  votes INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text_content TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  priority INT NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  url LONGTEXT NOT NULL,
  file_size VARCHAR(50),
  folder VARCHAR(200) DEFAULT 'general',
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  uploaded_by INT,
  downloads INT DEFAULT 0,
  description TEXT,
  is_public INT DEFAULT 1,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS post_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INT,
  name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500),
  file_type VARCHAR(100),
  file_size BIGINT DEFAULT 0,
  file_size_label VARCHAR(50),
  url LONGTEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  uploaded_by INT,
  downloads INT DEFAULT 0,
  is_public INT DEFAULT 1,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(500) NOT NULL,
  caption TEXT,
  big_text VARCHAR(300),
  image_url LONGTEXT,
  link VARCHAR(500) DEFAULT '#',
  bg_color VARCHAR(200) DEFAULT 'linear-gradient(135deg,#c8001a,#e31837)',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT
);

CREATE TABLE IF NOT EXISTS file_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS download_tokens (
  token VARCHAR(200) PRIMARY KEY,
  use_count INT DEFAULT 0,
  expires_at BIGINT NOT NULL
);

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

-- Seed categories
INSERT OR IGNORE INTO categories (id, name, slug, sort_order, active) VALUES
  ('hoat-dong-dang-uy', 'Tin tức - Sự kiện', 'hoat-dong-dang-uy', 1, 1),
  ('chi-dao-dieu-hanh', 'Thông báo nhà trường', 'chi-dao-dieu-hanh', 2, 1),
  ('chinh-quyen-nha-nuoc', 'Hoạt động chuyên môn', 'chinh-quyen-nha-nuoc', 3, 1),
  ('mat-tran-doan-the', 'Phong trào Đoàn - Đội', 'mat-tran-doan-the', 4, 1),
  ('cai-cach-hanh-chinh', 'Tuyển sinh đầu cấp', 'cai-cach-hanh-chinh', 5, 1),
  ('chuyen-doi-so', 'Ứng dụng CNTT - Chuyển đổi số', 'chuyen-doi-so', 6, 1),
  ('van-hoa-xa-hoi', 'Góc Phụ huynh', 'van-hoa-xa-hoi', 7, 1),
  ('kinh-te-moi-truong', 'Tài nguyên học tập', 'kinh-te-moi-truong', 8, 1),
  ('lich-lam-viec', 'Lịch công tác tuần', 'lich-lam-viec', 9, 1),
  ('an-ninh-quoc-phong', 'Gương sáng học sinh', 'an-ninh-quoc-phong', 10, 1),
  ('thong-bao', 'Thông báo chung', 'thong-bao', 11, 1);

-- Seed banners
INSERT OR IGNORE INTO banners (id, title, caption, big_text, image_url, link, bg_color, active, sort_order) VALUES
  (1, 'Trường Tiểu học Ngô Quyền - Nâng cánh ước mơ', 'Chào mừng quý phụ huynh và các em học sinh đến với website chính thức', '', '', '#', 'linear-gradient(135deg, #1a6bb5, #003380)', 1, 1),
  (2, 'Xây dựng trường học xanh - sạch - đẹp - an toàn', 'Thi đua dạy tốt - học tốt, xây dựng môi trường học đường thân thiện', '', '', '#', 'linear-gradient(135deg, #059669, #1b4332)', 1, 2),
  (3, 'Đẩy mạnh chuyển đổi số học đường', 'Ứng dụng hiệu quả công nghệ thông tin trong dạy học và quản lý giáo dục', '', '', '#', 'linear-gradient(135deg, #d32f2f, #8B0000)', 1, 3);

-- Seed default notification
INSERT OR IGNORE INTO notifications (id, text_content, active, priority) VALUES
  (1, 'Kế hoạch kiểm tra định kỳ cuối học kỳ II năm học 2025 - 2026', 1, 1);

-- Seed default users (admin / moderator with hashed passwords admin123 / mod123)
INSERT OR IGNORE INTO users (username, password, display_name, email, role, active, join_date) VALUES
  ('admin', '$2b$10$gD2HEpWzRL2/B6JuOMUjy.3y31Uergnbi2pHaHDe/pfu8qS2yvusC', 'Quản trị viên', 'admin@ngo-quyen.edu.vn', 'admin', 1, '2026-01-01'),
  ('moderator', '$2b$10$IljSc3bvlNS.RSkdJRvSseiSWQhspzt7u.jJw0BZw1OEZNTIxZB/S', 'Điều hành viên', 'mod@ngo-quyen.edu.vn', 'mod', 1, '2026-01-15');



-- D1 SQLite Schema for DAILY KOREAN NEWS

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
  ('site_title', 'DAILY KOREAN NEWS'),
  ('site_description', '글로벌 최신 뉴스와 신뢰할 수 있는 정보. (Global latest news and reliable information)'),
  ('site_keywords', 'daily korean news, daily korean report, 한국 뉴스, 신뢰할 수 있는 정보, 실시간 속보'),
  ('header_logo_text', 'DAILY KOREAN NEWS'),
  ('header_logo_icon', '📰'),
  ('header_links', '[{"label":"홈","href":"/"},{"label":"정치","href":"/#category-politics"},{"label":"경제","href":"/#category-economy"},{"label":"사회","href":"/#category-society"},{"label":"문화","href":"/#category-culture"},{"label":"소개","href":"/about"}]'),
  ('footer_copyright', '© 2026 DAILY KOREAN NEWS. All rights reserved.'),
  ('footer_columns', '[{"title":"뉴스 카테고리","links":[{"label":"정치","href":"/#category-politics"},{"label":"경제","href":"/#category-economy"},{"label":"사회","href":"/#category-society"},{"label":"문화","href":"/#category-culture"}]},{"title":"회사소개","links":[{"label":"회사 소개","href":"/about"},{"label":"개인정보처리방침","href":"#"},{"label":"이용약관","href":"#"}]}]');

INSERT OR IGNORE INTO users (username, password, display_name, email, role, tier, active) VALUES
  ('admin', 'pbkdf2:ba86cd946ef4872972b5b58bc72dee91:d89cd4903d993287843393306a21dc0e25c5ef5ea77d8bf6be0b64fe8af3c597', '관리자', 'admin@dailykorean.news', 'admin', 'Enterprise', 1),
  ('moderator', 'pbkdf2:fd926e499b50e58e8c906b115c2e2964:c8317e5d8c82f4e281a2914d3d0604aeb0326b3547b87e4c41ed170caca8cf63', '편집자', 'editor@dailykorean.news', 'mod', 'Pro', 1);

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
  '소개',
  'DAILY KOREAN NEWS 소개 페이지입니다.',
  '[{"id":"b_hero_1","type":"hero","visible":true,"configs":{"title":"DAILY KOREAN NEWS","description":"글로벌 최신 뉴스와 신뢰할 수 있는 정보를 제공하는 종합 미디어 포털입니다.","buttonText":"첫 화면으로","buttonLink":"/"}}]',
  'published'
);

INSERT OR IGNORE INTO pages (slug, title, description, layout, status) VALUES (
  'index',
  '홈페이지',
  'DAILY KOREAN NEWS 메인 홈',
  '[]',
  'published'
);

-- Seed realistic Korean news articles matching the visual layout of dailykoreareport.com
INSERT OR IGNORE INTO posts (id, slug, title, summary, content, image, author_id, author_name, status, views, created_at, updated_at) VALUES
  (1, 'iran-300-billion-fund', '이란에 지원되는 3000억 달러 기금에 대해 알려진 것은 무엇인가? – 코리아타임스', '발행일: 2026년 6월 23일 오전 1시 28분 KST 월요일 레바논 베이루트의 라피크 하리리 국제공항으로 이어지는 고속도로를 따라 이란의 새로운 최고지도자 아야톨라 모즈타바 하메네이와 그의 고인이 된 부친 알리 하메네이의 모습이 담긴 빌보드가 서 있다. 빌보드에는 충성스러운 이란에 감사한다는 슬로건이 적혀 있다. 로이터-연합뉴스 두바이 - 중동 전쟁을...', '이란에 지원되는 3000억 달러 기금에 대해 알려진 것은 무엇인가? 발행일: 2026년 6월 23일 오전 1시 28분 KST 월요일 레바논 베이루트의 라피크 하리리 국제공항으로 이어지는 고속도로를 따라 이란의 새로운 최고지도자 아야톨라 모즈타바 하메네이와 그의 고인이 된 부친 알리 하메네이의 모습이 담긴 빌보드가 서 있다. 빌보드에는 충성스러운 이란에 감사한다는 슬로건이 적혀 있다. 로이터-연합뉴스 두바이 - 중동 전쟁을 둘러싼 긴장이 고조되는 가운데, 이란에 지원되는 자금의 세부 내역과 활용 방안에 대한 국제사회의 관심이 집중되고 있습니다.', 'https://images.unsplash.com/photo-1579621970795-87faff3f6768?q=80&w=600&auto=format&fit=crop', 1, 'Admin', 'published', 1450, '2026-06-23T01:28:00Z', '2026-06-23T01:28:00Z'),
  (2, 'us-waives-iran-sanctions', '미국, 이란 제재 유예... 트럼프 “테헤란이 잘못 처신하면 해야 할 일 할 것” – 코리아타임스', '게시일: 2026년 6월 23일 오후 2:27 KST 도널드 트럼프 미국 대통령이 6월 22일 워싱턴 백악관 집무실에서 행정명령에 서명하며 발언하고 있다. AFP-연합뉴스 스위스 뷔르겐슈토크/워싱턴 - 미국이 초기 단계의 평화 협정에 따른 첫 회담 이후 월요일부터 60일 동안 이란에 대한 제재를 유예했다. 도널드 트럼프...', '미국, 이란 제재 유예... 트럼프 “테헤란이 잘못 처신하면 해야 할 일 할 것” 게시일: 2026년 6월 23일 오후 2:27 KST 도널드 트럼프 미국 대통령이 6월 22일 워싱턴 백악관 집무실에서 행정명령에 서명하며 발언하고 있다. AFP-연합뉴스 스위스 뷔르겐슈토크/워싱턴 - 미국이 초기 단계의 평화 협정에 따른 첫 회담 이후 월요일부터 60일 동안 이란에 대한 제재를 유예했다. 도널드 트럼프 미국 대통령은 테헤란의 향후 움직임에 따라 즉각적인 제재 재개 가능성을 경고하며 강력한 경고 메시지를 보냈습니다.', 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=600&auto=format&fit=crop', 1, 'Admin', 'published', 980, '2026-06-23T14:27:00Z', '2026-06-23T14:27:00Z'),
  (3, 'sp500-nasdaq-slip', 'S&P 500, 나스닥 대형 기술주 하락에 밀려 하락; 이란 동향 주시 – 코리아타임스', '뉴욕 증시는 대형 기술주들의 차익 실현 매물 출회와 함께 중동 지역의 지정학적 긴장감을 주시하며 하락 마감했습니다. 특히 반도체 및 AI 관련 핵심 기술주들의 조정이 두드러졌습니다.', 'S&P 500, 나스닥 대형 기술주 하락에 밀려 하락; 이란 동향 주시 – 코리아타임스 뉴욕 증시는 대형 기술주들의 차익 실현 매물 출회와 함께 중동 지역의 지정학적 긴장감을 주시하며 하락 마감했습니다. 특히 반도체 및 AI 관련 핵심 기술주들의 조정이 두드러졌습니다.', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop', 1, 'Admin', 'published', 2100, '2026-06-23T15:00:00Z', '2026-06-23T15:00:00Z'),
  (4, 'philippines-school-shooting', '필리핀 고등학교 총격 사건으로 3명 사망, 경찰 학생 2명 체포 – 코리아타임스', '필리핀 마닐라 인근의 한 고등학교에서 발생한 총격 사건으로 교사와 학생을 포함해 총 3명이 사망하고 여러 명이 부상을 입었습니다. 경찰은 현장에서 용의자인 학생 2명을 긴급 체포하여 조사를 진행 중입니다.', '필리핀 고등학교 총격 사건으로 3명 사망, 경찰 학생 2명 체포 – 코리아타임스 필리핀 마닐라 인근의 한 고등학교에서 발생한 총격 사건으로 교사와 학생을 포함해 총 3명이 사망하고 여러 명이 부상을 입었습니다. 경찰은 현장에서 용의자인 학생 2명을 긴급 체포하여 조사를 진행 중입니다.', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop', 1, 'Admin', 'published', 1880, '2026-06-23T11:00:00Z', '2026-06-23T11:00:00Z'),
  (5, 'lee-hwa-young-trial', '이화영 연어 술파티 의혹 재판과 야권 내 권력 지형 변화 전망', '이화영 전 경기도 평화부지사의 재판을 둘러싼 공방이 치열해지는 가운데, 법정 진술의 신빙성 논란이 정국을 흔들고 있습니다. 이번 재판 결과에 따라 야권 내부의 역학 관계 및 차기 대권 주자들의 정치적 입지에도 상당한 파장이 예상됩니다.', '이화영 전 경기도 평화부지사의 재판을 둘러싼 공방이 치열해지는 가운데, 법정 진술의 신빙성 논란이 정국을 흔들고 있습니다. 이번 재판 결과에 따라 야권 내부의 역학 관계 및 차기 대권 주자들의 정치적 입지에도 상당한 파장이 예상됩니다.', 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=600&auto=format&fit=crop', 1, 'Admin', 'published', 3200, '2026-06-23T09:00:00Z', '2026-06-23T09:00:00Z'),
  (6, 'opposition-conflict', '야권 내 계파 갈등 본격화 및 여야 정치권 동향 분석', '공천 및 당권 경쟁을 앞두고 야당 내부의 계파 간 긴장감이 최고조에 달하고 있습니다. 여당 역시 중도층 흡수를 위한 정국 주도권 싸움에 나서면서 여야 정치권의 수싸움이 복잡하게 전개되고 있는 상황입니다.', '공천 및 당권 경쟁을 앞두고 야당 내부의 계파 간 긴장감이 최고조에 달하고 있습니다. 여당 역시 중도층 흡수를 위한 정국 주도권 싸움에 나서면서 여야 정치권의 수싸움이 복잡하게 전개되고 있는 상황입니다.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop', 1, 'Admin', 'published', 2560, '2026-06-23T08:00:00Z', '2026-06-23T08:00:00Z');

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





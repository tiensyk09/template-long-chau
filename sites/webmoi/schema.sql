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
  ('site_title', 'Command Code - AI coding agent with taste'),
  ('site_description', 'The first AI coding agent that learns your coding taste. Powered by taste-1, a meta neuro-symbolic model.'),
  ('site_keywords', 'ai coding agent, taste-1, neuro-symbolic AI, code assistant'),
  ('header_logo_text', 'Command Code'),
  ('header_logo_icon', '⚡'),
  ('header_links', '[{"label":"Docs","href":"/#docs"},{"label":"Features","href":"/#features"},{"label":"Pricing","href":"/#pricing"},{"label":"Posts","href":"/#posts"}]'),
  ('footer_copyright', '© 2026 Command Code, 2261 Market St #5698, San Francisco, CA 94114. All rights reserved.'),
  ('footer_columns', '[{"title":"Product","links":[{"label":"Docs","href":"/#docs"},{"label":"Features","href":"/#features"},{"label":"Pricing","href":"/#pricing"},{"label":"Posts","href":"/#posts"}]},{"title":"Company","links":[{"label":"About Us","href":"/about"},{"label":"Privacy Policy","href":"#"},{"label":"Terms of Service","href":"#"}]}]');

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
  'About Us',
  'Learn about the team behind Command Code and our vision.',
  '[{"id":"b_hero_1","type":"hero","visible":true,"configs":{"title":"About Command Code","description":"We are on a mission to build the first neuro-symbolic coding agent that learns your personal programming taste.","buttonText":"Try Free CLI","buttonLink":"/"}},{"id":"b_feat_1","type":"features","visible":true,"configs":{"tag":"values","title":"Our Core Principles","description":"What drives our engineering team.","items":[{"title":"Developer Autonomy","desc":"Run locally, work headless, save conventions."},{"title":"Privacy First","desc":"Memory stays local. We never train models on your private repository."},{"title":"AST-Guided Reasoning","desc":"Injecting local static code analysis context directly into model reasoning loops."}]}}]',
  'published'
);

INSERT OR IGNORE INTO pages (slug, title, description, layout, status) VALUES (
  'index',
  'Homepage',
  'The coding agent that learns the way you code.',
  '[{"id":"b_hero_index","type":"hero","visible":true,"configs":{"tag":"🎉","tagText":"Command Code raised $5M seed.","tagLink":"#","title":"Command Code with your taste","description":"The coding agent that does it all. Learns the way you code. Until coding feels like thinking. Powered by taste-1 meta neuro-symbolic AI.","buttonText":"npm i -g command-code","buttonLink":"npm i -g command-code","secondaryButtonText":"Video Demo","secondaryButtonLink":"#","metricsText":"Code 10× faster • Reviews 2× quicker • Bugs 5× fewer"}},{"id":"b_terminal_index","type":"terminal","visible":true,"configs":{"tag":"// stop patching AI slop","title":"Coding agent that learns you","description":"Code you do not fix. The best DX for coding with AI. Command continuously learns your conventions and forgets what you delete.","leftTitle":"other-agents.log","rightTitle":"command-code.log"}},{"id":"b_feat_index","type":"features","visible":true,"configs":{"tag":"// features","title":"A mode for every developer","description":"Built out of the box to fit your architecture, conventions, and style.","items":[{"title":"Always learning","desc":"Every accept, reject, and edit is a signal — auto-generates into project-level convention skills."},{"title":"Modes for moments","desc":"Interactive CLI, Headless runs via `-p`, `--yolo`, and sandboxed background runners."},{"title":"Pro tools built in","desc":"File operations, ripgrep searches, sandbox shell runs, and multi-file code editing integrations."},{"title":"Memory carryover","desc":"Custom `/agents` profiles and persistent `/memory` context settings preserved across coding sessions."},{"title":"Highly Hackable","desc":"Supports reusable custom skills, custom terminal commands, MCP servers, and editor plugins."},{"title":"Better together","desc":"Share sessions with team members easily. Run `npx taste push` or `pull` to sync developer conventions."}]}},{"id":"b_stats_index","type":"stats","visible":true,"configs":{"tag":"// metrics","title":"The math of developer DX","description":"Faster code, cleaner reviews, and fewer bugs for a dollar plan.","items":[{"val":"10×","lbl":"Faster Code","desc":"Keystroke to pull request in a fraction of the time."},{"val":"2×","lbl":"Quicker Reviews","desc":"Cleaner diffs without chasing formatting nits."},{"val":"5×","lbl":"Fewer Bugs","desc":"Code compiles and builds safely on the first merge."}]}},{"id":"b_pricing_index","type":"pricing","visible":true,"configs":{"tag":"// pricing","title":"Go Plan","description":"Everything unlocked. For a dollar.","price":"$1","period":"/mo","subtext":"Cancel any time · $10 in free startup API credits included","credits":"DeepSeek V4 Pro 4× · Nemotron 3 Ultra 2.3× · Qwen 3.7 Max 2× · MiniMax M3 20×","showSignup":true}},{"id":"b_test_index","type":"testimonials","visible":true,"configs":{"tag":"// community","title":"Loved by engineers and founders","items":[{"quote":"“ Command Code learns my taste. After a week, it stopped making the mistakes I kept fixing in other agents. The diffs feel like a senior engineer who already read the codebase. ”","author":"Zeno Rocha","title":"Founder & CEO · Resend"},{"quote":"“ Command Code is the first agent where I trust open models in production. The harness is so solid I had to double check I was still on DeepSeek Flash. Shipped multiple CLIs for $2. ”","author":"David Thyresson","title":"RedwoodSDK Contributor"}]}},{"id":"b_posts_index","type":"posts","visible":true,"configs":{"title":"What is new in Command Code","description":"Latest improvements, models updates, and feature releases.","limit":5,"layoutStyle":"list"}},{"id":"b_faq_index","type":"faq","visible":true,"configs":{"tag":"// faq","title":"Questions, answered.","description":"Everything that usually comes up before a developer team installs.","items":[{"q":"How is Command Code different from Cursor or Copilot?","a":"Command Code is a frontier coding agent that lives in your terminal and continuously learns your coding taste. Powered by taste-1, it ships, fixes, tests, and refactors with the patterns you keep — and forgets the ones you delete."},{"q":"What does \"learns my taste\" actually mean?","a":"Every accept, reject, and edit is a signal. Command Code distills those into project-level /skills and personal /memory, so the next session opens with the conventions you already prefer. No rules to write, no prompts to maintain."},{"q":"Which models can I use? Can I bring my own?","a":"Every model listed in our docs ships out of the box — Anthropic, OpenAI, Google, xAI, DeepSeek, Qwen, Kimi, GLM, MiniMax, and more. New vendors land regularly."},{"q":"Is my code used for training?","a":"No. Never. Your code, your skills, and your memory stay on your machine. Command Code never trains on your work. See our Privacy Policy."},{"q":"How do teams share taste?","a":"npx taste push to publish a project skill, npx taste pull to install one. Skills are open files in your repo — review them in PRs like any other code."},{"q":"What does it cost?","a":"We offer a Free tier for solo developers. Pro and Team plans add seats, more compute credits, and shared team taste registries. See Pricing for details."}]}}]',
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





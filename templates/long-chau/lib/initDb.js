import { query } from './db';
import { hashPassword } from './auth';

export async function initDatabase() {
  // Signups table
  await query(`
    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Settings table
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(255) NOT NULL PRIMARY KEY,
      \`value\` TEXT
    )
  `);

  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      display_name TEXT,
      email TEXT,
      role VARCHAR(50) NOT NULL DEFAULT 'member',
      tier VARCHAR(50) NOT NULL DEFAULT 'Free',
      active INTEGER NOT NULL DEFAULT 1,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Posts/Changelog table
  await query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      image TEXT,
      author_id INTEGER,
      author_name TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      views INTEGER DEFAULT 0,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now')),
      updated_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Pages table
  await query(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      layout TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'published',
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now')),
      updated_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // API Keys table
  await query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      api_key VARCHAR(255) NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // File Categories table
  await query(`
    CREATE TABLE IF NOT EXISTS file_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Files table
  await query(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(500) NOT NULL,
      file_type VARCHAR(50),
      url LONGTEXT NOT NULL,
      file_size VARCHAR(50),
      folder VARCHAR(200) DEFAULT 'general',
      uploaded_at VARCHAR(100) NOT NULL DEFAULT (datetime('now')),
      uploaded_by INT,
      description TEXT,
      is_public INT DEFAULT 1,
      downloads INT DEFAULT 0,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Post Attachments table
  await query(`
    CREATE TABLE IF NOT EXISTS post_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INT,
      name VARCHAR(500) NOT NULL,
      original_name VARCHAR(500),
      file_type VARCHAR(100),
      file_size BIGINT DEFAULT 0,
      file_size_label VARCHAR(50),
      url LONGTEXT NOT NULL,
      uploaded_at VARCHAR(100) NOT NULL DEFAULT (datetime('now')),
      uploaded_by INT,
      downloads INT DEFAULT 0,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Download tokens tracking table
  await query(`
    CREATE TABLE IF NOT EXISTS download_tokens (
      token VARCHAR(200) PRIMARY KEY,
      use_count INT DEFAULT 0,
      expires_at BIGINT NOT NULL
    )
  `);

  // Stored files table (fallback for hosting uploads in database when filesystem is read-only)
  await query(`
    CREATE TABLE IF NOT EXISTS stored_files (
      \`key\` VARCHAR(255) PRIMARY KEY,
      content LONGTEXT NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      created_at VARCHAR(100) NOT NULL DEFAULT (datetime('now'))
    )
  `);


  // Alter tables to add SEO columns dynamically if they do not exist
  const addColumns = [
    { table: 'pages', column: 'meta_title', type: 'TEXT' },
    { table: 'pages', column: 'meta_description', type: 'TEXT' },
    { table: 'pages', column: 'meta_keywords', type: 'TEXT' },
    { table: 'posts', column: 'meta_title', type: 'TEXT' },
    { table: 'posts', column: 'meta_description', type: 'TEXT' },
    { table: 'posts', column: 'meta_keywords', type: 'TEXT' }
  ];

  for (const item of addColumns) {
    try {
      await query(`ALTER TABLE ${item.table} ADD COLUMN ${item.column} ${item.type}`);
      console.log(`Added column ${item.column} to table ${item.table}`);
    } catch (err) {
      // Column already exists or error
    }
  }

  console.log('✅ Database tables created and migrated');
}

export async function seedData(adminPassword, force = false) {
  const passwordToSeed = adminPassword || 'admin123';
  
  // Check if we should force override because the database was previously seeded with Command Code data
  let isCommandCode = false;
  try {
    const existingLogo = await query('SELECT `value` FROM settings WHERE `key` = ?', ['header_logo_text']);
    if (existingLogo.length > 0 && existingLogo[0].value === 'Command Code') {
      isCommandCode = true;
    }
  } catch (e) {
    // Table or settings might not exist yet
  }

  const shouldForce = force || isCommandCode;
  
  // Seed Settings
  const defaultSettings = [
    ['site_title', 'Nhà thuốc FPT Long Châu - Chuyên thuốc theo đơn, thực phẩm chức năng chính hãng'],
    ['site_description', 'FPT Long Châu là chuỗi nhà thuốc bán lẻ uy tín hàng đầu Việt Nam. Cung cấp thuốc kê đơn, dược mỹ phẩm, thực phẩm chức năng chính hãng.'],
    ['site_keywords', 'nhà thuốc long châu, fpt long châu, mua thuốc trực tuyến, thực phẩm chức năng'],
    ['header_logo_text', 'FPT Long Châu'],
    ['header_logo_icon', '💊'],
    ['header_links', JSON.stringify([
      { label: 'Danh mục', href: '/#categories' },
      { label: 'Flash Sale', href: '/#flashsale' },
      { label: 'Kiểm tra sức khỏe', href: '/#healthchecks' },
      { label: 'Góc sức khỏe', href: '/#posts' }
    ])],
    ['footer_copyright', '© 2026 FPT Long Châu. Thành viên Tập đoàn FPT. GPDKKD số 0314811806 do Sở KHĐT TP.HCM cấp ngày 28/12/2017.'],
    ['footer_columns', JSON.stringify([
      {
        title: 'Về chúng tôi',
        links: [
          { label: 'Hệ thống cửa hàng', href: '#' },
          { label: 'Giấy phép kinh doanh', href: '#' },
          { label: 'Liên hệ đóng góp ý kiến', href: '#' }
        ]
      },
      {
        title: 'Hỗ trợ khách hàng',
        links: [
          { label: 'Hướng dẫn mua hàng trực tuyến', href: '#' },
          { label: 'Chính sách đổi trả hàng', href: '#' },
          { label: 'Chính sách giao nhận hàng', href: '#' }
        ]
      }
    ])]
  ];

  for (const [key, val] of defaultSettings) {
    try {
      if (shouldForce) {
        await query('INSERT OR REPLACE INTO settings (`key`, `value`) VALUES (?, ?)', [key, val]);
      } else {
        await query('INSERT OR IGNORE INTO settings (`key`, `value`) VALUES (?, ?)', [key, val]);
      }
    } catch (err) {
      console.error(`Failed to seed setting key ${key}:`, err);
    }
  }

  // Seed default admin and moderator users
  try {
    const adminExists = await query('SELECT id FROM users WHERE username = ?', ['admin']);
    const hashedAdminPw = await hashPassword(passwordToSeed);
    if (adminExists.length === 0) {
      await query(
        'INSERT INTO users (username, password, display_name, email, role, tier, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['admin', hashedAdminPw, 'Administrator', 'admin@commandcode.ai', 'admin', 'Enterprise']
      );
      console.log('👑 Default admin user seeded');
    } else if (adminPassword) {
      await query('UPDATE users SET password = ? WHERE username = ?', [hashedAdminPw, 'admin']);
      console.log('👑 Admin user password updated to custom password');
    }

    const modExists = await query('SELECT id FROM users WHERE username = ?', ['moderator']);
    if (modExists.length === 0) {
      const hashedModPw = await hashPassword('mod123');
      await query(
        'INSERT INTO users (username, password, display_name, email, role, tier, active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        ['moderator', hashedModPw, 'Staff Moderator', 'mod@commandcode.ai', 'mod', 'Pro']
      );
      console.log('🛡️ Default moderator user seeded');
    }
  } catch (err) {
    console.error('Failed to seed default users:', err);
  }

  // Seed default dynamic pages
  try {
    const pageExists = await query('SELECT id FROM pages WHERE slug = ?', ['about']);
    if (pageExists.length === 0 || shouldForce) {
      const defaultLayout = [
        {
          id: 'b_about_hero',
          type: 'hero',
          visible: true,
          configs: {
            title: 'Hệ thống nhà thuốc FPT Long Châu',
            description: 'Thành viên tập đoàn FPT, chúng tôi cam kết cung cấp thuốc chất lượng cao, phục vụ chuyên nghiệp tận tâm với giá cả tốt nhất cho người dân Việt Nam.',
            buttonText: 'Xem danh sách cửa hàng',
            buttonLink: '/#stores'
          }
        },
        {
          id: 'b_about_feat',
          type: 'features',
          visible: true,
          configs: {
            tag: 'GIÁ TRỊ CỐT LÕI',
            title: 'Cam kết của chúng tôi',
            description: 'Chuỗi nhà thuốc vì sức khỏe cộng đồng.',
            items: [
              { title: 'Thuốc Chính Hãng 100%', desc: 'Nhập khẩu trực tiếp từ các hãng dược hàng đầu thế giới.' },
              { title: 'Dược Sĩ Tư Vấn Tận Tâm', desc: 'Đội ngũ trình độ cao, tư vấn đúng thuốc, đúng liều lượng.' },
              { title: 'Giá Cả Tốt Nhất', desc: 'Chính sách bình ổn giá, hỗ trợ tối đa cho bệnh nhân.' }
            ]
          }
        }
      ];
      if (pageExists.length > 0) {
        await query('DELETE FROM pages WHERE slug = ?', ['about']);
      }
      await query(
        'INSERT INTO pages (slug, title, description, layout, status) VALUES (?, ?, ?, ?, ?)',
        ['about', 'Giới thiệu Nhà thuốc FPT Long Châu', 'Giới thiệu về FPT Long Châu - thành viên Tập đoàn FPT - chuỗi nhà thuốc hàng đầu Việt Nam.', JSON.stringify(defaultLayout), 'published']
      );
      console.log('📄 Default about page seeded');
    }

    const indexExists = await query('SELECT id FROM pages WHERE slug = ?', ['index']);
    if (indexExists.length === 0 || shouldForce) {
      const indexLayout = [
        {
          id: 'b_hero_index',
          type: 'hero',
          visible: true,
          configs: {
            title: 'Nhà thuốc FPT Long Châu',
            description: 'Chuyên thuốc theo đơn · Tư vấn dược sĩ 24/7 · Giao hàng nhanh 3h',
            searchPlaceholder: 'Tìm tên thuốc, biệt dược, thực phẩm chức năng...',
            hotline: '1800 6928',
            shippingText: 'Giao hàng hỏa tốc trong 3 giờ · Miễn phí giao đơn từ 150k'
          }
        },
        {
          id: 'b_flashsale_index',
          type: 'flashsale',
          visible: true,
          configs: {
            title: 'FLASH SALE GIÁ TỐT',
            duration: 7200,
            items: [
              { name: 'Sữa bột Abbott Grow 4 Hương Vani 900g', price: 380000, salePrice: 329000, discount: '-13%', sold: 45, total: 50, image: 'https://nhathuoclongchau.com.vn/images/grow.png' },
              { name: 'Viên uống Puritan\'s Pride Vitamin C 1000mg', price: 280000, salePrice: 199000, discount: '-29%', sold: 22, total: 30, image: 'https://nhathuoclongchau.com.vn/images/vitaminc.png' },
              { name: 'Nước nhỏ mắt Rohto Nhật Bản Cool 12ml', price: 65000, salePrice: 49000, discount: '-25%', sold: 80, total: 100, image: 'https://nhathuoclongchau.com.vn/images/rohto.png' },
              { name: 'Dầu cá Omega 3 Fish Oil 1000mg Kirkland', price: 450000, salePrice: 349000, discount: '-22%', sold: 15, total: 40, image: 'https://nhathuoclongchau.com.vn/images/fishoil.png' }
            ]
          }
        },
        {
          id: 'b_feat_index',
          type: 'categories',
          visible: true,
          configs: {
            title: 'DANH MỤC NỔI BẬT',
            items: [
              { title: 'Thực phẩm chức năng', desc: 'Hỗ trợ đề kháng, tim mạch, xương khớp', icon: '💊' },
              { title: 'Dược phẩm kê đơn', desc: 'Thuốc đặc trị theo đơn bác sĩ', icon: '🏥' },
              { title: 'Thiết bị y tế', desc: 'Máy đo huyết áp, tiểu đường, khẩu trang', icon: '🩺' },
              { title: 'Chăm sóc cá nhân', desc: 'Sữa tắm, dầu gội, kem đánh răng', icon: '🧴' },
              { title: 'Dược mỹ phẩm', desc: 'Trị mụn, chống nắng, phục hồi da', icon: '🧴' },
              { title: 'Sản phẩm cho mẹ & bé', desc: 'Sữa công thức, bỉm, vitamin cho bé', icon: '🍼' }
            ]
          }
        },
        {
          id: 'b_healthchecks_index',
          type: 'healthchecks',
          visible: true,
          configs: {
            title: 'KIỂM TRA SỨC KHỎE',
            description: 'Sàng lọc sức khỏe trực tuyến nhanh chóng với kết quả tức thì cùng khuyến nghị y khoa thích hợp.',
            items: [
              { title: 'Sàng lọc tim mạch', desc: 'Đánh giá nguy cơ xơ vữa động mạch & huyết áp', action: 'Khảo sát ngay' },
              { title: 'Đánh giá tiểu đường', desc: 'Nhận biết sớm nguy cơ tiểu đường tuýp 2', action: 'Kiểm tra ngay' },
              { title: 'Khảo sát giấc ngủ', desc: 'Đo lường mức độ rối loạn giấc ngủ & stress', action: 'Bắt đầu' }
            ]
          }
        },
        {
          id: 'b_audiences_index',
          type: 'audiences',
          visible: true,
          configs: {
            title: 'XEM THEO ĐỐI TƯỢNG',
            items: [
              { name: 'Người cao tuổi', desc: 'Tim mạch, trí nhớ, khớp xương', tag: 'Xem thuốc ➔' },
              { name: 'Trẻ em', desc: 'Tăng đề kháng, phát triển chiều cao', tag: 'Xem thuốc ➔' },
              { name: 'Nam giới', desc: 'Tăng cường sinh lực, bổ thận', tag: 'Xem thuốc ➔' },
              { name: 'Phụ nữ', desc: 'Đẹp da, điều hòa nội tiết tố', tag: 'Xem thuốc ➔' }
            ]
          }
        },
        {
          id: 'b_brands_index',
          type: 'brands',
          visible: true,
          configs: {
            title: 'THƯƠNG HIỆU NỔI BẬT',
            items: [
              { name: 'Abbott', logo: 'https://nhathuoclongchau.com.vn/images/brand-abbott.png' },
              { name: 'Puritan\'s Pride', logo: 'https://nhathuoclongchau.com.vn/images/brand-puritan.png' },
              { name: 'Rohto', logo: 'https://nhathuoclongchau.com.vn/images/brand-rohto.png' },
              { name: 'Kirkland Signature', logo: 'https://nhathuoclongchau.com.vn/images/brand-kirkland.png' },
              { name: 'Sanofi', logo: 'https://nhathuoclongchau.com.vn/images/brand-sanofi.png' },
              { name: 'Dược Hậu Giang (DHG)', logo: 'https://nhathuoclongchau.com.vn/images/brand-dhg.png' }
            ]
          }
        },
        {
          id: 'b_posts_index',
          type: 'posts',
          visible: true,
          configs: {
            title: 'GÓC SỨC KHỎE',
            description: 'Kênh kiến thức y khoa chính thống từ dược sĩ & bác sĩ chuyên khoa FPT Long Châu.',
            limit: 5,
            layoutStyle: 'list'
          }
        }
      ];
      if (indexExists.length > 0) {
        await query('DELETE FROM pages WHERE slug = ?', ['index']);
      }
      await query(
        'INSERT INTO pages (slug, title, description, layout, status) VALUES (?, ?, ?, ?, ?)',
        ['index', 'Trang chủ', 'Nhà thuốc FPT Long Châu - Chuyên thuốc theo đơn bác sĩ.', JSON.stringify(indexLayout), 'published']
      );
      console.log('📄 Default index/homepage seeded');
    }
  } catch (err) {
    console.error('Failed to seed default pages:', err);
  }

  // Seed default file categories
  try {
    const existingFileCats = await query('SELECT COUNT(*) as cnt FROM file_categories');
    if (existingFileCats[0].cnt === 0) {
      const defaultFileCats = [
        { name: 'Chưa phân loại', slug: 'general' },
        { name: 'Ảnh minh họa', slug: 'images' },
        { name: 'Tài liệu hướng dẫn', slug: 'documents' },
        { name: 'Mã nguồn / Code', slug: 'code' },
        { name: 'Khác', slug: 'other' }
      ];
      for (const c of defaultFileCats) {
        await query('INSERT OR IGNORE INTO file_categories (name, slug) VALUES (?, ?)', [c.name, c.slug]);
      }
      console.log('📁 Default file categories seeded');
    }
  } catch (err) {
    console.error('Failed to seed default file categories:', err);
  }

  console.log('✅ Seed data complete');
}

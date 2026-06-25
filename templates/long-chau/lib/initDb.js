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


  // ─── E-COMMERCE TABLES ───────────────────────────────────────

  // Shop Categories (danh mục sản phẩm)
  await query(`
    CREATE TABLE IF NOT EXISTS shop_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      parent_id INTEGER,
      icon TEXT,
      image TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Products (sản phẩm)
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      short_description TEXT,
      description TEXT,
      price REAL NOT NULL DEFAULT 0,
      original_price REAL,
      thumbnail TEXT,
      images TEXT,
      brand TEXT,
      origin TEXT,
      unit TEXT DEFAULT 'Hộp',
      stock INTEGER DEFAULT 0,
      sold_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      is_featured INTEGER DEFAULT 0,
      is_flash_sale INTEGER DEFAULT 0,
      flash_sale_price REAL,
      flash_sale_end TEXT,
      tags TEXT,
      meta_title TEXT,
      meta_description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES shop_categories(id) ON DELETE SET NULL
    )
  `);

  // Product Variants (biến thể sản phẩm: Hộp, Vỉ, Chai...)
  await query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Product Reviews (đánh giá)
  await query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      order_id INTEGER,
      reviewer_name TEXT NOT NULL,
      reviewer_id INTEGER,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Orders (đơn hàng)
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL UNIQUE,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      shipping_address TEXT NOT NULL,
      shipping_province TEXT,
      shipping_note TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      shipping_fee REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      coupon_code TEXT,
      payment_method TEXT DEFAULT 'cod',
      payment_status TEXT DEFAULT 'pending',
      status TEXT DEFAULT 'pending',
      admin_note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Coupons (mã giảm giá)
  await query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL DEFAULT 'percent',
      discount_value REAL NOT NULL,
      min_order REAL DEFAULT 0,
      max_discount REAL,
      usage_limit INTEGER,
      usage_count INTEGER DEFAULT 0,
      expires_at TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
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

  // Seed E-Commerce data (shop categories + sample products + coupon)
  try {
    const catCount = await query('SELECT COUNT(*) as cnt FROM shop_categories');
    if (catCount[0].cnt === 0) {
      const defaultCats = [
        { name: 'Thực phẩm chức năng', slug: 'thuc-pham-chuc-nang', icon: '💊', sort_order: 1 },
        { name: 'Dược mỹ phẩm', slug: 'duoc-my-pham', icon: '🧴', sort_order: 2 },
        { name: 'Thuốc kê đơn', slug: 'thuoc-ke-don', icon: '💉', sort_order: 3 },
        { name: 'Thiết bị y tế', slug: 'thiet-bi-y-te', icon: '🩺', sort_order: 4 },
        { name: 'Chăm sóc cá nhân', slug: 'cham-soc-ca-nhan', icon: '🪥', sort_order: 5 },
        { name: 'Sản phẩm cho mẹ & bé', slug: 'me-va-be', icon: '🍼', sort_order: 6 },
        { name: 'Vitamin & Khoáng chất', slug: 'vitamin-khoang-chat', icon: '🌟', sort_order: 7 },
        { name: 'Sữa dinh dưỡng', slug: 'sua-dinh-duong', icon: '🥛', sort_order: 8 },
      ];
      for (const c of defaultCats) {
        await query(
          'INSERT OR IGNORE INTO shop_categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)',
          [c.name, c.slug, c.icon, c.sort_order]
        );
      }
      console.log('🛍️ Default shop categories seeded');
    }

    const prodCount = await query('SELECT COUNT(*) as cnt FROM products');
    if (prodCount[0].cnt === 0) {
      const cat1 = await query("SELECT id FROM shop_categories WHERE slug = 'thuc-pham-chuc-nang'");
      const cat2 = await query("SELECT id FROM shop_categories WHERE slug = 'vitamin-khoang-chat'");
      const cat3 = await query("SELECT id FROM shop_categories WHERE slug = 'sua-dinh-duong'");
      const catId1 = cat1[0]?.id || null;
      const catId2 = cat2[0]?.id || null;
      const catId3 = cat3[0]?.id || null;

      const sampleProducts = [
        { category_id: catId1, name: 'Viên uống Vitamin C 1000mg Puritan\'s Pride', slug: 'vitamin-c-1000mg-puritans-pride', short_description: 'Tăng cường miễn dịch, chống oxy hóa, sáng da', price: 199000, original_price: 280000, thumbnail: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png', brand: 'Puritan\'s Pride', origin: 'Hoa Kỳ', unit: 'Lốc', stock: 150, is_featured: 1, is_flash_sale: 1, flash_sale_price: 149000 },
        { category_id: catId2, name: 'Omega 3 Fish Oil 1000mg Kirkland Signature', slug: 'omega-3-fish-oil-kirkland', short_description: 'Bổ tim mạch, não bộ, thị giác, chống viêm', price: 450000, original_price: 580000, thumbnail: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png', brand: 'Kirkland Signature', origin: 'Hoa Kỳ', unit: 'Hộp', stock: 80, is_featured: 1 },
        { category_id: catId3, name: 'Sữa Ensure Gold Vanilla 900g Abbott', slug: 'sua-ensure-gold-vanilla-900g', short_description: 'Tăng cường sức khỏe cơ bắp, miễn dịch cho người lớn', price: 435000, original_price: 520000, thumbnail: '/images/Sua_d4a041e21d.png', brand: 'Abbott', origin: 'Hoa Kỳ', unit: 'Hộp', stock: 60, is_featured: 1, is_flash_sale: 1, flash_sale_price: 385000 },
        { category_id: catId2, name: 'Brauer Baby & Kids Ultra Pure DHA 60 Viên', slug: 'brauer-baby-dha-60v', short_description: 'Hỗ trợ phát triển não bộ và thị lực cho trẻ', price: 486800, original_price: 580000, thumbnail: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png', brand: 'Brauer', origin: 'Úc', unit: 'Hộp', stock: 45, is_featured: 1 },
        { category_id: catId1, name: 'New Nordic Skin Care Pigment Clear 60 Viên', slug: 'new-nordic-skin-care-pigment-clear', short_description: 'Giảm vết thâm, sạm, tàn nhang, làm sáng da', price: 500000, original_price: 650000, thumbnail: '/images/vien_uong_giam_vet_tham_sam_tan_nhang_giup_da_sang_min_skin_care_pigment_clear_60v_new_nordic_00011057_2_d86c2004d6.jpg', brand: 'New Nordic', origin: 'Hàn Quốc', unit: 'Hộp', stock: 30 },
        { category_id: catId2, name: 'Vitabiotics Feroglobin B12 30 Viên Nang', slug: 'vitabiotics-feroglobin-b12', short_description: 'Bổ sung sắt và vitamin B12, phòng thiếu máu', price: 180000, original_price: 220000, thumbnail: '/images/Vitabiotics_1_8d1424372d.png', brand: 'Vitabiotics', origin: 'Anh', unit: 'Hộp', stock: 70, is_featured: 1 },
        { category_id: catId1, name: 'Glucerna Sữa Bột Dành Cho Người Đái Tháo Đường', slug: 'glucerna-sua-bot-dai-thao-duong', short_description: 'Hỗ trợ kiểm soát đường huyết, cân bằng dinh dưỡng', price: 922000, original_price: 1050000, thumbnail: '/images/Sua_d4a041e21d.png', brand: 'Abbott', origin: 'Hoa Kỳ', unit: 'Hộp', stock: 25, is_flash_sale: 1, flash_sale_price: 842000 },
        { category_id: catId2, name: 'Vitamins For Life Super B-Complex 100 Viên', slug: 'vitamins-for-life-super-b-complex', short_description: 'Bổ sung đầy đủ 8 loại vitamin nhóm B cho cơ thể', price: 250000, original_price: 320000, thumbnail: '/images/Vitamins_For_Life_1_0783ec2683.png', brand: 'Vitamins For Life', origin: 'Hoa Kỳ', unit: 'Hộp', stock: 100, is_featured: 1 },
      ];

      for (const p of sampleProducts) {
        try {
          await query(
            `INSERT OR IGNORE INTO products (category_id, name, slug, short_description, price, original_price, thumbnail, brand, origin, unit, stock, is_featured, is_flash_sale, flash_sale_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [p.category_id, p.name, p.slug, p.short_description, p.price, p.original_price || null, p.thumbnail || null, p.brand || null, p.origin || null, p.unit || 'Hộp', p.stock || 0, p.is_featured || 0, p.is_flash_sale || 0, p.flash_sale_price || null]
          );
          // Add variants for each product
          const prod = await query('SELECT id FROM products WHERE slug = ?', [p.slug]);
          if (prod.length > 0) {
            const pid = prod[0].id;
            const variantCount = await query('SELECT COUNT(*) as cnt FROM product_variants WHERE product_id = ?', [pid]);
            if (variantCount[0].cnt === 0) {
              await query('INSERT INTO product_variants (product_id, name, price, stock) VALUES (?, ?, ?, ?)', [pid, p.unit || 'Hộp', p.price, p.stock]);
              if (p.unit === 'Lốc') {
                await query('INSERT INTO product_variants (product_id, name, price, stock) VALUES (?, ?, ?, ?)', [pid, 'Hộp', Math.round(p.price / 3), p.stock * 3]);
              }
            }
          }
        } catch (e) { /* ignore duplicate */ }
      }
      console.log('🛒 Sample products seeded');
    }

    // Seed a sample coupon
    const couponExists = await query("SELECT id FROM coupons WHERE code = 'LONGCHAU10'");
    if (couponExists.length === 0) {
      await query(
        "INSERT INTO coupons (code, discount_type, discount_value, min_order, max_discount, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)",
        ['LONGCHAU10', 'percent', 10, 200000, 50000, 100]
      );
      console.log('🎟️ Sample coupon LONGCHAU10 seeded');
    }

  } catch (err) {
    console.error('Failed to seed E-Commerce data:', err);
  }

  console.log('✅ Seed data complete');
}

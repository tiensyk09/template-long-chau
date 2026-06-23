import './globals.css';
import ConditionalLayout from '../components/ConditionalLayout';
import { query } from '@/lib/db';

export const metadata = {
  title: 'Trường Tiểu học Ngô Quyền - Đà Nẵng',
  description: 'Cổng thông tin điện tử chính thức của Trường Tiểu học Ngô Quyền, Phường Quảng Phú, TP Đà Nẵng',
};

async function getThemeCss() {
  let preset = 'cyan';
  let customColorsStr = '{}';

  try {
    const rows = await query('SELECT * FROM settings WHERE \`key\` IN ("theme_preset", "theme_custom_colors")');
    rows.forEach(r => {
      if (r.key === 'theme_preset') preset = r.value;
      if (r.key === 'theme_custom_colors') customColorsStr = r.value;
    });
  } catch (dbErr) {
    // Nếu bảng chưa tồn tại hoặc lỗi kết nối, dùng giá trị mặc định
  }

  let customColors = {};
  try {
    customColors = JSON.parse(customColorsStr || '{}');
  } catch {}

  // 1. Theme Đỏ (Bù Đăng Portal style)
  if (preset === 'red') {
    return `
      :root {
        --primary: #c0392b;
        --primary-dark: #922b21;
        --primary-light: #e74c3c;
        --accent: #d4a017;
        --accent-bright: #f1c40f;
        --accent-light: #fef9e7;
        --red: #da251d;
        --gold: #ffd700;
        --banner-bg: #b94030;
        --banner-bg-2: #8B2500;
        --nav-bg: #7b1d0e;
        --nav-hover: #a52a1a;
        --bg: #faf8f5;
      }
      header.site-header {
        background: linear-gradient(135deg, #8B2500 0%, #b94030 30%, #e74c3c 50%, #b94030 70%, #8B2500 100%) !important;
        box-shadow: 0 6px 24px rgba(100, 10, 5, 0.3) !important;
      }
      nav.main-nav {
        background: linear-gradient(90deg, #7b1d0e 0%, #a52a1a 50%, #7b1d0e 100%) !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.25) !important;
      }
    `;
  }

  // 2. Theme Xanh dương (Ocean Blue)
  if (preset === 'blue') {
    return `
      :root {
        --primary: #0d5bb5;
        --primary-dark: #09409e;
        --primary-light: #2979d6;
        --accent: #0ea5e9;
        --accent-bright: #38bdf8;
        --accent-light: #e0f2fe;
        --red: #0d5bb5;
        --gold: #ffffff;
        --banner-bg: #1a4f8a;
        --banner-bg-2: #0a2d5c;
        --nav-bg: #0a3572;
        --nav-hover: #1558b0;
      }
      header.site-header {
        background: linear-gradient(135deg, #0a2d5c 0%, #1a4f8a 50%, #0a2d5c 100%) !important;
      }
      nav.main-nav {
        background: linear-gradient(90deg, #0a3572 0%, #1558b0 50%, #0a3572 100%) !important;
      }
    `;
  }

  // 3. Theme Xanh lá (Nature Green)
  if (preset === 'green') {
    return `
      :root {
        --primary: #16a34a;
        --primary-dark: #0f6b34;
        --primary-light: #22c55e;
        --accent: #84cc16;
        --accent-bright: #a3e635;
        --accent-light: #f0fdf4;
        --red: #16a34a;
        --gold: #ffffff;
        --banner-bg: #166534;
        --banner-bg-2: #0d4220;
        --nav-bg: #14532d;
        --nav-hover: #166534;
      }
      header.site-header {
        background: linear-gradient(135deg, #0d4220 0%, #166534 50%, #0d4220 100%) !important;
      }
      nav.main-nav {
        background: linear-gradient(90deg, #14532d 0%, #166534 50%, #14532d 100%) !important;
      }
    `;
  }

  // 4. Theme Tùy chỉnh (Custom HEX codes)
  if (preset === 'custom' && customColors.primary) {
    const p = customColors.primary;
    const a = customColors.accent || '#00aeef';
    const bg = customColors.bg || '#f3f6fa';
    const nav = customColors.nav_bg || p;
    return `
      :root {
        --primary: ${p};
        --accent: ${a};
        --bg: ${bg};
        --nav-bg: ${nav};
      }
      header.site-header {
        background: linear-gradient(135deg, ${p} 0%, ${a} 100%) !important;
      }
      nav.main-nav {
        background: ${nav} !important;
      }
    `;
  }

  return '';
}

export default async function RootLayout({ children }) {
  const themeCss = await getThemeCss();

  return (
    <html lang="vi">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* Dynamic theme style overrides */}
        {themeCss && <style id="dynamic-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />}
      </head>
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}

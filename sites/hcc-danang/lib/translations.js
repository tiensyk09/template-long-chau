import { cookies } from 'next/headers';

export const TRANSLATIONS = {
  vi: {
    home: 'Trang chủ',
    about: 'Giới thiệu',
    news: 'Tin tức - Sự kiện',
    edu: 'Hoạt động giáo dục',
    schedule: 'Lịch công tác',
    gallery: 'Ảnh đẹp học đường',
    categories: 'CHUYÊN MỤC',
    latest_news: 'TIN MỚI NHẤT',
    work_schedule: 'LỊCH LÀM VIỆC',
    visit_stats: 'THỐNG KÊ TRUY CẬP',
    today: 'Hôm nay',
    this_month: 'Tháng này',
    total_visits: 'Tổng lượt truy cập',
    search_placeholder: 'Tìm kiếm tin tức...',
    search_btn: 'Tìm',
    all_news: 'Tất cả tin tức',
    articles_count: 'bài viết',
    read_more: 'Xem chi tiết',
    admin_login: 'Đăng nhập quản trị',
    related_news: 'TIN LIÊN QUAN',
    author: 'Tác giả',
    source: 'Nguồn',
    back_to_list: 'Quay lại danh sách tin',
    no_articles: 'Chưa có bài viết trong chuyên mục này.',
    contact: 'Liên hệ',
  },
  en: {
    home: 'Home',
    about: 'About Us',
    news: 'News & Events',
    edu: 'Activities',
    schedule: 'Schedule',
    gallery: 'Gallery',
    categories: 'CATEGORIES',
    latest_news: 'LATEST NEWS',
    work_schedule: 'WORK SCHEDULE',
    visit_stats: 'VISIT STATISTICS',
    today: 'Today',
    this_month: 'This Month',
    total_visits: 'Total Visits',
    search_placeholder: 'Search news...',
    search_btn: 'Search',
    all_news: 'All News',
    articles_count: 'articles',
    read_more: 'Read More',
    admin_login: 'Admin Login',
    related_news: 'RELATED NEWS',
    author: 'Author',
    source: 'Source',
    back_to_list: 'Back to list',
    no_articles: 'No articles in this category.',
    contact: 'Contact',
  }
};

export async function getLanguage() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('site_lang')?.value || 'vi';
  } catch {
    return 'vi';
  }
}

export async function t(key) {
  const lang = await getLanguage();
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['vi']?.[key] || key;
}

export function getLanguageClient() {
  if (typeof window === 'undefined') return 'vi';
  const match = document.cookie.match(/site_lang=([^;]+)/);
  return match ? match[1] : 'vi';
}

export function tClient(key) {
  const lang = getLanguageClient();
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['vi']?.[key] || key;
}

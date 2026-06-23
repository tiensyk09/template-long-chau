import { query } from '@/lib/db';
import HomePageClient from '@/components/HomePageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    // Fetch index page details
    const pages = await query('SELECT * FROM pages WHERE slug = ? AND status = ?', ['index', 'published']);
    const page = pages[0];

    // Fetch site configurations
    const siteTitle = await query('SELECT "value" FROM settings WHERE "key" = ?', ['site_title']);
    const siteDesc = await query('SELECT "value" FROM settings WHERE "key" = ?', ['site_description']);
    const siteKeywords = await query('SELECT "value" FROM settings WHERE "key" = ?', ['site_keywords']);

    const defaultTitle = siteTitle[0]?.value || 'DAILY KOREAN NEWS';
    const defaultDesc = siteDesc[0]?.value || '글로벌 최신 뉴스와 신뢰할 수 있는 정보.';
    const defaultKeywords = siteKeywords[0]?.value || 'daily korean news, daily korean report, 한국 뉴스, 신뢰할 수 있는 정보';


    return {
      title: page?.meta_title || defaultTitle,
      description: page?.meta_description || page?.description || defaultDesc,
      keywords: page?.meta_keywords || defaultKeywords,
    };
  } catch (err) {
    console.error('Failed to generate index metadata:', err);
    return {
      title: 'DAILY KOREAN NEWS'
    };
  }
}

export default async function HomePage() {
  let indexLayout = null;
  let changelogs = [];

  try {
    const pages = await query('SELECT * FROM pages WHERE slug = ? AND status = ?', ['index', 'published']);
    if (pages.length > 0) {
      indexLayout = JSON.parse(pages[0].layout || '[]');
    }
  } catch (err) {
    console.error('Failed to load dynamic homepage blocks:', err);
  }

  try {
    changelogs = await query(
      'SELECT id, slug, title, summary, content, image, status, views, author_name, created_at FROM posts WHERE status = ? ORDER BY created_at DESC LIMIT 5',
      ['published']
    );
  } catch (err) {
    console.error('Failed to load homepage changelogs:', err);
  }

  return (
    <HomePageClient
      initialLayout={indexLayout}
      initialChangelogs={changelogs}
    />
  );
}

import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import PageClient from '@/components/PageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const pages = await query('SELECT * FROM pages WHERE slug = ? AND status = ?', [slug, 'published']);
    const page = pages[0];
    if (!page) {
      return { title: 'Page Not Found | Command Code' };
    }

    const siteTitleRow = await query('SELECT "value" FROM settings WHERE "key" = ?', ['site_title']);
    const siteTitleSuffix = siteTitleRow[0]?.value || 'Command Code';

    return {
      title: page.meta_title || `${page.title} | ${siteTitleSuffix}`,
      description: page.meta_description || page.description || '',
      keywords: page.meta_keywords || '',
    };
  } catch (err) {
    console.error('Failed to generate page metadata:', err);
    return { title: 'Command Code' };
  }
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  
  let page = null;
  try {
    const pages = await query('SELECT * FROM pages WHERE slug = ? AND status = ?', [slug, 'published']);
    page = pages[0];
  } catch (err) {
    console.error('Error fetching dynamic page data:', err);
  }

  if (!page) {
    notFound();
  }

  return (
    <PageClient page={page} />
  );
}

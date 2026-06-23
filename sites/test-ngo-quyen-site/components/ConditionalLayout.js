'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Navigation from './Navigation';
import MarqueeBar from './MarqueeBar';
import Footer from './Footer';
import ScrollTop from './ScrollTop';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname && pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <Navigation />
      <MarqueeBar />
      {children}
      <Footer />
      <ScrollTop />
    </>
  );
}

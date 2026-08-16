import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { PageSpinner } from '@/components/PageSpinner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

/** Primary layout: top navbar, routed content, footer. */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-8">
        <Suspense fallback={<PageSpinner />}><Outlet /></Suspense>
      </main>
      <Footer />
    </div>
  );
}

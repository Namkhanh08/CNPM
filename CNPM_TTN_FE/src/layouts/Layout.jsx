import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header, Hero, Footer, Navbar } from '../components';

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="antialiased min-h-screen flex flex-col">
      <Navbar />
      {isHomePage && <Hero />}
      {isHomePage && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


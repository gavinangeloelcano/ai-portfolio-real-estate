'use client';
import { useEffect, useState } from 'react';

export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={scrolled ? 'sticky-header scrolled' : 'sticky-header'}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <strong style={{fontSize:16}}>AI Portfolio Pro</strong>
        <nav style={{display:'flex',gap:12}}>
          <a href="/">Home</a>
          <a href="/real-estate">Real Estate</a>
        </nav>
      </div>
    </header>
  );
}

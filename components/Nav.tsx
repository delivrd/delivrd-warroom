'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase';

const T = {
  bg: '#0B0D10',
  surface: '#12151A',
  border: 'rgba(255,255,255,0.06)',
  blue: '#5A9CF5',
  blueGlow: 'rgba(90,156,245,0.15)',
  text: '#DFE1E5',
  textBright: '#F2F3F5',
  textMid: '#9DA3AE',
  textDim: '#606878',
  textFaint: '#3A4050',
  green: '#2DD881',
};

const NAV_LINKS = [
  { href: '/library', label: 'Library' },
  { href: '/sprints', label: 'Sprints' },
  { href: '/map', label: 'Map' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/contacts', label: 'Contacts' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(11,13,16,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${T.border}`,
    }}>
      {/* Top accent line */}
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, transparent 10%, ${T.blue}40 50%, transparent 90%)`,
      }} />

      <div style={{
        maxWidth: '1440px', margin: '0 auto', padding: '0 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: '52px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="https://cdn.prod.website-files.com/64385d3c78af797e73f21562/65e919896fc3669ecfe1d74b_Delivrd_2024_white_long%404x.png"
            alt="Delivrd"
            style={{ height: '18px', opacity: 0.95 }}
          />
          <div style={{ width: '1px', height: '16px', background: T.border }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: T.textDim, letterSpacing: '0.5px' }}>War Room</span>
          {/* Live dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '4px' }}>
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: T.green, boxShadow: `0 0 6px ${T.green}60`,
              animation: 'pulse 2s infinite',
            }} />
          </div>
        </div>

        {/* Navigation links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {NAV_LINKS.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} style={{
                padding: '6px 14px',
                fontSize: '12px', fontWeight: active ? 600 : 450,
                color: active ? T.textBright : T.textDim,
                textDecoration: 'none',
                borderRadius: '6px',
                background: active ? T.blueGlow : 'transparent',
                border: active ? `1px solid ${T.blue}15` : '1px solid transparent',
                transition: 'all 0.12s ease',
                letterSpacing: '-0.1px',
              }}
              onMouseEnter={e => { if (!active) { (e.target as HTMLElement).style.color = T.textMid; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}}
              onMouseLeave={e => { if (!active) { (e.target as HTMLElement).style.color = T.textDim; (e.target as HTMLElement).style.background = 'transparent'; }}}
              >
                {link.label}
              </Link>
            );
          })}

          <div style={{ width: '1px', height: '16px', background: T.border, margin: '0 8px' }} />

          <button onClick={handleLogout} style={{
            fontSize: '11px', fontWeight: 450, color: T.textFaint,
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px',
            transition: 'color 0.12s',
          }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = T.textDim}
          onMouseLeave={e => (e.target as HTMLElement).style.color = T.textFaint}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

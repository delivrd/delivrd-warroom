'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/flow', label: 'Deal Flow' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/library', label: 'Library' },
  { href: '/sprints', label: 'Sprints' },
  { href: '/map', label: 'Map' },
  { href: '/contacts', label: 'Contacts' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme: T, mode, toggle } = useTheme();

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: mode === 'dark' ? 'rgba(11,13,16,0.88)' : 'rgba(255,255,255,0.92)',
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
            style={{ height: '18px', opacity: 0.95, filter: mode === 'light' ? 'invert(1)' : 'none' }}
          />
          <div style={{ width: '1px', height: '16px', background: T.border }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: T.textDim, letterSpacing: '0.5px' }}>War Room</span>
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
                background: active ? `${T.blue}15` : 'transparent',
                border: active ? `1px solid ${T.blue}15` : '1px solid transparent',
                transition: 'all 0.12s ease',
                letterSpacing: '-0.1px',
              }}>
                {link.label}
              </Link>
            );
          })}

          <div style={{ width: '1px', height: '16px', background: T.border, margin: '0 8px' }} />

          <button onClick={toggle} style={{
            fontSize: '11px', fontWeight: 450, color: T.textDim,
            background: 'none', border: `1px solid ${T.border}`, borderRadius: '6px',
            cursor: 'pointer', padding: '4px 10px',
            transition: 'color 0.12s',
          }}>
            {mode === 'dark' ? '☀️' : '🌙'}
          </button>

          <button onClick={handleLogout} style={{
            fontSize: '11px', fontWeight: 450, color: T.textFaint,
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px',
            transition: 'color 0.12s',
          }}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

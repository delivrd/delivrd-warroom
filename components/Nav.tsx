'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const links = [
    { href: '/library', label: 'Library' },
    { href: '/sprints', label: 'Execution' },
    { href: '/map', label: 'Map' },
    { href: '/pipeline', label: 'Pipeline' },
    { href: '/contacts', label: 'Contacts' },
  ];

  return (
    <nav 
      className="sticky top-0 z-50 border-b border-war-border"
      style={{
        background: 'rgba(10,10,11,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-5">
            <span className="text-[26px] font-bold tracking-tight text-war-blue">
              DELIVRD
            </span>
            <div className="w-px h-6 bg-war-border" />
            <span className="text-label font-semibold tracking-tight text-text-mid">
              War Room
            </span>
            {/* Live indicator */}
            <div className="flex items-center gap-2.5 ml-1">
              <span 
                className="w-2 h-2 rounded-full animate-pulse shadow-lg" 
                style={{ background: '#34c759', boxShadow: '0 0 8px rgba(52,199,89,0.4)' }}
              />
              <span className="text-micro font-bold font-mono text-status-green">
                LIVE
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-10">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-label font-semibold tracking-tight transition-colors relative py-1"
                  style={{ 
                    color: isActive ? '#f5f5f7' : '#8e8e93'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#f5f5f7';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#8e8e93';
                  }}
                >
                  {link.label}
                  {isActive && (
                    <div 
                      className="absolute -bottom-5 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: '#0066ff', boxShadow: '0 0 8px rgba(0,102,255,0.4)' }}
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="w-px h-6 bg-war-border" />
            
            <button
              onClick={handleLogout}
              className="text-label font-semibold tracking-tight transition-colors text-text-dim hover:text-text-bright"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

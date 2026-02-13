'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Battle, Tier, Impact, Effort, Owner } from '@/lib/types';

// ═══ DESIGN TOKENS ═══
const T = {
  bg: '#08090B',
  surface: '#101114',
  card: '#141619',
  elevated: '#1A1D21',
  glass: 'rgba(20,22,25,0.75)',
  border: '#1E2126',
  borderLit: '#2A2E34',

  blue: '#5A9CF5',
  blueHot: '#6BABFF',
  blueWash: 'rgba(90,156,245,0.05)',
  blueBorder: 'rgba(90,156,245,0.12)',
  blueGlow: 'rgba(90,156,245,0.06)',

  text: '#E4E6EA',
  textBright: '#F7F8F9',
  textMid: '#B0B5BE',
  textDim: '#6E747F',
  textFaint: '#3E434C',

  green: '#34D07B',
  red: '#F04B4B',
  amber: '#E5A832',
  purple: '#A97CF5',

  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
};

const TIER_CONFIG: Record<Tier, { label: string; short: string; color: string; glow: string }> = {
  now: { label: 'Sprint Now', short: 'NOW', color: T.red, glow: 'rgba(240,75,75,0.12)' },
  soon: { label: 'Sprint Soon', short: 'SOON', color: T.amber, glow: 'rgba(229,168,50,0.12)' },
  later: { label: 'Backlog', short: 'BACKLOG', color: T.blue, glow: 'rgba(90,156,245,0.08)' },
  monitor: { label: 'Monitor', short: 'MONITOR', color: T.textFaint, glow: 'rgba(62,67,76,0.08)' },
};

const IMPACT_COLOR: Record<Impact, string> = { C: T.red, H: T.amber, M: T.blue, L: T.textDim };
const IMPACT_LABEL: Record<Impact, string> = { C: 'Critical', H: 'High', M: 'Medium', L: 'Low' };
const EFFORT_COLOR: Record<Effort, string> = { L: T.green, M: T.amber, H: T.red };
const EFFORT_LABEL: Record<Effort, string> = { L: 'Low', M: 'Medium', H: 'High' };
const OWNER_LABEL: Record<Owner, string> = { t: 'Tomi', s: 'Schalaschly', b: 'Both', a: 'AI', n: '—' };

const CAT_ABBR: Record<string, string> = {
  organic: 'ORG', live: 'LIVE', search: 'SRCH', paid: 'PAID', direct: 'DR',
  referral: 'REF', partnerships: 'PRTN', marketplaces: 'MKTP', media: 'PR',
  community: 'COMM', product: 'PROD', offline: 'OFF', darksocial: 'DARK',
};

const CAT_LABEL: Record<string, string> = {
  organic: 'Organic', live: 'Live & Community', search: 'Search & Intent',
  paid: 'Paid Social', direct: 'Direct Response', referral: 'Referral',
  partnerships: 'Partnerships', marketplaces: 'Marketplaces', media: 'Media & PR',
  community: 'Community', product: 'Product-Led', offline: 'Offline', darksocial: 'Dark Social',
};

export default function LibraryPage() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [filterCat, setFilterCat] = useState('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBattles(); }, []);

  async function loadBattles() {
    const { data, error } = await supabase.from('battles').select('*').order('id');
    if (error) console.error('Error loading battles:', error);
    else setBattles(data || []);
    setLoading(false);
  }

  async function updateTier(battleId: number, newTier: Tier) {
    const { error } = await supabase.from('battles')
      .update({ tier: newTier, updated_at: new Date().toISOString() })
      .eq('id', battleId);
    if (error) console.error('Error updating tier:', error);
    else setBattles(prev => prev.map(b => b.id === battleId ? { ...b, tier: newTier } : b));
  }

  const filtered = battles.filter(b => {
    if (filterCat !== 'all' && b.category !== filterCat) return false;
    if (filterTier !== 'all' && b.tier !== filterTier) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tierOrder: Tier[] = ['now', 'soon', 'later', 'monitor'];
  const sorted = [...filtered].sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
  const counts = { now: 0, soon: 0, later: 0, monitor: 0 };
  battles.forEach(b => counts[b.tier]++);
  const totalActive = counts.now + counts.soon;
  const categories = Array.from(new Set(battles.map(b => b.category))).sort();

  let lastTier: string | null = null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: '13px' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes expandIn { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
        select option { background: ${T.elevated}; color: ${T.text}; }
      `}</style>

      {/* Cinematic background */}
      <div style={{ position: 'fixed', top: '-20%', left: '30%', width: '60%', height: '60%', background: 'radial-gradient(ellipse, rgba(90,156,245,0.03) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: '36px 40px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 600, color: T.textBright, letterSpacing: '-0.5px', marginBottom: '6px' }}>Battle Library</h1>
              <p style={{ fontSize: '13px', color: T.textDim, fontWeight: 400 }}>Revenue channels ranked by strategic priority</p>
            </div>

            {/* Hero stat cluster */}
            <div style={{ display: 'flex', gap: '1px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
              <div style={{ background: T.blueWash, padding: '14px 24px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '2px', borderRight: `1px solid ${T.border}`, position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, inset: 0, background: `radial-gradient(circle at center, ${T.blueGlow} 0%, transparent 70%)`, pointerEvents: 'none' as const }} />
                <span style={{ fontSize: '28px', fontWeight: 800, color: T.blueHot, fontFamily: T.mono, lineHeight: 1, position: 'relative' as const }}>{totalActive}</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: T.blue, letterSpacing: '1.5px', position: 'relative' as const }}>IN PLAY</span>
              </div>
              {tierOrder.map(k => {
                const t = TIER_CONFIG[k];
                const active = filterTier === k;
                return (
                  <button key={k} onClick={() => setFilterTier(filterTier === k ? 'all' : k)} style={{
                    background: active ? t.glow : T.surface, border: 'none', padding: '14px 18px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '2px',
                    borderRight: `1px solid ${T.border}`, transition: 'background 0.1s', minWidth: '64px',
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: active ? t.color : T.textMid, fontFamily: T.mono, lineHeight: 1 }}>{counts[k]}</span>
                    <span style={{ fontSize: '8px', fontWeight: 700, color: active ? t.color : T.textFaint, letterSpacing: '1px' }}>{t.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '220px' }}>
              <input type="text" placeholder="Search channels..." value={search} onChange={e => setSearch(e.target.value)} style={{
                width: '100%', padding: '9px 12px 9px 32px', background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: '8px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit',
              }} />
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: T.textFaint }}>⌕</span>
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
              padding: '9px 12px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '8px',
              fontSize: '12px', color: filterCat === 'all' ? T.textDim : T.textMid, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{CAT_LABEL[cat] || cat}</option>)}
            </select>
            {(search || filterCat !== 'all' || filterTier !== 'all') && (
              <button onClick={() => { setSearch(''); setFilterCat('all'); setFilterTier('all'); }}
                style={{ fontSize: '11px', color: T.textDim, background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>Clear filters</button>
            )}
            <span style={{ fontSize: '11px', color: T.textFaint, marginLeft: 'auto', fontFamily: T.mono }}>{filtered.length} channels</span>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 76px 90px 72px 90px 24px', alignItems: 'center', padding: '0 20px 10px', gap: '8px', borderBottom: `1px solid ${T.border}` }}>
            {['#', 'CHANNEL', 'IMPACT', 'EFFORT', 'OWNER', 'TYPE', 'PRIORITY', ''].map((h, i) => (
              <span key={i} style={{ fontSize: '9px', fontWeight: 600, color: T.textFaint, letterSpacing: '1.2px' }}>{h}</span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div style={{ padding: '0 40px 100px' }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center' as const, padding: '80px 0' }}>
              <p style={{ fontSize: '14px', color: T.textDim }}>No channels match your filters</p>
            </div>
          ) : sorted.map((b) => {
            const isExp = expanded === b.id;
            const isHov = hoverRow === b.id;
            const tier = TIER_CONFIG[b.tier];

            let divider = null;
            if (b.tier !== lastTier) {
              lastTier = b.tier;
              divider = (
                <div key={`d-${b.tier}`} style={{ padding: '24px 0 10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: tier.color, boxShadow: `0 0 6px ${tier.color}40` }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: tier.color, letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>{tier.label}</span>
                  <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${tier.color}20, transparent 80%)` }} />
                </div>
              );
            }

            return (
              <div key={b.id}>
                {divider}
                <div
                  onMouseEnter={() => setHoverRow(b.id)}
                  onMouseLeave={() => setHoverRow(null)}
                  style={{
                    background: isExp ? T.card : isHov ? T.card : 'transparent',
                    border: isExp ? `1px solid ${T.borderLit}` : '1px solid transparent',
                    borderLeft: isExp ? `2px solid ${T.blue}` : isHov ? '2px solid rgba(90,156,245,0.2)' : '2px solid transparent',
                    borderRadius: '12px', marginBottom: '1px', transition: 'all 0.12s ease',
                  }}
                >
                  <div onClick={() => setExpanded(isExp ? null : b.id)} style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 76px 76px 90px 72px 90px 24px',
                    alignItems: 'center', padding: '13px 20px', cursor: 'pointer', gap: '8px',
                  }}>
                    <span style={{ fontSize: '11px', color: T.textFaint, fontFamily: T.mono, fontWeight: 500 }}>{String(b.id).padStart(2, '0')}</span>
                    <span style={{ fontSize: '13px', fontWeight: 560, color: isExp || isHov ? T.textBright : T.text, transition: 'color 0.1s' }}>{b.name}</span>
                    <span style={{ fontSize: '11px', fontWeight: 550, color: IMPACT_COLOR[b.impact] }}>{IMPACT_LABEL[b.impact]}</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: EFFORT_COLOR[b.effort] }}>{EFFORT_LABEL[b.effort]}</span>
                    <span style={{ fontSize: '11px', color: T.textDim, fontWeight: 450 }}>{OWNER_LABEL[b.owner]}</span>
                    <span style={{ fontSize: '10px', color: T.textFaint, fontWeight: 500, letterSpacing: '0.5px' }}>{CAT_ABBR[b.category] || b.category}</span>
                    <select value={b.tier} onClick={e => e.stopPropagation()} onChange={e => updateTier(b.id, e.target.value as Tier)}
                      style={{
                        fontSize: '10px', fontWeight: 600, color: tier.color,
                        background: tier.glow, border: `1px solid ${tier.color}20`,
                        borderRadius: '5px', padding: '4px 6px', cursor: 'pointer',
                        fontFamily: 'inherit', outline: 'none', letterSpacing: '0.3px',
                      }}>
                      {tierOrder.map(k => <option key={k} value={k}>{TIER_CONFIG[k].label}</option>)}
                    </select>
                    <span style={{
                      fontSize: '10px', color: T.textFaint, transition: 'transform 0.15s ease',
                      transform: isExp ? 'rotate(90deg)' : 'none', textAlign: 'center' as const,
                      opacity: isHov || isExp ? 1 : 0.4,
                    }}>›</span>
                  </div>

                  {isExp && (
                    <div style={{ padding: '0px 22px 22px', animation: 'expandIn 0.2s ease' }}>
                      <div style={{ height: '1px', background: `linear-gradient(90deg, ${T.blue}25, transparent 60%)`, marginBottom: '20px' }} />
                      {b.why_this_tier && (
                        <div style={{ padding: '18px 20px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '8px', marginBottom: '12px' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: T.textDim, letterSpacing: '1.5px', marginBottom: '10px' }}>STRATEGIC RATIONALE</div>
                          <div style={{ fontSize: '13.5px', color: T.text, lineHeight: 1.75, fontWeight: 400 }}>{b.why_this_tier}</div>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        {b.next_action && (
                          <div style={{ padding: '18px 20px', background: T.surface, border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.blue}`, borderRadius: '8px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: T.blue, letterSpacing: '1.5px', marginBottom: '10px' }}>NEXT MOVE</div>
                            <div style={{ fontSize: '13.5px', color: T.text, lineHeight: 1.75, fontWeight: 400 }}>{b.next_action}</div>
                          </div>
                        )}
                        {b.ai_play && (
                          <div style={{ padding: '18px 20px', background: T.surface, border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.amber}`, borderRadius: '8px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: T.amber, letterSpacing: '1.5px', marginBottom: '10px' }}>AI LEVERAGE</div>
                            <div style={{ fontSize: '13.5px', color: T.text, lineHeight: 1.75, fontWeight: 400 }}>{b.ai_play}</div>
                          </div>
                        )}
                      </div>
                      {b.success_metric && (
                        <div style={{ padding: '18px 20px', background: T.surface, border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.green}`, borderRadius: '8px' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: T.green, letterSpacing: '1.5px', marginBottom: '10px' }}>TARGET METRIC</div>
                          <div style={{ fontSize: '13.5px', color: T.text, lineHeight: 1.75, fontWeight: 400 }}>{b.success_metric}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

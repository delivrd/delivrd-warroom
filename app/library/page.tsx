'use client';
import { useTheme } from '@/lib/theme';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Battle, Tier, Impact, Effort, Owner } from '@/lib/types';

// ═══ DESIGN TOKENS v5 ═══

const CAT_LABEL: Record<string, string> = {
  organic: 'Organic', live: 'Live', search: 'Search', paid: 'Paid', direct: 'Direct',
  referral: 'Referral', partnerships: 'Partners', marketplaces: 'Market', media: 'Media',
  community: 'Community', product: 'Product', offline: 'Offline', darksocial: 'Dark',
};

export default function LibraryPage() {
  const { theme: T, mode } = useTheme();

  const TIER_CFG: Record<Tier, { label: string; color: string; bg: string }> = {
    now: { label: 'NOW', color: T.red, bg: T.redDim },
    soon: { label: 'SOON', color: T.amber, bg: T.amberDim },
    later: { label: 'LATER', color: T.blue, bg: T.blueWash },
    monitor: { label: 'MON', color: T.textDim, bg: 'rgba(96,104,120,0.08)' },
  };

  const IMPACT_CFG: Record<Impact, { label: string; color: string; short: string }> = {
    C: { label: 'Critical', color: T.red, short: 'CRIT' },
    H: { label: 'High', color: T.amber, short: 'HIGH' },
    M: { label: 'Medium', color: T.blue, short: 'MED' },
    L: { label: 'Low', color: T.textDim, short: 'LOW' },
  };

  const EFFORT_CFG: Record<Effort, { label: string; color: string }> = {
    L: { label: 'Low', color: T.green },
    M: { label: 'Med', color: T.amber },
    H: { label: 'High', color: T.red },
  };

  const OWNER_CFG: Record<Owner, { label: string; color: string }> = {
    t: { label: 'Tomi', color: T.blueHot },
    s: { label: 'Schala', color: T.purple },
    b: { label: 'Both', color: T.amber },
    a: { label: 'AI', color: T.green },
    n: { label: '—', color: T.textFaint },
  };
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

  async function updateField(id: number, field: string, value: string) {
    const { error } = await supabase.from('battles')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) console.error(`Error updating ${field}:`, error);
    else setBattles(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  }

  const filtered = battles.filter(b => {
    if (filterCat !== 'all' && b.category !== filterCat) return false;
    if (filterTier !== 'all' && b.tier !== filterTier) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!b.name.toLowerCase().includes(s) && !b.category.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const tierOrder: Tier[] = ['now', 'soon', 'later', 'monitor'];
  const sorted = [...filtered].sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
  const counts = { now: 0, soon: 0, later: 0, monitor: 0 };
  battles.forEach(b => counts[b.tier]++);
  const categories = Array.from(new Set(battles.map(b => b.category))).sort();

  let lastTier: string | null = null;

  // Pill component for inline selects
  const Pill = ({ value, options, color, bg, onChange }: {
    value: string; options: { value: string; label: string; color: string }[];
    color: string; bg: string; onChange: (v: string) => void;
  }) => (
    <select value={value} onClick={e => e.stopPropagation()} onChange={e => onChange(e.target.value)}
      style={{
        fontSize: '10px', fontWeight: 700, color, background: bg,
        border: `1px solid ${color}18`, borderRadius: '4px',
        padding: '3px 6px', cursor: 'pointer', fontFamily: 'inherit',
        outline: 'none', letterSpacing: '0.3px', appearance: 'none' as const,
        WebkitAppearance: 'none' as const, textAlign: 'center' as const,
        minWidth: '52px',
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: '13px', animation: 'pulse 1.5s infinite' }}>Loading battles...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative' }}>
      <style>{`
        @keyframes expandIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        select option { background: ${T.elevated}; color: ${T.text}; }
        ::selection { background: ${T.blue}40; }
      `}</style>

      {/* Subtle blue atmosphere */}
      <div style={{ position: 'fixed', top: '-30%', left: '20%', width: '60%', height: '50%', background: 'radial-gradient(ellipse, rgba(90,156,245,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1440px', margin: '0 auto', padding: '28px 32px 80px' }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 650, color: T.textBright, letterSpacing: '-0.3px', marginBottom: '4px' }}>Battle Library</h1>
            <p style={{ fontSize: '12px', color: T.textDim }}>95 revenue channels prioritized for execution</p>
          </div>

          {/* Tier stat bar */}
          <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
            {/* IN PLAY hero */}
            <div style={{
              padding: '10px 20px', background: T.blueWash,
              display: 'flex', alignItems: 'baseline', gap: '8px',
              borderRight: `1px solid ${T.border}`,
            }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: T.blueHot, fontFamily: T.mono, lineHeight: 1 }}>{counts.now + counts.soon}</span>
              <span style={{ fontSize: '8px', fontWeight: 700, color: T.blue, letterSpacing: '1.2px' }}>IN PLAY</span>
            </div>
            {tierOrder.map(k => {
              const cfg = TIER_CFG[k];
              const active = filterTier === k;
              return (
                <button key={k} onClick={() => setFilterTier(filterTier === k ? 'all' : k)} style={{
                  background: active ? cfg.bg : 'transparent', border: 'none',
                  padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'baseline', gap: '6px',
                  borderRight: `1px solid ${T.border}`, transition: 'background 0.1s',
                }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: active ? cfg.color : T.textMid, fontFamily: T.mono, lineHeight: 1 }}>{counts[k]}</span>
                  <span style={{ fontSize: '8px', fontWeight: 600, color: active ? cfg.color : T.textFaint, letterSpacing: '0.8px' }}>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ FILTERS ═══ */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{
            width: '200px', padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit',
          }} />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
            padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '6px',
            fontSize: '12px', color: filterCat === 'all' ? T.textDim : T.text, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <option value="all">All categories</option>
            {categories.map(c => <option key={c} value={c}>{CAT_LABEL[c] || c}</option>)}
          </select>
          {(search || filterCat !== 'all' || filterTier !== 'all') && (
            <button onClick={() => { setSearch(''); setFilterCat('all'); setFilterTier('all'); }}
              style={{ fontSize: '11px', color: T.textDim, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px' }}>Reset</button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: T.textFaint, fontFamily: T.mono }}>{filtered.length}</span>
        </div>

        {/* ═══ TABLE ═══ */}
        <div style={{ background: T.surface, borderRadius: '12px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 70px 64px 64px 72px 70px 28px',
            padding: '10px 16px', gap: '4px', alignItems: 'center',
            borderBottom: `1px solid ${T.border}`, background: T.card,
          }}>
            {['#', 'CHANNEL', 'TIER', 'IMPACT', 'EFFORT', 'OWNER', 'TYPE', ''].map((h, i) => (
              <span key={i} style={{ fontSize: '9px', fontWeight: 650, color: T.textFaint, letterSpacing: '1px', textTransform: 'uppercase' as const }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {sorted.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' as const }}>
              <p style={{ fontSize: '13px', color: T.textDim }}>No channels match</p>
            </div>
          ) : sorted.map((b) => {
            const isExp = expanded === b.id;
            const isHov = hoverRow === b.id;
            const tier = TIER_CFG[b.tier];
            const impact = IMPACT_CFG[b.impact];
            const effort = EFFORT_CFG[b.effort];
            const owner = OWNER_CFG[b.owner];

            // Tier section divider
            let divider = null;
            if (b.tier !== lastTier) {
              lastTier = b.tier;
              divider = (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '16px 16px 8px',
                }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: tier.color, boxShadow: `0 0 6px ${tier.color}50` }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: tier.color, letterSpacing: '1.5px' }}>
                    {tier.label === 'MON' ? 'MONITOR' : tier.label === 'NOW' ? 'SPRINT NOW' : tier.label === 'SOON' ? 'SPRINT SOON' : 'BACKLOG'}
                    <span style={{ color: T.textFaint, marginLeft: '8px', fontWeight: 500 }}>({sorted.filter(x => x.tier === b.tier).length})</span>
                  </span>
                  <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${tier.color}15, transparent 60%)` }} />
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
                    borderLeft: isExp ? `2px solid ${T.blue}` : isHov ? `2px solid ${T.blue}30` : '2px solid transparent',
                    background: isExp ? T.card : isHov ? `${T.card}80` : 'transparent',
                    transition: 'all 0.1s ease',
                  }}
                >
                  {/* Main row */}
                  <div onClick={() => setExpanded(isExp ? null : b.id)} style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 70px 64px 64px 72px 70px 28px',
                    padding: '10px 14px', gap: '4px', alignItems: 'center', cursor: 'pointer',
                  }}>
                    {/* # */}
                    <span style={{ fontSize: '10px', color: T.textFaint, fontFamily: T.mono }}>{String(b.id).padStart(2, '0')}</span>

                    {/* Channel name */}
                    <span style={{
                      fontSize: '13px', fontWeight: 550,
                      color: isExp ? T.textBright : isHov ? T.textBright : T.text,
                      transition: 'color 0.1s',
                    }}>{b.name}</span>

                    {/* Tier - editable */}
                    <Pill
                      value={b.tier}
                      options={tierOrder.map(k => ({ value: k, label: TIER_CFG[k].label, color: TIER_CFG[k].color }))}
                      color={tier.color} bg={tier.bg}
                      onChange={v => updateField(b.id, 'tier', v)}
                    />

                    {/* Impact - editable */}
                    <Pill
                      value={b.impact}
                      options={(['C', 'H', 'M', 'L'] as Impact[]).map(k => ({ value: k, label: IMPACT_CFG[k].short, color: IMPACT_CFG[k].color }))}
                      color={impact.color} bg={`${impact.color}12`}
                      onChange={v => updateField(b.id, 'impact', v)}
                    />

                    {/* Effort - editable */}
                    <Pill
                      value={b.effort}
                      options={(['L', 'M', 'H'] as Effort[]).map(k => ({ value: k, label: EFFORT_CFG[k].label, color: EFFORT_CFG[k].color }))}
                      color={effort.color} bg={`${effort.color}12`}
                      onChange={v => updateField(b.id, 'effort', v)}
                    />

                    {/* Owner - editable */}
                    <Pill
                      value={b.owner}
                      options={(['t', 's', 'b', 'a', 'n'] as Owner[]).map(k => ({ value: k, label: OWNER_CFG[k].label, color: OWNER_CFG[k].color }))}
                      color={owner.color} bg={`${owner.color}10`}
                      onChange={v => updateField(b.id, 'owner', v)}
                    />

                    {/* Category - display only */}
                    <span style={{
                      fontSize: '10px', fontWeight: 500, color: T.textDim,
                      background: T.elevated, padding: '3px 6px', borderRadius: '4px',
                      textAlign: 'center' as const, letterSpacing: '0.3px',
                    }}>{CAT_LABEL[b.category] || b.category}</span>

                    {/* Expand chevron */}
                    <span style={{
                      fontSize: '11px', color: isHov || isExp ? T.textMid : T.textFaint,
                      transform: isExp ? 'rotate(90deg)' : 'none',
                      transition: 'all 0.12s ease', textAlign: 'center' as const,
                      display: 'inline-block',
                    }}>›</span>
                  </div>

                  {/* Expanded detail panel */}
                  {isExp && (
                    <div style={{ padding: '0 16px 18px 52px', animation: 'expandIn 0.15s ease' }}>
                      {/* Blue gradient separator */}
                      <div style={{ height: '1px', background: `linear-gradient(90deg, ${T.blue}20, transparent 50%)`, marginBottom: '16px' }} />

                      {/* Strategic Rationale - full width */}
                      {b.why_this_tier && (
                        <div style={{ marginBottom: '10px', padding: '14px 16px', background: T.bg, borderRadius: '8px', border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: T.textDim, letterSpacing: '1.2px', marginBottom: '8px' }}>STRATEGIC RATIONALE</div>
                          <div style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>{b.why_this_tier}</div>
                        </div>
                      )}

                      {/* Two-column: Next Move + AI Leverage */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        {b.next_action && (
                          <div style={{ padding: '14px 16px', background: T.bg, borderRadius: '8px', border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.blue}` }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: T.blue, letterSpacing: '1.2px', marginBottom: '8px' }}>NEXT MOVE</div>
                            <div style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>{b.next_action}</div>
                          </div>
                        )}
                        {b.ai_play && (
                          <div style={{ padding: '14px 16px', background: T.bg, borderRadius: '8px', border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.amber}` }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: T.amber, letterSpacing: '1.2px', marginBottom: '8px' }}>AI LEVERAGE</div>
                            <div style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>{b.ai_play}</div>
                          </div>
                        )}
                      </div>

                      {/* Target Metric */}
                      {b.success_metric && (
                        <div style={{ padding: '14px 16px', background: T.bg, borderRadius: '8px', border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.green}` }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: T.green, letterSpacing: '1.2px', marginBottom: '8px' }}>TARGET METRIC</div>
                          <div style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>{b.success_metric}</div>
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

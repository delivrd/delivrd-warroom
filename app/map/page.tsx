'use client';
import { useTheme } from '@/lib/theme';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Battle, Tier } from '@/lib/types';


// 4 zones containing 13 fronts
interface Front {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

interface Zone {
  id: string;
  name: string;
  color: string;
  colorDim: string;
  description: string;
  fronts: Front[];
}

export default function MapPage() {
  const { theme: T, mode } = useTheme();

  const TIER_CFG: Record<Tier, { label: string; color: string; bg: string }> = {
    now: { label: 'NOW', color: T.red, bg: T.redDim },
    soon: { label: 'SOON', color: T.amber, bg: T.amberDim },
    later: { label: 'LATER', color: T.blue, bg: T.blueWash },
    monitor: { label: 'MON', color: T.textDim, bg: 'rgba(96,104,120,0.06)' },
  };

  const ZONES: Zone[] = [
    {
      id: 'owned', name: 'Owned Media', color: T.blue, colorDim: T.blueWash,
      description: 'Channels you control. Your content, your audience.',
      fronts: [
        { id: 'organic', name: 'Organic Social', category: 'organic', description: 'TikTok, Instagram, YouTube, Facebook, LinkedIn', icon: '📱' },
        { id: 'live', name: 'Live Channels', category: 'live', description: 'TikTok Live, YouTube Live, Instagram Live', icon: '🔴' },
        { id: 'direct', name: 'Direct Response', category: 'direct', description: 'Email, SMS, Lead Magnets, Scripts', icon: '📨' },
        { id: 'product', name: 'Product-Led', category: 'product', description: 'Negotiation tools, scripts, downloads', icon: '🛠' },
      ],
    },
    {
      id: 'discovery', name: 'Discovery', color: T.green, colorDim: T.greenDim,
      description: 'Getting found when people search.',
      fronts: [
        { id: 'search', name: 'Search', category: 'search', description: 'Google, YouTube SEO, TikTok SEO', icon: '🔍' },
        { id: 'marketplaces', name: 'Marketplaces', category: 'marketplaces', description: 'Facebook Marketplace, Angi', icon: '🏪' },
      ],
    },
    {
      id: 'amplified', name: 'Amplified', color: T.amber, colorDim: T.amberDim,
      description: 'Paid and earned reach beyond your audience.',
      fronts: [
        { id: 'paid', name: 'Paid Ads', category: 'paid', description: 'Facebook, Google, YouTube, TikTok Ads', icon: '💰' },
        { id: 'referral', name: 'Referrals', category: 'referral', description: 'Structured referral programs, testimonials', icon: '🤝' },
        { id: 'partnerships', name: 'Partnerships', category: 'partnerships', description: 'Auto YouTubers, finance blogs', icon: '🔗' },
        { id: 'media', name: 'Media & PR', category: 'media', description: 'Press releases, podcast appearances', icon: '📰' },
      ],
    },
    {
      id: 'longterm', name: 'Long-term', color: T.purple, colorDim: T.purpleDim,
      description: 'Community building and offline presence.',
      fronts: [
        { id: 'community', name: 'Community', category: 'community', description: 'Slack, forums, meetup groups', icon: '👥' },
        { id: 'offline', name: 'Offline', category: 'offline', description: 'Direct mail, billboards, radio', icon: '📮' },
        { id: 'darksocial', name: 'Dark Social', category: 'darksocial', description: 'Word of mouth, private shares', icon: '🌑' },
      ],
    },
  ];

  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFront, setExpandedFront] = useState<string | null>(null);
  const [hoverFront, setHoverFront] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('battles').select('*').order('id').then(({ data }) => {
      setBattles(data || []);
      setLoading(false);
    });
  }, []);

  const getBattlesForFront = (category: string) => battles.filter(b => b.category === category);

  const getTierCounts = (frontBattles: Battle[]) => ({
    now: frontBattles.filter(b => b.tier === 'now').length,
    soon: frontBattles.filter(b => b.tier === 'soon').length,
    later: frontBattles.filter(b => b.tier === 'later').length,
    monitor: frontBattles.filter(b => b.tier === 'monitor').length,
  });

  // Zone-level stats
  const getZoneStats = (zone: Zone) => {
    const allBattles = zone.fronts.flatMap(f => getBattlesForFront(f.category));
    return {
      total: allBattles.length,
      active: allBattles.filter(b => b.tier === 'now' || b.tier === 'soon').length,
    };
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: '13px' }}>Loading map...</span>
      </div>
    );
  }

  const totalActive = battles.filter(b => b.tier === 'now' || b.tier === 'soon').length;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative' }}>
      <style>{`
        @keyframes expandIn { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
      `}</style>

      {/* Subtle atmosphere */}
      <div style={{ position: 'fixed', top: '-20%', left: '30%', width: '40%', height: '40%', background: 'radial-gradient(ellipse, rgba(90,156,245,0.02) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1440px', margin: '0 auto', padding: '28px 32px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 650, color: T.textBright, letterSpacing: '-0.3px', marginBottom: '4px' }}>Strategic Map</h1>
            <p style={{ fontSize: '12px', color: T.textDim }}>13 fronts across 4 zones. {totalActive} channels in play.</p>
          </div>

          {/* Zone legend */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {ZONES.map(z => {
              const stats = getZoneStats(z);
              return (
                <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: z.color }} />
                  <span style={{ fontSize: '11px', color: T.textMid }}>{z.name}</span>
                  <span style={{ fontSize: '10px', color: T.textFaint, fontFamily: T.mono }}>{stats.active}/{stats.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Grid - 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {ZONES.map(zone => {
            const zoneStats = getZoneStats(zone);
            return (
              <div key={zone.id} style={{
                background: T.surface, borderRadius: '12px',
                border: `1px solid ${T.border}`, overflow: 'hidden',
              }}>
                {/* Zone header */}
                <div style={{
                  padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: `1px solid ${T.border}`,
                  background: `linear-gradient(135deg, ${zone.colorDim}, transparent 60%)`,
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: zone.color, marginBottom: '2px' }}>{zone.name}</div>
                    <div style={{ fontSize: '11px', color: T.textDim }}>{zone.description}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: zone.color, fontFamily: T.mono }}>{zoneStats.active}</span>
                    <span style={{ fontSize: '10px', color: T.textFaint }}>/{zoneStats.total}</span>
                  </div>
                </div>

                {/* Fronts */}
                <div style={{ padding: '8px' }}>
                  {zone.fronts.map(front => {
                    const frontBattles = getBattlesForFront(front.category);
                    const counts = getTierCounts(frontBattles);
                    const isExp = expandedFront === front.id;
                    const isHov = hoverFront === front.id;
                    const active = counts.now + counts.soon;

                    return (
                      <div key={front.id}>
                        <div
                          onClick={() => setExpandedFront(isExp ? null : front.id)}
                          onMouseEnter={() => setHoverFront(front.id)}
                          onMouseLeave={() => setHoverFront(null)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                            background: isExp ? T.card : isHov ? `${T.card}80` : 'transparent',
                            borderLeft: isExp ? `2px solid ${zone.color}` : '2px solid transparent',
                            transition: 'all 0.1s',
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>{front.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 560, color: isExp ? T.textBright : T.text }}>{front.name}</div>
                            <div style={{ fontSize: '10px', color: T.textDim }}>{front.description}</div>
                          </div>

                          {/* Tier dots */}
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {counts.now > 0 && (
                              <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: T.mono, color: T.red, background: T.redDim, padding: '2px 6px', borderRadius: '3px' }}>{counts.now}</span>
                            )}
                            {counts.soon > 0 && (
                              <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: T.mono, color: T.amber, background: T.amberDim, padding: '2px 6px', borderRadius: '3px' }}>{counts.soon}</span>
                            )}
                            {counts.later > 0 && (
                              <span style={{ fontSize: '10px', fontWeight: 600, fontFamily: T.mono, color: T.textDim }}>{counts.later}</span>
                            )}
                            {counts.monitor > 0 && (
                              <span style={{ fontSize: '10px', fontWeight: 500, fontFamily: T.mono, color: T.textFaint }}>{counts.monitor}</span>
                            )}
                          </div>

                          {/* Total + expand */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: T.mono, color: active > 0 ? zone.color : T.textFaint }}>{frontBattles.length}</span>
                            <span style={{
                              fontSize: '10px', color: T.textFaint,
                              transform: isExp ? 'rotate(90deg)' : 'none',
                              transition: 'transform 0.12s', display: 'inline-block',
                            }}>›</span>
                          </div>
                        </div>

                        {/* Expanded battle list */}
                        {isExp && frontBattles.length > 0 && (
                          <div style={{
                            padding: '4px 12px 8px 42px',
                            animation: 'expandIn 0.2s ease',
                            overflow: 'hidden',
                          }}>
                            {frontBattles.sort((a, b) => {
                              const order: Tier[] = ['now', 'soon', 'later', 'monitor'];
                              return order.indexOf(a.tier) - order.indexOf(b.tier);
                            }).map(b => {
                              const tier = TIER_CFG[b.tier];
                              return (
                                <div key={b.id} style={{
                                  display: 'flex', alignItems: 'center', gap: '8px',
                                  padding: '6px 8px', borderRadius: '4px',
                                  borderBottom: `1px solid ${T.border}`,
                                }}>
                                  <span style={{ fontSize: '10px', color: T.textFaint, fontFamily: T.mono, width: '20px' }}>{String(b.id).padStart(2, '0')}</span>
                                  <span style={{ fontSize: '12px', color: T.text, flex: 1 }}>{b.name}</span>
                                  <span style={{
                                    fontSize: '9px', fontWeight: 700, color: tier.color,
                                    background: tier.bg, padding: '2px 6px', borderRadius: '3px',
                                    letterSpacing: '0.3px',
                                  }}>{tier.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity bar at bottom - Tier distribution */}
        <div style={{
          marginTop: '20px', padding: '16px 20px',
          background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: T.textDim }}>Distribution</span>
          <div style={{ flex: 1, display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: T.elevated }}>
            {(['now', 'soon', 'later', 'monitor'] as Tier[]).map(tier => {
              const count = battles.filter(b => b.tier === tier).length;
              const pct = (count / battles.length) * 100;
              return <div key={tier} style={{ width: `${pct}%`, background: TIER_CFG[tier].color, transition: 'width 0.3s' }} />;
            })}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['now', 'soon', 'later', 'monitor'] as Tier[]).map(tier => {
              const count = battles.filter(b => b.tier === tier).length;
              return (
                <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '1px', background: TIER_CFG[tier].color }} />
                  <span style={{ fontSize: '10px', color: T.textDim }}>{TIER_CFG[tier].label}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: T.mono, color: TIER_CFG[tier].color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useTheme } from '@/lib/theme';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact, PipelineStage } from '@/lib/types/crm';
import { PIPELINE_STAGES, getStageConfig } from '@/lib/types/crm';


const STAGE_COLOR: Record<PipelineStage, string> = {
  new: '#9DA3AE', contacted: '#5A9CF5', qualified: '#B07CFF',
  proposal: '#FFB340', negotiation: '#FF8C40', closed_won: '#2DD881',
  closed_lost: '#FF5C5C', nurture: '#606878',
};

const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual', quo: 'Quo', manychat: 'ManyChat', referral: 'Referral',
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', website: 'Website', email: 'Email',
};

const DEAL_VALUE = 1000; // $1k per deal

export default function DashboardPage() {
  const { theme: T, mode } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    setContacts(data || []);
    setLoading(false);
  }

  // Filter by time range
  const now = new Date();
  const cutoff = timeRange === 'all' ? null : new Date(now.getTime() - (
    timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  ) * 86400000);

  const rangeContacts = cutoff
    ? contacts.filter(c => new Date(c.created_at) >= cutoff)
    : contacts;

  // ═══ CORE METRICS ═══
  const total = rangeContacts.length;
  const won = rangeContacts.filter(c => c.pipeline_stage === 'closed_won');
  const lost = rangeContacts.filter(c => c.pipeline_stage === 'closed_lost');
  const active = rangeContacts.filter(c => !['closed_won', 'closed_lost', 'nurture'].includes(c.pipeline_stage));
  const nurture = rangeContacts.filter(c => c.pipeline_stage === 'nurture');

  const revenue = won.length * DEAL_VALUE;
  const pipelineValue = active.length * DEAL_VALUE;
  const closeRate = total > 0 ? ((won.length / total) * 100) : 0;
  const lossRate = total > 0 ? ((lost.length / total) * 100) : 0;

  // Average savings (from saved data or estimate)
  const totalSavings = won.reduce((sum, c) => sum + (c.savings_amount || 4500), 0);
  const avgSavings = won.length > 0 ? Math.round(totalSavings / won.length) : 0;

  // ═══ SOURCE BREAKDOWN ═══
  const sources = Array.from(new Set(rangeContacts.map(c => c.source))).sort();
  const sourceStats = sources.map(source => {
    const all = rangeContacts.filter(c => c.source === source);
    const w = all.filter(c => c.pipeline_stage === 'closed_won').length;
    const l = all.filter(c => c.pipeline_stage === 'closed_lost').length;
    const decided = w + l;
    return {
      source,
      label: SOURCE_LABEL[source] || source,
      total: all.length,
      won: w,
      lost: l,
      active: all.filter(c => !['closed_won', 'closed_lost', 'nurture'].includes(c.pipeline_stage)).length,
      closeRate: decided > 0 ? ((w / decided) * 100) : 0,
      revenue: w * DEAL_VALUE,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // ═══ PIPELINE FUNNEL ═══
  const stages: PipelineStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won'];
  const funnelData = stages.map(s => ({
    stage: s,
    ...getStageConfig(s),
    count: rangeContacts.filter(c => c.pipeline_stage === s).length,
  }));
  const maxFunnel = Math.max(...funnelData.map(f => f.count), 1);

  // ═══ RECENT WINS ═══
  const recentWins = contacts
    .filter(c => c.pipeline_stage === 'closed_won')
    .slice(0, 8);

  // ═══ STALE / OVERDUE ═══
  const staleCount = active.filter(c => {
    const lastDate = c.last_contact_at || c.updated_at;
    return (now.getTime() - new Date(lastDate).getTime()) / 86400000 >= 3;
  }).length;

  const overdueCount = active.filter(c => c.next_follow_up && new Date(c.next_follow_up) < now).length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: '13px' }}>Loading stats...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '28px 32px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 650, color: T.textBright, letterSpacing: '-0.3px', marginBottom: '4px' }}>Revenue Dashboard</h1>
            <p style={{ fontSize: '12px', color: T.textDim }}>{total} leads tracked · ${revenue.toLocaleString()} closed</p>
          </div>

          {/* Time range toggle */}
          <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
            {(['7d', '30d', '90d', 'all'] as const).map(r => (
              <button key={r} onClick={() => setTimeRange(r)} style={{
                padding: '6px 14px', background: timeRange === r ? T.blueWash : 'transparent',
                border: 'none', borderRight: `1px solid ${T.border}`, cursor: 'pointer',
                fontSize: '11px', fontWeight: timeRange === r ? 600 : 450,
                color: timeRange === r ? T.blue : T.textDim,
              }}>{r === 'all' ? 'All Time' : r.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* Hero stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <StatCard label="REVENUE" value={`$${revenue.toLocaleString()}`} color={T.green} sub={`${won.length} deals`} />
          <StatCard label="PIPELINE" value={`$${pipelineValue.toLocaleString()}`} color={T.blueHot} sub={`${active.length} active`} />
          <StatCard label="CLOSE RATE" value={`${closeRate.toFixed(1)}%`} color={closeRate >= 20 ? T.green : closeRate >= 10 ? T.amber : T.red} sub={`${won.length}W / ${lost.length}L`} />
          <StatCard label="AVG SAVINGS" value={`$${avgSavings.toLocaleString()}`} color={T.amber} sub="per client" />
          <StatCard label="STALE" value={String(staleCount)} color={staleCount > 0 ? T.red : T.green} sub="3d+ no contact" alert={staleCount > 5} />
          <StatCard label="OVERDUE" value={String(overdueCount)} color={overdueCount > 0 ? T.red : T.green} sub="follow-ups" alert={overdueCount > 0} />
        </div>

        {/* Two column: Funnel + Source breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

          {/* Pipeline Funnel */}
          <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: T.textFaint, letterSpacing: '1px', marginBottom: '16px' }}>PIPELINE FUNNEL</div>
            {funnelData.map(f => {
              const pct = (f.count / maxFunnel) * 100;
              return (
                <div key={f.stage} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: f.color, width: '80px' }}>{f.label}</span>
                  <div style={{ flex: 1, height: '20px', background: T.bg, borderRadius: '4px', overflow: 'hidden', position: 'relative' as const }}>
                    <div style={{
                      height: '100%', width: `${Math.max(pct, 2)}%`, background: f.color,
                      borderRadius: '4px', opacity: 0.25, transition: 'width 0.4s ease',
                    }} />
                    <div style={{
                      height: '100%', width: `${Math.max(pct, 2)}%`, background: `linear-gradient(90deg, ${f.color}50, ${f.color}20)`,
                      borderRadius: '4px', position: 'absolute' as const, top: 0, left: 0,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: T.mono, color: f.count > 0 ? f.color : T.textFaint, width: '32px', textAlign: 'right' as const }}>{f.count}</span>
                </div>
              );
            })}
          </div>

          {/* Source Performance */}
          <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: T.textFaint, letterSpacing: '1px', marginBottom: '16px' }}>SOURCE PERFORMANCE</div>

            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 40px 40px 60px 60px', gap: '4px', marginBottom: '8px' }}>
              {['SOURCE', 'TOTAL', 'WON', 'LOST', 'RATE', 'REV'].map((h, i) => (
                <span key={i} style={{ fontSize: '8px', fontWeight: 650, color: T.textFaint, letterSpacing: '0.8px' }}>{h}</span>
              ))}
            </div>

            {sourceStats.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' as const, fontSize: '11px', color: T.textDim }}>No data yet</div>
            ) : sourceStats.map(s => (
              <div key={s.source} style={{
                display: 'grid', gridTemplateColumns: '1fr 50px 40px 40px 60px 60px', gap: '4px',
                padding: '6px 0', borderBottom: `1px solid ${T.border}`, alignItems: 'center',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 550, color: T.text }}>{s.label}</span>
                <span style={{ fontSize: '11px', fontFamily: T.mono, color: T.textMid }}>{s.total}</span>
                <span style={{ fontSize: '11px', fontFamily: T.mono, color: s.won > 0 ? T.green : T.textFaint }}>{s.won}</span>
                <span style={{ fontSize: '11px', fontFamily: T.mono, color: s.lost > 0 ? T.red : T.textFaint }}>{s.lost}</span>
                <span style={{
                  fontSize: '10px', fontWeight: 700, fontFamily: T.mono,
                  color: s.closeRate >= 20 ? T.green : s.closeRate >= 10 ? T.amber : s.closeRate > 0 ? T.red : T.textFaint,
                }}>{s.closeRate > 0 ? `${s.closeRate.toFixed(0)}%` : '—'}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: T.mono, color: s.revenue > 0 ? T.green : T.textFaint }}>
                  {s.revenue > 0 ? `$${(s.revenue / 1000).toFixed(0)}k` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Wins */}
        <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: T.textFaint, letterSpacing: '1px', marginBottom: '16px' }}>
            RECENT WINS ({won.length} total · ${(won.length * DEAL_VALUE).toLocaleString()})
          </div>

          {recentWins.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center' as const, fontSize: '12px', color: T.textDim }}>No closed deals yet</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {recentWins.map(c => (
                <div key={c.id} style={{
                  padding: '12px', background: T.greenDim, borderRadius: '8px',
                  border: `1px solid ${T.green}15`, borderLeft: `2px solid ${T.green}`,
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: T.textBright, marginBottom: '2px' }}>
                    {[c.first_name, c.last_name].filter(Boolean).join(' ')}
                  </div>
                  {c.vehicle_interest && (
                    <div style={{ fontSize: '11px', color: T.textMid, marginBottom: '4px' }}>{c.vehicle_interest}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: T.textDim }}>{SOURCE_LABEL[c.source] || c.source}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: T.mono, color: T.green }}>+$1,000</span>
                  </div>
                  {c.savings_amount && (
                    <div style={{ fontSize: '9px', color: T.green, marginTop: '2px' }}>Saved client ${c.savings_amount.toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({ label, value, color, sub, alert }: {
  label: string; value: string; color: string; sub: string; alert?: boolean;
}) {
  const { theme: T } = useTheme();
  return (
    <div style={{
      background: T.surface, borderRadius: '10px', border: `1px solid ${alert ? `${T.red}30` : T.border}`,
      padding: '16px', position: 'relative' as const, overflow: 'hidden',
    }}>
      {alert && <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, height: '2px', background: T.red }} />}
      <div style={{ fontSize: '9px', fontWeight: 700, color: T.textFaint, letterSpacing: '1.2px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: T.mono, color, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '10px', color: T.textDim }}>{sub}</div>
    </div>
  );
}

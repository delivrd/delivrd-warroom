'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact, PipelineStage } from '@/lib/types/crm';
import { PIPELINE_STAGES, getStageConfig } from '@/lib/types/crm';

const T = {
  bg: '#0B0D10', surface: '#12151A', card: '#171B21', elevated: '#1D2228',
  border: 'rgba(255,255,255,0.06)', borderLit: 'rgba(255,255,255,0.10)',
  blue: '#5A9CF5', blueHot: '#78B4FF', blueWash: 'rgba(90,156,245,0.06)',
  text: '#DFE1E5', textBright: '#F2F3F5', textMid: '#9DA3AE',
  textDim: '#606878', textFaint: '#3A4050',
  green: '#2DD881', red: '#FF5C5C', amber: '#FFB340', purple: '#B07CFF',
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase.from('contacts').select('*').order('updated_at', { ascending: false });
    if (error) console.error(error);
    else setContacts(data || []);
    setLoading(false);
  }

  const filtered = contacts.filter(c => {
    if (filterStage !== 'all' && c.pipeline_stage !== filterStage) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase();
      if (!name.includes(s) && !c.phone?.includes(s) && !c.email?.toLowerCase().includes(s) && !c.vehicle_interest?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: '13px' }}>Loading contacts...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '28px 32px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 650, color: T.textBright, letterSpacing: '-0.3px', marginBottom: '4px' }}>Contacts</h1>
            <p style={{ fontSize: '12px', color: T.textDim }}>{contacts.length} total contacts</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <input type="text" placeholder="Search name, phone, vehicle..." value={search} onChange={e => setSearch(e.target.value)} style={{
            width: '260px', padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit',
          }} />
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{
            padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '6px',
            fontSize: '12px', color: filterStage === 'all' ? T.textDim : T.text, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <option value="all">All stages</option>
            {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: T.textFaint, fontFamily: T.mono }}>{filtered.length}</span>
        </div>

        {/* Table */}
        <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 140px 80px 120px 80px 80px',
            padding: '10px 16px', gap: '4px', alignItems: 'center',
            borderBottom: `1px solid ${T.border}`, background: T.card,
          }}>
            {['NAME', 'VEHICLE', 'SCORE', 'STAGE', 'SOURCE', 'PHONE'].map((h, i) => (
              <span key={i} style={{ fontSize: '9px', fontWeight: 650, color: T.textFaint, letterSpacing: '1px' }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' as const, fontSize: '13px', color: T.textDim }}>
              {contacts.length === 0 ? 'No contacts yet. Add from Pipeline.' : 'No matches'}
            </div>
          ) : filtered.map(c => {
            const stage = getStageConfig(c.pipeline_stage);
            return (
              <div key={c.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 80px 120px 80px 80px',
                padding: '10px 16px', gap: '4px', alignItems: 'center',
                borderBottom: `1px solid ${T.border}`, transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.card}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 550, color: T.text }}>{[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown'}</div>
                  {c.email && <div style={{ fontSize: '10px', color: T.textDim }}>{c.email}</div>}
                </div>
                <span style={{ fontSize: '11px', color: T.textMid }}>{c.vehicle_interest || '—'}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: T.mono, color: c.lead_score >= 60 ? T.green : c.lead_score >= 30 ? T.amber : T.textDim }}>{c.lead_score}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: stage.color }}>{stage.label}</span>
                <span style={{ fontSize: '10px', color: T.textDim }}>{c.source}</span>
                <span style={{ fontSize: '10px', color: T.textDim, fontFamily: T.mono }}>{c.phone || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact, PipelineStage } from '@/lib/types/crm';
import { PIPELINE_STAGES, getStageConfig } from '@/lib/types/crm';

const T = {
  bg: '#0B0D10', surface: '#12151A', card: '#171B21', elevated: '#1D2228',
  border: 'rgba(255,255,255,0.06)', borderLit: 'rgba(255,255,255,0.10)',
  blue: '#5A9CF5', blueHot: '#78B4FF', blueWash: 'rgba(90,156,245,0.06)',
  blueBorder: 'rgba(90,156,245,0.15)',
  text: '#DFE1E5', textBright: '#F2F3F5', textMid: '#9DA3AE',
  textDim: '#606878', textFaint: '#3A4050',
  green: '#2DD881', greenDim: 'rgba(45,216,129,0.12)',
  red: '#FF5C5C', redDim: 'rgba(255,92,92,0.12)',
  amber: '#FFB340', amberDim: 'rgba(255,179,64,0.12)',
  purple: '#B07CFF',
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
};

const STAGE_COLOR: Record<PipelineStage, string> = {
  new: '#9DA3AE', contacted: '#5A9CF5', qualified: '#B07CFF',
  proposal: '#FFB340', negotiation: '#FF8C40', closed_won: '#2DD881',
  closed_lost: '#FF5C5C', nurture: '#606878',
};

const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual', quo: 'Quo', manychat: 'ManyChat', referral: 'Referral',
  tiktok: 'TikTok', instagram: 'IG', youtube: 'YouTube', website: 'Web', email: 'Email',
};

type SortField = 'score' | 'name' | 'created' | 'updated' | 'stage' | 'follow_up';
type SortDir = 'asc' | 'desc';

export default function PipelinePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStale, setFilterStale] = useState(false);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Contact | null>(null);
  const [hoverRow, setHoverRow] = useState<string | null>(null);

  useEffect(() => { loadContacts(); }, []);

  async function loadContacts() {
    const { data, error } = await supabase.from('contacts').select('*').order('lead_score', { ascending: false });
    if (error) console.error(error);
    else setContacts(data || []);
    setLoading(false);
  }

  async function updateField(id: string, field: string, value: any) {
    const { error } = await supabase.from('contacts')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  async function bulkUpdateStage(stage: PipelineStage) {
    const ids = Array.from(selected);
    for (const id of ids) {
      await supabase.from('contacts').update({ pipeline_stage: stage, updated_at: new Date().toISOString() }).eq('id', id);
    }
    setSelected(new Set());
    loadContacts();
  }

  async function addContact(data: Partial<Contact>) {
    const { error } = await supabase.from('contacts').insert(data).select();
    if (!error) { setShowAddModal(false); loadContacts(); }
  }

  // Filtering
  const filtered = contacts.filter(c => {
    if (filterStage !== 'all' && c.pipeline_stage !== filterStage) return false;
    if (filterSource !== 'all' && c.source !== filterSource) return false;
    if (filterStale) {
      const daysSince = c.last_contact_at
        ? Math.floor((Date.now() - new Date(c.last_contact_at).getTime()) / 86400000)
        : c.created_at ? Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000) : 999;
      if (daysSince < 3) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const name = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase();
      if (!name.includes(s) && !c.phone?.includes(s) && !c.email?.toLowerCase().includes(s) && !c.vehicle_interest?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'score': cmp = (a.lead_score || 0) - (b.lead_score || 0); break;
      case 'name': cmp = ([a.first_name, a.last_name].filter(Boolean).join(' ')).localeCompare([b.first_name, b.last_name].filter(Boolean).join(' ')); break;
      case 'created': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
      case 'updated': cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(); break;
      case 'stage': {
        const order = PIPELINE_STAGES.map(s => s.id);
        cmp = order.indexOf(a.pipeline_stage) - order.indexOf(b.pipeline_stage);
        break;
      }
      case 'follow_up': {
        const aDate = a.next_follow_up ? new Date(a.next_follow_up).getTime() : Infinity;
        const bDate = b.next_follow_up ? new Date(b.next_follow_up).getTime() : Infinity;
        cmp = aDate - bDate;
        break;
      }
    }
    return sortDir === 'desc' ? -cmp : cmp;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map(c => c.id)));
  };

  const daysSince = (dateStr: string | null) => {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Stage counts for header
  const stageCounts = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s.id] = contacts.filter(c => c.pipeline_stage === s.id).length;
    return acc;
  }, {} as Record<string, number>);

  const activeStages: PipelineStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];
  const totalActive = activeStages.reduce((sum, s) => sum + (stageCounts[s] || 0), 0);
  const sources = Array.from(new Set(contacts.map(c => c.source))).sort();

  const SortHeader = ({ field, label, width }: { field: SortField; label: string; width?: string }) => (
    <span onClick={() => toggleSort(field)} style={{
      fontSize: '9px', fontWeight: 650, color: sortField === field ? T.blue : T.textFaint,
      letterSpacing: '1px', cursor: 'pointer', userSelect: 'none' as const, width,
    }}>
      {label} {sortField === field ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </span>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: '13px' }}>Loading pipeline...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        select option { background: ${T.elevated}; color: ${T.text}; }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1600px', margin: '0 auto', padding: '28px 32px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 650, color: T.textBright, letterSpacing: '-0.3px', marginBottom: '4px' }}>Sales Command</h1>
            <p style={{ fontSize: '12px', color: T.textDim }}>{contacts.length} contacts · {totalActive} active pipeline</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Stage mini-bar */}
            <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
              {activeStages.map(s => {
                const cfg = getStageConfig(s);
                const count = stageCounts[s] || 0;
                const isActive = filterStage === s;
                return (
                  <button key={s} onClick={() => setFilterStage(filterStage === s ? 'all' : s)} style={{
                    padding: '6px 10px', background: isActive ? `${cfg.color}15` : 'transparent',
                    border: 'none', borderRight: `1px solid ${T.border}`, cursor: 'pointer',
                    display: 'flex', alignItems: 'baseline', gap: '4px',
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: T.mono, color: isActive ? cfg.color : count > 0 ? T.textMid : T.textFaint }}>{count}</span>
                    <span style={{ fontSize: '8px', fontWeight: 500, color: isActive ? cfg.color : T.textFaint, letterSpacing: '0.5px' }}>{cfg.label.toUpperCase().slice(0, 4)}</span>
                  </button>
                );
              })}
            </div>

            <button onClick={() => setShowImportModal(true)} style={{
              fontSize: '11px', fontWeight: 550, color: T.textMid, background: T.surface,
              border: `1px solid ${T.border}`, borderRadius: '6px', padding: '7px 14px', cursor: 'pointer',
            }}>Import CSV</button>

            <button onClick={() => setShowAddModal(true)} style={{
              fontSize: '12px', fontWeight: 600, color: T.textBright, background: T.blue,
              border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer',
            }}>+ New</button>
          </div>
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <input type="text" placeholder="Search name, phone, vehicle..." value={search} onChange={e => setSearch(e.target.value)} style={{
            width: '240px', padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit',
          }} />

          <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{
            padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '6px',
            fontSize: '12px', color: filterStage === 'all' ? T.textDim : T.text, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <option value="all">All stages</option>
            {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{
            padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '6px',
            fontSize: '12px', color: filterSource === 'all' ? T.textDim : T.text, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <option value="all">All sources</option>
            {sources.map(s => <option key={s} value={s}>{SOURCE_LABEL[s] || s}</option>)}
          </select>

          <button onClick={() => setFilterStale(!filterStale)} style={{
            padding: '7px 12px', background: filterStale ? T.redDim : T.surface,
            border: `1px solid ${filterStale ? `${T.red}30` : T.border}`, borderRadius: '6px',
            fontSize: '11px', fontWeight: 550, color: filterStale ? T.red : T.textDim, cursor: 'pointer',
          }}>
            {filterStale ? '🔴 Stale (3d+)' : 'Stale'}
          </button>

          {(search || filterStage !== 'all' || filterSource !== 'all' || filterStale) && (
            <button onClick={() => { setSearch(''); setFilterStage('all'); setFilterSource('all'); setFilterStale(false); }}
              style={{ fontSize: '11px', color: T.textDim, background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>Reset</button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '11px', color: T.textFaint, fontFamily: T.mono }}>{sorted.length}</span>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px',
            background: T.blueWash, border: `1px solid ${T.blueBorder}`, borderRadius: '8px', marginBottom: '8px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: T.blue }}>{selected.size} selected</span>
            <span style={{ fontSize: '11px', color: T.textDim }}>Move to:</span>
            {PIPELINE_STAGES.slice(0, 6).map(s => (
              <button key={s.id} onClick={() => bulkUpdateStage(s.id)} style={{
                fontSize: '10px', fontWeight: 600, color: s.color, background: `${s.color}12`,
                border: `1px solid ${s.color}20`, borderRadius: '4px', padding: '3px 8px', cursor: 'pointer',
              }}>{s.label}</button>
            ))}
            <button onClick={() => setSelected(new Set())} style={{
              fontSize: '10px', color: T.textDim, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto',
            }}>Clear</button>
          </div>
        )}

        {/* Table */}
        <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 120px 60px 90px 70px 80px 70px 60px',
            padding: '10px 14px', gap: '4px', alignItems: 'center',
            borderBottom: `1px solid ${T.border}`, background: T.card,
          }}>
            <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0}
              onChange={toggleSelectAll}
              style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: T.blue }} />
            <SortHeader field="name" label="CONTACT" />
            <span style={{ fontSize: '9px', fontWeight: 650, color: T.textFaint, letterSpacing: '1px' }}>VEHICLE</span>
            <SortHeader field="score" label="SCORE" />
            <SortHeader field="stage" label="STAGE" />
            <span style={{ fontSize: '9px', fontWeight: 650, color: T.textFaint, letterSpacing: '1px' }}>SOURCE</span>
            <SortHeader field="updated" label="LAST ACT" />
            <SortHeader field="follow_up" label="FOLLOW" />
            <span style={{ fontSize: '9px', fontWeight: 650, color: T.textFaint, letterSpacing: '1px' }}>PHONE</span>
          </div>

          {sorted.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '28px', opacity: 0.12, marginBottom: '12px' }}>📋</div>
              <p style={{ fontSize: '13px', color: T.textDim, marginBottom: '8px' }}>
                {contacts.length === 0 ? 'No contacts yet' : 'No matches'}
              </p>
              {contacts.length === 0 && (
                <p style={{ fontSize: '11px', color: T.textFaint }}>
                  Add manually, import CSV, or connect ManyChat/Email webhooks
                </p>
              )}
            </div>
          ) : sorted.map(c => {
            const isSelected = selected.has(c.id);
            const isHov = hoverRow === c.id;
            const stageCfg = getStageConfig(c.pipeline_stage);
            const stageColor = STAGE_COLOR[c.pipeline_stage];
            const lastDays = daysSince(c.last_contact_at || c.updated_at);
            const isStale = lastDays !== null && lastDays >= 3;
            const followDays = daysSince(c.next_follow_up);
            const isOverdue = c.next_follow_up && new Date(c.next_follow_up) < new Date();

            return (
              <div key={c.id}
                onMouseEnter={() => setHoverRow(c.id)}
                onMouseLeave={() => setHoverRow(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 120px 60px 90px 70px 80px 70px 60px',
                  padding: '9px 14px', gap: '4px', alignItems: 'center',
                  background: isSelected ? T.blueWash : isHov ? `${T.card}80` : 'transparent',
                  borderBottom: `1px solid ${T.border}`, transition: 'background 0.08s',
                  borderLeft: isSelected ? `2px solid ${T.blue}` : '2px solid transparent',
                }}
              >
                {/* Checkbox */}
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(c.id)}
                  style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: T.blue }} />

                {/* Name + email */}
                <div style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => setShowDetail(c)}>
                  <div style={{ fontSize: '13px', fontWeight: 550, color: isHov ? T.textBright : T.text, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown'}
                  </div>
                  {c.email && <div style={{ fontSize: '10px', color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{c.email}</div>}
                </div>

                {/* Vehicle */}
                <span style={{ fontSize: '11px', color: T.textMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{c.vehicle_interest || '—'}</span>

                {/* Score */}
                <span style={{
                  fontSize: '12px', fontWeight: 700, fontFamily: T.mono,
                  color: c.lead_score >= 60 ? T.green : c.lead_score >= 30 ? T.amber : T.textDim,
                }}>{c.lead_score}</span>

                {/* Stage pill - editable */}
                <select value={c.pipeline_stage} onClick={e => e.stopPropagation()}
                  onChange={e => updateField(c.id, 'pipeline_stage', e.target.value)}
                  style={{
                    fontSize: '10px', fontWeight: 700, color: stageColor, background: `${stageColor}12`,
                    border: `1px solid ${stageColor}18`, borderRadius: '4px', padding: '3px 6px',
                    cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                    appearance: 'none' as const, WebkitAppearance: 'none' as const,
                    textAlign: 'center' as const, minWidth: '72px',
                  }}>
                  {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>

                {/* Source */}
                <span style={{
                  fontSize: '9px', fontWeight: 600, color: T.textDim,
                  background: T.elevated, padding: '2px 5px', borderRadius: '3px',
                  textAlign: 'center' as const,
                }}>{SOURCE_LABEL[c.source] || c.source}</span>

                {/* Last activity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: isStale ? T.red : T.textDim }}>{formatDate(c.last_contact_at || c.updated_at)}</span>
                  {isStale && <span style={{ fontSize: '9px', color: T.red, fontWeight: 600 }}>{lastDays}d</span>}
                </div>

                {/* Follow-up */}
                <span style={{
                  fontSize: '10px',
                  color: isOverdue ? T.red : c.next_follow_up ? T.textMid : T.textFaint,
                  fontWeight: isOverdue ? 600 : 400,
                }}>{c.next_follow_up ? formatDate(c.next_follow_up) : '—'}</span>

                {/* Phone */}
                <span style={{ fontSize: '10px', color: T.textDim, fontFamily: T.mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                  {c.phone ? c.phone.slice(-4) : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Slide-out */}
      {showDetail && <DetailPanel contact={showDetail} onClose={() => { setShowDetail(null); loadContacts(); }} />}

      {/* Add Contact Modal */}
      {showAddModal && <AddModal onAdd={addContact} onClose={() => setShowAddModal(false)} />}

      {/* Import CSV Modal */}
      {showImportModal && <ImportModal onDone={() => { setShowImportModal(false); loadContacts(); }} />}
    </div>
  );
}

// ═══ DETAIL PANEL ═══
function DetailPanel({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [form, setForm] = useState(contact);

  const save = async (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    await supabase.from('contacts').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', contact.id);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: '440px', background: T.surface,
        borderLeft: `1px solid ${T.borderLit}`, overflowY: 'auto' as const,
        animation: 'slideUp 0.15s ease',
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: T.textFaint, letterSpacing: '1.2px' }}>CONTACT</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>

          <div style={{ fontSize: '18px', fontWeight: 650, color: T.textBright, marginBottom: '16px' }}>
            {[form.first_name, form.last_name].filter(Boolean).join(' ') || 'Unknown'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <DetailField label="First Name" value={form.first_name || ''} onSave={v => save('first_name', v)} />
            <DetailField label="Last Name" value={form.last_name || ''} onSave={v => save('last_name', v)} />
            <DetailField label="Phone" value={form.phone || ''} onSave={v => save('phone', v)} />
            <DetailField label="Email" value={form.email || ''} onSave={v => save('email', v)} />
            <DetailField label="Vehicle Interest" value={form.vehicle_interest || ''} onSave={v => save('vehicle_interest', v)} full />
            <DetailField label="Vehicle Make" value={form.vehicle_make || ''} onSave={v => save('vehicle_make', v)} />
            <DetailField label="Timeline" value={form.timeline || ''} onSave={v => save('timeline', v)} />
            <DetailField label="Budget Range" value={form.budget_range || ''} onSave={v => save('budget_range', v)} />
            <DetailField label="Lead Score" value={String(form.lead_score || 0)} onSave={v => save('lead_score', parseInt(v) || 0)} />
          </div>

          {/* Stage buttons */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: T.textFaint, letterSpacing: '1.2px', marginBottom: '8px' }}>STAGE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
              {PIPELINE_STAGES.map(s => (
                <button key={s.id} onClick={() => save('pipeline_stage', s.id)} style={{
                  fontSize: '10px', fontWeight: 600,
                  color: form.pipeline_stage === s.id ? T.textBright : s.color,
                  background: form.pipeline_stage === s.id ? `${s.color}25` : 'transparent',
                  border: `1px solid ${form.pipeline_stage === s.id ? s.color + '40' : T.border}`,
                  borderRadius: '5px', padding: '5px 10px', cursor: 'pointer',
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: T.textFaint, letterSpacing: '1.2px', marginBottom: '6px' }}>NOTES</div>
            <textarea defaultValue={form.notes || ''} onBlur={e => save('notes', e.target.value)}
              placeholder="Add notes..." rows={4}
              style={{
                width: '100%', padding: '10px 12px', background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: '8px', fontSize: '12px', color: T.text, outline: 'none',
                fontFamily: 'inherit', resize: 'vertical' as const, lineHeight: 1.6,
              }} />
          </div>

          {/* Source + dates */}
          <div style={{ marginTop: '16px', padding: '12px', background: T.bg, borderRadius: '8px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: '10px', color: T.textDim }}>Source: {SOURCE_LABEL[form.source] || form.source} {form.source_detail ? `(${form.source_detail})` : ''}</div>
            <div style={{ fontSize: '10px', color: T.textFaint, marginTop: '4px' }}>Created: {new Date(form.created_at).toLocaleDateString()}</div>
            {form.manychat_id && <div style={{ fontSize: '10px', color: T.textFaint, marginTop: '2px' }}>ManyChat: {form.manychat_id}</div>}
            {form.quo_contact_id && <div style={{ fontSize: '10px', color: T.textFaint, marginTop: '2px' }}>Quo: {form.quo_contact_id}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value, onSave, full }: { label: string; value: string; onSave: (v: string) => void; full?: boolean }) {
  const [val, setVal] = useState(value);
  return (
    <div style={{ gridColumn: full ? 'span 2' : undefined }}>
      <div style={{ fontSize: '9px', fontWeight: 600, color: T.textFaint, letterSpacing: '0.8px', marginBottom: '4px' }}>{label.toUpperCase()}</div>
      <input type="text" value={val} onChange={e => setVal(e.target.value)} onBlur={() => { if (val !== value) onSave(val); }}
        style={{
          width: '100%', padding: '7px 10px', background: T.bg, border: `1px solid ${T.border}`,
          borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit',
        }} />
    </div>
  );
}

// ═══ ADD MODAL ═══
function AddModal({ onAdd, onClose }: { onAdd: (d: Partial<Contact>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    vehicle_interest: '', source: 'manual' as Contact['source'],
    timeline: '', budget_range: '', pipeline_stage: 'new' as PipelineStage,
  });
  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.surface, borderRadius: '12px', border: `1px solid ${T.borderLit}`,
        width: '440px', boxShadow: '0 24px 48px rgba(0,0,0,0.4)', padding: '24px',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: T.textBright, marginBottom: '20px' }}>New Contact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <ModalField label="First Name" value={form.first_name} onChange={v => set('first_name', v)} autoFocus />
          <ModalField label="Last Name" value={form.last_name} onChange={v => set('last_name', v)} />
          <ModalField label="Phone" value={form.phone} onChange={v => set('phone', v)} />
          <ModalField label="Email" value={form.email} onChange={v => set('email', v)} />
          <ModalField label="Vehicle Interest" value={form.vehicle_interest} onChange={v => set('vehicle_interest', v)} full />
          <ModalField label="Timeline" value={form.timeline} onChange={v => set('timeline', v)} />
          <ModalField label="Budget" value={form.budget_range} onChange={v => set('budget_range', v)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ fontSize: '12px', color: T.textDim, background: 'none', border: `1px solid ${T.border}`, borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { if (form.first_name || form.phone) onAdd(form); }} style={{ fontSize: '12px', fontWeight: 600, color: T.textBright, background: T.blue, border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer' }}>Add</button>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, value, onChange, autoFocus, full, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; autoFocus?: boolean; full?: boolean; placeholder?: string;
}) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : undefined }}>
      <div style={{ fontSize: '9px', fontWeight: 600, color: T.textFaint, letterSpacing: '0.8px', marginBottom: '4px' }}>{label.toUpperCase()}</div>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} autoFocus={autoFocus} placeholder={placeholder}
        style={{ width: '100%', padding: '7px 10px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit' }} />
    </div>
  );
}

// ═══ CSV IMPORT MODAL ═══
function ImportModal({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState<'ready' | 'importing' | 'done' | 'error'>('ready');
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus('importing');
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { setError('File empty or missing header'); setStatus('error'); return; }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const rows = lines.slice(1);

      // Map common CSV headers to our schema
      const headerMap: Record<string, string> = {};
      headers.forEach((h, i) => {
        if (['first_name', 'first name', 'firstname', 'first'].includes(h)) headerMap[String(i)] = 'first_name';
        else if (['last_name', 'last name', 'lastname', 'last'].includes(h)) headerMap[String(i)] = 'last_name';
        else if (['phone', 'phone number', 'mobile', 'cell'].includes(h)) headerMap[String(i)] = 'phone';
        else if (['email', 'email address', 'e-mail'].includes(h)) headerMap[String(i)] = 'email';
        else if (['vehicle', 'vehicle_interest', 'car', 'vehicle interest'].includes(h)) headerMap[String(i)] = 'vehicle_interest';
        else if (['make', 'vehicle_make', 'brand'].includes(h)) headerMap[String(i)] = 'vehicle_make';
        else if (['source', 'lead source', 'lead_source'].includes(h)) headerMap[String(i)] = 'source';
        else if (['timeline', 'timeframe', 'time frame'].includes(h)) headerMap[String(i)] = 'timeline';
        else if (['budget', 'budget_range', 'budget range', 'price range'].includes(h)) headerMap[String(i)] = 'budget_range';
        else if (['notes', 'note', 'comments'].includes(h)) headerMap[String(i)] = 'notes';
        else if (['name', 'full name', 'full_name', 'fullname'].includes(h)) headerMap[String(i)] = 'full_name';
      });

      const contacts: Partial<Contact>[] = [];
      for (const row of rows) {
        const cols = row.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const contact: Record<string, any> = { pipeline_stage: 'new', source: 'manual', lead_score: 0 };

        Object.entries(headerMap).forEach(([idx, field]) => {
          const val = cols[parseInt(idx)] || '';
          if (!val) return;
          if (field === 'full_name') {
            const parts = val.split(' ');
            contact.first_name = parts[0];
            if (parts.length > 1) contact.last_name = parts.slice(1).join(' ');
          } else {
            contact[field] = val;
          }
        });

        if (contact.first_name || contact.phone || contact.email) {
          contacts.push(contact);
        }
      }

      if (contacts.length === 0) { setError('No valid contacts found. Needs at least: first_name, phone, or email columns.'); setStatus('error'); return; }

      // Batch insert
      const batchSize = 50;
      let imported = 0;
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        const { error: insertError } = await supabase.from('contacts').insert(batch);
        if (insertError) { setError(`Import error at row ${i}: ${insertError.message}`); setStatus('error'); return; }
        imported += batch.length;
        setCount(imported);
      }

      setCount(imported);
      setStatus('done');
    } catch (err: any) {
      setError(err.message || 'Import failed');
      setStatus('error');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onDone}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.surface, borderRadius: '12px', border: `1px solid ${T.borderLit}`,
        width: '440px', boxShadow: '0 24px 48px rgba(0,0,0,0.4)', padding: '24px',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: T.textBright, marginBottom: '16px' }}>Import Contacts from CSV</div>

        {status === 'ready' && (
          <>
            <div style={{ fontSize: '12px', color: T.textMid, marginBottom: '16px', lineHeight: 1.6 }}>
              Upload a CSV with columns like: first_name, last_name, phone, email, vehicle, source, timeline, budget, notes. A "name" or "full name" column also works.
            </div>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            <button onClick={() => fileRef.current?.click()} style={{
              width: '100%', padding: '32px', background: T.bg, border: `2px dashed ${T.border}`,
              borderRadius: '8px', cursor: 'pointer', textAlign: 'center' as const,
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: T.blue, marginBottom: '4px' }}>Choose CSV file</div>
              <div style={{ fontSize: '11px', color: T.textFaint }}>or drag and drop</div>
            </button>
          </>
        )}

        {status === 'importing' && (
          <div style={{ textAlign: 'center' as const, padding: '20px' }}>
            <div style={{ fontSize: '14px', color: T.text, marginBottom: '8px' }}>Importing...</div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: T.mono, color: T.blue }}>{count}</div>
          </div>
        )}

        {status === 'done' && (
          <div style={{ textAlign: 'center' as const, padding: '20px' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: T.green }}>{count} contacts imported</div>
            <button onClick={onDone} style={{
              marginTop: '16px', fontSize: '12px', fontWeight: 600, color: T.textBright,
              background: T.blue, border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer',
            }}>Done</button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center' as const, padding: '20px' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>❌</div>
            <div style={{ fontSize: '12px', color: T.red, marginBottom: '12px' }}>{error}</div>
            <button onClick={() => { setStatus('ready'); setError(''); }} style={{
              fontSize: '12px', color: T.textMid, background: T.elevated, border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer',
            }}>Try again</button>
          </div>
        )}

        {status === 'ready' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button onClick={onDone} style={{ fontSize: '12px', color: T.textDim, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

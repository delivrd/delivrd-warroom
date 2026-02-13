'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact, PipelineStage } from '@/lib/types/crm';
import { PIPELINE_STAGES, getStageConfig } from '@/lib/types/crm';

const T = {
  bg: '#0B0D10',
  surface: '#12151A',
  card: '#171B21',
  elevated: '#1D2228',
  border: 'rgba(255,255,255,0.06)',
  borderLit: 'rgba(255,255,255,0.10)',

  blue: '#5A9CF5',
  blueHot: '#78B4FF',
  blueWash: 'rgba(90,156,245,0.06)',
  blueBorder: 'rgba(90,156,245,0.15)',

  text: '#DFE1E5',
  textBright: '#F2F3F5',
  textMid: '#9DA3AE',
  textDim: '#606878',
  textFaint: '#3A4050',

  green: '#2DD881',
  greenDim: 'rgba(45,216,129,0.12)',
  red: '#FF5C5C',
  redDim: 'rgba(255,92,92,0.12)',
  amber: '#FFB340',
  amberDim: 'rgba(255,179,64,0.12)',
  purple: '#B07CFF',

  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
};

const VISIBLE_STAGES: PipelineStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won'];

const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual', quo: 'Quo', manychat: 'ManyChat', referral: 'Referral',
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', website: 'Website',
};

export default function PipelinePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<PipelineStage | null>(null);

  useEffect(() => { loadContacts(); }, []);

  async function loadContacts() {
    const { data, error } = await supabase.from('contacts').select('*').order('lead_score', { ascending: false });
    if (error) console.error('Error:', error);
    else setContacts(data || []);
    setLoading(false);
  }

  async function moveContact(contactId: string, newStage: PipelineStage) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact || contact.pipeline_stage === newStage) return;

    // Optimistic update
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, pipeline_stage: newStage } : c));

    const { error } = await supabase.from('contacts')
      .update({ pipeline_stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', contactId);

    if (error) {
      console.error('Move error:', error);
      loadContacts(); // revert
    }

    // Log history
    await supabase.from('pipeline_history').insert({
      contact_id: contactId,
      from_stage: contact.pipeline_stage,
      to_stage: newStage,
    }).select();
  }

  async function addContact(data: Partial<Contact>) {
    const { error } = await supabase.from('contacts').insert(data).select();
    if (error) console.error('Add error:', error);
    else { setShowAddModal(false); loadContacts(); }
  }

  const byStage = (stage: PipelineStage) => contacts.filter(c => c.pipeline_stage === stage);

  const totalDeals = contacts.filter(c => !['closed_won', 'closed_lost', 'nurture'].includes(c.pipeline_stage)).length;

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
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, padding: '28px 32px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 650, color: T.textBright, letterSpacing: '-0.3px', marginBottom: '4px' }}>Sales Command</h1>
            <p style={{ fontSize: '12px', color: T.textDim }}>Drag contacts between stages to update pipeline</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Stats */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: `1px solid ${T.border}` }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: T.blueHot, fontFamily: T.mono }}>{totalDeals}</span>
              <span style={{ fontSize: '10px', color: T.textDim, fontWeight: 500 }}>active deals</span>
            </div>

            {/* Add contact */}
            <button onClick={() => setShowAddModal(true)} style={{
              fontSize: '12px', fontWeight: 600, color: T.textBright,
              background: T.blue, border: 'none', borderRadius: '8px',
              padding: '10px 18px', cursor: 'pointer', transition: 'opacity 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >+ New Contact</button>
          </div>
        </div>

        {/* Kanban Board */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px' }}>
          {VISIBLE_STAGES.map(stageId => {
            const cfg = getStageConfig(stageId);
            const stageContacts = byStage(stageId);
            const isDrop = dropTarget === stageId;

            return (
              <div key={stageId}
                onDragOver={e => { e.preventDefault(); setDropTarget(stageId); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={() => { if (draggedId) { moveContact(draggedId, stageId); setDraggedId(null); setDropTarget(null); } }}
                style={{
                  flex: '1 0 200px', minWidth: '200px', maxWidth: '280px',
                }}
              >
                {/* Column header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: '8px',
                  borderBottom: `2px solid ${cfg.color}`,
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 650, color: cfg.color, letterSpacing: '0.5px' }}>{cfg.label.toUpperCase()}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: T.textDim, fontFamily: T.mono }}>{stageContacts.length}</span>
                </div>

                {/* Drop zone */}
                <div style={{
                  minHeight: '400px', borderRadius: '8px',
                  background: isDrop ? `${cfg.color}08` : 'transparent',
                  border: isDrop ? `1px dashed ${cfg.color}30` : '1px solid transparent',
                  transition: 'all 0.15s ease', padding: '4px',
                }}>
                  {stageContacts.length === 0 && !isDrop && (
                    <div style={{ padding: '32px 12px', textAlign: 'center' as const }}>
                      <p style={{ fontSize: '11px', color: T.textFaint }}>No contacts</p>
                    </div>
                  )}

                  {stageContacts.map(contact => (
                    <div key={contact.id}
                      draggable
                      onDragStart={() => setDraggedId(contact.id)}
                      onDragEnd={() => { setDraggedId(null); setDropTarget(null); }}
                      onClick={() => setSelectedContact(contact)}
                      style={{
                        background: T.card, borderRadius: '8px',
                        border: `1px solid ${draggedId === contact.id ? T.blue : T.border}`,
                        padding: '12px', marginBottom: '6px', cursor: 'grab',
                        opacity: draggedId === contact.id ? 0.5 : 1,
                        transition: 'all 0.1s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderLit; }}
                      onMouseLeave={e => { if (draggedId !== contact.id) e.currentTarget.style.borderColor = T.border; }}
                    >
                      {/* Name */}
                      <div style={{ fontSize: '13px', fontWeight: 560, color: T.textBright, marginBottom: '4px' }}>
                        {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown'}
                      </div>

                      {/* Vehicle interest */}
                      {contact.vehicle_interest && (
                        <div style={{ fontSize: '11px', color: T.textMid, marginBottom: '6px' }}>{contact.vehicle_interest}</div>
                      )}

                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' as const }}>
                        {/* Source */}
                        <span style={{
                          fontSize: '9px', fontWeight: 600, color: T.textDim,
                          background: T.elevated, padding: '2px 5px', borderRadius: '3px',
                        }}>{SOURCE_LABEL[contact.source] || contact.source}</span>

                        {/* Score */}
                        {contact.lead_score > 0 && (
                          <span style={{
                            fontSize: '9px', fontWeight: 700, fontFamily: T.mono,
                            color: contact.lead_score >= 60 ? T.green : contact.lead_score >= 30 ? T.amber : T.textDim,
                          }}>{contact.lead_score}</span>
                        )}

                        {/* Timeline */}
                        {contact.timeline && (
                          <span style={{ fontSize: '9px', color: T.textFaint }}>{contact.timeline}</span>
                        )}

                        {/* Phone indicator */}
                        {contact.phone && (
                          <span style={{ fontSize: '9px', color: T.textFaint }}>📱</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Detail Slide-out */}
      {selectedContact && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedContact(null)} />
          <div style={{
            position: 'relative', width: '420px', background: T.surface,
            borderLeft: `1px solid ${T.borderLit}`, overflowY: 'auto' as const,
            animation: 'slideUp 0.15s ease',
          }}>
            <div style={{ padding: '24px' }}>
              {/* Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: T.textFaint, letterSpacing: '1.2px' }}>CONTACT DETAIL</span>
                <button onClick={() => setSelectedContact(null)} style={{
                  background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', fontSize: '16px',
                }}>✕</button>
              </div>

              {/* Name */}
              <div style={{ fontSize: '18px', fontWeight: 650, color: T.textBright, marginBottom: '4px' }}>
                {[selectedContact.first_name, selectedContact.last_name].filter(Boolean).join(' ') || 'Unknown'}
              </div>

              {selectedContact.vehicle_interest && (
                <div style={{ fontSize: '13px', color: T.textMid, marginBottom: '16px' }}>{selectedContact.vehicle_interest}</div>
              )}

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                {[
                  { label: 'Phone', value: selectedContact.phone },
                  { label: 'Email', value: selectedContact.email },
                  { label: 'Source', value: SOURCE_LABEL[selectedContact.source] || selectedContact.source },
                  { label: 'Score', value: String(selectedContact.lead_score) },
                  { label: 'Timeline', value: selectedContact.timeline },
                  { label: 'Budget', value: selectedContact.budget_range },
                  { label: 'Make', value: selectedContact.vehicle_make },
                  { label: 'Stage', value: getStageConfig(selectedContact.pipeline_stage).label },
                ].filter(f => f.value).map((f, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: T.bg, borderRadius: '6px', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: T.textFaint, letterSpacing: '0.8px', marginBottom: '4px' }}>{f.label.toUpperCase()}</div>
                    <div style={{ fontSize: '12px', color: T.text }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Stage selector */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: T.textFaint, letterSpacing: '1.2px', marginBottom: '8px' }}>MOVE TO STAGE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
                  {PIPELINE_STAGES.map(s => (
                    <button key={s.id}
                      onClick={() => {
                        moveContact(selectedContact.id, s.id);
                        setSelectedContact({ ...selectedContact, pipeline_stage: s.id });
                      }}
                      style={{
                        fontSize: '10px', fontWeight: 600,
                        color: selectedContact.pipeline_stage === s.id ? T.textBright : s.color,
                        background: selectedContact.pipeline_stage === s.id ? `${s.color}25` : 'transparent',
                        border: `1px solid ${selectedContact.pipeline_stage === s.id ? s.color + '40' : T.border}`,
                        borderRadius: '5px', padding: '5px 10px', cursor: 'pointer',
                        transition: 'all 0.1s',
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: T.textFaint, letterSpacing: '1.2px', marginBottom: '8px' }}>NOTES</div>
                <textarea
                  defaultValue={selectedContact.notes || ''}
                  onBlur={async (e) => {
                    await supabase.from('contacts').update({ notes: e.target.value, updated_at: new Date().toISOString() }).eq('id', selectedContact.id);
                  }}
                  placeholder="Add notes..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 12px', background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: '8px', fontSize: '12px', color: T.text, outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical' as const, lineHeight: 1.6,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && <AddContactModal onAdd={addContact} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

// ═══ ADD CONTACT MODAL ═══
function AddContactModal({ onAdd, onClose }: { onAdd: (d: Partial<Contact>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    vehicle_interest: '', source: 'manual' as Contact['source'],
    timeline: '', budget_range: '', pipeline_stage: 'new' as PipelineStage,
  });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.15s ease' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.surface, borderRadius: '12px', border: `1px solid ${T.borderLit}`,
        width: '440px', boxShadow: '0 24px 48px rgba(0,0,0,0.4)', padding: '24px',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: T.textBright, marginBottom: '20px' }}>New Contact</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <Field label="First Name" value={form.first_name} onChange={v => set('first_name', v)} autoFocus />
          <Field label="Last Name" value={form.last_name} onChange={v => set('last_name', v)} />
          <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} />
          <Field label="Email" value={form.email} onChange={v => set('email', v)} />
        </div>

        <Field label="Vehicle Interest" value={form.vehicle_interest} onChange={v => set('vehicle_interest', v)} full />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <div>
            <label style={{ fontSize: '9px', fontWeight: 600, color: T.textFaint, letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>SOURCE</label>
            <select value={form.source} onChange={e => set('source', e.target.value)} style={{
              width: '100%', padding: '8px 10px', background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit',
            }}>
              {['manual', 'quo', 'manychat', 'referral', 'tiktok', 'instagram', 'youtube', 'website'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <Field label="Timeline" value={form.timeline} onChange={v => set('timeline', v)} placeholder="e.g. This month" />
        </div>

        <Field label="Budget Range" value={form.budget_range} onChange={v => set('budget_range', v)} full placeholder="e.g. $30-50k" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button onClick={onClose} style={{
            fontSize: '12px', color: T.textDim, background: 'none', border: `1px solid ${T.border}`,
            borderRadius: '6px', padding: '8px 16px', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={() => {
            if (!form.first_name && !form.phone) return;
            onAdd(form);
          }} style={{
            fontSize: '12px', fontWeight: 600, color: T.textBright, background: T.blue,
            border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer',
          }}>Add Contact</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, autoFocus, full, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  autoFocus?: boolean; full?: boolean; placeholder?: string;
}) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : undefined, marginBottom: '4px' }}>
      <label style={{ fontSize: '9px', fontWeight: 600, color: T.textFaint, letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>{label.toUpperCase()}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} autoFocus={autoFocus} placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 10px', background: T.bg, border: `1px solid ${T.border}`,
          borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit',
        }} />
    </div>
  );
}

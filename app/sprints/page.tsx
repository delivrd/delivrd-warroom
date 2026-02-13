'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Sprint, SprintBattle, Battle, Tier, Owner } from '@/lib/types';

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
  blueGlow: 'rgba(90,156,245,0.08)',

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

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  not_started: { label: 'Not Started', color: T.textDim, bg: 'rgba(96,104,120,0.1)' },
  in_progress: { label: 'In Progress', color: T.blue, bg: T.blueWash },
  blocked: { label: 'Blocked', color: T.red, bg: T.redDim },
  done: { label: 'Done', color: T.green, bg: T.greenDim },
  deferred: { label: 'Deferred', color: T.amber, bg: T.amberDim },
};

const OWNER_LABEL: Record<Owner, string> = { t: 'Tomi', s: 'Schala', b: 'Both', a: 'AI', n: '—' };
const OWNER_COLOR: Record<Owner, string> = { t: T.blueHot, s: T.purple, b: T.amber, a: T.green, n: T.textFaint };

export default function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintBattles, setSprintBattles] = useState<Record<string, SprintBattle[]>>({});
  const [allBattles, setAllBattles] = useState<Battle[]>([]);
  const [activeSprintId, setActiveSprintId] = useState<string>('sprint-1');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [sprintsRes, sbRes, battlesRes] = await Promise.all([
      supabase.from('sprints').select('*').order('sort_order'),
      supabase.from('sprint_battles').select('*, battle:battles(*)').order('priority'),
      supabase.from('battles').select('*').order('id'),
    ]);

    if (sprintsRes.data) {
      setSprints(sprintsRes.data);
      if (sprintsRes.data.length > 0) setActiveSprintId(sprintsRes.data[0].id);
    }

    if (sbRes.data) {
      const grouped = sbRes.data.reduce((acc: Record<string, SprintBattle[]>, sb: SprintBattle) => {
        if (!acc[sb.sprint_id]) acc[sb.sprint_id] = [];
        acc[sb.sprint_id].push(sb);
        return acc;
      }, {});
      setSprintBattles(grouped);
    }

    if (battlesRes.data) setAllBattles(battlesRes.data);
    setLoading(false);
  }

  async function updateStatus(sbId: number, newStatus: string) {
    const { error } = await supabase.from('sprint_battles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', sbId);
    if (!error) {
      setSprintBattles(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(sid => {
          updated[sid] = updated[sid].map(sb => sb.id === sbId ? { ...sb, status: newStatus as any } : sb);
        });
        return updated;
      });
    }
  }

  async function updateOwner(sbId: number, newOwner: string) {
    const { error } = await supabase.from('sprint_battles')
      .update({ owner: newOwner, updated_at: new Date().toISOString() })
      .eq('id', sbId);
    if (!error) {
      setSprintBattles(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(sid => {
          updated[sid] = updated[sid].map(sb => sb.id === sbId ? { ...sb, owner: newOwner as Owner } : sb);
        });
        return updated;
      });
    }
  }

  async function updateNotes(sbId: number, notes: string) {
    await supabase.from('sprint_battles').update({ notes, updated_at: new Date().toISOString() }).eq('id', sbId);
  }

  async function addBattleToSprint(battleId: number) {
    const currentBattles = sprintBattles[activeSprintId] || [];
    const nextPriority = currentBattles.length + 1;
    const { error } = await supabase.from('sprint_battles').insert({
      sprint_id: activeSprintId,
      battle_id: battleId,
      priority: nextPriority,
      owner: 'n',
      status: 'not_started',
    });
    if (!error) {
      setShowAddModal(false);
      setAddSearch('');
      loadData();
    }
  }

  async function removeBattleFromSprint(sbId: number) {
    const { error } = await supabase.from('sprint_battles').delete().eq('id', sbId);
    if (!error) loadData();
  }

  const activeSprint = sprints.find(s => s.id === activeSprintId);
  const activeBattles = sprintBattles[activeSprintId] || [];
  const doneCount = activeBattles.filter(sb => sb.status === 'done').length;
  const inProgressCount = activeBattles.filter(sb => sb.status === 'in_progress').length;
  const blockedCount = activeBattles.filter(sb => sb.status === 'blocked').length;
  const pct = activeBattles.length > 0 ? Math.round((doneCount / activeBattles.length) * 100) : 0;

  // Battles available to add (not already in this sprint)
  const assignedBattleIds = new Set(activeBattles.map(sb => sb.battle_id));
  const availableBattles = allBattles.filter(b => !assignedBattleIds.has(b.id) && (b.tier === 'now' || b.tier === 'soon'));
  const filteredAvailable = addSearch
    ? availableBattles.filter(b => b.name.toLowerCase().includes(addSearch.toLowerCase()))
    : availableBattles;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: '13px' }}>Loading sprints...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative' }}>
      <style>{`
        @keyframes expandIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        select option { background: ${T.elevated}; color: ${T.text}; }
        textarea:focus { border-color: ${T.blue} !important; box-shadow: 0 0 0 2px ${T.blueGlow} !important; }
      `}</style>

      <div style={{ position: 'fixed', top: '-30%', left: '20%', width: '60%', height: '50%', background: 'radial-gradient(ellipse, rgba(90,156,245,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1440px', margin: '0 auto', padding: '28px 32px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 650, color: T.textBright, letterSpacing: '-0.3px', marginBottom: '4px' }}>Sprint Execution</h1>
            <p style={{ fontSize: '12px', color: T.textDim }}>Active sprints with task ownership and status tracking</p>
          </div>

          {/* Sprint progress stat */}
          {activeSprint && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', borderRadius: '8px', border: `1px solid ${T.border}`, padding: '10px 20px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: pct === 100 ? T.green : T.blueHot, fontFamily: T.mono, lineHeight: 1 }}>{pct}%</span>
              <span style={{ fontSize: '11px', color: T.textDim }}>{doneCount}/{activeBattles.length} complete</span>
              {inProgressCount > 0 && <span style={{ fontSize: '10px', color: T.blue, fontWeight: 600 }}>{inProgressCount} active</span>}
              {blockedCount > 0 && <span style={{ fontSize: '10px', color: T.red, fontWeight: 600 }}>{blockedCount} blocked</span>}
            </div>
          )}
        </div>

        {/* Sprint Tabs */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: `1px solid ${T.border}`, paddingBottom: '0' }}>
          {sprints.map(sprint => {
            const isActive = sprint.id === activeSprintId;
            const sBattles = sprintBattles[sprint.id] || [];
            const sDone = sBattles.filter(sb => sb.status === 'done').length;
            return (
              <button key={sprint.id} onClick={() => { setActiveSprintId(sprint.id); setExpanded(null); }}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: isActive ? `2px solid ${T.blue}` : '2px solid transparent',
                  marginBottom: '-1px', transition: 'all 0.1s',
                }}>
                <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 450, color: isActive ? T.textBright : T.textDim, display: 'block', marginBottom: '2px' }}>
                  {sprint.name}
                </span>
                <span style={{ fontSize: '10px', color: isActive ? T.textMid : T.textFaint }}>
                  {sprint.weeks} {sBattles.length > 0 ? `· ${sDone}/${sBattles.length}` : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sprint Info Card */}
        {activeSprint && (
          <div style={{
            background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`,
            padding: '20px 24px', marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: T.textBright, marginBottom: '4px' }}>{activeSprint.name}</div>
                {activeSprint.subtitle && <div style={{ fontSize: '12px', color: T.textMid, marginBottom: '8px' }}>{activeSprint.subtitle}</div>}
                {activeSprint.goal && (
                  <div style={{ fontSize: '12px', color: T.text, lineHeight: 1.6 }}>
                    <span style={{ color: T.textDim, fontWeight: 600, fontSize: '9px', letterSpacing: '1px', marginRight: '8px' }}>GOAL</span>
                    {activeSprint.goal}
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: T.elevated, borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${pct}%`, transition: 'width 0.4s ease',
                background: pct === 100 ? T.green : `linear-gradient(90deg, ${T.blue}, ${T.blueHot})`,
                boxShadow: `0 0 8px ${pct === 100 ? T.green : T.blue}40`,
              }} />
            </div>
          </div>
        )}

        {/* Battle Tasks Table */}
        <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '36px 1fr 90px 72px 80px 80px 28px',
            padding: '10px 16px', gap: '4px', alignItems: 'center',
            borderBottom: `1px solid ${T.border}`, background: T.card,
          }}>
            {['#', 'TASK', 'STATUS', 'OWNER', 'ESTIMATE', 'METRIC', ''].map((h, i) => (
              <span key={i} style={{ fontSize: '9px', fontWeight: 650, color: T.textFaint, letterSpacing: '1px' }}>{h}</span>
            ))}
          </div>

          {activeBattles.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' as const }}>
              <p style={{ fontSize: '13px', color: T.textDim, marginBottom: '12px' }}>No battles in this sprint yet</p>
              <button onClick={() => setShowAddModal(true)} style={{
                fontSize: '12px', fontWeight: 600, color: T.blue, background: T.blueWash,
                border: `1px solid ${T.blueBorder}`, borderRadius: '6px', padding: '8px 16px', cursor: 'pointer',
              }}>+ Add Battles</button>
            </div>
          ) : activeBattles.map((sb, idx) => {
            const isExp = expanded === sb.id;
            const isHov = hoverRow === sb.id;
            const status = STATUS_CFG[sb.status] || STATUS_CFG.not_started;
            const ownerColor = OWNER_COLOR[sb.owner] || T.textFaint;

            return (
              <div key={sb.id}
                onMouseEnter={() => setHoverRow(sb.id)}
                onMouseLeave={() => setHoverRow(null)}
                style={{
                  borderLeft: isExp ? `2px solid ${T.blue}` : isHov ? `2px solid ${T.blue}30` : '2px solid transparent',
                  background: isExp ? T.card : isHov ? `${T.card}80` : 'transparent',
                  transition: 'all 0.1s ease',
                }}
              >
                {/* Row */}
                <div onClick={() => setExpanded(isExp ? null : sb.id)} style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr 90px 72px 80px 80px 28px',
                  padding: '12px 14px', gap: '4px', alignItems: 'center', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '10px', color: T.textFaint, fontFamily: T.mono }}>{String(idx + 1).padStart(2, '0')}</span>

                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 550, color: isExp || isHov ? T.textBright : T.text }}>{sb.battle?.name || `Battle #${sb.battle_id}`}</span>
                    {sb.description && <div style={{ fontSize: '11px', color: T.textDim, marginTop: '2px', lineHeight: 1.4 }}>{sb.description.length > 60 ? sb.description.substring(0, 60) + '...' : sb.description}</div>}
                  </div>

                  {/* Status pill */}
                  <select value={sb.status} onClick={e => e.stopPropagation()} onChange={e => updateStatus(sb.id, e.target.value)}
                    style={{
                      fontSize: '10px', fontWeight: 700, color: status.color, background: status.bg,
                      border: `1px solid ${status.color}18`, borderRadius: '4px', padding: '4px 6px',
                      cursor: 'pointer', fontFamily: 'inherit', outline: 'none', appearance: 'none' as const,
                      WebkitAppearance: 'none' as const, textAlign: 'center' as const, minWidth: '80px',
                    }}>
                    {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>

                  {/* Owner pill */}
                  <select value={sb.owner} onClick={e => e.stopPropagation()} onChange={e => updateOwner(sb.id, e.target.value)}
                    style={{
                      fontSize: '10px', fontWeight: 600, color: ownerColor, background: `${ownerColor}10`,
                      border: `1px solid ${ownerColor}18`, borderRadius: '4px', padding: '4px 6px',
                      cursor: 'pointer', fontFamily: 'inherit', outline: 'none', appearance: 'none' as const,
                      WebkitAppearance: 'none' as const, textAlign: 'center' as const,
                    }}>
                    {(['t', 's', 'b', 'a', 'n'] as Owner[]).map(k => <option key={k} value={k}>{OWNER_LABEL[k]}</option>)}
                  </select>

                  <span style={{ fontSize: '10px', color: T.textDim }}>{sb.time_estimate || '—'}</span>
                  <span style={{ fontSize: '10px', color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{sb.metric || '—'}</span>

                  <span style={{
                    fontSize: '11px', color: isHov || isExp ? T.textMid : T.textFaint,
                    transform: isExp ? 'rotate(90deg)' : 'none', transition: 'all 0.12s ease',
                    textAlign: 'center' as const, display: 'inline-block',
                  }}>›</span>
                </div>

                {/* Expanded */}
                {isExp && (
                  <div style={{ padding: '0 16px 18px 52px', animation: 'expandIn 0.15s ease' }}>
                    <div style={{ height: '1px', background: `linear-gradient(90deg, ${T.blue}20, transparent 50%)`, marginBottom: '16px' }} />

                    {/* Description */}
                    {sb.description && (
                      <div style={{ fontSize: '13px', color: T.text, lineHeight: 1.7, marginBottom: '12px' }}>{sb.description}</div>
                    )}

                    {/* Deliverable + Steps */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      {sb.deliverable && (
                        <div style={{ padding: '14px 16px', background: T.bg, borderRadius: '8px', border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.green}` }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: T.green, letterSpacing: '1.2px', marginBottom: '8px' }}>DELIVERABLE</div>
                          <div style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>{sb.deliverable}</div>
                        </div>
                      )}
                      {sb.ai_lever && (
                        <div style={{ padding: '14px 16px', background: T.bg, borderRadius: '8px', border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.amber}` }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: T.amber, letterSpacing: '1.2px', marginBottom: '8px' }}>AI LEVER</div>
                          <div style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>{sb.ai_lever}</div>
                        </div>
                      )}
                    </div>

                    {sb.blockers && (
                      <div style={{ padding: '14px 16px', background: T.redDim, borderRadius: '8px', border: `1px solid rgba(255,92,92,0.15)`, marginBottom: '8px' }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: T.red, letterSpacing: '1.2px', marginBottom: '8px' }}>BLOCKERS</div>
                        <div style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>{sb.blockers}</div>
                      </div>
                    )}

                    {/* Notes */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: T.textFaint, letterSpacing: '1.2px', marginBottom: '6px' }}>NOTES</div>
                      <textarea
                        defaultValue={sb.notes || ''}
                        onBlur={e => updateNotes(sb.id, e.target.value)}
                        placeholder="Add execution notes..."
                        rows={3}
                        style={{
                          width: '100%', padding: '10px 12px', background: T.bg, border: `1px solid ${T.border}`,
                          borderRadius: '8px', fontSize: '12px', color: T.text, outline: 'none',
                          fontFamily: 'inherit', resize: 'vertical' as const, lineHeight: 1.6,
                        }}
                      />
                    </div>

                    {/* Remove from sprint */}
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => removeBattleFromSprint(sb.id)} style={{
                        fontSize: '10px', color: T.red, background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px 8px', opacity: 0.6,
                      }}>Remove from sprint</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add battle button */}
          {activeBattles.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}` }}>
              <button onClick={() => setShowAddModal(true)} style={{
                fontSize: '11px', fontWeight: 550, color: T.blue, background: 'none', border: 'none',
                cursor: 'pointer', padding: '4px 0',
              }}>+ Add battle to sprint</button>
            </div>
          )}
        </div>
      </div>

      {/* Add Battle Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.15s ease',
        }} onClick={() => setShowAddModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: T.surface, borderRadius: '12px', border: `1px solid ${T.borderLit}`,
            width: '480px', maxHeight: '520px', display: 'flex', flexDirection: 'column' as const,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}>
            <div style={{ padding: '20px 20px 12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: T.textBright, marginBottom: '12px' }}>Add Battle to Sprint</div>
              <input type="text" placeholder="Search NOW and SOON battles..." value={addSearch} onChange={e => setAddSearch(e.target.value)}
                autoFocus
                style={{
                  width: '100%', padding: '9px 12px', background: T.bg, border: `1px solid ${T.border}`,
                  borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none', fontFamily: 'inherit',
                }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' as const, padding: '0 8px 12px' }}>
              {filteredAvailable.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' as const, fontSize: '12px', color: T.textDim }}>No battles available</div>
              ) : filteredAvailable.map(b => (
                <button key={b.id} onClick={() => addBattleToSprint(b.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '10px 12px', background: 'none', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', textAlign: 'left' as const, transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.card)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: '10px', color: T.textFaint, fontFamily: T.mono, width: '20px' }}>{String(b.id).padStart(2, '0')}</span>
                  <span style={{ fontSize: '12px', color: T.text, flex: 1 }}>{b.name}</span>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
                    color: b.tier === 'now' ? T.red : T.amber,
                    background: b.tier === 'now' ? T.redDim : T.amberDim,
                    padding: '2px 6px', borderRadius: '3px',
                  }}>{b.tier.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

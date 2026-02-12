'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Sprint, SprintBattle } from '@/lib/types';
import { STATUS_LABELS, OWNER_LABELS } from '@/lib/types';

export default function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintBattles, setSprintBattles] = useState<Record<string, SprintBattle[]>>({});
  const [activeSprintId, setActiveSprintId] = useState<string>('sprint-1');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: sprintsData } = await supabase
      .from('sprints')
      .select('*')
      .order('sort_order');

    if (sprintsData) {
      setSprints(sprintsData);
      if (sprintsData.length > 0) {
        setActiveSprintId(sprintsData[0].id);
      }
    }

    const { data: sprintBattlesData } = await supabase
      .from('sprint_battles')
      .select(`
        *,
        battle:battles(*)
      `)
      .order('priority');

    if (sprintBattlesData) {
      const grouped = sprintBattlesData.reduce((acc, sb) => {
        if (!acc[sb.sprint_id]) acc[sb.sprint_id] = [];
        acc[sb.sprint_id].push(sb as SprintBattle);
        return acc;
      }, {} as Record<string, SprintBattle[]>);
      setSprintBattles(grouped);
    }

    setLoading(false);
  }

  async function updateStatus(sprintBattleId: number, newStatus: string) {
    const { error } = await supabase
      .from('sprint_battles')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', sprintBattleId);

    if (!error) {
      setSprintBattles(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(sprintId => {
          updated[sprintId] = updated[sprintId].map(sb =>
            sb.id === sprintBattleId ? { ...sb, status: newStatus as any } : sb
          );
        });
        return updated;
      });
    }
  }

  async function updateNotes(sprintBattleId: number, notes: string) {
    await supabase
      .from('sprint_battles')
      .update({ 
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', sprintBattleId);
  }

  const activeSprint = sprints.find(s => s.id === activeSprintId);
  const activeBattles = sprintBattles[activeSprintId] || [];

  const completedCount = activeBattles.filter(sb => sb.status === 'done').length;
  const progressPercent = activeBattles.length > 0 
    ? Math.round((completedCount / activeBattles.length) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: { bg: 'rgba(72, 72, 77, 0.3)', text: '#86868b' },
      in_progress: { bg: 'rgba(0, 102, 255, 1)', text: '#f5f5f7' },
      blocked: { bg: 'rgba(255, 69, 58, 1)', text: '#f5f5f7' },
      done: { bg: 'rgba(48, 209, 88, 1)', text: '#f5f5f7' },
      deferred: { bg: 'rgba(255, 214, 10, 1)', text: '#0a0a0b' }
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-war-bg flex items-center justify-center">
        <div className="text-text-mid text-label font-mono animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-war-bg">
      <div className="max-w-[1600px] mx-auto px-10 pt-section pb-block">
        {/* Header */}
        <div className="mb-block">
          <h1 className="text-display font-bold tracking-tight text-text-bright mb-6">
            Execution System
          </h1>
          <p className="text-body-lg text-text-mid max-w-3xl">
            Sprint-based task tracking. Status and ownership in real time.
          </p>
        </div>

        {/* Sprint Tabs */}
        <div className="flex gap-10 mb-element border-b border-war-border">
          {sprints.map(sprint => (
            <button
              key={sprint.id}
              onClick={() => setActiveSprintId(sprint.id)}
              className="pb-5 text-body font-semibold tracking-tight border-b-2 transition-all relative"
              style={{
                color: activeSprintId === sprint.id ? '#f5f5f7' : '#8e8e93',
                borderColor: activeSprintId === sprint.id ? '#0066ff' : 'transparent'
              }}
            >
              {sprint.name}
              {activeSprintId === sprint.id && (
                <div 
                  className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full"
                  style={{ boxShadow: '0 0 12px rgba(0,102,255,0.5)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Sprint Header */}
        {activeSprint && (
          <div 
            className="mb-element rounded-premium p-card border border-war-border bg-war-surface"
          >
            <div className="flex justify-between items-start mb-element">
              <div>
                <h2 className="text-headline font-bold tracking-tight text-text-bright mb-3">
                  {activeSprint.name}
                </h2>
                {activeSprint.subtitle && (
                  <p className="text-body text-text-mid mb-2">{activeSprint.subtitle}</p>
                )}
                {activeSprint.weeks && (
                  <p className="text-label text-text-faint">{activeSprint.weeks}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold tracking-tight text-war-blue mb-2">
                  {progressPercent}%
                </div>
                <div className="text-label font-medium text-text-mid">
                  {completedCount} of {activeBattles.length}
                </div>
              </div>
            </div>

            {activeSprint.goal && (
              <div className="mb-element">
                <h3 className="text-micro font-bold text-text-faint mb-3">
                  SPRINT GOAL
                </h3>
                <p className="text-body text-text-bright">{activeSprint.goal}</p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-war-elevated overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${progressPercent}%`, 
                  background: 'linear-gradient(90deg, #0066ff 0%, #0088ff 100%)',
                  boxShadow: '0 0 20px rgba(0,102,255,0.4)'
                }}
              />
            </div>
          </div>
        )}

        {/* Sprint Battle Cards */}
        <div className="space-y-5">
          {activeBattles.map((sb, index) => (
            <div
              key={sb.id}
              className="rounded-premium p-card border border-war-border bg-war-surface transition-all hover:border-war-border-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6 flex-1">
                  {/* Priority Number */}
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-premium flex items-center justify-center text-body font-bold shadow-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, #0066ff 0%, #0088ff 100%)', 
                      color: '#f5f5f7',
                      boxShadow: '0 4px 16px rgba(0,102,255,0.3)'
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-title font-bold tracking-tight text-text-bright mb-3">
                      {sb.battle?.name || `Battle ${sb.battle_id}`}
                    </h3>
                    <div className="flex items-center gap-5">
                      {sb.time_estimate && (
                        <span className="text-label font-medium text-text-mid">
                          ⏱ {sb.time_estimate}
                        </span>
                      )}
                      <span className="text-label font-medium text-text-mid">
                        👤 {OWNER_LABELS[sb.owner]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-5">
                  <select
                    value={sb.status}
                    onChange={(e) => updateStatus(sb.id, e.target.value)}
                    className="px-6 py-3 rounded-button text-label font-bold focus:outline-none cursor-pointer shadow-md"
                    style={{
                      backgroundColor: getStatusColor(sb.status).bg,
                      color: getStatusColor(sb.status).text,
                      border: 'none'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setExpandedId(expandedId === sb.id ? null : sb.id)}
                    className="w-10 h-10 rounded-button border border-war-border text-text-mid hover:text-text-bright hover:border-war-border-hover transition-all text-2xl font-bold"
                  >
                    {expandedId === sb.id ? '−' : '+'}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === sb.id && (
                <div className="mt-element pt-element border-t border-war-border space-y-element">
                  {sb.description && (
                    <p className="text-body leading-relaxed text-text-mid">
                      {sb.description}
                    </p>
                  )}

                  {sb.steps && sb.steps.length > 0 && (
                    <div>
                      <h4 className="text-micro font-bold text-text-faint mb-4">
                        EXECUTION STEPS
                      </h4>
                      <ol className="space-y-3">
                        {sb.steps.map((step, i) => (
                          <li key={i} className="text-label flex gap-4 text-text-bright">
                            <span className="text-text-mid font-bold">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-5">
                    {sb.ai_lever && (
                      <div className="rounded-premium p-5 bg-status-amber-dim border border-status-amber-bright">
                        <h4 className="text-micro font-bold text-status-amber mb-3">
                          AUTOMATION
                        </h4>
                        <p className="text-label text-text-bright leading-relaxed">{sb.ai_lever}</p>
                      </div>
                    )}

                    {sb.blockers && (
                      <div className="rounded-premium p-5 bg-status-red-dim border border-status-red-bright">
                        <h4 className="text-micro font-bold text-status-red mb-3">
                          BLOCKERS
                        </h4>
                        <p className="text-label text-text-bright leading-relaxed">{sb.blockers}</p>
                      </div>
                    )}

                    {sb.metric && (
                      <div className="rounded-premium p-5 bg-status-green-dim border border-status-green-bright">
                        <h4 className="text-micro font-bold text-status-green mb-3">
                          SUCCESS METRIC
                        </h4>
                        <p className="text-label text-text-bright leading-relaxed">{sb.metric}</p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-micro font-bold text-text-faint mb-3">
                      NOTES
                    </label>
                    <textarea
                      value={sb.notes || ''}
                      onChange={(e) => {
                        setSprintBattles(prev => {
                          const updated = { ...prev };
                          updated[activeSprintId] = updated[activeSprintId].map(b =>
                            b.id === sb.id ? { ...b, notes: e.target.value } : b
                          );
                          return updated;
                        });
                      }}
                      onBlur={(e) => updateNotes(sb.id, e.target.value)}
                      rows={4}
                      className="w-full px-6 py-5 rounded-button text-label focus:outline-none focus:ring-2 focus:ring-war-blue bg-war-elevated border border-war-border text-text-bright placeholder-text-faint"
                      placeholder="Add execution notes..."
                      style={{ caretColor: '#0066ff' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {activeBattles.length === 0 && (
          <div className="text-center py-section">
            <div className="text-6xl text-text-faint mb-6 opacity-20">∅</div>
            <p className="text-body-lg text-text-mid">No battles assigned to this sprint</p>
          </div>
        )}
      </div>
    </div>
  );
}

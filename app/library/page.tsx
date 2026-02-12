'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Battle, Tier } from '@/lib/types';
import { TIER_LABELS, IMPACT_LABELS, EFFORT_LABELS, OWNER_LABELS } from '@/lib/types';

export default function LibraryPage() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [filteredBattles, setFilteredBattles] = useState<Battle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBattles();
  }, []);

  async function loadBattles() {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error loading battles:', error);
    } else {
      setBattles(data || []);
      setFilteredBattles(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    let filtered = battles;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.description?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(b => b.tier === selectedTier);
    }

    setFilteredBattles(filtered);
  }, [battles, searchTerm, selectedCategory, selectedTier]);

  async function updateTier(battleId: number, newTier: Tier) {
    const { error } = await supabase
      .from('battles')
      .update({ tier: newTier, updated_at: new Date().toISOString() })
      .eq('id', battleId);

    if (error) {
      console.error('Error updating tier:', error);
    } else {
      setBattles(prev => prev.map(b =>
        b.id === battleId ? { ...b, tier: newTier } : b
      ));
    }
  }

  const categories = Array.from(new Set(battles.map(b => b.category)));

  // Sort by tier for display
  const sortedBattles = [...filteredBattles].sort((a, b) => {
    const tierOrder: Record<Tier, number> = { now: 0, soon: 1, later: 2, monitor: 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  // Group by tier
  const battlesByTier = {
    now: sortedBattles.filter(b => b.tier === 'now'),
    soon: sortedBattles.filter(b => b.tier === 'soon'),
    later: sortedBattles.filter(b => b.tier === 'later'),
    monitor: sortedBattles.filter(b => b.tier === 'monitor'),
  };

  // Stats for hero cluster
  const stats = {
    total: battles.length,
    filtered: sortedBattles.length,
    now: battles.filter(b => b.tier === 'now').length,
    soon: battles.filter(b => b.tier === 'soon').length,
    later: battles.filter(b => b.tier === 'later').length,
    monitor: battles.filter(b => b.tier === 'monitor').length,
    categories: categories.length,
  };

  const tierConfig = {
    now: { label: 'NOW', color: '#34c759', bg: 'rgba(52,199,89,0.15)', border: 'rgba(52,199,89,0.25)' },
    soon: { label: 'SOON', color: '#00a8ff', bg: 'rgba(0,168,255,0.15)', border: 'rgba(0,168,255,0.25)' },
    later: { label: 'LATER', color: '#ff9500', bg: 'rgba(255,149,0,0.15)', border: 'rgba(255,149,0,0.25)' },
    monitor: { label: 'MONITOR', color: '#8e8e93', bg: 'rgba(142,142,147,0.15)', border: 'rgba(142,142,147,0.25)' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-war-bg flex items-center justify-center">
        <div className="text-text-mid text-label font-mono animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-war-bg font-sans">
      {/* Hero Header */}
      <div className="max-w-[1600px] mx-auto px-10 pt-section pb-block">
        {/* Headline */}
        <div className="mb-block">
          <h1 className="text-display font-bold tracking-tight text-text-bright mb-6">
            Battle Library
          </h1>
          <p className="text-body-lg text-text-mid max-w-3xl">
            Strategic initiatives prioritized by tier. From NOW to MONITOR — every battle mapped, scored, and ready to execute.
          </p>
        </div>
        
        {/* Hero Stats Cluster */}
        <div className="mb-element grid grid-cols-5 gap-5">
          {/* Total Battles */}
          <div 
            className="bg-war-surface border border-war-border rounded-premium p-card transition-all hover:border-war-border-hover cursor-default"
          >
            <div className="text-micro text-text-faint font-bold mb-4">
              TOTAL BATTLES
            </div>
            <div className="text-5xl font-bold font-mono text-text-bright leading-none">
              {stats.total}
            </div>
            {stats.filtered !== stats.total && (
              <div className="text-caption text-text-dim font-mono mt-3">
                {stats.filtered} shown
              </div>
            )}
          </div>

          {/* Now */}
          <div 
            className="bg-war-surface border rounded-premium p-card transition-all hover:border-war-border-hover cursor-pointer"
            style={{ 
              borderColor: selectedTier === 'now' ? tierConfig.now.color : 'rgba(255,255,255,0.06)',
              background: selectedTier === 'now' ? tierConfig.now.bg : 'transparent',
              boxShadow: selectedTier === 'now' ? `0 0 24px ${tierConfig.now.color}25` : 'none'
            }}
            onClick={() => setSelectedTier(selectedTier === 'now' ? 'all' : 'now')}
          >
            <div className="text-micro font-bold mb-4" style={{ color: tierConfig.now.color }}>
              NOW
            </div>
            <div className="text-5xl font-bold font-mono leading-none" style={{ color: tierConfig.now.color }}>
              {stats.now}
            </div>
          </div>

          {/* Soon */}
          <div 
            className="bg-war-surface border rounded-premium p-card transition-all hover:border-war-border-hover cursor-pointer"
            style={{ 
              borderColor: selectedTier === 'soon' ? tierConfig.soon.color : 'rgba(255,255,255,0.06)',
              background: selectedTier === 'soon' ? tierConfig.soon.bg : 'transparent',
              boxShadow: selectedTier === 'soon' ? `0 0 24px ${tierConfig.soon.color}25` : 'none'
            }}
            onClick={() => setSelectedTier(selectedTier === 'soon' ? 'all' : 'soon')}
          >
            <div className="text-micro font-bold mb-4" style={{ color: tierConfig.soon.color }}>
              SOON
            </div>
            <div className="text-5xl font-bold font-mono leading-none" style={{ color: tierConfig.soon.color }}>
              {stats.soon}
            </div>
          </div>

          {/* Later */}
          <div 
            className="bg-war-surface border rounded-premium p-card transition-all hover:border-war-border-hover cursor-pointer"
            style={{ 
              borderColor: selectedTier === 'later' ? tierConfig.later.color : 'rgba(255,255,255,0.06)',
              background: selectedTier === 'later' ? tierConfig.later.bg : 'transparent',
              boxShadow: selectedTier === 'later' ? `0 0 24px ${tierConfig.later.color}25` : 'none'
            }}
            onClick={() => setSelectedTier(selectedTier === 'later' ? 'all' : 'later')}
          >
            <div className="text-micro font-bold mb-4" style={{ color: tierConfig.later.color }}>
              LATER
            </div>
            <div className="text-5xl font-bold font-mono leading-none" style={{ color: tierConfig.later.color }}>
              {stats.later}
            </div>
          </div>

          {/* Monitor */}
          <div 
            className="bg-war-surface border rounded-premium p-card transition-all hover:border-war-border-hover cursor-pointer"
            style={{ 
              borderColor: selectedTier === 'monitor' ? tierConfig.monitor.color : 'rgba(255,255,255,0.06)',
              background: selectedTier === 'monitor' ? tierConfig.monitor.bg : 'transparent',
              boxShadow: selectedTier === 'monitor' ? `0 0 24px ${tierConfig.monitor.color}25` : 'none'
            }}
            onClick={() => setSelectedTier(selectedTier === 'monitor' ? 'all' : 'monitor')}
          >
            <div className="text-micro font-bold mb-4" style={{ color: tierConfig.monitor.color }}>
              MONITOR
            </div>
            <div className="text-5xl font-bold font-mono leading-none" style={{ color: tierConfig.monitor.color }}>
              {stats.monitor}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-block space-y-5">
          <input
            type="text"
            placeholder="Search battles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-5 bg-war-surface border border-war-border text-text-bright placeholder-text-faint rounded-premium text-body font-mono focus:outline-none focus:border-war-blue focus:ring-2 focus:ring-war-blue-dim transition-all"
          />

          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-4 bg-war-surface border border-war-border text-text-mid rounded-button text-label font-semibold focus:outline-none focus:border-war-blue cursor-pointer transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-6 py-4 bg-status-red-dim border border-status-red-bright text-status-red rounded-button text-label font-bold transition-all hover:bg-status-red-bright"
              >
                Clear
              </button>
            )}

            {selectedTier !== 'all' && (
              <button
                onClick={() => setSelectedTier('all')}
                className="px-6 py-4 bg-status-red-dim border border-status-red-bright text-status-red rounded-button text-label font-bold transition-all hover:bg-status-red-bright"
              >
                Clear Tier
              </button>
            )}
          </div>
        </div>

        {/* Battle List by Tier */}
        {sortedBattles.length === 0 ? (
          <div className="text-center py-section">
            <div className="text-6xl text-text-faint mb-6 opacity-20">∅</div>
            <p className="text-body-lg text-text-mid">No battles match your filters</p>
          </div>
        ) : (
          <div className="space-y-block">
            {(Object.keys(battlesByTier) as Array<keyof typeof battlesByTier>).map((tier) => {
              const tieredBattles = battlesByTier[tier];
              if (tieredBattles.length === 0) return null;

              const config = tierConfig[tier];

              return (
                <div key={tier} className="space-y-5">
                  {/* Tier Divider */}
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-3 h-3 rounded-full shadow-lg" 
                      style={{ 
                        background: config.color,
                        boxShadow: `0 0 16px ${config.color}40`
                      }}
                    />
                    <div 
                      className="text-micro font-bold font-mono"
                      style={{ color: config.color }}
                    >
                      {config.label} ({tieredBattles.length})
                    </div>
                    <div 
                      className="flex-1 h-px bg-war-border"
                    />
                  </div>

                  {/* Battles */}
                  {tieredBattles.map((battle, idx) => (
                    <div
                      key={battle.id}
                      className="bg-war-surface border border-war-border rounded-premium p-card transition-all hover:border-war-border-hover animate-fade-up"
                      style={{ 
                        animationDelay: `${idx * 0.03}s`,
                        opacity: 0
                      }}
                    >
                      {/* Battle Row - 8 Column Grid */}
                      <div className="grid grid-cols-8 gap-6 items-center">
                        {/* Col 1-2: Name */}
                        <div className="col-span-2">
                          <div className="text-body font-semibold text-text-bright leading-tight">
                            {battle.name}
                          </div>
                        </div>

                        {/* Col 3: Category */}
                        <div className="col-span-1">
                          <div 
                            className="inline-block px-3 py-1.5 rounded-tag text-micro font-bold border"
                            style={{ 
                              background: 'rgba(0,102,255,0.15)', 
                              color: '#0066ff',
                              borderColor: 'rgba(0,102,255,0.3)'
                            }}
                          >
                            {battle.category}
                          </div>
                        </div>

                        {/* Col 4: Impact */}
                        <div className="col-span-1 text-center">
                          <div className="text-micro text-text-faint mb-2">IMPACT</div>
                          <div className="text-label font-bold font-mono text-text-bright">
                            {IMPACT_LABELS[battle.impact]}
                          </div>
                        </div>

                        {/* Col 5: Effort */}
                        <div className="col-span-1 text-center">
                          <div className="text-micro text-text-faint mb-2">EFFORT</div>
                          <div className="text-label font-bold font-mono text-text-bright">
                            {EFFORT_LABELS[battle.effort]}
                          </div>
                        </div>

                        {/* Col 6: Owner */}
                        <div className="col-span-1 text-center">
                          <div className="text-micro text-text-faint mb-2">OWNER</div>
                          <div className="text-label font-bold font-mono text-text-bright">
                            {OWNER_LABELS[battle.owner]}
                          </div>
                        </div>

                        {/* Col 7: Tier Dropdown */}
                        <div className="col-span-1 flex justify-center">
                          <select
                            value={battle.tier}
                            onChange={(e) => updateTier(battle.id, e.target.value as Tier)}
                            className="px-4 py-2.5 rounded-button text-label font-bold font-mono cursor-pointer focus:outline-none transition-all"
                            style={{ 
                              background: config.bg,
                              color: config.color,
                              border: `1px solid ${config.border}`,
                              boxShadow: `0 0 12px ${config.color}20`
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {Object.entries(TIER_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Col 8: Expand Button */}
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => setExpandedId(expandedId === battle.id ? null : battle.id)}
                            className="w-10 h-10 rounded-button bg-war-elevated border border-war-border text-text-mid hover:text-text-bright hover:border-war-border-hover transition-all font-mono text-xl font-bold"
                          >
                            {expandedId === battle.id ? '−' : '+'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedId === battle.id && (
                        <div className="mt-element pt-element border-t border-war-border space-y-6 animate-fade-up">
                          {battle.description && (
                            <p className="text-body leading-relaxed text-text-mid">
                              {battle.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-5">
                            {battle.why_this_tier && (
                              <div className="bg-status-amber-dim border border-status-amber-bright rounded-premium p-5">
                                <h4 className="text-micro font-bold text-status-amber mb-3">
                                  WHY THIS TIER
                                </h4>
                                <p className="text-label text-text-bright leading-relaxed">{battle.why_this_tier}</p>
                              </div>
                            )}

                            {battle.next_action && (
                              <div className="bg-war-blue-dim border border-war-blue-bright rounded-premium p-5">
                                <h4 className="text-micro font-bold text-war-blue mb-3">
                                  NEXT MOVE
                                </h4>
                                <p className="text-label text-text-bright leading-relaxed">{battle.next_action}</p>
                              </div>
                            )}

                            {battle.ai_play && (
                              <div className="bg-status-purple-dim border border-status-purple-bright rounded-premium p-5">
                                <h4 className="text-micro font-bold text-status-purple mb-3">
                                  AUTOMATION
                                </h4>
                                <p className="text-label text-text-bright leading-relaxed">{battle.ai_play}</p>
                              </div>
                            )}

                            {battle.success_metric && (
                              <div className="bg-status-green-dim border border-status-green-bright rounded-premium p-5">
                                <h4 className="text-micro font-bold text-status-green mb-3">
                                  SUCCESS METRIC
                                </h4>
                                <p className="text-label text-text-bright leading-relaxed">{battle.success_metric}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Battle Library Data - All 95 Channels
// TODO: Import full battle data from warroom-v2.jsx artifact

import { Battle } from '../types';

export const BATTLES: Omit<Battle, 'created_at' | 'updated_at'>[] = [
  {
    id: 1,
    name: "TikTok",
    category: "organic",
    tier: "now",
    impact: "C",
    effort: "L",
    owner: "t",
    description: "Short-form vertical video discovery engine. 470k followers, highest volume channel.",
    why_this_tier: "#1 channel. 470k. Highest volume. Priority infrastructure build.",
    next_action: "Keyword CTA system on every video. AI comment monitor for buying signals.",
    ai_play: "AI monitors comments for buying signals, auto-DMs qualified leads with booking link.",
    success_metric: "DM-to-qualified rate. Revenue from TikTok weekly."
  },
  {
    id: 2,
    name: "Instagram",
    category: "organic",
    tier: "now",
    impact: "C",
    effort: "M",
    owner: "t",
    description: "Visual storytelling platform. Strong brand presence, moderate engagement.",
    why_this_tier: "Major channel, needs systematic posting + story automation.",
    next_action: "Build content calendar automation + story link system.",
    ai_play: "AI generates caption variants, auto-schedules optimal posting times.",
    success_metric: "Story link clicks, DM conversations started."
  },
  {
    id: 3,
    name: "YouTube",
    category: "organic",
    tier: "soon",
    impact: "H",
    effort: "H",
    owner: "t",
    description: "Long-form video content. High trust-building potential, labor-intensive.",
    why_this_tier: "High impact but requires production infrastructure first.",
    next_action: "Define video series format + production workflow.",
    ai_play: "AI generates video outlines, auto-creates timestamps + descriptions.",
    success_metric: "Watch time, subscriber conversion rate."
  },
  // Add remaining 92 battles here from warroom-v2.jsx
  // ...
];

// Categories for filtering
export const CATEGORIES = [
  'organic',
  'paid',
  'partnerships',
  'referral',
  'content',
  'automation',
  'infrastructure'
];

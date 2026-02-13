'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact, PipelineStage, Communication } from '@/lib/types/crm';
import { PIPELINE_STAGES, getStageConfig } from '@/lib/types/crm';

const T = {
  bg: '#0B0D10', surface: '#12151A', card: '#171B21', elevated: '#1D2228',
  border: 'rgba(255,255,255,0.06)', borderLit: 'rgba(255,255,255,0.10)',
  blue: '#5A9CF5', blueHot: '#78B4FF', blueWash: 'rgba(90,156,245,0.06)',
  blueBorder: 'rgba(90,156,245,0.15)', blueGlow: 'rgba(90,156,245,0.08)',
  text: '#DFE1E5', textBright: '#F2F3F5', textMid: '#9DA3AE',
  textDim: '#606878', textFaint: '#3A4050',
  green: '#2DD881', greenDim: 'rgba(45,216,129,0.12)',
  red: '#FF5C5C', redDim: 'rgba(255,92,92,0.12)',
  amber: '#FFB340', amberDim: 'rgba(255,179,64,0.12)',
  purple: '#B07CFF', purpleDim: 'rgba(176,124,255,0.12)',
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
};

const STAGE_COLOR: Record<PipelineStage, string> = {
  new: '#9DA3AE', contacted: '#5A9CF5', qualified: '#B07CFF',
  proposal: '#FFB340', negotiation: '#FF8C40', closed_won: '#2DD881',
  closed_lost: '#FF5C5C', nurture: '#606878',
};

const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual', quo: 'Quo', manychat: 'ManyChat', referral: 'Referral',
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', website: 'Website', email: 'Email',
};

type CommType = 'sms' | 'call' | 'email' | 'note';

export default function DealFlowPage() {
  const [queue, setQueue] = useState<Contact[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [comms, setComms] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState<'intro' | 'follow_up' | 'objection' | 'close'>('intro');
  const [logType, setLogType] = useState<CommType>('sms');
  const [logContent, setLogContent] = useState('');
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [stats, setStats] = useState({ worked: 0, moved: 0, skipped: 0 });
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [showSendSms, setShowSendSms] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [smsContent, setSmsContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');

  useEffect(() => { loadQueue(); }, []);

  async function loadQueue() {
    // Load active pipeline contacts, sorted by priority:
    // 1. Overdue follow-ups first
    // 2. Then by lead score desc
    // 3. Then by last contact date (oldest first = most stale)
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .in('pipeline_stage', ['new', 'contacted', 'qualified', 'proposal', 'negotiation'])
      .order('lead_score', { ascending: false });

    if (data) {
      // Re-sort: overdue follow-ups first, then score
      const now = new Date();
      const sorted = data.sort((a, b) => {
        const aOverdue = a.next_follow_up && new Date(a.next_follow_up) < now ? 1 : 0;
        const bOverdue = b.next_follow_up && new Date(b.next_follow_up) < now ? 1 : 0;
        if (bOverdue !== aOverdue) return bOverdue - aOverdue;

        // Stale contacts (no contact in 3+ days) get priority
        const aDays = a.last_contact_at ? (now.getTime() - new Date(a.last_contact_at).getTime()) / 86400000 : 999;
        const bDays = b.last_contact_at ? (now.getTime() - new Date(b.last_contact_at).getTime()) / 86400000 : 999;
        const aStale = aDays >= 3 ? 1 : 0;
        const bStale = bDays >= 3 ? 1 : 0;
        if (bStale !== aStale) return bStale - aStale;

        return (b.lead_score || 0) - (a.lead_score || 0);
      });
      setQueue(sorted);
    }
    setLoading(false);
  }

  const current = queue[currentIdx] || null;

  useEffect(() => {
    if (current) loadComms(current.id);
  }, [current?.id]);

  async function loadComms(contactId: string) {
    const { data } = await supabase
      .from('communications')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(20);
    setComms(data || []);
  }

  async function updateContact(field: string, value: any) {
    if (!current) return;
    await supabase.from('contacts')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', current.id);
    setQueue(prev => prev.map(c => c.id === current.id ? { ...c, [field]: value } : c));
  }

  async function moveStage(stage: PipelineStage) {
    if (!current) return;
    const oldStage = current.pipeline_stage;
    await updateContact('pipeline_stage', stage);

    // Log pipeline history
    await supabase.from('pipeline_history').insert({
      contact_id: current.id, from_stage: oldStage, to_stage: stage,
    });

    // If won, set deal value
    if (stage === 'closed_won') {
      await updateContact('closed_deal_value', 1000);
    }

    setStats(prev => ({ ...prev, moved: prev.moved + 1 }));
  }

  async function logCommunication() {
    if (!current || !logContent.trim()) return;
    await supabase.from('communications').insert({
      contact_id: current.id,
      type: logType,
      direction: 'outbound',
      content: logContent,
    });
    await updateContact('last_contact_at', new Date().toISOString());
    setLogContent('');
    setShowLogPanel(false);
    loadComms(current.id);
  }

  async function sendSms() {
    if (!current || !smsContent.trim() || !current.phone) return;
    setSending(true);
    setSendStatus(null);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sms',
          contact_id: current.id,
          to: current.phone,
          content: smsContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendStatus('✓ SMS sent');
        setSmsContent('');
        setShowSendSms(false);
        loadComms(current.id);
      } else {
        setSendStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSendStatus(`Error: ${err.message}`);
    }
    setSending(false);
    setTimeout(() => setSendStatus(null), 3000);
  }

  async function sendEmail() {
    if (!current || !emailContent.trim() || !current.email) return;
    setSending(true);
    setSendStatus(null);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          contact_id: current.id,
          to: current.email,
          subject: emailSubject || 'Delivrd - Your Car Buying Concierge',
          content: emailContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendStatus('✓ Email sent');
        setEmailContent('');
        setEmailSubject('');
        setShowSendEmail(false);
        loadComms(current.id);
      } else {
        setSendStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSendStatus(`Error: ${err.message}`);
    }
    setSending(false);
    setTimeout(() => setSendStatus(null), 3000);
  }

  async function setFollowUp() {
    if (!current || !followUpDate) return;
    await updateContact('next_follow_up', new Date(followUpDate).toISOString());
    setFollowUpDate('');
  }

  function nextLead() {
    setAiResponse('');
    setShowLogPanel(false);
    setLogContent('');
    if (currentIdx < queue.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setStats(prev => ({ ...prev, worked: prev.worked + 1 }));
    }
  }

  function skipLead() {
    setAiResponse('');
    setShowLogPanel(false);
    if (currentIdx < queue.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    }
  }

  async function generateAiResponse() {
    if (!current) return;
    setAiLoading(true);

    const name = [current.first_name, current.last_name].filter(Boolean).join(' ') || 'there';
    const vehicle = current.vehicle_interest || 'a vehicle';
    const lastComm = comms.length > 0 ? comms[0].content : null;

    const prompts: Record<string, string> = {
      intro: `Write a short, friendly first outreach text message (2-3 sentences max) to ${name} who is interested in ${vehicle}. They found us through ${SOURCE_LABEL[current.source] || current.source}. Be conversational, not salesy. Mention Delivrd helps people save thousands on car purchases. Ask about their timeline.`,
      follow_up: `Write a short follow-up text (2 sentences) to ${name} about their interest in ${vehicle}. ${lastComm ? `Last message context: "${lastComm.substring(0, 100)}"` : 'We haven\'t heard back yet.'}. Be casual and helpful, not pushy.`,
      objection: `Write a short response (2-3 sentences) handling a common car buying objection for ${name} interested in ${vehicle}. Address concerns about our service fee by framing it against typical savings of $3,000-$8,000. Be confident but not aggressive.`,
      close: `Write a short closing message (2-3 sentences) for ${name} who is interested in ${vehicle}. Ask them to confirm they want to move forward so we can start working the deal. Mention our $1,000 fee is only charged when we save them money.`,
    };

    try {
      const res = await fetch('/api/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompts[aiContext] }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.response || data.text || '');
      } else {
        // Fallback: generate locally
        const templates: Record<string, string> = {
          intro: `Hey ${name}! 👋 I'm reaching out from Delivrd - we help people save thousands when buying a car. I saw you're interested in ${vehicle}. What's your timeline looking like?`,
          follow_up: `Hey ${name}, just checking in on your ${vehicle} search. Any updates on your timeline? Happy to help whenever you're ready!`,
          objection: `Great question ${name}! Our $1,000 fee typically saves our clients $3,000-$8,000 on their purchase. We only charge when we deliver savings, so there's zero risk on your end.`,
          close: `${name}, sounds like you're ready to move forward on the ${vehicle}! Want me to start working the deal? Our fee is $1,000 and we only charge once we've locked in your savings.`,
        };
        setAiResponse(templates[aiContext]);
      }
    } catch {
      const templates: Record<string, string> = {
        intro: `Hey ${name}! 👋 I'm reaching out from Delivrd - we help people save thousands when buying a car. I saw you're interested in ${vehicle}. What's your timeline looking like?`,
        follow_up: `Hey ${name}, just checking in on your ${vehicle} search. Any updates on your timeline? Happy to help whenever you're ready!`,
        objection: `Great question ${name}! Our $1,000 fee typically saves our clients $3,000-$8,000 on their purchase. We only charge when we deliver savings, so there's zero risk on your end.`,
        close: `${name}, sounds like you're ready to move forward on the ${vehicle}! Want me to start working the deal? Our fee is $1,000 and we only charge once we've locked in your savings.`,
      };
      setAiResponse(templates[aiContext]);
    }
    setAiLoading(false);
  }

  const daysSince = (d: string | null) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: T.textDim, fontFamily: T.mono, fontSize: '13px' }}>Loading queue...</span>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.2 }}>✅</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: T.textBright, marginBottom: '8px' }}>Queue Empty</div>
          <div style={{ fontSize: '13px', color: T.textDim }}>No active leads to work. Add contacts in Pipeline.</div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const stageCfg = getStageConfig(current.pipeline_stage);
  const stageColor = STAGE_COLOR[current.pipeline_stage];
  const lastDays = daysSince(current.last_contact_at);
  const isStale = lastDays !== null && lastDays >= 3;
  const isOverdue = current.next_follow_up && new Date(current.next_follow_up) < new Date();
  const position = currentIdx + 1;
  const total = queue.length;

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        select option { background: ${T.elevated}; color: ${T.text}; }
        textarea:focus { border-color: ${T.blue} !important; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 32px 80px' }}>

        {/* Top bar: position + session stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 650, color: T.textBright, letterSpacing: '-0.3px' }}>Deal Flow</h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: T.mono, color: T.blueHot }}>{position}</span>
              <span style={{ fontSize: '12px', color: T.textFaint }}>/ {total}</span>
            </div>
            {/* Priority indicators */}
            {isOverdue && <span style={{ fontSize: '10px', fontWeight: 700, color: T.red, background: T.redDim, padding: '3px 8px', borderRadius: '4px' }}>OVERDUE</span>}
            {isStale && !isOverdue && <span style={{ fontSize: '10px', fontWeight: 700, color: T.amber, background: T.amberDim, padding: '3px 8px', borderRadius: '4px' }}>STALE {lastDays}d</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
              <span style={{ color: T.green }}>{stats.worked} worked</span>
              <span style={{ color: T.blue }}>{stats.moved} moved</span>
              <span style={{ color: T.textDim }}>{stats.skipped} skipped</span>
            </div>
            <button onClick={skipLead} style={{
              fontSize: '11px', fontWeight: 550, color: T.textDim, background: T.surface,
              border: `1px solid ${T.border}`, borderRadius: '6px', padding: '7px 14px', cursor: 'pointer',
            }}>Skip ›</button>
            <button onClick={nextLead} style={{
              fontSize: '12px', fontWeight: 600, color: T.textBright, background: T.blue,
              border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer',
            }}>Next Lead →</button>
          </div>
        </div>

        {/* Main layout: 2 column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '12px', animation: 'slideIn 0.2s ease' }} key={current.id}>

          {/* LEFT: Lead card */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>

            {/* Lead header card */}
            <div style={{
              background: T.surface, borderRadius: '12px', border: `1px solid ${T.border}`,
              padding: '24px', borderTop: `3px solid ${stageColor}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: T.textBright, marginBottom: '4px' }}>
                    {[current.first_name, current.last_name].filter(Boolean).join(' ') || 'Unknown Contact'}
                  </div>
                  {current.vehicle_interest && (
                    <div style={{ fontSize: '14px', color: T.blue, fontWeight: 500, marginBottom: '8px' }}>{current.vehicle_interest}</div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: T.textDim, background: T.elevated, padding: '3px 8px', borderRadius: '4px' }}>
                      {SOURCE_LABEL[current.source] || current.source}
                    </span>
                    {current.source_detail && (
                      <span style={{ fontSize: '10px', color: T.textFaint }}>{current.source_detail}</span>
                    )}
                    <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: T.mono, color: current.lead_score >= 60 ? T.green : current.lead_score >= 30 ? T.amber : T.textDim }}>
                      Score: {current.lead_score}
                    </span>
                  </div>
                </div>

                {/* Score ring */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  border: `3px solid ${current.lead_score >= 60 ? T.green : current.lead_score >= 30 ? T.amber : T.textDim}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: current.lead_score >= 60 ? T.greenDim : current.lead_score >= 30 ? T.amberDim : T.elevated,
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: T.mono, color: current.lead_score >= 60 ? T.green : current.lead_score >= 30 ? T.amber : T.textDim }}>
                    {current.lead_score}
                  </span>
                </div>
              </div>

              {/* Contact info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {[
                  { label: 'Phone', value: current.phone, action: current.phone ? `tel:${current.phone}` : null },
                  { label: 'Email', value: current.email, action: current.email ? `mailto:${current.email}` : null },
                  { label: 'Timeline', value: current.timeline },
                  { label: 'Budget', value: current.budget_range },
                ].map((f, i) => (
                  <div key={i} style={{ padding: '8px 10px', background: T.bg, borderRadius: '6px', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: T.textFaint, letterSpacing: '0.8px', marginBottom: '3px' }}>{f.label.toUpperCase()}</div>
                    {f.action ? (
                      <a href={f.action} style={{ fontSize: '12px', color: T.blue, textDecoration: 'none' }}>{f.value}</a>
                    ) : (
                      <div style={{ fontSize: '12px', color: f.value ? T.text : T.textFaint }}>{f.value || '—'}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick action buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                {current.phone && (
                  <a href={`tel:${current.phone}`} style={{
                    fontSize: '11px', fontWeight: 600, color: T.green, background: T.greenDim,
                    border: `1px solid ${T.green}20`, borderRadius: '6px', padding: '6px 14px',
                    textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>📞 Call</a>
                )}
                {current.phone && (
                  <button onClick={() => { setShowSendSms(!showSendSms); setShowSendEmail(false); setShowLogPanel(false); }} style={{
                    fontSize: '11px', fontWeight: 600, color: showSendSms ? T.textBright : T.blue, background: showSendSms ? T.blue : T.blueWash,
                    border: `1px solid ${T.blue}20`, borderRadius: '6px', padding: '6px 14px',
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>💬 Text</button>
                )}
                {current.email && (
                  <button onClick={() => { setShowSendEmail(!showSendEmail); setShowSendSms(false); setShowLogPanel(false); }} style={{
                    fontSize: '11px', fontWeight: 600, color: showSendEmail ? T.textBright : T.purple, background: showSendEmail ? T.purple : T.purpleDim,
                    border: `1px solid ${T.purple}20`, borderRadius: '6px', padding: '6px 14px',
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>📧 Email</button>
                )}
                <button onClick={() => { setShowLogPanel(!showLogPanel); setShowSendSms(false); setShowSendEmail(false); }} style={{
                  fontSize: '11px', fontWeight: 600, color: T.textMid, background: T.elevated,
                  border: `1px solid ${T.border}`, borderRadius: '6px', padding: '6px 14px', cursor: 'pointer',
                }}>📝 Log Activity</button>
                {sendStatus && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: sendStatus.startsWith('✓') ? T.green : T.red, alignSelf: 'center' }}>{sendStatus}</span>
                )}
              </div>
            </div>

            {/* SMS Compose Panel */}
            {showSendSms && current.phone && (
              <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.blueBorder}`, padding: '16px', borderLeft: `2px solid ${T.blue}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: T.blue, letterSpacing: '1px' }}>SEND SMS → {current.phone}</span>
                </div>
                <textarea value={smsContent} onChange={e => setSmsContent(e.target.value)}
                  placeholder="Type your message..." rows={3} autoFocus
                  style={{
                    width: '100%', padding: '10px', background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: '6px', fontSize: '13px', color: T.text, outline: 'none',
                    fontFamily: 'inherit', resize: 'none' as const, lineHeight: 1.6, marginBottom: '8px',
                  }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: T.textFaint }}>{smsContent.length}/160 chars</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setShowSendSms(false)} style={{
                      fontSize: '11px', color: T.textDim, background: 'none', border: `1px solid ${T.border}`,
                      borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
                    }}>Cancel</button>
                    <button onClick={sendSms} disabled={sending || !smsContent.trim()} style={{
                      fontSize: '11px', fontWeight: 600, color: T.textBright, background: T.blue,
                      border: 'none', borderRadius: '6px', padding: '6px 16px',
                      cursor: sending ? 'wait' : 'pointer', opacity: !smsContent.trim() ? 0.4 : 1,
                    }}>{sending ? 'Sending...' : 'Send SMS →'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* Email Compose Panel */}
            {showSendEmail && current.email && (
              <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.purple}20`, padding: '16px', borderLeft: `2px solid ${T.purple}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: T.purple, letterSpacing: '1px' }}>SEND EMAIL → {current.email}</span>
                </div>
                <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Subject (optional)" style={{
                    width: '100%', padding: '8px 10px', background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none',
                    fontFamily: 'inherit', marginBottom: '6px',
                  }} />
                <textarea value={emailContent} onChange={e => setEmailContent(e.target.value)}
                  placeholder="Type your email..." rows={5} autoFocus
                  style={{
                    width: '100%', padding: '10px', background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: '6px', fontSize: '13px', color: T.text, outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical' as const, lineHeight: 1.6, marginBottom: '8px',
                  }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button onClick={() => setShowSendEmail(false)} style={{
                    fontSize: '11px', color: T.textDim, background: 'none', border: `1px solid ${T.border}`,
                    borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
                  }}>Cancel</button>
                  <button onClick={sendEmail} disabled={sending || !emailContent.trim()} style={{
                    fontSize: '11px', fontWeight: 600, color: T.textBright, background: T.purple,
                    border: 'none', borderRadius: '6px', padding: '6px 16px',
                    cursor: sending ? 'wait' : 'pointer', opacity: !emailContent.trim() ? 0.4 : 1,
                  }}>{sending ? 'Sending...' : 'Send Email →'}</button>
                </div>
              </div>
            )}
            </div>

            {/* Log activity panel */}
            {showLogPanel && (
              <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                  {(['sms', 'call', 'email', 'note'] as CommType[]).map(t => (
                    <button key={t} onClick={() => setLogType(t)} style={{
                      fontSize: '10px', fontWeight: 600,
                      color: logType === t ? T.textBright : T.textDim,
                      background: logType === t ? T.blueWash : 'transparent',
                      border: `1px solid ${logType === t ? T.blueBorder : T.border}`,
                      borderRadius: '5px', padding: '4px 10px', cursor: 'pointer',
                    }}>{t.toUpperCase()}</button>
                  ))}
                </div>
                <textarea value={logContent} onChange={e => setLogContent(e.target.value)}
                  placeholder={`Log ${logType}...`} rows={3}
                  style={{
                    width: '100%', padding: '10px', background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none',
                    fontFamily: 'inherit', resize: 'none' as const, lineHeight: 1.6, marginBottom: '8px',
                  }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={logCommunication} style={{
                    fontSize: '11px', fontWeight: 600, color: T.textBright, background: T.blue,
                    border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer',
                  }}>Save</button>
                </div>
              </div>
            )}

            {/* AI Response Generator */}
            <div style={{
              background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '16px',
              borderLeft: `2px solid ${T.amber}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: T.amber, letterSpacing: '1px' }}>AI RESPONSE</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {(['intro', 'follow_up', 'objection', 'close'] as const).map(ctx => (
                    <button key={ctx} onClick={() => setAiContext(ctx)} style={{
                      fontSize: '9px', fontWeight: 600,
                      color: aiContext === ctx ? T.textBright : T.textDim,
                      background: aiContext === ctx ? T.amberDim : 'transparent',
                      border: `1px solid ${aiContext === ctx ? `${T.amber}30` : T.border}`,
                      borderRadius: '4px', padding: '3px 8px', cursor: 'pointer',
                    }}>{ctx === 'follow_up' ? 'Follow Up' : ctx.charAt(0).toUpperCase() + ctx.slice(1)}</button>
                  ))}
                </div>
              </div>

              <button onClick={generateAiResponse} disabled={aiLoading} style={{
                width: '100%', padding: '10px', background: T.amberDim, border: `1px solid ${T.amber}20`,
                borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                color: aiLoading ? T.textDim : T.amber, cursor: aiLoading ? 'wait' : 'pointer',
                marginBottom: aiResponse ? '10px' : '0',
              }}>
                {aiLoading ? 'Generating...' : `Generate ${aiContext === 'follow_up' ? 'Follow Up' : aiContext.charAt(0).toUpperCase() + aiContext.slice(1)} Message`}
              </button>

              {aiResponse && (
                <div>
                  <div style={{
                    padding: '12px', background: T.bg, borderRadius: '6px', border: `1px solid ${T.border}`,
                    fontSize: '13px', color: T.text, lineHeight: 1.7, marginBottom: '8px',
                  }}>{aiResponse}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { navigator.clipboard.writeText(aiResponse); }} style={{
                      fontSize: '10px', fontWeight: 600, color: T.blue, background: T.blueWash,
                      border: `1px solid ${T.blueBorder}`, borderRadius: '5px', padding: '4px 10px', cursor: 'pointer',
                    }}>Copy</button>
                    {current.phone && (
                      <button onClick={() => { setSmsContent(aiResponse); setShowSendSms(true); setShowSendEmail(false); setShowLogPanel(false); }} style={{
                        fontSize: '10px', fontWeight: 600, color: T.green, background: T.greenDim,
                        border: `1px solid ${T.green}20`, borderRadius: '5px', padding: '4px 10px', cursor: 'pointer',
                      }}>Send as SMS →</button>
                    )}
                    {current.email && (
                      <button onClick={() => { setEmailContent(aiResponse); setShowSendEmail(true); setShowSendSms(false); setShowLogPanel(false); }} style={{
                        fontSize: '10px', fontWeight: 600, color: T.purple, background: T.purpleDim,
                        border: `1px solid ${T.purple}20`, borderRadius: '5px', padding: '4px 10px', cursor: 'pointer',
                      }}>Send as Email →</button>
                    )}
                    <button onClick={generateAiResponse} style={{
                      fontSize: '10px', fontWeight: 500, color: T.textFaint, background: 'none',
                      border: 'none', cursor: 'pointer', padding: '4px 8px',
                    }}>Regenerate</button>
                  </div>
                </div>
              )}
            </div>

            {/* Stage + Follow-up */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Stage mover */}
              <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: T.textFaint, letterSpacing: '1px', marginBottom: '10px' }}>MOVE STAGE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {PIPELINE_STAGES.map(s => (
                    <button key={s.id} onClick={() => moveStage(s.id)} style={{
                      fontSize: '10px', fontWeight: 600,
                      color: current.pipeline_stage === s.id ? T.textBright : s.color,
                      background: current.pipeline_stage === s.id ? `${s.color}25` : 'transparent',
                      border: `1px solid ${current.pipeline_stage === s.id ? s.color + '40' : T.border}`,
                      borderRadius: '5px', padding: '6px 8px', cursor: 'pointer', transition: 'all 0.1s',
                    }}>{s.label}</button>
                  ))}
                </div>
              </div>

              {/* Follow-up scheduler */}
              <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: T.textFaint, letterSpacing: '1px', marginBottom: '10px' }}>FOLLOW-UP</div>
                {current.next_follow_up && (
                  <div style={{
                    fontSize: '12px', color: isOverdue ? T.red : T.text, marginBottom: '10px',
                    fontWeight: isOverdue ? 600 : 400,
                  }}>
                    Scheduled: {new Date(current.next_follow_up).toLocaleDateString()} {isOverdue ? '(OVERDUE)' : ''}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={{
                    flex: 1, padding: '6px 8px', background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: '6px', fontSize: '11px', color: T.text, outline: 'none',
                    fontFamily: 'inherit',
                  }} />
                  <button onClick={setFollowUp} disabled={!followUpDate} style={{
                    fontSize: '10px', fontWeight: 600, color: T.textBright, background: T.blue,
                    border: 'none', borderRadius: '6px', padding: '6px 12px',
                    cursor: followUpDate ? 'pointer' : 'default', opacity: followUpDate ? 1 : 0.4,
                  }}>Set</button>
                </div>
                {/* Quick follow-up buttons */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {[
                    { label: 'Tomorrow', days: 1 },
                    { label: '3 Days', days: 3 },
                    { label: '1 Week', days: 7 },
                  ].map(({ label, days }) => (
                    <button key={label} onClick={() => {
                      const d = new Date(); d.setDate(d.getDate() + days);
                      updateContact('next_follow_up', d.toISOString());
                    }} style={{
                      fontSize: '9px', fontWeight: 550, color: T.textDim, background: T.elevated,
                      border: `1px solid ${T.border}`, borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: T.textFaint, letterSpacing: '1px', marginBottom: '8px' }}>NOTES</div>
              <textarea defaultValue={current.notes || ''} key={current.id}
                onBlur={e => updateContact('notes', e.target.value)}
                placeholder="Deal notes..." rows={3}
                style={{
                  width: '100%', padding: '10px', background: T.bg, border: `1px solid ${T.border}`,
                  borderRadius: '6px', fontSize: '12px', color: T.text, outline: 'none',
                  fontFamily: 'inherit', resize: 'vertical' as const, lineHeight: 1.6,
                }} />
            </div>
          </div>

          {/* RIGHT: Communication history */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0' }}>
            <div style={{
              background: T.surface, borderRadius: '12px', border: `1px solid ${T.border}`,
              padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' as const,
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: T.textFaint, letterSpacing: '1px', marginBottom: '12px' }}>ACTIVITY ({comms.length})</div>

              <div style={{ flex: 1, overflowY: 'auto' as const }}>
                {comms.length === 0 ? (
                  <div style={{ padding: '32px 12px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: '11px', color: T.textFaint }}>No activity logged yet</div>
                  </div>
                ) : comms.map(comm => {
                  const typeIcon: Record<string, string> = { sms: '💬', call: '📞', email: '📧', note: '📝', voicemail: '📱' };
                  const isInbound = comm.direction === 'inbound';
                  return (
                    <div key={comm.id} style={{
                      padding: '10px 12px', marginBottom: '6px', borderRadius: '8px',
                      background: isInbound ? T.blueWash : T.bg,
                      borderLeft: `2px solid ${isInbound ? T.blue : T.textFaint}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: T.textDim }}>
                          {typeIcon[comm.type] || '📝'} {comm.type.toUpperCase()} · {comm.direction}
                        </span>
                        <span style={{ fontSize: '9px', color: T.textFaint }}>
                          {new Date(comm.created_at).toLocaleDateString()} {new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {comm.content && (
                        <div style={{ fontSize: '12px', color: T.text, lineHeight: 1.6 }}>{comm.content}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar at bottom */}
        <div style={{
          marginTop: '16px', height: '3px', borderRadius: '2px', background: T.elevated, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '2px', width: `${(position / total) * 100}%`,
            background: `linear-gradient(90deg, ${T.blue}, ${T.blueHot})`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

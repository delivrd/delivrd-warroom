'use client';

import { useEffect, useState } from 'react';
import { type PipelineContact, type Communication, COMM_TYPE_ICONS, PRIORITY_COLORS, getStageConfig } from '@/lib/types/crm';
import { getContactCommunications, createCommunication, getContactFollowUps } from '@/lib/api/crm';

interface ContactDetailPanelProps {
  contact: PipelineContact;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ContactDetailPanel({ contact, onClose, onUpdate }: ContactDetailPanelProps) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'info' | 'tasks'>('timeline');
  const [newNote, setNewNote] = useState('');
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingSMS, setSendingSMS] = useState(false);

  useEffect(() => {
    loadData();
  }, [contact.id]);

  async function loadData() {
    try {
      const [comms, tasks] = await Promise.all([
        getContactCommunications(contact.id),
        getContactFollowUps(contact.id)
      ]);
      setCommunications(comms);
      setFollowUps(tasks);
    } catch (error) {
      console.error('Error loading contact data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;

    try {
      await createCommunication({
        contact_id: contact.id,
        type: 'note',
        direction: 'internal',
        body: newNote,
        status: 'sent'
      });
      setNewNote('');
      loadData();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }

  async function handleSendSMS() {
    if (!smsMessage.trim()) return;
    if (!contact.phone) {
      alert('This contact has no phone number');
      return;
    }

    setSendingSMS(true);
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          message: smsMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to send SMS');
      }

      setSmsMessage('');
      setShowSMSModal(false);
      loadData(); // Reload to show the new SMS in timeline
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      alert(error.message || 'Failed to send SMS');
    } finally {
      setSendingSMS(false);
    }
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  const stageConfig = getStageConfig(contact.stage);

  return (
    <>
      {/* Overlay with stronger blur */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 animate-expand-in"
        onClick={onClose}
      />

      {/* Panel with glass effect */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-crm-surface/95 backdrop-blur-xl shadow-2xl border-l border-crm-border z-50 overflow-y-auto animate-expand-in">
        {/* Header */}
        <div className="sticky top-0 bg-crm-card/80 backdrop-blur-crm border-b border-crm-border z-10">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="text-crm-small-caps text-crm-text-faint mb-3">CONTACT DETAILS</div>
                <h2 className="text-crm-headline text-crm-text-bright mb-3">
                  {contact.full_name}
                </h2>
                <p className="text-crm-body text-crm-text-mid">
                  {contact.title ? `${contact.title} • ` : ''}{contact.dealership_name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-crm-text-dim hover:text-crm-text-bright transition-colors p-2 hover:bg-crm-elevated rounded-crm-button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Stats with glass cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-crm-elevated/50 backdrop-blur-sm border border-crm-border rounded-crm-button p-4">
                <div className="text-crm-small-caps text-crm-text-faint mb-2">STAGE</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full shadow-sm"
                    style={{ backgroundColor: stageConfig.color }}
                  />
                  <span className="text-crm-label text-crm-text font-medium">
                    {stageConfig.label}
                  </span>
                </div>
              </div>
              <div className="bg-crm-elevated/50 backdrop-blur-sm border border-crm-border rounded-crm-button p-4">
                <div className="text-crm-small-caps text-crm-text-faint mb-2">SCORE</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-crm-blue text-xl">
                    {contact.lead_score}
                  </span>
                  <span className="text-crm-caption text-crm-text-dim">/ 100</span>
                </div>
              </div>
              <div className="bg-crm-elevated/50 backdrop-blur-sm border border-crm-border rounded-crm-button p-4">
                <div className="text-crm-small-caps text-crm-text-faint mb-2">PRIORITY</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: PRIORITY_COLORS[contact.priority] }}
                  />
                  <span className="text-crm-label text-crm-text capitalize font-medium">
                    {contact.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-crm-border">
            {[
              { id: 'timeline', label: 'Timeline' },
              { id: 'info', label: 'Info' },
              { id: 'tasks', label: 'Tasks', badge: followUps.filter(f => f.status === 'pending').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex-1 px-6 py-4 text-crm-label font-semibold transition-all relative
                  ${activeTab === tab.id 
                    ? 'text-crm-blue bg-crm-elevated/30' 
                    : 'text-crm-text-dim hover:text-crm-text hover:bg-crm-elevated/20'}
                `}
              >
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-2 bg-crm-amber/20 text-crm-amber border border-crm-amber/30 px-2.5 py-0.5 rounded-crm-button text-xs font-mono font-bold">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-crm-blue shadow-crm-glow" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'timeline' && (
            <div className="space-y-5">
              {/* Quick Actions */}
              <div className="flex gap-4">
                {/* Add Note with glass effect */}
                <div className="flex-1 bg-crm-card/50 backdrop-blur-crm border border-crm-border rounded-crm-card p-6 shadow-lg">
                  <div className="text-crm-small-caps text-crm-text-faint mb-3">ADD NOTE</div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this contact..."
                    className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="mt-4 bg-crm-blue hover:bg-crm-blue/90 disabled:bg-crm-muted disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-crm-button text-crm-label font-semibold transition-all shadow-crm-glow hover:shadow-crm-glow-lg"
                  >
                    Add Note
                  </button>
                </div>

                {/* Send SMS */}
                {contact.phone && (
                  <div className="bg-crm-card/50 backdrop-blur-crm border border-crm-border rounded-crm-card p-6 shadow-lg flex flex-col items-center justify-center min-w-[200px]">
                    <div className="text-4xl mb-4">💬</div>
                    <button
                      onClick={() => setShowSMSModal(true)}
                      className="bg-crm-green hover:bg-crm-green/90 text-white px-6 py-3 rounded-crm-button text-crm-label font-semibold transition-all shadow-crm-glow hover:shadow-crm-glow-lg"
                    >
                      Send SMS
                    </button>
                    <p className="text-crm-caption text-crm-text-dim mt-2 font-mono">{contact.phone}</p>
                  </div>
                )}
              </div>

              {/* Communications Timeline with glass cards */}
              <div className="space-y-4">
                {communications.map((comm, index) => (
                  <div 
                    key={comm.id} 
                    className="bg-crm-card/50 backdrop-blur-crm border border-crm-border rounded-crm-card p-6 hover:border-crm-blue/30 transition-all animate-expand-in shadow-lg"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      borderLeftWidth: '3px',
                      borderLeftColor: comm.direction === 'inbound' ? '#34D07B' : '#5A9CF5'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl opacity-70">
                        {COMM_TYPE_ICONS[comm.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className="text-crm-label text-crm-text-bright font-semibold capitalize">
                            {comm.type}
                          </span>
                          <span className="text-crm-caption text-crm-text-dim">
                            • {formatDateTime(comm.created_at)}
                          </span>
                          <span className={`
                            text-xs px-2.5 py-1 rounded-crm-button font-mono font-semibold border
                            ${comm.direction === 'inbound' 
                              ? 'bg-crm-green/10 text-crm-green border-crm-green/20' 
                              : 'bg-crm-blue/10 text-crm-blue border-crm-blue/20'}
                          `}>
                            {comm.direction}
                          </span>
                        </div>
                        {comm.subject && (
                          <p className="text-crm-body text-crm-text-bright font-semibold mb-2">
                            {comm.subject}
                          </p>
                        )}
                        {comm.body && (
                          <p className="text-crm-body text-crm-text-mid whitespace-pre-wrap leading-relaxed">
                            {comm.body}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {communications.length === 0 && !loading && (
                  <div className="text-center py-20 bg-crm-card/30 backdrop-blur-sm rounded-crm-card border border-dashed border-crm-border">
                    <div className="text-crm-text-faint text-6xl mb-4 opacity-20">💬</div>
                    <p className="text-crm-body text-crm-text-mid mb-2">No communications yet</p>
                    <p className="text-crm-label text-crm-text-dim">Add a note to get started!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Contact Info with glass effect */}
              <div className="bg-crm-card/50 backdrop-blur-crm border border-crm-border rounded-crm-card p-6 shadow-lg">
                <div className="text-crm-small-caps text-crm-text-faint mb-4">CONTACT INFORMATION</div>
                <div className="space-y-4">
                  {contact.phone && (
                    <div>
                      <label className="text-crm-caption text-crm-text-dim block mb-1.5">Phone</label>
                      <a href={`tel:${contact.phone}`} className="text-crm-body text-crm-blue hover:text-crm-blue/80 font-mono font-semibold transition-colors">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.email && (
                    <div>
                      <label className="text-crm-caption text-crm-text-dim block mb-1.5">Email</label>
                      <a href={`mailto:${contact.email}`} className="text-crm-body text-crm-blue hover:text-crm-blue/80 font-medium transition-colors">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.dealership_brand && (
                    <div>
                      <label className="text-crm-caption text-crm-text-dim block mb-1.5">Brand</label>
                      <p className="text-crm-body text-crm-text-bright font-medium">{contact.dealership_brand}</p>
                    </div>
                  )}
                  {contact.dealership_location && (
                    <div>
                      <label className="text-crm-caption text-crm-text-dim block mb-1.5">Location</label>
                      <p className="text-crm-body text-crm-text-bright font-medium">{contact.dealership_location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {contact.notes && (
                <div className="bg-crm-card/50 backdrop-blur-crm border border-crm-border rounded-crm-card p-6 shadow-lg">
                  <div className="text-crm-small-caps text-crm-text-faint mb-4">NOTES</div>
                  <p className="text-crm-body text-crm-text-mid whitespace-pre-wrap leading-relaxed">
                    {contact.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="bg-crm-card/50 backdrop-blur-crm border border-crm-border rounded-crm-card p-6 shadow-lg">
                  <div className="text-crm-small-caps text-crm-text-faint mb-4">TAGS</div>
                  <div className="flex flex-wrap gap-2.5">
                    {contact.tags.map(tag => (
                      <span 
                        key={tag}
                        className="bg-crm-elevated border border-crm-border text-crm-text px-4 py-2 rounded-crm-button text-crm-label font-medium hover:border-crm-blue/30 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {followUps.map((task, index) => (
                <div 
                  key={task.id} 
                  className="bg-crm-card/50 backdrop-blur-crm border border-crm-border rounded-crm-card p-6 hover:border-crm-blue/30 transition-all animate-expand-in shadow-lg"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    borderLeftWidth: '3px',
                    borderLeftColor: task.status === 'pending' ? '#E5A832' : '#34D07B'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-crm-body text-crm-text-bright font-semibold flex-1">
                      {task.title}
                    </h4>
                    <span className={`
                      text-xs px-3 py-1.5 rounded-crm-button font-mono font-bold border
                      ${task.status === 'pending' 
                        ? 'bg-crm-amber/10 text-crm-amber border-crm-amber/20' 
                        : 'bg-crm-green/10 text-crm-green border-crm-green/20'}
                    `}>
                      {task.status}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-crm-label text-crm-text-mid mb-4 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-crm-caption text-crm-text-dim pt-3 border-t border-crm-border">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      {formatDateTime(task.due_date)}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-crm-text-faint" />
                    <span className="capitalize font-medium">{task.type}</span>
                  </div>
                </div>
              ))}

              {followUps.length === 0 && !loading && (
                <div className="text-center py-20 bg-crm-card/30 backdrop-blur-sm rounded-crm-card border border-dashed border-crm-border">
                  <div className="text-crm-text-faint text-6xl mb-4 opacity-20">✓</div>
                  <p className="text-crm-body text-crm-text-mid mb-2">No follow-up tasks</p>
                  <p className="text-crm-label text-crm-text-dim">All caught up!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SMS Modal */}
      {showSMSModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setShowSMSModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="bg-crm-card border border-crm-border rounded-crm-card shadow-2xl max-w-2xl w-full animate-expand-in">
              {/* Modal Header */}
              <div className="border-b border-crm-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-crm-headline text-crm-text-bright mb-2">Send SMS</h3>
                    <p className="text-crm-body text-crm-text-mid">
                      To: <span className="font-mono font-semibold text-crm-text-bright">{contact.phone}</span>
                      {' • '}
                      <span className="font-medium">{contact.full_name}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSMSModal(false)}
                    className="text-crm-text-dim hover:text-crm-text-bright transition-colors p-2 hover:bg-crm-elevated rounded-crm-button"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder={`Hey ${contact.first_name}, `}
                  className="w-full bg-crm-elevated border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-green focus:border-crm-green transition-all resize-none"
                  rows={6}
                  autoFocus
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-crm-caption font-mono font-semibold ${
                    smsMessage.length > 160 ? 'text-crm-amber' : 'text-crm-text-dim'
                  }`}>
                    {smsMessage.length} / 160 characters
                  </span>
                  {smsMessage.length > 160 && (
                    <span className="text-crm-caption text-crm-amber">
                      ⚠️ Message may be sent as multiple SMS
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-crm-border p-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSMSModal(false)}
                  disabled={sendingSMS}
                  className="px-6 py-3 rounded-crm-button text-crm-label font-semibold text-crm-text hover:bg-crm-elevated transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendSMS}
                  disabled={!smsMessage.trim() || sendingSMS}
                  className="bg-crm-green hover:bg-crm-green/90 disabled:bg-crm-muted disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-crm-button text-crm-label font-semibold transition-all shadow-crm-glow hover:shadow-crm-glow-lg flex items-center gap-2"
                >
                  {sendingSMS ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>💬</span>
                      Send SMS
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getPipelineContacts, updateContactStage, subscribeToContacts } from '@/lib/api/crm';
import { PIPELINE_STAGES, type PipelineContact, type PipelineStage } from '@/lib/types/crm';
import ContactCard from '@/components/crm/ContactCard';
import ContactDetailPanel from '@/components/crm/ContactDetailPanel';
import AddContactButton from '@/components/crm/AddContactButton';

export default function PipelinePage() {
  const [contacts, setContacts] = useState<PipelineContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<PipelineContact | null>(null);
  const [draggedContact, setDraggedContact] = useState<PipelineContact | null>(null);

  useEffect(() => {
    loadContacts();
    
    // Real-time subscription
    const subscription = subscribeToContacts((payload) => {
      console.log('Contact change:', payload);
      loadContacts(); // Reload on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadContacts() {
    try {
      const data = await getPipelineContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  function getContactsByStage(stage: PipelineStage) {
    return contacts.filter(c => c.stage === stage);
  }

  function handleDragStart(contact: PipelineContact) {
    setDraggedContact(contact);
  }

  function handleDragEnd() {
    setDraggedContact(null);
  }

  async function handleDrop(stage: PipelineStage) {
    if (!draggedContact || draggedContact.stage === stage) return;

    // Optimistic update
    setContacts(prev => 
      prev.map(c => 
        c.id === draggedContact.id 
          ? { ...c, stage } 
          : c
      )
    );

    try {
      await updateContactStage(draggedContact.id, stage);
    } catch (error) {
      console.error('Error updating stage:', error);
      // Revert on error
      loadContacts();
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault(); // Allow drop
  }

  const stats = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = getContactsByStage(stage.id).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-crm-bg flex items-center justify-center">
        <div className="text-text-mid text-label font-mono animate-pulse">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crm-bg">
      {/* Header with glass effect */}
      <div className="border-b border-crm-border sticky top-0 z-10"
        style={{
          background: 'rgba(20,21,23,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="max-w-[1800px] mx-auto px-10 py-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-micro text-text-faint font-bold mb-3">DEAL PIPELINE</div>
              <h1 className="text-display font-bold tracking-tight text-text-bright mb-5">Active Deals</h1>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-4xl font-bold text-crm-blue">
                    {contacts.length}
                  </span>
                  <span className="text-label text-text-mid">active contacts</span>
                </div>
                <div className="w-px h-8 bg-crm-border" />
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-semibold text-text-primary">
                    {PIPELINE_STAGES.length}
                  </span>
                  <span className="text-label text-text-mid">stages</span>
                </div>
              </div>
            </div>
            <AddContactButton onContactAdded={loadContacts} />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-[1800px] mx-auto px-10 py-element">
        <div className="flex gap-6 overflow-x-auto pb-6">
          {PIPELINE_STAGES.map(stage => (
            <div
              key={stage.id}
              className="flex-shrink-0 w-96"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage Header with glass effect */}
              <div className="mb-5 px-6 py-5 bg-crm-surface rounded-premium border border-crm-border"
                style={{
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div 
                    className="w-3 h-10 rounded-full"
                    style={{ 
                      backgroundColor: stage.color,
                      boxShadow: `0 0 16px ${stage.color}40`
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-micro text-text-faint font-bold mb-2">STAGE</div>
                    <h2 className="text-title-lg text-text-bright font-semibold">
                      {stage.label}
                    </h2>
                  </div>
                  <div className="bg-crm-elevated px-4 py-2 rounded-button border border-crm-border">
                    <span className="text-body font-mono font-bold text-text-primary">
                      {stats[stage.id] || 0}
                    </span>
                  </div>
                </div>
                <p className="text-caption text-text-dim ml-7">
                  {stage.description}
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {getContactsByStage(stage.id).map(contact => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onDragStart={() => handleDragStart(contact)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedContact(contact)}
                    isDragging={draggedContact?.id === contact.id}
                  />
                ))}

                {/* Empty State with gradient */}
                {getContactsByStage(stage.id).length === 0 && (
                  <div className="bg-gradient-to-br from-crm-surface/30 to-crm-card/30 border border-dashed border-crm-border rounded-premium p-10 text-center backdrop-blur-sm">
                    <div className="text-text-faint text-5xl mb-4 opacity-20">∅</div>
                    <p className="text-caption text-text-faint">
                      No contacts in {stage.label.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Detail Panel (Slide-out) */}
      {selectedContact && (
        <ContactDetailPanel
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={loadContacts}
        />
      )}
    </div>
  );
}

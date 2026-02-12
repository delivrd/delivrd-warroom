'use client';

import { type PipelineContact, PRIORITY_COLORS, COMM_TYPE_ICONS } from '@/lib/types/crm';

interface ContactCardProps {
  contact: PipelineContact;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
  isDragging: boolean;
}

export default function ContactCard({ 
  contact, 
  onDragStart, 
  onDragEnd, 
  onClick,
  isDragging 
}: ContactCardProps) {
  
  function formatDate(dateString: string | null) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        relative bg-crm-card rounded-premium p-6 
        border border-crm-border
        cursor-grab active:cursor-grabbing
        hover:border-crm-blue-bright transition-all duration-200
        ${isDragging ? 'opacity-50 rotate-2 scale-105' : 'opacity-100'}
      `}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: PRIORITY_COLORS[contact.priority],
        boxShadow: isDragging ? '0 8px 32px rgba(45,127,249,0.2)' : 'none'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-body text-text-bright font-semibold truncate mb-2">
            {contact.full_name}
          </h3>
          <p className="text-label text-text-mid truncate">
            {contact.dealership_name}
          </p>
        </div>

        {/* Priority Indicator with glow */}
        {contact.priority !== 'medium' && (
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0 ml-3 mt-1 animate-pulse"
            style={{ 
              backgroundColor: PRIORITY_COLORS[contact.priority],
              boxShadow: `0 0 12px ${PRIORITY_COLORS[contact.priority]}60`
            }}
            title={`${contact.priority} priority`}
          />
        )}
      </div>

      {/* Lead Score Hero */}
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-3xl font-bold text-crm-blue">
          {contact.lead_score}
        </span>
        <span className="text-micro text-text-faint font-bold">LEAD SCORE</span>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center gap-4 text-caption text-text-dim mb-4 pb-4 border-b border-crm-border">
        {/* Brand */}
        {contact.dealership_brand && (
          <div className="truncate font-medium">
            {contact.dealership_brand}
          </div>
        )}

        {/* Location */}
        {contact.dealership_location && (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-text-faint" />
            <div className="truncate">
              {contact.dealership_location}
            </div>
          </>
        )}
      </div>

      {/* Last Contact */}
      <div className="flex items-center justify-between text-caption text-text-dim">
        <div className="flex items-center gap-2.5">
          {contact.last_contact_type && (
            <span className="text-base">{COMM_TYPE_ICONS[contact.last_contact_type]}</span>
          )}
          <span className="font-medium">
            {formatDate(contact.last_contact_date)}
          </span>
        </div>

        {/* Pending Follow-ups Badge with glow */}
        {contact.pending_followups > 0 && (
          <div className="bg-status-amber-dim text-status-amber px-3 py-1.5 rounded-tag border border-status-amber-bright text-xs font-mono font-bold"
            style={{ boxShadow: '0 0 8px rgba(255,149,0,0.2)' }}
          >
            {contact.pending_followups}
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-crm-border">
          {contact.tags.slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="bg-crm-elevated border border-crm-border text-text-dim px-3 py-1.5 rounded-tag text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="text-text-faint text-xs px-3 py-1.5">
              +{contact.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

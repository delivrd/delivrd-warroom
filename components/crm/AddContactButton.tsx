'use client';

import { useState } from 'react';
import { createContact } from '@/lib/api/crm';
import type { Contact, PipelineStage, ContactSource, ContactPriority } from '@/lib/types/crm';

interface AddContactButtonProps {
  onContactAdded: () => void;
}

export default function AddContactButton({ onContactAdded }: AddContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dealership_name: '',
    dealership_brand: '',
    dealership_location: '',
    title: '',
    stage: 'lead' as PipelineStage,
    source: 'manual' as ContactSource,
    priority: 'medium' as ContactPriority,
    notes: '',
    tags: ''
  });

  function handleClose() {
    setIsOpen(false);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      dealership_name: '',
      dealership_brand: '',
      dealership_location: '',
      title: '',
      stage: 'lead',
      source: 'manual',
      priority: 'medium',
      notes: '',
      tags: ''
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const contactData: Partial<Contact> = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        lead_score: 0,
        status: 'active'
      };

      await createContact(contactData);
      onContactAdded();
      handleClose();
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Failed to create contact. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-crm-blue hover:bg-crm-blue/90 text-white px-8 py-3 rounded-crm-button text-crm-label font-semibold transition-all flex items-center gap-2.5 shadow-crm-glow hover:shadow-crm-glow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Contact
      </button>

      {/* Modal with T design */}
      {isOpen && (
        <>
          {/* Overlay with stronger blur */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-expand-in"
            onClick={handleClose}
          />

          {/* Modal Content with glass effect */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-expand-in">
            <div className="bg-crm-surface/95 backdrop-blur-xl border border-crm-border rounded-crm-card w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-crm-card/80 backdrop-blur-crm border-b border-crm-border p-8 flex items-center justify-between z-10">
                <div>
                  <div className="text-crm-small-caps text-crm-text-faint mb-2">NEW CONTACT</div>
                  <h2 className="text-crm-headline text-crm-text-bright">Add New Contact</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-crm-text-dim hover:text-crm-text-bright transition-colors p-2 hover:bg-crm-elevated rounded-crm-button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Basic Info */}
                <div>
                  <div className="text-crm-small-caps text-crm-text-faint mb-4">BASIC INFORMATION</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        First Name <span className="text-crm-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                        placeholder="john@dealership.com"
                      />
                    </div>
                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Dealership Info */}
                <div>
                  <div className="text-crm-small-caps text-crm-text-faint mb-4">DEALERSHIP INFORMATION</div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Dealership Name <span className="text-crm-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.dealership_name}
                        onChange={(e) => setFormData({ ...formData, dealership_name: e.target.value })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                        placeholder="Smith Honda of Charlotte"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                          Brand
                        </label>
                        <input
                          type="text"
                          value={formData.dealership_brand}
                          onChange={(e) => setFormData({ ...formData, dealership_brand: e.target.value })}
                          className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                          placeholder="Honda, Toyota, Ford..."
                        />
                      </div>
                      <div>
                        <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                          Location
                        </label>
                        <input
                          type="text"
                          value={formData.dealership_location}
                          onChange={(e) => setFormData({ ...formData, dealership_location: e.target.value })}
                          className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                          placeholder="Charlotte, NC"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Title / Role
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                        placeholder="General Manager, Sales Director..."
                      />
                    </div>
                  </div>
                </div>

                {/* Pipeline Settings */}
                <div>
                  <div className="text-crm-small-caps text-crm-text-faint mb-4">PIPELINE SETTINGS</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Stage
                      </label>
                      <select
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value as PipelineStage })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                      >
                        <option value="lead">Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Source
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value as ContactSource })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                      >
                        <option value="manual">Manual Entry</option>
                        <option value="quo">Quo Message</option>
                        <option value="referral">Referral</option>
                        <option value="cold-outbound">Cold Outbound</option>
                        <option value="website">Website</option>
                        <option value="event">Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as ContactPriority })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <div className="text-crm-small-caps text-crm-text-faint mb-4">ADDITIONAL INFORMATION</div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all resize-none"
                        rows={3}
                        placeholder="Any additional context about this contact..."
                      />
                    </div>

                    <div>
                      <label className="block text-crm-label text-crm-text-dim mb-2 font-medium">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full bg-crm-elevated/50 border border-crm-border rounded-crm-button px-4 py-3 text-crm-body text-crm-text placeholder-crm-text-dim focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all font-mono"
                        placeholder="vip, hot-lead, follow-up-needed"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-crm-border">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-8 py-3 text-crm-label text-crm-text-mid hover:text-crm-text-bright font-semibold transition-colors hover:bg-crm-elevated rounded-crm-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-crm-blue hover:bg-crm-blue/90 disabled:bg-crm-muted disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-3 rounded-crm-button text-crm-label font-semibold transition-all shadow-crm-glow hover:shadow-crm-glow-lg"
                  >
                    {loading ? 'Creating...' : 'Create Contact'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}

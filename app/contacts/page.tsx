'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getContacts, searchContacts } from '@/lib/api/crm';
import { type Contact, PRIORITY_COLORS, getStageLabel } from '@/lib/types/crm';
import AddContactButton from '@/components/crm/AddContactButton';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'score' | 'name'>('updated');

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contacts, searchQuery, filterStage, filterPriority, sortBy]);

  async function loadContacts() {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      try {
        const results = await searchContacts(query);
        setContacts(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      loadContacts();
    }
  }

  function applyFilters() {
    let filtered = [...contacts];

    // Stage filter
    if (filterStage !== 'all') {
      filtered = filtered.filter(c => c.stage === filterStage);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(c => c.priority === filterPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'score':
          return b.lead_score - a.lead_score;
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        default:
          return 0;
      }
    });

    setFilteredContacts(filtered);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crm-bg flex items-center justify-center">
        <div className="text-text-mid text-label font-mono animate-pulse">Loading contacts...</div>
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
        <div className="max-w-[1600px] mx-auto px-10 py-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-micro text-text-faint font-bold mb-3">CONTACT DIRECTORY</div>
              <h1 className="text-display font-bold tracking-tight text-text-bright mb-5">All Contacts</h1>
              <div className="flex items-center gap-5">
                <span className="font-mono text-4xl font-bold text-crm-blue">
                  {filteredContacts.length}
                </span>
                <span className="text-text-faint text-2xl">/</span>
                <span className="font-mono text-2xl text-text-primary">
                  {contacts.length}
                </span>
                <span className="text-label text-text-mid ml-2">contacts</span>
              </div>
            </div>
            <AddContactButton onContactAdded={loadContacts} />
          </div>

          {/* Search & Filters with glass morphism */}
          <div className="flex flex-wrap gap-5">
            {/* Search with glow effect */}
            <div className="flex-1 min-w-[400px]">
              <div className="relative group">
                <svg 
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-dim group-focus-within:text-crm-blue transition-colors"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name, dealership, phone, or email..."
                  className="w-full bg-crm-surface border border-crm-border rounded-premium pl-14 pr-6 py-5 text-body text-text-bright placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-crm-blue transition-all"
                />
              </div>
            </div>

            {/* Stage Filter */}
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-crm-surface border border-crm-border rounded-button px-6 py-5 text-label text-text-primary focus:outline-none focus:ring-2 focus:ring-crm-blue transition-all font-semibold"
            >
              <option value="all">All Stages</option>
              <option value="lead">Lead</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
              <option value="nurture">Nurture</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-crm-surface border border-crm-border rounded-button px-6 py-5 text-label text-text-primary focus:outline-none focus:ring-2 focus:ring-crm-blue transition-all font-semibold"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-crm-surface border border-crm-border rounded-button px-6 py-5 text-label text-text-primary focus:outline-none focus:ring-2 focus:ring-crm-blue transition-all font-semibold"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Added</option>
              <option value="score">Lead Score</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table with glass effect */}
      <div className="max-w-[1600px] mx-auto px-10 py-element">
        {filteredContacts.length === 0 ? (
          <div className="bg-crm-surface border border-crm-border rounded-premium p-section text-center">
            <div className="text-text-faint text-7xl mb-8 opacity-20">👤</div>
            <p className="text-title-lg text-text-mid mb-3">
              {searchQuery ? 'No contacts match your search' : 'No contacts yet'}
            </p>
            <p className="text-label text-text-dim mb-8">
              {searchQuery ? 'Try adjusting your filters' : 'Get started by adding your first contact'}
            </p>
            {!searchQuery && (
              <AddContactButton onContactAdded={loadContacts} />
            )}
          </div>
        ) : (
          <div className="bg-crm-surface border border-crm-border rounded-premium overflow-hidden shadow-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-crm-border bg-crm-card">
                  <th className="text-left px-8 py-6 text-micro text-text-faint font-bold">
                    CONTACT
                  </th>
                  <th className="text-left px-8 py-6 text-micro text-text-faint font-bold">
                    DEALERSHIP
                  </th>
                  <th className="text-left px-8 py-6 text-micro text-text-faint font-bold">
                    STAGE
                  </th>
                  <th className="text-center px-8 py-6 text-micro text-text-faint font-bold">
                    SCORE
                  </th>
                  <th className="text-center px-8 py-6 text-micro text-text-faint font-bold">
                    PRIORITY
                  </th>
                  <th className="text-left px-8 py-6 text-micro text-text-faint font-bold">
                    UPDATED
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, index) => (
                  <tr 
                    key={contact.id}
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                    className="border-b border-crm-border hover:bg-crm-elevated cursor-pointer transition-all group relative"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <td className="px-8 py-6">
                      <div>
                        <div className="text-body text-text-bright font-medium mb-1 group-hover:text-crm-blue transition-colors">
                          {contact.full_name}
                        </div>
                        {contact.title && (
                          <div className="text-label text-text-dim">
                            {contact.title}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-body text-text-primary">
                        {contact.dealership_name}
                      </div>
                      {contact.dealership_brand && (
                        <div className="text-label text-text-dim">
                          {contact.dealership_brand}
                          {contact.dealership_location && ` • ${contact.dealership_location}`}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-label text-text-mid font-semibold">
                        {getStageLabel(contact.stage)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-mono font-bold text-crm-blue text-2xl">
                        {contact.lead_score}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shadow-md"
                          style={{ 
                            backgroundColor: PRIORITY_COLORS[contact.priority],
                            boxShadow: `0 0 12px ${PRIORITY_COLORS[contact.priority]}40`
                          }}
                        />
                        <span className="text-label text-text-dim capitalize font-medium">
                          {contact.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-label text-text-dim">
                        {formatDate(contact.updated_at)}
                      </span>
                    </td>
                    {/* Border-left accent on hover */}
                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-crm-blue opacity-0 group-hover:opacity-100 transition-opacity rounded-l-premium" 
                      style={{ boxShadow: '0 0 16px rgba(45,127,249,0.6)' }}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

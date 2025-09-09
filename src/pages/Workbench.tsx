import { useState } from 'react';
import { useContacts } from '../hooks/useContacts';
import { InteractionModal } from '../components/InteractionModal';
import { Contact, InteractionType } from '../api/types';

export function Workbench() {
  const [search, setSearch] = useState('');
  const [owner, setOwner] = useState('');
  const [interactionModal, setInteractionModal] = useState<{
    isOpen: boolean;
    contactId: string;
    contactName: string;
    type: InteractionType;
  }>({
    isOpen: false,
    contactId: '',
    contactName: '',
    type: 'Phone',
  });

  const { data, isLoading, error } = useContacts({
    search: search.trim() || undefined,
    owner: owner.trim() || undefined,
  });

  if (isLoading) return <div>Loading workbench...</div>;
  if (error) return <div>Error loading contacts: {String(error)}</div>;

  const contacts = data?.contacts || [];

  const handleLogInteraction = (contactId: string, contactName: string, type: InteractionType) => {
    setInteractionModal({
      isOpen: true,
      contactId,
      contactName,
      type,
    });
  };

  const generateMailtoLink = (contact: Contact) => {
    if (!contact.email) return '#';
    
    const subject = `Follow up with ${contact.fullName}`;
    const body = `Hi ${contact.fullName.split(' ')[0]},\n\n`;
    
    return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const formatLastOutreach = (lastOutreach?: string) => {
    if (!lastOutreach) return 'Never';
    
    const date = new Date(lastOutreach);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Workbench</h2>
      
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        
        <input
          type="text"
          placeholder="Filter by owner..."
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Daily Touches on Contacts ({contacts.length})
          </h3>
          
          {contacts.length === 0 ? (
            <p className="text-gray-500">No contacts found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Linked Client</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>Last Outreach</th>
                  <th>Days Since</th>
                  <th>Quick Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <div className="font-medium">{contact.fullName}</div>
                      {contact.title && <div className="text-sm text-gray-600">{contact.title}</div>}
                      {contact.email && (
                        <div className="text-sm">
                          <a
                            href={generateMailtoLink(contact)}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && <div className="text-sm">{contact.phone}</div>}
                    </td>
                    <td className="text-sm">
                      {/* This would need client data joined in real implementation */}
                      -
                    </td>
                    <td>
                      <span className="px-2 py-1 rounded text-xs bg-gray-100">
                        {contact.inheritedCategory || '-'}
                      </span>
                    </td>
                    <td>{contact.owner || '-'}</td>
                    <td className="text-sm">{formatLastOutreach(contact.lastOutreach)}</td>
                    <td className="text-center">{contact.daysSinceLastOutreach || 0}</td>
                    <td>
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-600 truncate">
                          {contact.quickNotes || '-'}
                        </div>
                      </div>
                    </td>
                    <td>
                      {contact.doNotContact ? (
                        <span className="text-xs text-red-600">Do Not Contact</span>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleLogInteraction(contact.id, contact.fullName, 'Phone')}
                            className="btn btn-secondary text-xs"
                            title="Log Phone Call"
                          >
                            📞
                          </button>
                          <button
                            onClick={() => handleLogInteraction(contact.id, contact.fullName, 'Email')}
                            className="btn btn-secondary text-xs"
                            title="Log Email"
                          >
                            📧
                          </button>
                          <button
                            onClick={() => handleLogInteraction(contact.id, contact.fullName, 'Meeting')}
                            className="btn btn-secondary text-xs"
                            title="Log Meeting"
                          >
                            🤝
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <InteractionModal
        isOpen={interactionModal.isOpen}
        onClose={() => setInteractionModal(prev => ({ ...prev, isOpen: false }))}
        contactId={interactionModal.contactId}
        contactName={interactionModal.contactName}
        type={interactionModal.type}
      />
    </div>
  );
}
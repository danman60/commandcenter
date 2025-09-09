import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useClients, useUpdateClientCategory } from '../hooks/useClients';
import { useContacts } from '../hooks/useContacts';
import { ClientCard } from '../components/ClientCard';
import { InteractionModal } from '../components/InteractionModal';
import { Client, ClientCategory, InteractionType } from '../api/types';

const CATEGORIES: ClientCategory[] = ['Previous Client', 'Warm Lead', 'Cold Lead'];

export function LeadBoard() {
  const { data, isLoading, error } = useClients({});
  const updateCategory = useUpdateClientCategory();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
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

  const { data: contactsData } = useContacts({
    clientId: selectedClientId || undefined,
  });

  if (isLoading) return <div>Loading lead board...</div>;
  if (error) return <div>Error loading leads: {String(error)}</div>;

  const clients = data?.clients || [];

  const clientsByCategory = CATEGORIES.reduce((acc, category) => {
    acc[category] = clients.filter(client => client.category === category);
    return acc;
  }, {} as Record<ClientCategory, Client[]>);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newCategory = destination.droppableId as ClientCategory;

    try {
      await updateCategory.mutateAsync({
        clientId: draggableId,
        category: newCategory,
      });
    } catch (error) {
      console.error('Failed to update client category:', error);
    }
  };

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(selectedClientId === clientId ? null : clientId);
  };

  const handleLogInteraction = (contactId: string, contactName: string, type: InteractionType) => {
    setInteractionModal({
      isOpen: true,
      contactId,
      contactName,
      type,
    });
  };

  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;
  const contacts = contactsData?.contacts || [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lead Board</h2>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex flex-col">
              <h3 className="text-lg font-semibold p-4 bg-gray-100 rounded-t-lg">
                {category}
                <span className="ml-2 text-sm text-gray-600">
                  ({clientsByCategory[category].length})
                </span>
              </h3>
              
              <Droppable droppableId={category}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`drag-column ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                  >
                    {clientsByCategory[category].map((client, index) => (
                      <Draggable key={client.id} draggableId={client.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ClientCard
                              client={client}
                              onClick={() => handleClientClick(client.id)}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedClient && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">{selectedClient.clientName}</h3>
            <button
              onClick={() => setSelectedClientId(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Client Details</h4>
              <p><strong>Category:</strong> {selectedClient.category}</p>
              <p><strong>Owner:</strong> {selectedClient.owner}</p>
              {selectedClient.city && (
                <p><strong>Location:</strong> {[selectedClient.city, selectedClient.provinceState].filter(Boolean).join(', ')}</p>
              )}
              {selectedClient.website && (
                <p><strong>Website:</strong> <a href={selectedClient.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedClient.website}</a></p>
              )}
              <p><strong>Last Outreach:</strong> {selectedClient.lastOutreach || 'Never'}</p>
              <p><strong>Days Since:</strong> {selectedClient.daysSinceLastOutreach || 0}</p>
              <p><strong>Alert Level:</strong> {selectedClient.alertLevel}</p>
            </div>

            {selectedClient.clientNotes && (
              <div>
                <h4 className="font-semibold mb-2">Client Notes</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedClient.clientNotes}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Contacts</h4>
              {contacts.length === 0 ? (
                <p className="text-gray-500">No contacts found</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border p-3 rounded">
                      <div className="font-medium">{contact.fullName}</div>
                      {contact.title && <div className="text-sm text-gray-600">{contact.title}</div>}
                      {contact.email && <div className="text-sm">{contact.email}</div>}
                      {contact.phone && <div className="text-sm">{contact.phone}</div>}
                      
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleLogInteraction(contact.id, contact.fullName, 'Phone')}
                          className="btn btn-secondary text-xs"
                          disabled={contact.doNotContact}
                        >
                          Log Phone
                        </button>
                        <button
                          onClick={() => handleLogInteraction(contact.id, contact.fullName, 'Email')}
                          className="btn btn-secondary text-xs"
                          disabled={contact.doNotContact}
                        >
                          Log Email
                        </button>
                        <button
                          onClick={() => handleLogInteraction(contact.id, contact.fullName, 'Meeting')}
                          className="btn btn-secondary text-xs"
                          disabled={contact.doNotContact}
                        >
                          Log Meeting
                        </button>
                      </div>
                      
                      {contact.doNotContact && (
                        <div className="text-xs text-red-600 mt-1">Do Not Contact</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
import React, { useState } from 'react';
import { InteractionType } from '../api/types';
import { useCreateInteraction } from '../hooks/useInteractions';

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
  type: InteractionType;
}

export function InteractionModal({ 
  isOpen, 
  onClose, 
  contactId, 
  contactName, 
  type 
}: InteractionModalProps) {
  const [notes, setNotes] = useState('');
  const createInteraction = useCreateInteraction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createInteraction.mutateAsync({
        contactId,
        type,
        notes: notes.trim() || undefined,
      });
      
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Failed to create interaction:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Log {type} with {contactName}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Add any notes about this interaction..."
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={createInteraction.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createInteraction.isPending}
            >
              {createInteraction.isPending ? 'Logging...' : `Log ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
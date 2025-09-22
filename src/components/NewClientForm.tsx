import { useState } from 'react';
import { Client, ServiceStatus } from '../api/types';

interface NewClientFormProps {
  onSubmit: (client: Partial<Client>) => void;
  onCancel: () => void;
}

export function NewClientForm({ onSubmit, onCancel }: NewClientFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    city: '',
    provinceState: '',
    website: '',
    clientNotes: '',
    studiosageStatus: 'UnAsked' as ServiceStatus,
    recitalVideoStatus: 'UnAsked' as ServiceStatus,
    promoVideoStatus: 'UnAsked' as ServiceStatus
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientName.trim()) {
      onSubmit({
        ...formData,
        category: ['Dance'],
        owner: '',
        doNotContact: false,
        alertLevel: 'None'
      } as any);
      setFormData({
        clientName: '',
        city: '',
        provinceState: '',
        website: '',
        clientNotes: '',
        studiosageStatus: 'UnAsked',
        recitalVideoStatus: 'UnAsked',
        promoVideoStatus: 'UnAsked'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-purple-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Dance Studio
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Studio Name *
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter studio name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Province/State
            </label>
            <input
              type="text"
              value={formData.provinceState}
              onChange={(e) => setFormData(prev => ({ ...prev, provinceState: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Province or State"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.clientNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, clientNotes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Any notes about this studio..."
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Add Studio
          </button>
        </div>
      </form>
    </div>
  );
}

interface AddClientButtonProps {
  onClick: () => void;
}

export function AddClientButton({ onClick }: AddClientButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-dashed border-purple-300 rounded-lg p-8 hover:from-purple-200 hover:to-pink-200 hover:border-purple-400 transition-all duration-200 group"
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-800">
            Add New Dance Studio
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Click to add a new client to your CRM
          </p>
        </div>
      </div>
    </button>
  );
}
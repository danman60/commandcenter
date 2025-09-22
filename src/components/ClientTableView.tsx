import { Client, ServiceStatus } from '../api/types';
import { useState, useEffect } from 'react';

interface ClientTableViewProps {
  clients: Client[];
}

function getClientInitials(clientName: string): string {
  return clientName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}


function formatDate(dateString?: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

interface ServiceStatusDropdownProps {
  value: ServiceStatus | undefined;
  onChange: (status: ServiceStatus) => void;
  clientId: string;
  service: string;
}

function ServiceStatusDropdown({ value, onChange }: ServiceStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus = value || 'UnAsked';

  const statusColors = {
    'Signed up': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'UnAsked': 'bg-gray-100 text-gray-800'
  };

  const handleStatusChange = (newStatus: ServiceStatus) => {
    onChange(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus]} hover:opacity-80 transition-opacity`}
      >
        {currentStatus}
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
          {(['UnAsked', 'Signed up', 'Rejected'] as ServiceStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                status === currentStatus ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ClientTableView({ clients }: ClientTableViewProps) {
  const [updatedClients, setUpdatedClients] = useState<Client[]>(clients);

  // Update state when clients prop changes
  useEffect(() => {
    setUpdatedClients(clients);
  }, [clients]);

  const handleEmailClick = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Update last contact date to today
    const today = new Date().toISOString().split('T')[0];
    setUpdatedClients(prev => prev.map(client =>
      client.id === clientId
        ? { ...client, lastOutreach: today }
        : client
    ));
    console.log(`Email contact logged for client: ${clientId} on ${today}`);
  };

  const handleCallClick = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Update last contact date to today
    const today = new Date().toISOString().split('T')[0];
    setUpdatedClients(prev => prev.map(client =>
      client.id === clientId
        ? { ...client, lastOutreach: today }
        : client
    ));
    console.log(`Phone call logged for client: ${clientId} on ${today}`);
  };

  const handleServiceStatusChange = (clientId: string, service: keyof Pick<Client, 'studiosageStatus' | 'recitalVideoStatus' | 'promoVideoStatus'>, status: ServiceStatus) => {
    setUpdatedClients(prev => prev.map(client =>
      client.id === clientId
        ? { ...client, [service]: status }
        : client
    ));
    console.log(`${service} status updated to ${status} for client: ${clientId}`);
  };

  // Use updated clients data
  const displayClients = updatedClients.length > 0 ? updatedClients : clients;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Studiosage
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recital Video
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Promo Video
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayClients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {getClientInitials(client.clientName)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {client.clientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {[client.city, client.provinceState].filter(Boolean).join(', ') || 'Dance Studio'}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(client.lastOutreach) || 'Never'}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ServiceStatusDropdown
                    value={client.studiosageStatus}
                    onChange={(status) => handleServiceStatusChange(client.id, 'studiosageStatus', status)}
                    clientId={client.id}
                    service="Studiosage"
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ServiceStatusDropdown
                    value={client.recitalVideoStatus}
                    onChange={(status) => handleServiceStatusChange(client.id, 'recitalVideoStatus', status)}
                    clientId={client.id}
                    service="Recital Video"
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ServiceStatusDropdown
                    value={client.promoVideoStatus}
                    onChange={(status) => handleServiceStatusChange(client.id, 'promoVideoStatus', status)}
                    clientId={client.id}
                    service="Promo Video"
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={(e) => handleEmailClick(client.id, e)}
                      title="Log Email Contact"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      onClick={(e) => handleCallClick(client.id, e)}
                      title="Log Phone Call"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {displayClients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No dance clients found</div>
        </div>
      )}
    </div>
  );
}
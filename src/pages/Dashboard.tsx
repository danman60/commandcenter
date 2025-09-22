import { useClients } from '../hooks/useClients';
import { AlertLevel, Client } from '../api/types';
import { ClientTableView } from '../components/ClientTableView';
import { NewClientForm, AddClientButton } from '../components/NewClientForm';
import { useState } from 'react';

export function Dashboard() {
  const { data: allClientsData, isLoading, error } = useClients({});
  const { data: overdueClientsData } = useClients({ overdue: true });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClients, setNewClients] = useState<Client[]>([]);

  // Filter to only show dance clients and include new ones
  const danceClientsFromAPI = allClientsData?.clients.filter(client =>
    Array.isArray(client.category) ? client.category.includes('Dance') : client.category === 'Dance'
  ) || [];

  const allClients = {
    ...allClientsData,
    clients: [...newClients, ...danceClientsFromAPI]
  };

  const overdueDanceClientsFromAPI = overdueClientsData?.clients.filter(client =>
    Array.isArray(client.category) ? client.category.includes('Dance') : client.category === 'Dance'
  ) || [];

  const overdueClients = {
    ...overdueClientsData,
    clients: overdueDanceClientsFromAPI
  };

  const handleAddClient = (clientData: Partial<Client>) => {
    const newClient: Client = {
      id: `temp-${Date.now()}`,
      clientName: clientData.clientName || '',
      city: clientData.city,
      provinceState: clientData.provinceState,
      website: clientData.website,
      tags: [],
      owner: '',
      category: clientData.category || 'Dance',
      doNotContact: false,
      clientNotes: clientData.clientNotes,
      alertLevel: 'None',
      studiosageStatus: clientData.studiosageStatus || 'UnAsked',
      recitalVideoStatus: clientData.recitalVideoStatus || 'UnAsked',
      promoVideoStatus: clientData.promoVideoStatus || 'UnAsked'
    } as any;

    setNewClients(prev => [newClient, ...prev]);
    setShowAddForm(false);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-lg text-gray-600">Loading dashboard...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mx-auto max-w-2xl mt-8">
      <div className="flex items-center space-x-3">
        <div className="text-red-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800">System Temporarily Unavailable</h3>
          <p className="text-red-700 mt-1">
            We're experiencing technical difficulties connecting to the database.
            This is typically resolved within a few minutes.
          </p>
          <div className="mt-4 text-sm text-red-600">
            <p><strong>For administrators:</strong> Check backend deployment status and environment variables.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const clients = allClients?.clients || [];
  const overdue = overdueClients?.clients || [];

  const kpis = {
    total: clients.length,
    overdue3Days: overdue.filter(c => c.alertLevel === '3 days').length,
    overdue1Week: overdue.filter(c => c.alertLevel === '1 week').length,
    overdue3Weeks: overdue.filter(c => c.alertLevel === '3 weeks').length,
    overdue6Weeks: overdue.filter(c => c.alertLevel === '6 weeks').length,
  };

  const categoryStats = clients.reduce((acc, client) => {
    acc[client.category] = (acc[client.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alertStats = overdue.reduce((acc, client) => {
    acc[client.alertLevel] = (acc[client.alertLevel] || 0) + 1;
    return acc;
  }, {} as Record<AlertLevel, number>);

  const topOverdueClients = [...overdue]
    .sort((a, b) => {
      const severityA = a.severityRank || 0;
      const severityB = b.severityRank || 0;
      if (severityA !== severityB) return severityB - severityA;
      return (b.daysSinceLastOutreach || 0) - (a.daysSinceLastOutreach || 0);
    })
    .slice(0, 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dance Studio Dashboard</h2>
          <p className="text-gray-600">Manage your dance studio clients and services</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{kpis.total}</div>
              <div className="text-purple-100 text-sm">Total Dance Studios</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <span className="text-2xl">🩰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{kpis.overdue3Days}</div>
              <div className="text-orange-100 text-sm">3 Days Overdue</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{kpis.overdue1Week}</div>
              <div className="text-red-100 text-sm">1 Week Overdue</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{kpis.overdue3Weeks}</div>
              <div className="text-red-100 text-sm">3 Weeks Overdue</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{kpis.overdue6Weeks}</div>
              <div className="text-red-100 text-sm">6+ Weeks Overdue</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 00-2-2H9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Service Categories</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">{Array.isArray(category) ? category.join(', ') : category}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Overdue Follow-ups</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(alertStats).map(([level, count]) => (
              <div key={level} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700 font-medium">{level}</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Add Client Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Dance Studios</h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Studio
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Add Client Form or Button */}
            {showAddForm ? (
              <div className="lg:col-span-4">
                <NewClientForm
                  onSubmit={handleAddClient}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            ) : (
              <div className="lg:col-span-1">
                <AddClientButton onClick={() => setShowAddForm(true)} />
              </div>
            )}

            {!showAddForm && (
              <div className="lg:col-span-3">
                <ClientTableView clients={clients} />
              </div>
            )}
          </div>
        </div>

        {/* All Clients Section */}
        {!showAddForm && (
          <div>
            <h3 className="text-lg font-semibold mb-4">All Dance Studios ({clients.length})</h3>
            <ClientTableView clients={clients} />
          </div>
        )}

        {/* Priority Follow-ups */}
        {!showAddForm && topOverdueClients.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-600">Priority Follow-ups ({topOverdueClients.length})</h3>
            <ClientTableView clients={topOverdueClients.slice(0, 10)} />
          </div>
        )}
      </div>
    </div>
  );
}
import { useClients } from '../hooks/useClients';
import { AlertLevel } from '../api/types';
import { ClientTableView } from '../components/ClientTableView';

export function Dashboard() {
  const { data: allClients, isLoading, error } = useClients({});
  const { data: overdueClients } = useClients({ overdue: true });

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
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-number">{kpis.total}</div>
          <div className="kpi-label">Total Clients</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-number text-yellow-600">{kpis.overdue3Days}</div>
          <div className="kpi-label">Overdue 3 Days</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-number text-orange-600">{kpis.overdue1Week}</div>
          <div className="kpi-label">Overdue 1 Week</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-number text-red-600">{kpis.overdue3Weeks}</div>
          <div className="kpi-label">Overdue 3 Weeks</div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-number text-red-800">{kpis.overdue6Weeks}</div>
          <div className="kpi-label">Overdue 6 Weeks</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Clients by Category</h3>
          <div className="space-y-2">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span>{category}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Overdue by Alert Level</h3>
          <div className="space-y-2">
            {Object.entries(alertStats).map(([level, count]) => (
              <div key={level} className="flex justify-between items-center">
                <span>{level}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">All Clients</h3>
          <ClientTableView clients={clients} />
        </div>
        
        {topOverdueClients.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Priority Follow-ups</h3>
            <ClientTableView clients={topOverdueClients.slice(0, 10)} />
          </div>
        )}
      </div>
    </div>
  );
}
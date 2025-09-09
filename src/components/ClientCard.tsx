import { Client, AlertLevel } from '../api/types';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  isDragging?: boolean;
}

export function ClientCard({ client, onClick, isDragging }: ClientCardProps) {
  const getAlertClass = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case '3 days': return 'alert-3-days';
      case '1 week': return 'alert-1-week';
      case '3 weeks': return 'alert-3-weeks';
      case '6 weeks': return 'alert-6-weeks';
      default: return '';
    }
  };

  const getOwnerInitials = (owner: string) => {
    return owner.split(' ').map(n => n[0]).join('').toUpperCase();
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
    <div 
      className={`client-card ${getAlertClass(client.alertLevel)} ${isDragging ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900">{client.clientName}</h4>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {getOwnerInitials(client.owner)}
        </span>
      </div>
      
      {(client.city || client.provinceState) && (
        <p className="text-sm text-gray-600 mb-2">
          {[client.city, client.provinceState].filter(Boolean).join(', ')}
        </p>
      )}
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          Last: {formatLastOutreach(client.lastOutreach)}
        </span>
        
        {client.daysSinceLastOutreach && client.daysSinceLastOutreach > 0 && (
          <span className="font-medium">
            {client.daysSinceLastOutreach}d ago
          </span>
        )}
      </div>
      
      {client.alertLevel !== 'None' && (
        <div className="mt-2 text-xs font-medium">
          Alert: {client.alertLevel}
        </div>
      )}
    </div>
  );
}
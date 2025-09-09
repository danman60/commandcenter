import { ClientCategory, AlertLevel } from '../api/types';

interface FiltersProps {
  search: string;
  category: ClientCategory | '';
  owner: string;
  alertLevel: AlertLevel | '';
  overdue: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ClientCategory | '') => void;
  onOwnerChange: (value: string) => void;
  onAlertLevelChange: (value: AlertLevel | '') => void;
  onOverdueChange: (value: boolean) => void;
}

export function Filters({
  search,
  category,
  owner,
  alertLevel,
  overdue,
  onSearchChange,
  onCategoryChange,
  onOwnerChange,
  onAlertLevelChange,
  onOverdueChange,
}: FiltersProps) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="filter-input"
      />
      
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as ClientCategory | '')}
        className="filter-input"
      >
        <option value="">All Categories</option>
        <option value="Previous Client">Previous Client</option>
        <option value="Warm Lead">Warm Lead</option>
        <option value="Cold Lead">Cold Lead</option>
      </select>
      
      <input
        type="text"
        placeholder="Filter by owner..."
        value={owner}
        onChange={(e) => onOwnerChange(e.target.value)}
        className="filter-input"
      />
      
      <select
        value={alertLevel}
        onChange={(e) => onAlertLevelChange(e.target.value as AlertLevel | '')}
        className="filter-input"
      >
        <option value="">All Alert Levels</option>
        <option value="3 days">3 days</option>
        <option value="1 week">1 week</option>
        <option value="3 weeks">3 weeks</option>
        <option value="6 weeks">6 weeks</option>
      </select>
      
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={overdue}
          onChange={(e) => onOverdueChange(e.target.checked)}
        />
        Show overdue only
      </label>
    </div>
  );
}
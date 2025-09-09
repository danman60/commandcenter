import { 
  ClientsResponse, 
  UpdateClientCategoryRequest,
  ClientCategory 
} from './types';

const API_BASE = '/api';

export async function fetchClients(params: {
  overdue?: boolean;
  category?: ClientCategory;
  owner?: string;
  search?: string;
}): Promise<ClientsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.overdue !== undefined) {
    searchParams.append('overdue', params.overdue.toString());
  }
  if (params.category) {
    searchParams.append('category', params.category);
  }
  if (params.owner) {
    searchParams.append('owner', params.owner);
  }
  if (params.search) {
    searchParams.append('search', params.search);
  }

  const response = await fetch(`${API_BASE}/clients?${searchParams}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${response.statusText}`);
  }

  return response.json();
}

export async function updateClientCategory(
  clientId: string, 
  request: UpdateClientCategoryRequest
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/clientUpdateCategory/${clientId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to update client category: ${response.statusText}`);
  }

  return response.json();
}
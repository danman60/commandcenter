import { ContactsResponse } from './types';

const API_BASE = '/api';

export async function fetchContacts(params: {
  clientId?: string;
  owner?: string;
  search?: string;
}): Promise<ContactsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.clientId) {
    searchParams.append('clientId', params.clientId);
  }
  if (params.owner) {
    searchParams.append('owner', params.owner);
  }
  if (params.search) {
    searchParams.append('search', params.search);
  }

  const response = await fetch(`${API_BASE}/contacts?${searchParams}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch contacts: ${response.statusText}`);
  }

  return response.json();
}
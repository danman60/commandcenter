import { AirtableRecord } from './types';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

if (!AIRTABLE_BASE_ID || !AIRTABLE_PAT) {
  throw new Error('Missing required Airtable environment variables');
}

async function makeRequest<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  
  const response = await fetch(url, {
    ...init,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}

export async function listTable<T>(
  table: string,
  params: {
    fields?: string[];
    filterByFormula?: string;
    sort?: { field: string; direction: 'asc' | 'desc' }[];
    maxRecords?: number;
    pageSize?: number;
  } = {}
): Promise<{ records: AirtableRecord[]; offset?: string }> {
  const searchParams = new URLSearchParams();
  
  if (params.fields) {
    params.fields.forEach(field => searchParams.append('fields[]', field));
  }
  
  if (params.filterByFormula) {
    searchParams.append('filterByFormula', params.filterByFormula);
  }
  
  if (params.sort) {
    params.sort.forEach((sortItem, index) => {
      searchParams.append(`sort[${index}][field]`, sortItem.field);
      searchParams.append(`sort[${index}][direction]`, sortItem.direction);
    });
  }
  
  if (params.maxRecords) {
    searchParams.append('maxRecords', params.maxRecords.toString());
  }
  
  if (params.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }

  const query = searchParams.toString();
  const path = `/${table}${query ? '?' + query : ''}`;
  
  return makeRequest(path);
}

export async function createRecord<T>(
  table: string,
  fields: Record<string, any>
): Promise<AirtableRecord> {
  const path = `/${table}`;
  
  return makeRequest(path, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
}

export async function updateRecord<T>(
  table: string,
  id: string,
  fields: Record<string, any>
): Promise<AirtableRecord> {
  const path = `/${table}/${id}`;
  
  return makeRequest(path, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  });
}

export async function getRecord(
  table: string,
  id: string
): Promise<AirtableRecord> {
  const path = `/${table}/${id}`;
  return makeRequest(path);
}

export function mapClientRecord(record: AirtableRecord) {
  return {
    id: record.id,
    clientName: record.fields['Client Name'] || '',
    city: record.fields.City,
    provinceState: record.fields['Province/State'],
    website: record.fields.Website,
    tags: record.fields.Tags || [],
    owner: record.fields.Owner?.name || record.fields.Owner || '',
    category: record.fields.Category || 'Cold Lead',
    doNotContact: record.fields['Do Not Contact'] || false,
    clientNotes: record.fields['Client Notes'],
    lastOutreach: record.fields['Last Outreach'],
    daysSinceLastOutreach: record.fields['Days Since Last Outreach'],
    alertLevel: record.fields['Alert Level'] || 'None',
    nextTouchDate: record.fields['Next Touch Date'],
  };
}

export function mapContactRecord(record: AirtableRecord) {
  return {
    id: record.id,
    fullName: record.fields['Full Name'] || '',
    title: record.fields.Title,
    email: record.fields.Email,
    phone: record.fields.Phone,
    linkedClient: record.fields['Linked Client'],
    inheritedCategory: record.fields['Inherited Category'],
    owner: record.fields.Owner?.name || record.fields.Owner,
    doNotContact: record.fields['Do Not Contact'] || false,
    quickNotes: record.fields['Quick Notes'],
    lastOutreach: record.fields['Last Outreach'],
    daysSinceLastOutreach: record.fields['Days Since Last Outreach'],
  };
}

export function mapInteractionRecord(record: AirtableRecord) {
  return {
    id: record.id,
    contact: record.fields.Contact,
    client: record.fields.Client,
    type: record.fields.Type,
    notes: record.fields.Notes,
    timestamp: record.fields.Timestamp || record.createdTime,
    createdBy: record.fields['Created By']?.name || record.fields['Created By'] || '',
  };
}
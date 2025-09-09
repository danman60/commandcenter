import { Handler } from '@netlify/functions';
import { listTable, mapContactRecord } from './_lib/airtable.js';
import { Contact } from './_lib/types.js';

export const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
        body: '',
      };
    }

    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const params = new URLSearchParams(event.queryStringParameters || {});
    const clientId = params.get('clientId');
    const owner = params.get('owner');
    const search = params.get('search');

    let filterFormula = '';
    const filters: string[] = [];

    // Filter out "Do Not Contact" records
    filters.push(`{Do Not Contact} != 1`);

    if (clientId) {
      filters.push(`FIND("${clientId}", ARRAYJOIN({Linked Client}, ",")) > 0`);
    }

    if (owner) {
      filters.push(`FIND("${owner}", {Owner}) > 0`);
    }

    if (search) {
      filters.push(`OR(
        FIND(UPPER("${search}"), UPPER({Full Name})) > 0,
        FIND(UPPER("${search}"), UPPER({Title})) > 0,
        FIND(UPPER("${search}"), UPPER({Email})) > 0
      )`);
    }

    if (filters.length > 0) {
      filterFormula = filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`;
    }

    const result = await listTable('Contacts', {
      filterByFormula: filterFormula || undefined,
      sort: [{ field: 'Full Name', direction: 'asc' }],
      maxRecords: 200,
    });

    const contacts: Contact[] = result.records.map(mapContactRecord);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contacts,
        total: result.records.length,
        offset: result.offset,
      }),
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
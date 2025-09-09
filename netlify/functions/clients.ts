import { Handler } from '@netlify/functions';
import { listTable, mapClientRecord } from './_lib/airtable';
import { Client } from './_lib/types';

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
    const overdue = params.get('overdue');
    const category = params.get('category');
    const owner = params.get('owner');
    const search = params.get('search');

    let filterFormula = '';
    const filters: string[] = [];

    // Filter out "Do Not Contact" records - if field exists
    // filters.push(`NOT({Do Not Contact})`);

    if (overdue === 'true') {
      filters.push(`{Days Since Last Outreach} >= 3`);
    }

    if (category) {
      filters.push(`{Category} = "${category}"`);
    }

    if (owner) {
      filters.push(`FIND("${owner}", {Owner}) > 0`);
    }

    if (search) {
      filters.push(`OR(
        FIND(UPPER("${search}"), UPPER({Client Name})) > 0,
        FIND(UPPER("${search}"), UPPER({City})) > 0,
        FIND(UPPER("${search}"), UPPER({Province/State})) > 0
      )`);
    }

    if (filters.length > 0) {
      filterFormula = filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`;
    }

    const sort = overdue === 'true' 
      ? [
          { field: 'Alert Level', direction: 'desc' as const },
          { field: 'Days Since Last Outreach', direction: 'desc' as const }
        ]
      : [
          { field: 'Client Name', direction: 'asc' as const }
        ];

    const result = await listTable('Clients', {
      filterByFormula: filterFormula || undefined,
      sort,
      maxRecords: 100,
    });

    const clients: Client[] = result.records.map(mapClientRecord);

    // Add severity ranking for overdue clients
    const clientsWithSeverity = clients.map(client => ({
      ...client,
      severityRank: getSeverityRank(client.alertLevel, client.daysSinceLastOutreach || 0)
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clients: clientsWithSeverity,
        total: result.records.length,
        offset: result.offset,
      }),
    };
  } catch (error) {
    console.error('Error fetching clients:', error);
    
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

function getSeverityRank(alertLevel: string, daysSince: number): number {
  switch (alertLevel) {
    case '6 weeks': return 4;
    case '3 weeks': return 3;
    case '1 week': return 2;
    case '3 days': return 1;
    default: return 0;
  }
}
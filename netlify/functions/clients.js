const fetch = require('node-fetch');

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

function mapClientRecord(record) {
  // Map fields that actually exist in the Airtable base
  return {
    id: record.id,
    clientName: record.fields['Client Name'] || '',
    city: record.fields.City,
    provinceState: record.fields['Province/State'],
    website: record.fields.Website,
    tags: record.fields.Tags || [],
    owner: record.fields.Owner?.name || record.fields.Owner || '',
    category: Array.isArray(record.fields.Category) 
      ? record.fields.Category[0] || 'Cold Lead' 
      : record.fields.Category || 'Cold Lead',
    doNotContact: false, // Skip this field for now
    clientNotes: record.fields['Client Notes'],
    lastOutreach: record.fields['Last Outreach'],
    daysSinceLastOutreach: 0, // Default value - field may not exist
    alertLevel: 'None', // Default value - field may not exist
    nextTouchDate: record.fields['Next Touch Date'],
  };
}

function getSeverityRank(alertLevel, daysSince) {
  switch (alertLevel) {
    case '6 weeks': return 4;
    case '3 weeks': return 3;
    case '1 week': return 2;
    case '3 days': return 1;
    default: return 0;
  }
}

exports.handler = async (event, context) => {
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

    if (!AIRTABLE_BASE_ID || !AIRTABLE_PAT) {
      throw new Error('Missing Airtable environment variables');
    }

    const params = new URLSearchParams(event.queryStringParameters || {});
    const overdue = params.get('overdue');
    const category = params.get('category');
    const owner = params.get('owner');
    const search = params.get('search');

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    let filterFormula = '';
    const filters = [];

    // Skip overdue filtering for now - field might not exist
    // if (overdue === 'true') {
    //   filters.push(`{Days Since Last Outreach} >= 3`);
    // }

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
      queryParams.append('filterByFormula', filterFormula);
    }

    // Add sorting - using basic fields that exist
    queryParams.append('sort[0][field]', 'Client Name');
    queryParams.append('sort[0][direction]', 'asc');

    queryParams.append('maxRecords', '100');

    const url = `${BASE_URL}/Clients?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const result = await response.json();
    const clients = result.records.map(mapClientRecord);

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
    console.error('Error fetching clients:', error.message || error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message || 'Unknown error',
      }),
    };
  }
};
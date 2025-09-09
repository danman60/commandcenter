const fetch = require('node-fetch');

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

function mapContactRecord(record) {
  // Use the actual primary field name from the Contacts table
  const primaryFieldValue = Object.values(record.fields)[0] || '';
  
  return {
    id: record.id,
    fullName: primaryFieldValue,
    title: record.fields.Title,
    email: record.fields.Email,
    phone: record.fields.Phone,
    linkedClient: record.fields['Linked Client'],
    inheritedCategory: record.fields['Inherited Category'],
    owner: record.fields.Owner?.name || record.fields.Owner,
    doNotContact: false, // Skip this field for now
    quickNotes: record.fields['Quick Notes'],
    lastOutreach: record.fields['Last Outreach'],
    daysSinceLastOutreach: 0, // Default value
  };
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
    const clientId = params.get('clientId');
    const owner = params.get('owner');
    const search = params.get('search');

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    let filterFormula = '';
    const filters = [];

    if (clientId) {
      filters.push(`FIND("${clientId}", ARRAYJOIN({Linked Client}, ",")) > 0`);
    }

    if (owner) {
      filters.push(`FIND("${owner}", {Owner}) > 0`);
    }

    // Skip search filtering for now - field names need to be verified
    // if (search) {
    //   filters.push(`OR(
    //     FIND(UPPER("${search}"), UPPER({Full Name})) > 0,
    //     FIND(UPPER("${search}"), UPPER({Title})) > 0,
    //     FIND(UPPER("${search}"), UPPER({Email})) > 0
    //   )`);
    // }

    if (filters.length > 0) {
      filterFormula = filters.length === 1 ? filters[0] : `AND(${filters.join(', ')})`;
      queryParams.append('filterByFormula', filterFormula);
    }

    // Skip sorting by specific field for now
    // queryParams.append('sort[0][field]', 'Full Name');
    // queryParams.append('sort[0][direction]', 'asc');
    queryParams.append('maxRecords', '200');

    const url = `${BASE_URL}/Contacts?${queryParams.toString()}`;
    
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
    const contacts = result.records.map(mapContactRecord);

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
        error: error.message || 'Unknown error',
      }),
    };
  }
};
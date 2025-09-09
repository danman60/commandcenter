const fetch = require('node-fetch');

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

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

    // Test Airtable connection by fetching one record from Clients table
    const response = await fetch(`${BASE_URL}/Clients?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        airtableConnection: 'connected',
        recordCount: result.records ? result.records.length : 0,
      }),
    };
  } catch (error) {
    console.error('Health check failed:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
      }),
    };
  }
};
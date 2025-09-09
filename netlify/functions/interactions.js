const fetch = require('node-fetch');

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

function validateInteractionRequest(body) {
  try {
    const data = JSON.parse(body);
    
    if (!data.contactId || typeof data.contactId !== 'string') {
      return { isValid: false, error: 'contactId is required and must be a string' };
    }
    
    if (!data.type || !['Phone', 'Email', 'Meeting', 'Other'].includes(data.type)) {
      return { isValid: false, error: 'type must be one of: Phone, Email, Meeting, Other' };
    }
    
    return { isValid: true, data };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON body' };
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
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: '',
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    if (!AIRTABLE_BASE_ID || !AIRTABLE_PAT) {
      throw new Error('Missing Airtable environment variables');
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const validation = validateInteractionRequest(event.body);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: validation.error }),
      };
    }

    const { contactId, type, notes } = validation.data;

    // Get the contact to resolve the linked client
    const contactResponse = await fetch(`${BASE_URL}/Contacts/${contactId}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });

    if (!contactResponse.ok) {
      throw new Error(`Failed to fetch contact: ${contactResponse.status} ${contactResponse.statusText}`);
    }

    const contactRecord = await contactResponse.json();
    const linkedClientIds = contactRecord.fields['Linked Client'];

    if (!linkedClientIds || !Array.isArray(linkedClientIds) || linkedClientIds.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Contact must be linked to a client',
        }),
      };
    }

    // Create the interaction record
    const interactionFields = {
      Contact: [contactId],
      Client: linkedClientIds,
      Type: type,
    };

    if (notes) {
      interactionFields.Notes = notes;
    }

    const createResponse = await fetch(`${BASE_URL}/Interactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: interactionFields }),
    });

    if (!createResponse.ok) {
      const errorBody = await createResponse.text();
      throw new Error(`Failed to create interaction: ${createResponse.status} ${createResponse.statusText} - ${errorBody}`);
    }

    const createdRecord = await createResponse.json();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        interactionId: createdRecord.id,
        contactId,
        clientIds: linkedClientIds,
        type,
        notes: notes || null,
        timestamp: createdRecord.createdTime,
        summary: `Created ${type.toLowerCase()} interaction for contact ${contactRecord.fields['Full Name'] || contactId}`,
      }),
    };
  } catch (error) {
    console.error('Error creating interaction:', error);
    
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
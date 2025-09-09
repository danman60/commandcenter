import { Handler } from '@netlify/functions';
import { createRecord, getRecord } from './_lib/airtable';
import { CreateInteractionSchema } from './_lib/types';

export const handler: Handler = async (event, context) => {
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

    const requestData = JSON.parse(event.body);
    const validation = CreateInteractionSchema.safeParse(requestData);

    if (!validation.success) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Invalid request data',
          details: validation.error.errors,
        }),
      };
    }

    const { contactId, type, notes } = validation.data;

    // Get the contact to resolve the linked client
    const contactRecord = await getRecord('Contacts', contactId);
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
    const interactionFields: Record<string, any> = {
      Contact: [contactId],
      Client: linkedClientIds,
      Type: type,
    };

    if (notes) {
      interactionFields.Notes = notes;
    }

    const createdRecord = await createRecord('Interactions', interactionFields);

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
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
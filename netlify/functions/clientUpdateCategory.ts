import { Handler } from '@netlify/functions';
import { updateRecord } from './_lib/airtable';
import { UpdateClientCategorySchema } from './_lib/types';

export const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
        },
        body: '',
      };
    }

    if (event.httpMethod !== 'PATCH') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const clientId = event.path.split('/').pop();
    if (!clientId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Client ID is required' }),
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
    const validation = UpdateClientCategorySchema.safeParse(requestData);

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

    const { category } = validation.data;

    const updatedRecord = await updateRecord('Clients', clientId, {
      Category: category,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        clientId,
        category,
        updatedAt: updatedRecord.createdTime,
      }),
    };
  } catch (error) {
    console.error('Error updating client category:', error);
    
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
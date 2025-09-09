exports.handler = async (event, context) => {
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

  // Mock client data for testing
  const mockClients = [
    {
      id: 'client1',
      clientName: 'Test Dance Studio',
      city: 'Toronto',
      provinceState: 'ON',
      owner: 'John Doe',
      category: 'Warm Lead',
      doNotContact: false,
      alertLevel: '3 days',
      daysSinceLastOutreach: 5,
      severityRank: 1
    },
    {
      id: 'client2', 
      clientName: 'Elite Dance Academy',
      city: 'Vancouver',
      provinceState: 'BC',
      owner: 'Jane Smith',
      category: 'Previous Client',
      doNotContact: false,
      alertLevel: '1 week',
      daysSinceLastOutreach: 10,
      severityRank: 2
    }
  ];

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clients: mockClients,
      total: mockClients.length,
      message: 'Mock data - replace with real Airtable integration'
    }),
  };
};
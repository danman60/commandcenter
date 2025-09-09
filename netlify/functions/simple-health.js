exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Simple health check working',
    }),
  };
};
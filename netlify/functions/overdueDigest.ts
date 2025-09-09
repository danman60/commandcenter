import { Handler } from '@netlify/functions';
import { listTable, mapClientRecord } from './_lib/airtable.js';
import { Client } from './_lib/types.js';

export const handler: Handler = async (event, context) => {
  try {
    console.log('Running daily overdue digest at:', new Date().toISOString());

    // Get all overdue clients (3+ days since last outreach) that are not "Do Not Contact"
    const result = await listTable('Clients', {
      filterByFormula: 'AND({Do Not Contact} != 1, {Days Since Last Outreach} >= 3)',
      sort: [
        { field: 'Alert Level', direction: 'desc' },
        { field: 'Days Since Last Outreach', direction: 'desc' }
      ],
      maxRecords: 500,
    });

    const overdueClients: Client[] = result.records.map(mapClientRecord);

    // Group clients by alert level and owner
    const summary: Record<string, Record<string, Client[]>> = {};

    overdueClients.forEach(client => {
      const alertLevel = client.alertLevel;
      const owner = client.owner || 'Unassigned';

      if (!summary[alertLevel]) {
        summary[alertLevel] = {};
      }
      
      if (!summary[alertLevel][owner]) {
        summary[alertLevel][owner] = [];
      }

      summary[alertLevel][owner].push(client);
    });

    // Log the summary
    console.log('=== DAILY OVERDUE DIGEST ===');
    console.log(`Total overdue clients: ${overdueClients.length}`);
    console.log('');

    Object.keys(summary)
      .sort((a, b) => getSeverityOrder(b) - getSeverityOrder(a))
      .forEach(alertLevel => {
        console.log(`${alertLevel.toUpperCase()}:`);
        
        Object.keys(summary[alertLevel])
          .sort()
          .forEach(owner => {
            const clients = summary[alertLevel][owner];
            console.log(`  ${owner}: ${clients.length} clients`);
            
            clients.slice(0, 5).forEach(client => {
              console.log(`    - ${client.clientName} (${client.daysSinceLastOutreach}d ago)`);
            });
            
            if (clients.length > 5) {
              console.log(`    ... and ${clients.length - 5} more`);
            }
          });
        
        console.log('');
      });

    // Prepare summary statistics
    const stats = {
      totalOverdue: overdueClients.length,
      byAlertLevel: Object.keys(summary).reduce((acc, level) => {
        acc[level] = Object.values(summary[level]).flat().length;
        return acc;
      }, {} as Record<string, number>),
      byOwner: Object.values(summary).flat().reduce((acc, ownerClients) => {
        Object.keys(ownerClients).forEach(owner => {
          acc[owner] = (acc[owner] || 0) + ownerClients[owner].length;
        });
        return acc;
      }, {} as Record<string, number>),
    };

    console.log('Summary statistics:', JSON.stringify(stats, null, 2));
    console.log('=== END DIGEST ===');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        summary: stats,
        message: `Processed ${overdueClients.length} overdue clients`,
      }),
    };
  } catch (error) {
    console.error('Error in overdue digest:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

function getSeverityOrder(alertLevel: string): number {
  switch (alertLevel) {
    case '6 weeks': return 4;
    case '3 weeks': return 3;
    case '1 week': return 2;
    case '3 days': return 1;
    default: return 0;
  }
}
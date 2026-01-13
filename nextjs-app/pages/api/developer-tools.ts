import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock developer tools data
    const developerData = {
      apiEndpoints: [
        {
          method: 'GET',
          path: '/landfill-report',
          description: 'Get main landfill report',
          status: 'active',
          responseTime: '45ms',
          lastCalled: new Date().toISOString(),
          requests: 1247,
          errors: 3
        },
        {
          method: 'POST',
          path: '/landfill-report/row',
          description: 'Add new row to report',
          status: 'active',
          responseTime: '120ms',
          lastCalled: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          requests: 89,
          errors: 1
        },
        {
          method: 'PUT',
          path: '/landfill-report',
          description: 'Update entire report',
          status: 'active',
          responseTime: '89ms',
          lastCalled: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          requests: 234,
          errors: 0
        },
        {
          method: 'GET',
          path: '/all-reports',
          description: 'Get all reports summary',
          status: 'active',
          responseTime: '67ms',
          lastCalled: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          requests: 456,
          errors: 2
        },
        {
          method: 'POST',
          path: '/landfill-reports/{id}/attachments',
          description: 'Upload attachments',
          status: 'active',
          responseTime: '234ms',
          lastCalled: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          requests: 23,
          errors: 1
        }
      ],
      performanceMetrics: {
        totalRequests: 2049,
        averageResponseTime: '89ms',
        errorRate: '0.3%',
        uptime: '99.9%',
        memoryUsage: '45%',
        cpuUsage: '23%',
        activeConnections: 12,
        dataSize: '2.3MB',
        peakMemory: '67%',
        slowestEndpoint: '/landfill-reports/{id}/attachments'
      },
      debugInfo: {
        version: '1.0.0',
        environment: 'production',
        lastDeploy: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        buildTime: '2m 34s',
        dependencies: 23,
        vulnerabilities: 0,
        testCoverage: '87%',
        lastError: null,
        gitCommit: 'a2547a1',
        branch: 'main'
      },
      logs: [
        {
          level: 'INFO',
          message: 'Server started successfully',
          timestamp: new Date().toISOString(),
          source: 'app'
        },
        {
          level: 'INFO',
          message: 'Database connection established',
          timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          source: 'database'
        },
        {
          level: 'WARN',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          source: 'monitoring'
        },
        {
          level: 'ERROR',
          message: 'Failed to process attachment upload',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          source: 'upload'
        },
        {
          level: 'INFO',
          message: 'View state saved successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          source: 'state'
        }
      ],
      systemHealth: {
        database: 'healthy',
        storage: 'healthy',
        network: 'healthy',
        cache: 'degraded',
        queue: 'healthy'
      }
    };

    res.status(200).json(developerData);
  } catch (error) {
    console.error('Error fetching developer tools data:', error);
    res.status(500).json({ error: 'Failed to fetch developer tools data' });
  }
}

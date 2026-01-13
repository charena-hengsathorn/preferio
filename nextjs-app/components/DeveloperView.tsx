import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore,
  Code,
  BugReport,
  Speed,
  Storage,
  NetworkCheck,
  Security,
  Timeline,
  Visibility,
  Refresh,
  Download,
  Upload,
  Delete,
  Add,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';

interface DeveloperViewProps {
  data: any;
  loading: boolean;
  dataSource: any;
}

const DeveloperView: React.FC<DeveloperViewProps> = ({ data, loading, dataSource }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [apiEndpoints, setApiEndpoints] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [devDataLoading, setDevDataLoading] = useState(false);

  // Fetch developer tools data
  useEffect(() => {
    const fetchDeveloperData = async () => {
      setDevDataLoading(true);
      try {
        const response = await fetch('/api/developer-tools');
        if (response.ok) {
          const devData = await response.json();
          setApiEndpoints(devData.apiEndpoints || []);
          setPerformanceMetrics(devData.performanceMetrics || {});
          setDebugInfo(devData.debugInfo || {});
          setSystemHealth(devData.systemHealth || {});
          setLogs(devData.logs || []);
        }
      } catch (error) {
        console.error('Error fetching developer data:', error);
      } finally {
        setDevDataLoading(false);
      }
    };

    fetchDeveloperData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;
    
    setQueryLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQueryResult({
        success: true,
        data: { message: 'Query executed successfully', result: customQuery },
        executionTime: '1.2s'
      });
    } catch (error) {
      setQueryResult({
        success: false,
        error: 'Query execution failed',
        executionTime: '0.8s'
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'error';
      case 'WARN': return 'warning';
      case 'INFO': return 'info';
      default: return 'default';
    }
  };

  if (devDataLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Loading developer tools...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Code color="primary" />
        Developer View
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="🔧 API Endpoints" />
        <Tab label="📊 Performance" />
        <Tab label="🐛 Debug Info" />
        <Tab label="🔍 Query Tool" />
        <Tab label="📝 Logs" />
      </Tabs>

      {/* API Endpoints Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            API Endpoints Status
          </Typography>
          <Grid container spacing={2}>
            {apiEndpoints.map((endpoint, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {endpoint.method} {endpoint.path}
                      </Typography>
                      <Chip 
                        label={endpoint.status} 
                        color={getStatusColor(endpoint.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {endpoint.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Chip 
                        icon={<Speed />} 
                        label={`${endpoint.responseTime} avg`} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`Last: ${new Date(endpoint.lastCalled).toLocaleTimeString()}`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Visibility />}>
                      Test
                    </Button>
                    <Button size="small" startIcon={<Edit />}>
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Performance Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Performance Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  📈 Request Statistics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {performanceMetrics.totalRequests.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Response Time
                  </Typography>
                  <Typography variant="h5">
                    {performanceMetrics.averageResponseTime}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Error Rate
                  </Typography>
                  <Typography variant="h5" color={performanceMetrics.errorRate === '0.8%' ? 'success.main' : 'error.main'}>
                    {performanceMetrics.errorRate}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🖥️ System Resources
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Memory Usage
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseInt(performanceMetrics.memoryUsage)} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {performanceMetrics.memoryUsage}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    CPU Usage
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseInt(performanceMetrics.cpuUsage)} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {performanceMetrics.cpuUsage}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<NetworkCheck />} 
                    label={`${performanceMetrics.activeConnections} active`} 
                    size="small"
                  />
                  <Chip 
                    icon={<Storage />} 
                    label={performanceMetrics.dataSize} 
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🏥 System Health
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(systemHealth).map(([service, status]) => (
                    <Box key={service} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {service}
                      </Typography>
                      <Chip 
                        label={status as string} 
                        color={status === 'healthy' ? 'success' : status === 'degraded' ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Slowest Endpoint
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {performanceMetrics.slowestEndpoint}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Debug Info Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Debug Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🏷️ Application Info
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Version" 
                      secondary={debugInfo.version}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Environment" 
                      secondary={debugInfo.environment}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Last Deploy" 
                      secondary={new Date(debugInfo.lastDeploy).toLocaleString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Build Time" 
                      secondary={debugInfo.buildTime}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  📦 Dependencies
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Total Dependencies" 
                      secondary={debugInfo.dependencies}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Vulnerabilities" 
                      secondary={
                        <Chip 
                          label={debugInfo.vulnerabilities} 
                          color={debugInfo.vulnerabilities === 0 ? 'success' : 'error'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Test Coverage" 
                      secondary={debugInfo.testCoverage}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Last Error" 
                      secondary={debugInfo.lastError || 'None'}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Query Tool Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            🔍 Custom Query Tool
          </Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Custom Query"
              placeholder="Enter your custom query here..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={executeCustomQuery}
                disabled={!customQuery.trim() || queryLoading}
                startIcon={queryLoading ? <Refresh /> : <Code />}
              >
                {queryLoading ? 'Executing...' : 'Execute Query'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setCustomQuery('')}
                startIcon={<Clear />}
              >
                Clear
              </Button>
            </Box>
          </Paper>
          
          {queryResult && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Query Result
              </Typography>
              <Alert 
                severity={queryResult.success ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                {queryResult.success ? 'Query executed successfully' : 'Query execution failed'}
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={JSON.stringify(queryResult, null, 2)}
                InputProps={{ readOnly: true }}
                sx={{ fontFamily: 'monospace' }}
              />
            </Paper>
          )}
        </Box>
      )}

      {/* Logs Tab */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            📝 Application Logs
          </Typography>
          <Paper sx={{ p: 2 }}>
            <List>
              {logs.map((log: any, index: number) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Chip 
                        label={log.level} 
                        color={getLogLevelColor(log.level) as any}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={log.message}
                      secondary={`${new Date(log.timestamp).toLocaleString()} - ${log.source}`}
                    />
                  </ListItem>
                  {index < logs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default DeveloperView;

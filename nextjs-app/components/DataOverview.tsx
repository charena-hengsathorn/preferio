import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  DataObject,
  Storage,
  Speed,
  Security,
  Info,
  Warning,
  Error,
  CheckCircle
} from '@mui/icons-material';

interface DataOverviewProps {
  data: any;
  loading: boolean;
  dataSource: any;
}

const DataOverview: React.FC<DataOverviewProps> = ({
  data,
  loading,
  dataSource
}) => {
  const dataStats = useMemo(() => {
    if (!data) return null;

    const analyzeObject = (obj: any, path = ''): any => {
      let stats = {
        totalKeys: 0,
        totalValues: 0,
        nestedObjects: 0,
        arrays: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0,
        maxDepth: 0,
        size: 0
      };

      const traverse = (current: any, currentPath: string, depth: number = 0): void => {
        stats.maxDepth = Math.max(stats.maxDepth, depth);
        
        if (Array.isArray(current)) {
          stats.arrays++;
          stats.totalKeys++;
          current.forEach((item, index) => {
            traverse(item, `${currentPath}[${index}]`, depth + 1);
          });
        } else if (current !== null && typeof current === 'object') {
          stats.nestedObjects++;
          stats.totalKeys++;
          Object.entries(current).forEach(([key, value]) => {
            traverse(value, `${currentPath}.${key}`, depth + 1);
          });
        } else {
          stats.totalValues++;
          if (typeof current === 'string') stats.strings++;
          else if (typeof current === 'number') stats.numbers++;
          else if (typeof current === 'boolean') stats.booleans++;
          else if (current === null) stats.nulls++;
        }
      };

      traverse(obj, path);
      stats.size = JSON.stringify(obj).length;
      
      return stats;
    };

    return analyzeObject(data);
  }, [data]);

  const dataHealth = useMemo(() => {
    if (!dataStats) return null;

    const issues: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    // Check for potential issues
    if (dataStats.nulls > 0) {
      warnings.push(`${dataStats.nulls} null values found`);
    }

    if (dataStats.emptyStrings > 0) {
      warnings.push(`${dataStats.emptyStrings} empty strings found`);
    }

    if (dataStats.maxDepth > 5) {
      warnings.push(`Deep nesting detected (${dataStats.maxDepth} levels)`);
    }

    if (dataStats.size > 1000000) {
      warnings.push('Large data size detected (>1MB)');
    }

    if (dataStats.arrays.length === 0) {
      info.push('No arrays found in data structure');
    }

    if (dataStats.nestedObjects === 0) {
      info.push('Flat data structure (no nested objects)');
    }

    return {
      issues,
      warnings,
      info,
      healthScore: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10))
    };
  }, [dataStats]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading data overview...
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="warning">
        No data available. Please select a data source or check your connection.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Data Source Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          📊 Data Source Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Source Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Storage />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Name" 
                      secondary={dataSource.name} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DataObject />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Type" 
                      secondary={dataSource.type === 'api' ? 'API Endpoint' : 'File'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Info />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Description" 
                      secondary={dataSource.description} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Health
                </Typography>
                {dataHealth && (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3" color={`${getHealthColor(dataHealth.healthScore)}.main`}>
                      {dataHealth.healthScore}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Health Score
                    </Typography>
                  </Box>
                )}
                {dataHealth?.warnings.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    {dataHealth.warnings[0]}
                    {dataHealth.warnings.length > 1 && ` (+${dataHealth.warnings.length - 1} more)`}
                  </Alert>
                )}
                {dataHealth?.issues.length > 0 && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {dataHealth.issues[0]}
                    {dataHealth.issues.length > 1 && ` (+${dataHealth.issues.length - 1} more)`}
                  </Alert>
                )}
                {dataHealth?.issues.length === 0 && dataHealth?.warnings.length === 0 && (
                  <Alert severity="success">
                    Data structure looks healthy!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Statistics */}
      {dataStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary.main">
                  {dataStats.totalKeys}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Keys
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="secondary.main">
                  {dataStats.totalValues}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Values
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {dataStats.maxDepth}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max Depth
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {(dataStats.size / 1024).toFixed(1)}KB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data Size
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Data Type Breakdown */}
      {dataStats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📈 Data Type Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={dataStats.strings} 
                  color="success" 
                  sx={{ mb: 1, minWidth: 60 }}
                />
                <Typography variant="body2">Strings</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={dataStats.numbers} 
                  color="primary" 
                  sx={{ mb: 1, minWidth: 60 }}
                />
                <Typography variant="body2">Numbers</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={dataStats.booleans} 
                  color="warning" 
                  sx={{ mb: 1, minWidth: 60 }}
                />
                <Typography variant="body2">Booleans</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={dataStats.arrays} 
                  color="error" 
                  sx={{ mb: 1, minWidth: 60 }}
                />
                <Typography variant="body2">Arrays</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={dataStats.nestedObjects} 
                  color="secondary" 
                  sx={{ mb: 1, minWidth: 60 }}
                />
                <Typography variant="body2">Objects</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={dataStats.nulls} 
                  sx={{ mb: 1, minWidth: 60, bgcolor: 'grey.500', color: 'white' }}
                />
                <Typography variant="body2">Nulls</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🚀 Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <CardContent>
                <Typography variant="subtitle1">View Raw JSON</Typography>
                <Typography variant="body2" color="text.secondary">
                  See the complete JSON structure
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <CardContent>
                <Typography variant="subtitle1">Export Data</Typography>
                <Typography variant="body2" color="text.secondary">
                  Download as CSV or JSON
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <CardContent>
                <Typography variant="subtitle1">Validate Schema</Typography>
                <Typography variant="body2" color="text.secondary">
                  Check data integrity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
              <CardContent>
                <Typography variant="subtitle1">Edit Data</Typography>
                <Typography variant="body2" color="text.secondary">
                  Modify values interactively
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DataOverview;

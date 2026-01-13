import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, Paper, Alert, Button, IconButton, Tooltip } from '@mui/material';
import { Save, Clear, Download, Upload } from '@mui/icons-material';
import JSONTableViewer from '../components/JSONTableViewer';
import InteractiveDataExplorer from '../components/InteractiveDataExplorer';
import DataOverview from '../components/DataOverview';
import RevisionManagement from '../components/RevisionManagement';
import DeveloperView from '../components/DeveloperView';
import { useViewStateContext } from '../contexts/ViewStateContext';

interface DataSource {
  name: string;
  url: string;
  description: string;
  type: 'api' | 'file';
}

const DataLookbook: React.FC = () => {
  // Use view state context for persistent state
  const {
    activeTab,
    setActiveTab,
    selectedDataSource: selectedSourceName,
    setSelectedDataSource: setSelectedSourceName,
    clearAllStates,
    exportViewState,
    importViewState
  } = useViewStateContext();

  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      name: 'Landfill Report',
      url: 'https://preferio-backend-9135849b553e.herokuapp.com/landfill-report',
      description: 'Main landfill report data with financial information',
      type: 'api'
    },
    {
      name: 'All Reports',
      url: 'https://preferio-backend-9135849b553e.herokuapp.com/all-reports',
      description: 'Collection of all landfill reports',
      type: 'api'
    },
    {
      name: 'Revision Management',
      url: '/api/revision-data',
      description: 'Revision management and audit trail data',
      type: 'api'
    },
    {
      name: 'Sample Data',
      url: '/api/sample-data',
      description: 'Sample JSON data for testing',
      type: 'file'
    }
  ]);
  
  // Find selected data source by name
  const selectedDataSource = dataSources.find(source => source.name === selectedSourceName) || dataSources[0];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (source: DataSource) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(source.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDataSource);
  }, [selectedDataSource]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // View state management functions
  const handleClearAllStates = () => {
    if (confirm('Are you sure you want to clear all saved view states? This action cannot be undone.')) {
      clearAllStates();
    }
  };

  const handleExportViewState = () => {
    const stateJson = exportViewState();
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'view-state.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportViewState = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importViewState(content)) {
            alert('View state imported successfully!');
            // Reload the page to apply the imported state
            window.location.reload();
          } else {
            alert('Failed to import view state. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDataSourceChange = (source: DataSource) => {
    setSelectedSourceName(source.name);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5',
      padding: 3 
    }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              📊 Data Lookbook
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Comprehensive JSON data exploration and visualization tool
            </Typography>
          </Box>
          
          {/* View State Controls */}
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Export View State">
                <IconButton onClick={handleExportViewState} color="primary" size="small">
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Import View State">
                <IconButton onClick={handleImportViewState} color="primary" size="small">
                  <Upload />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear All View States">
                <IconButton onClick={handleClearAllStates} color="error" size="small">
                  <Clear />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              💾 View state is automatically saved
            </Typography>
          </Box>
        </Box>
        

        {/* Data Source Selector */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Data Sources:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {dataSources.map((source) => (
              <Paper
                key={source.name}
                elevation={selectedDataSource.name === source.name ? 4 : 1}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: selectedDataSource.name === source.name ? 'primary.light' : 'background.paper',
                  color: selectedDataSource.name === source.name ? 'primary.contrastText' : 'text.primary',
                  transition: 'all 0.2s',
                  '&:hover': {
                    elevation: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleDataSourceChange(source)}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {source.name}
                </Typography>
                <Typography variant="caption" display="block">
                  {source.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                  {source.type === 'api' ? '🌐 API' : '📁 File'}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading data: {error}
          </Alert>
        )}
      </Paper>

      <Paper elevation={3}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="📋 Data Overview" />
          <Tab label="📊 JSON Table Viewer" />
          <Tab label="🌳 Interactive Explorer" />
          <Tab label="🔧 Developer View" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {selectedDataSource.name === 'Revision Management' ? (
            <RevisionManagement />
          ) : (
            <>
              {activeTab === 0 && (
                <DataOverview 
                  data={data} 
                  loading={loading} 
                  dataSource={selectedDataSource} 
                />
              )}
              {activeTab === 1 && (
                <JSONTableViewer 
                  data={data} 
                  loading={loading} 
                  dataSource={selectedDataSource}
                  onDataUpdate={setData}
                />
              )}
              {activeTab === 2 && (
                <InteractiveDataExplorer 
                  data={data} 
                  loading={loading} 
                  dataSource={selectedDataSource}
                  onDataUpdate={setData}
                />
              )}
              {activeTab === 3 && (
                <DeveloperView 
                  data={data} 
                  loading={loading} 
                  dataSource={selectedDataSource}
                />
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default DataLookbook;

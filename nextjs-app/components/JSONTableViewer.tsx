import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useViewStateContext } from '../contexts/ViewStateContext';
import {
  ExpandMore,
  ExpandLess,
  Search,
  FilterList,
  Download,
  Refresh,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

interface JSONTableViewerProps {
  data: any;
  loading: boolean;
  dataSource: any;
  onDataUpdate?: (data: any) => void;
}

interface TableColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  nested?: boolean;
}

const JSONTableViewer: React.FC<JSONTableViewerProps> = ({
  data,
  loading,
  dataSource,
  onDataUpdate
}) => {
  // Use view state context for persistent state
  const {
    tableSearchTerm,
    setTableSearchTerm,
    tableSortBy,
    setTableSortBy,
    tableSortOrder,
    setTableSortOrder,
    tablePage,
    setTablePage,
    tableRowsPerPage,
    setTableRowsPerPage
  } = useViewStateContext();

  // Local state for UI interactions
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Flatten JSON data into table rows
  const tableData = useMemo(() => {
    if (!data) return [];

    const flattenObject = (obj: any, prefix = '', level = 0): any[] => {
      const result: any[] = [];
      
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const type = Array.isArray(value) ? 'array' : typeof value;
        
        if (type === 'object' && value !== null) {
          result.push({
            id: fullKey,
            key: key,
            path: fullKey,
            value: value,
            type: type,
            level: level,
            nested: true,
            children: flattenObject(value, fullKey, level + 1)
          });
        } else {
          result.push({
            id: fullKey,
            key: key,
            path: fullKey,
            value: value,
            type: type,
            level: level,
            nested: false,
            children: []
          });
        }
      }
      
      return result;
    };

    return flattenObject(data);
  }, [data]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = tableData;

    // Search filter
    if (tableSearchTerm) {
      filtered = filtered.filter(row =>
        row.key.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
        JSON.stringify(row.value).toLowerCase().includes(tableSearchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(row => row.type === filterType);
    }

    return filtered;
  }, [tableData, tableSearchTerm, filterType]);

  const handleExpandRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const handleEditCell = (rowId: string, value: any) => {
    setEditingCell(rowId);
    setEditValue(value);
  };

  const handleSaveEdit = () => {
    if (editingCell && onDataUpdate) {
      // Update the data (simplified - in real app you'd update the nested structure)
      console.log('Saving edit:', editingCell, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleExport = (format: string) => {
    if (!data) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'csv':
        content = convertToCSV(filteredData);
        filename = `${dataSource.name.toLowerCase().replace(/\s+/g, '_')}_data.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `${dataSource.name.toLowerCase().replace(/\s+/g, '_')}_data.json`;
        mimeType = 'application/json';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportMenuAnchor(null);
  };

  const convertToCSV = (data: any[]) => {
    const headers = ['Path', 'Key', 'Type', 'Value'];
    const rows = data.map(row => [
      row.path,
      row.key,
      row.type,
      typeof row.value === 'object' ? JSON.stringify(row.value) : row.value
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      string: '#4caf50',
      number: '#2196f3',
      boolean: '#ff9800',
      object: '#9c27b0',
      array: '#f44336',
      null: '#9e9e9e'
    };
    return colors[type] || '#666';
  };

  const renderValue = (row: any) => {
    if (editingCell === row.id) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <IconButton size="small" onClick={handleSaveEdit} color="primary">
            <Save fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancelEdit} color="secondary">
            <Cancel fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    if (row.type === 'object' || row.type === 'array') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {JSON.stringify(row.value).substring(0, 50)}
            {JSON.stringify(row.value).length > 50 ? '...' : ''}
          </Typography>
          <Tooltip title="Expand to view">
            <IconButton
              size="small"
              onClick={() => handleExpandRow(row.id)}
              sx={{ color: 'primary.main' }}
            >
              {expandedRows.has(row.id) ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {row.value === null ? 'null' : String(row.value)}
        </Typography>
        <IconButton
          size="small"
          onClick={() => handleEditCell(row.id, row.value)}
          sx={{ opacity: 0.7 }}
        >
          <Edit fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading data...
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
      {/* Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search"
            value={tableSearchTerm}
            onChange={(e) => setTableSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            placeholder="Search keys or values..."
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="object">Object</MenuItem>
              <MenuItem value="array">Array</MenuItem>
              <MenuItem value="null">Null</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Download />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            Export Data
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            <MenuItem onClick={() => handleExport('json')}>Export as JSON</MenuItem>
          </Menu>
        </Grid>
      </Grid>

      {/* Data Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Total Fields
              </Typography>
              <Typography variant="h6">
                {tableData.length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Filtered Results
              </Typography>
              <Typography variant="h6">
                {filteredData.length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Nested Objects
              </Typography>
              <Typography variant="h6">
                {tableData.filter(row => row.nested).length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Data Source
              </Typography>
              <Typography variant="h6">
                {dataSource.name}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Path</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: row.level % 2 === 0 ? 'background.paper' : 'action.hover'
                  }}
                >
                  <TableCell sx={{ pl: row.level * 2 + 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {row.path}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {row.key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.type}
                      size="small"
                      sx={{
                        bgcolor: getTypeColor(row.type),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {renderValue(row)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {row.nested && (
                        <Tooltip title={expandedRows.has(row.id) ? 'Collapse' : 'Expand'}>
                          <IconButton
                            size="small"
                            onClick={() => handleExpandRow(row.id)}
                          >
                            {expandedRows.has(row.id) ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                
                {/* Nested children */}
                {row.nested && expandedRows.has(row.id) && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ p: 0, bgcolor: 'grey.50' }}>
                      <Collapse in={expandedRows.has(row.id)}>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Nested Content:
                          </Typography>
                          <pre style={{ 
                            fontSize: '12px', 
                            overflow: 'auto', 
                            maxHeight: '300px',
                            background: '#f5f5f5',
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}>
                            {JSON.stringify(row.value, null, 2)}
                          </pre>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredData.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No data matches your current search and filter criteria.
        </Alert>
      )}
    </Box>
  );
};

export default JSONTableViewer;

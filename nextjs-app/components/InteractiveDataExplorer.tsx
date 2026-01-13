import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import {
  ExpandMore,
  ChevronRight,
  Edit,
  Save,
  Cancel,
  Add,
  Delete,
  Search,
  FilterList,
  Schema,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';

interface InteractiveDataExplorerProps {
  data: any;
  loading: boolean;
  dataSource: any;
  onDataUpdate?: (data: any) => void;
}

interface TreeNode {
  id: string;
  label: string;
  value: any;
  type: string;
  path: string;
  children?: TreeNode[] | null;
  isValid?: boolean;
  error?: string;
}

const InteractiveDataExplorer: React.FC<InteractiveDataExplorerProps> = ({
  data,
  loading,
  dataSource,
  onDataUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  // Convert data to tree structure
  const treeData = useMemo(() => {
    if (!data) return null;
    
    try {

    const createTreeNode = (obj: any, key: string, path: string, depth: number = 0, visited: Set<any> = new Set()): TreeNode => {
      // Prevent infinite recursion
      if (depth > 5) {
        return {
          id: path,
          label: key,
          type: 'string',
          value: '[Maximum depth reached]',
          path: path,
          children: null,
          error: 'Maximum depth reached'
        };
      }
      
      // Prevent circular references
      if (visited.has(obj)) {
        return {
          id: path,
          label: key,
          type: 'string',
          value: '[Circular reference]',
          path: path,
          children: null,
          error: 'Circular reference detected'
        };
      }
      
      const nodeId = path;
      const nodeValue = obj;
      const nodeType = Array.isArray(nodeValue) ? 'array' : typeof nodeValue;
      
      let children: TreeNode[] = [];
      let isValid = true;
      let error = '';

      if (nodeType === 'object' && nodeValue !== null) {
        const newVisited = new Set(visited);
        newVisited.add(obj);
        children = Object.entries(nodeValue).map(([childKey, childValue]) =>
          createTreeNode(childValue, childKey, `${path}.${childKey}`, depth + 1, newVisited)
        );
      } else if (nodeType === 'array' && nodeValue !== null) {
        const newVisited = new Set(visited);
        newVisited.add(obj);
        children = nodeValue.map((childValue: any, index: number) =>
          createTreeNode(childValue, `[${index}]`, `${path}[${index}]`, depth + 1, newVisited)
        );
      }

      // Basic validation
      if (nodeType === 'string' && nodeValue === '') {
        isValid = false;
        error = 'Empty string';
      } else if (nodeType === 'number' && isNaN(nodeValue)) {
        isValid = false;
        error = 'Invalid number';
      }

      return {
        id: nodeId,
        label: key,
        value: nodeValue,
        type: nodeType,
        path: path,
        children: children.length > 0 ? children : undefined,
        isValid,
        error: error || undefined
      };
    };

    return createTreeNode(data, 'root', 'root');
    } catch (error) {
      console.error('Error building tree data:', error);
      return {
        id: 'error',
        label: 'Error',
        type: 'string',
        value: 'Failed to parse data',
        path: 'error',
        children: null,
        error: 'Failed to parse data structure'
      };
    }
  }, [data]);

  // Filter tree data based on search and error filter
  const filteredTreeData = useMemo(() => {
    if (!treeData) return null;

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matchesSearch = !searchTerm || 
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(node.value).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesErrorFilter = !showOnlyErrors || !node.isValid;

      if (!matchesSearch || !matchesErrorFilter) {
        return null;
      }

      const filteredChildren = node.children?.map(filterNode).filter(Boolean) as TreeNode[] || [];
      
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : undefined
      };
    };

    return filterNode(treeData);
  }, [treeData, searchTerm, showOnlyErrors]);

  // Schema validation
  const validateSchema = () => {
    if (!data) return;

    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    // Check for required fields (customize based on your data structure)
    const requiredFields = ['report_info', 'data_rows', 'totals'];
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check data types
    if (data.report_info && typeof data.report_info !== 'object') {
      errors.push('report_info should be an object');
    }

    if (data.data_rows && !Array.isArray(data.data_rows)) {
      errors.push('data_rows should be an array');
    }

    // Check for empty arrays
    if (data.data_rows && Array.isArray(data.data_rows) && data.data_rows.length === 0) {
      warnings.push('data_rows array is empty');
    }

    // Check for null values
    const checkForNulls = (obj: any, path = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (value === null) {
          info.push(`Null value found at: ${currentPath}`);
        } else if (typeof value === 'object' && value !== null) {
          checkForNulls(value, currentPath);
        }
      });
    };

    if (data) {
      checkForNulls(data);
    }

    setValidationResults({
      errors,
      warnings,
      info,
      isValid: errors.length === 0
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      string: '#4caf50',
      number: '#2196f3',
      boolean: '#ff9800',
      object: '#9c27b0',
      array: '#f44336',
      null: '#9e9e9e',
      undefined: '#666'
    };
    return colors[type] || '#666';
  };

  const getValidationIcon = (node: TreeNode) => {
    if (!node.isValid) {
      return <Error color="error" fontSize="small" />;
    }
    return <CheckCircle color="success" fontSize="small" />;
  };

  const handleEditNode = (node: TreeNode) => {
    setEditingNode(node.id);
    setEditValue(JSON.stringify(node.value));
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingNode && onDataUpdate) {
      try {
        const newValue = JSON.parse(editValue);
        // In a real implementation, you'd update the nested structure
        console.log('Saving edit:', editingNode, newValue);
        setEditDialogOpen(false);
        setEditingNode(null);
        setEditValue('');
      } catch (error) {
        alert('Invalid JSON format');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingNode(null);
    setEditValue('');
  };

  const renderTreeItem = useMemo(() => {
    const renderNode = (node: TreeNode, depth: number = 0): React.ReactElement => {
      // Prevent infinite recursion by limiting depth
      if (depth > 10) {
        return (
          <TreeItem
            key={node.id}
            itemId={node.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                <Typography variant="body2" color="error">
                  Maximum depth reached
                </Typography>
              </Box>
            }
          />
        );
      }
      
      const hasChildren = node.children && node.children.length > 0;
      
      return (
        <TreeItem
          key={node.id}
          itemId={node.id}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              {getValidationIcon(node)}
              <Typography variant="body2" fontWeight="bold">
                {node.label}
              </Typography>
              <Chip
                label={node.type}
                size="small"
                sx={{
                  bgcolor: getTypeColor(node.type),
                  color: 'white',
                  fontSize: '0.7rem',
                  height: '20px'
                }}
              />
              {node.error && (
                <Tooltip title={node.error}>
                  <Warning color="warning" fontSize="small" />
                </Tooltip>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title="Edit value">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditNode(node);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
          sx={{
            '& .MuiTreeItem-content': {
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }
          }}
        >
          {hasChildren && node.children?.map(child => renderNode(child, depth + 1))}
          {!hasChildren && (
            <TreeItem
              itemId={`${node.id}-value`}
              label={
                <Box sx={{ pl: 2, py: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      bgcolor: 'grey.100',
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      wordBreak: 'break-all'
                    }}
                  >
                    {node.type === 'object' || node.type === 'array'
                      ? JSON.stringify(node.value, null, 2)
                      : String(node.value === null ? 'null' : node.value)
                    }
                  </Typography>
                </Box>
              }
            />
          )}
        </TreeItem>
      );
    };
    
    return renderNode;
  }, [filteredTreeData, searchTerm, showOnlyErrors]);

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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            placeholder="Search keys or values..."
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyErrors}
                onChange={(e) => setShowOnlyErrors(e.target.checked)}
              />
            }
            label="Show only errors"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Schema />}
            onClick={validateSchema}
          >
            Validate Schema
          </Button>
        </Box>
      </Box>

      {/* Validation Results */}
      {validationResults && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {validationResults.isValid ? (
                <CheckCircle color="success" />
              ) : (
                <Error color="error" />
              )}
              <Typography variant="h6">
                Schema Validation Results
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {validationResults.errors.length > 0 && (
                  <Box>
                  <Alert severity="error" icon={<Error />}>
                    <Typography variant="subtitle2" gutterBottom>
                      Errors ({validationResults.errors.length}):
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validationResults.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                  </Box>
                )}
                {validationResults.warnings.length > 0 && (
                  <Box>
                  <Alert severity="warning" icon={<Warning />}>
                    <Typography variant="subtitle2" gutterBottom>
                      Warnings ({validationResults.warnings.length}):
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validationResults.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </Alert>
                  </Box>
                )}
                {validationResults.info.length > 0 && (
                  <Box>
                  <Alert severity="info" icon={<Info />}>
                    <Typography variant="subtitle2" gutterBottom>
                      Information ({validationResults.info.length}):
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validationResults.info.map((info: string, index: number) => (
                        <li key={index}>{info}</li>
                      ))}
                    </ul>
                  </Alert>
                  </Box>
                )}
              </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Tree View */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Interactive Data Tree
        </Typography>
        {filteredTreeData && !filteredTreeData.error ? (
          <SimpleTreeView
            sx={{
              flexGrow: 1,
              maxHeight: 600,
              overflowY: 'auto'
            }}
          >
            {renderTreeItem(filteredTreeData)}
          </SimpleTreeView>
        ) : filteredTreeData?.error ? (
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              Data Parsing Error
            </Typography>
            <Typography variant="body2">
              {filteredTreeData.error}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info">
            No data matches your current search criteria.
          </Alert>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="md" fullWidth>
        <DialogTitle>Edit Value</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Enter JSON value..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InteractiveDataExplorer;

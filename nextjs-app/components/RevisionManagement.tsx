import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  Lock,
  LockOpen,
  Edit,
  Visibility,
  History,
  Person,
  Schedule,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';

interface RevisionData {
  reports: ReportRevision[];
  summary: RevisionSummary;
}

interface ReportRevision {
  id: string;
  name: string;
  version: number;
  status: 'draft' | 'locked' | 'published' | 'archived';
  company_id: string;
  locked_by?: string;
  locked_at?: string;
  created_by: string;
  last_modified_by: string;
  created_at: string;
  updated_at: string;
  audit_trail: AuditEntry[];
  date_range: {
    start_date: string;
    end_date: string;
    period: string;
  };
  source: {
    type: string;
    file_name?: string;
    uploaded_at?: string;
    ocr_confidence?: number;
  };
}

interface AuditEntry {
  id: string;
  action: string;
  user_id: string;
  timestamp: string;
  comment?: string;
  changes?: any[];
}

interface RevisionSummary {
  total_reports: number;
  draft_reports: number;
  locked_reports: number;
  published_reports: number;
  archived_reports: number;
  total_versions: number;
  total_audit_entries: number;
}

const RevisionManagement: React.FC = () => {
  const [data, setData] = useState<RevisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => {
    fetchRevisionData();
  }, []);

  const fetchRevisionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/revision-data');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch revision data: ${response.status}`);
      }
      
      const revisionData = await response.json();
      setData(revisionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revision data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit color="primary" />;
      case 'locked': return <Lock color="warning" />;
      case 'published': return <CheckCircle color="success" />;
      case 'archived': return <History color="disabled" />;
      default: return <Error color="error" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'primary';
      case 'locked': return 'warning';
      case 'published': return 'success';
      case 'archived': return 'default';
      default: return 'error';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <CheckCircle color="success" fontSize="small" />;
      case 'updated': return <Edit color="primary" fontSize="small" />;
      case 'locked': return <Lock color="warning" fontSize="small" />;
      case 'unlocked': return <LockOpen color="success" fontSize="small" />;
      case 'published': return <Visibility color="info" fontSize="small" />;
      default: return <History color="disabled" fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading revision data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>
          Error Loading Revision Data
        </Typography>
        <Typography variant="body2">
          {error}
        </Typography>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No revision data available.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Revision Management Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Reports
              </Typography>
              <Typography variant="h4">
                {data.summary.total_reports}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Versions
              </Typography>
              <Typography variant="h4">
                {data.summary.total_versions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Audit Entries
              </Typography>
              <Typography variant="h4">
                {data.summary.total_audit_entries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Locked Reports
              </Typography>
              <Typography variant="h4" color="warning.main">
                {data.summary.locked_reports}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Distribution */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Status Distribution
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Edit />}
            label={`Draft: ${data.summary.draft_reports}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Lock />}
            label={`Locked: ${data.summary.locked_reports}`}
            color="warning"
            variant="outlined"
          />
          <Chip
            icon={<CheckCircle />}
            label={`Published: ${data.summary.published_reports}`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<History />}
            label={`Archived: ${data.summary.archived_reports}`}
            color="default"
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Reports Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Reports with Revision History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Locked By</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {report.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {report.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(report.status || 'draft')}
                      label={(report.status || 'draft').toUpperCase()}
                      color={getStatusColor(report.status || 'draft') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      v{report.version || 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {report.locked_by ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        <Typography variant="body2">
                          {report.locked_by}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not locked
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" />
                      <Typography variant="body2">
                        {formatDate(report.updated_at)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Audit Trail">
                      <IconButton
                        size="small"
                        onClick={() => setExpandedReport(
                          expandedReport === report.id ? null : report.id
                        )}
                      >
                        <History />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Audit Trail Details */}
      {data.reports.map((report) => (
        <Accordion
          key={report.id}
          expanded={expandedReport === report.id}
          onChange={() => setExpandedReport(
            expandedReport === report.id ? null : report.id
          )}
          sx={{ mt: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">
              Audit Trail: {report.id} (v{report.version})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Report Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created by: {report.created_by}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created at: {formatDate(report.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last modified by: {report.last_modified_by}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last modified: {formatDate(report.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Audit Trail ({(report.audit_trail || []).length} entries)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Comment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(report.audit_trail || []).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getActionIcon(entry.action)}
                            <Typography variant="body2">
                              {entry.action.toUpperCase()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.user_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(entry.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.comment || 'No comment'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default RevisionManagement;

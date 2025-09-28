import React, { useState, useEffect } from 'react';
import './AllLandfillReports.css';

interface ReportSummary {
  id: string;
  name: string;
  company: string;
  period: string;
  created_at: string;
  updated_at: string;
  total_amount: number;
  version?: number;
  status?: string;
  locked_by?: string;
}

interface AllReports {
  reports: ReportSummary[];
}

const AllLandfillReports: React.FC = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/all-reports`);
      if (response.ok) {
        const data: AllReports = await response.json();
        setReports(data.reports);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleViewReport = (reportId: string) => {
    // Navigate to the landfill report tab and load this specific report
    // For now, we'll show an alert - in the future this could navigate to the report
    alert(`Viewing report ${reportId}. This will be implemented to show the full report.`);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/all-reports/${reportId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchReports(); // Refresh the list
      } else {
        setError('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Error deleting report');
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      draft: { color: '#e3f2fd', textColor: '#1976d2', label: 'Draft' },
      locked: { color: '#fff3e0', textColor: '#f57c00', label: 'Locked' },
      published: { color: '#e8f5e8', textColor: '#2e7d32', label: 'Published' },
      archived: { color: '#f3e5f5', textColor: '#7b1fa2', label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span 
        className="status-badge" 
        style={{ 
          backgroundColor: config.color, 
          color: config.textColor 
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="all-landfill-reports">
      <div className="reports-header">
        <div className="header-content">
          <h1>All Landfill Reports</h1>
          <p>Manage and view all landfill reports • {reports.length} report{reports.length !== 1 ? 's' : ''} found</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={fetchReports}
          disabled={loading}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="reports-grid">
        {reports.length === 0 ? (
          <div className="no-reports">
            <p>No reports found. Create your first report!</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-title-section">
                  <h3>{report.name}</h3>
                  <div className="report-meta">
                    {getStatusBadge(report.status)}
                    {report.version && (
                      <span className="version-badge">v{report.version}</span>
                    )}
                  </div>
                </div>
                <div className="report-actions">
                  <button 
                    className="btn btn-edit btn-sm"
                    onClick={() => handleViewReport(report.id)}
                    title="View Report"
                  >
                    👁️ View
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteReport(report.id)}
                    title="Delete Report"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="all-reports-info">
                <div className="info-row">
                  <span className="label">Report ID:</span>
                  <span className="value">{report.id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Company:</span>
                  <span className="value">{report.company}</span>
                </div>
                <div className="info-row">
                  <span className="label">Period:</span>
                  <span className="value">{report.period}</span>
                </div>
                <div className="info-row">
                  <span className="label">Total Amount:</span>
                  <span className="value amount">{formatCurrency(report.total_amount)}</span>
                </div>
                {report.locked_by && (
                  <div className="info-row">
                    <span className="label">Locked by:</span>
                    <span className="value locked">{report.locked_by}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Created:</span>
                  <span className="value">{formatDate(report.created_at)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Updated:</span>
                  <span className="value">{formatDate(report.updated_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllLandfillReports;

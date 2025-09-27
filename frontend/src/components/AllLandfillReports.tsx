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

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
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
        <h1>All Landfill Reports</h1>
        <p>Manage and view all landfill reports</p>
        <button 
          className="btn btn-primary"
          onClick={fetchReports}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
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
                <h3>{report.name}</h3>
                <div className="report-actions">
                  <button 
                    className="btn btn-edit btn-sm"
                    title="View Report"
                  >
                    👁️
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
              
              <div className="report-info">
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

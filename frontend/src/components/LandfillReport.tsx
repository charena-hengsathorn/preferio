import React, { useState, useEffect } from 'react';
import './LandfillReport.css';

interface LandfillRow {
  id?: number;
  receive_ton?: number;
  ton: number;
  gcv?: number;
  multi?: number;
  price?: number;
  total_ton: number;
  baht_per_ton: number;
  amount: number;
  vat: number;
  total: number;
  remark?: string;
}

interface LandfillReport {
  report_info: {
    company: string;
    period: string;
    report_id: string;
    quota_weight: number;
    reference: string;
    report_by: string;
    price_reference: string;
    adjustment: string;
  };
  data_rows: LandfillRow[];
  totals: {
    receive_ton: number;
    ton: number;
    total_ton: number;
    amount: number;
    vat: number;
    total: number;
  };
  additional_info: {
    difference_adjustment: number;
    adjustment_amount: number;
  };
}

const LandfillReport: React.FC = () => {
  const [report, setReport] = useState<LandfillReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRow, setNewRow] = useState<Partial<LandfillRow>>({
    ton: 0,
    total_ton: 0,
    baht_per_ton: 0,
    amount: 0,
    vat: 0,
    total: 0,
    remark: ''
  });

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/landfill-report`);
      const data = await response.json();
      if (data.message) {
        // No report exists, create a default one
        await createDefaultReport();
      } else {
        setReport(data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const createDefaultReport = async () => {
    const defaultReport: LandfillReport = {
      report_info: {
        company: "บจก. พรีเฟอริโอ้ เทรด",
        period: "1-15/09/2025",
        report_id: "P7922",
        quota_weight: 1700.00,
        reference: "00W1W23100/5",
        report_by: "A/C Saraburi",
        price_reference: "H265794",
        adjustment: "700-527/W2000"
      },
      data_rows: [],
      totals: {
        receive_ton: 0,
        ton: 0,
        total_ton: 0,
        amount: 0,
        vat: 0,
        total: 0
      },
      additional_info: {
        difference_adjustment: 0,
        adjustment_amount: 0
      }
    };

    try {
      const response = await fetch(`${API_BASE}/landfill-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultReport),
      });
      if (response.ok) {
        setReport(defaultReport);
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const addRow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/landfill-report/row`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRow),
      });
      if (response.ok) {
        setNewRow({
          ton: 0,
          total_ton: 0,
          baht_per_ton: 0,
          amount: 0,
          vat: 0,
          total: 0,
          remark: ''
        });
        setShowAddForm(false);
        fetchReport();
      }
    } catch (error) {
      console.error('Error adding row:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRow = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/landfill-report/row/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchReport();
      }
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const exportToJSON = async () => {
    try {
      const response = await fetch(`${API_BASE}/landfill-report/export`);
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'landfill_report.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (!report) {
    return <div className="loading">Loading landfill report...</div>;
  }

  return (
    <div className="landfill-report">
      <header className="report-header">
        <h1>TPI POLENE POWER PUBLIC COMPANY LIMITED LANDFILL REPORT</h1>
        <div className="report-info">
          <div className="info-row">
            <span className="label">Period:</span>
            <span className="value">{report.report_info.period}</span>
          </div>
          <div className="info-row">
            <span className="label">Company:</span>
            <span className="value">{report.report_info.company}</span>
          </div>
          <div className="info-row">
            <span className="label">Report ID:</span>
            <span className="value">{report.report_info.report_id}</span>
          </div>
          <div className="info-row">
            <span className="label">Quota Weight:</span>
            <span className="value">{report.report_info.quota_weight.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="table-controls">
        <div className="controls-left">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Row'}
          </button>
          <button className="btn btn-secondary" onClick={exportToJSON}>
            Export JSON
          </button>
        </div>
        
      </div>

      {showAddForm && (
        <div className="add-row-form">
          <h3>Add New Row</h3>
          <form onSubmit={addRow}>
            <div className="form-grid">
              <div className="form-group">
                <label>Receive (Ton):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.receive_ton || ''}
                  onChange={(e) => setNewRow({...newRow, receive_ton: parseFloat(e.target.value) || undefined})}
                />
              </div>
              <div className="form-group">
                <label>Ton:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.ton || ''}
                  onChange={(e) => setNewRow({...newRow, ton: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="form-group">
                <label>GCV:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.gcv || ''}
                  onChange={(e) => setNewRow({...newRow, gcv: parseFloat(e.target.value) || undefined})}
                />
              </div>
              <div className="form-group">
                <label>Multi:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.multi || ''}
                  onChange={(e) => setNewRow({...newRow, multi: parseFloat(e.target.value) || undefined})}
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.price || ''}
                  onChange={(e) => setNewRow({...newRow, price: parseFloat(e.target.value) || undefined})}
                />
              </div>
              <div className="form-group">
                <label>Total Ton:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.total_ton || ''}
                  onChange={(e) => setNewRow({...newRow, total_ton: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Baht/Ton:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.baht_per_ton || ''}
                  onChange={(e) => setNewRow({...newRow, baht_per_ton: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.amount || ''}
                  onChange={(e) => setNewRow({...newRow, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="form-group">
                <label>VAT:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.vat || ''}
                  onChange={(e) => setNewRow({...newRow, vat: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.total || ''}
                  onChange={(e) => setNewRow({...newRow, total: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Remark:</label>
                <input
                  type="text"
                  value={newRow.remark || ''}
                  onChange={(e) => setNewRow({...newRow, remark: e.target.value})}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Adding...' : 'Add Row'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="landfill-table">
            <thead>
              <tr>
                <th>Receive (Ton)</th>
                <th>Ton</th>
                <th>GCV</th>
                <th>Multi</th>
                <th>Price</th>
                <th>Total Ton</th>
                <th>Baht/Ton</th>
                <th>Amount</th>
                <th>Vat</th>
                <th>Total</th>
                <th>Remark</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {report.data_rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.receive_ton?.toLocaleString() || ''}</td>
                  <td>{row.ton.toLocaleString()}</td>
                  <td>{row.gcv?.toLocaleString() || ''}</td>
                  <td>{row.multi?.toLocaleString() || ''}</td>
                  <td>{row.price?.toLocaleString() || ''}</td>
                  <td>{row.total_ton.toLocaleString()}</td>
                  <td>{row.baht_per_ton.toLocaleString()}</td>
                  <td>{row.amount.toLocaleString()}</td>
                  <td>{row.vat.toLocaleString()}</td>
                  <td>{row.total.toLocaleString()}</td>
                  <td>{row.remark || ''}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteRow(row.id!)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="totals-row">
                <td><strong>{report.totals.receive_ton?.toLocaleString() || ''}</strong></td>
                <td><strong>{report.totals.ton.toLocaleString()}</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td><strong>{report.totals.total_ton.toLocaleString()}</strong></td>
                <td></td>
                <td><strong>{report.totals.amount.toLocaleString()}</strong></td>
                <td><strong>{report.totals.vat.toLocaleString()}</strong></td>
                <td><strong>{report.totals.total.toLocaleString()}</strong></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
      </div>

      <div className="additional-info">
        <div className="info-section">
          <h3>Additional Information</h3>
          <div className="info-row">
            <span className="label">Report By:</span>
            <span className="value">{report.report_info.report_by}</span>
          </div>
          <div className="info-row">
            <span className="label">Price Reference:</span>
            <span className="value">{report.report_info.price_reference}</span>
          </div>
          <div className="info-row">
            <span className="label">Adjustment:</span>
            <span className="value">{report.report_info.adjustment}</span>
          </div>
          <div className="info-row">
            <span className="label">Difference Adjustment:</span>
            <span className="value">{report.additional_info.difference_adjustment.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="label">Adjustment Amount:</span>
            <span className="value">{report.additional_info.adjustment_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandfillReport;

import React, { useState, useRef } from 'react';
import './Dashboard.css';
import LandfillReport from './LandfillReport';
import AllLandfillReports from './AllLandfillReports';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'landfill' | 'all-reports'>('dashboard');
  const createNewReportRef = useRef<(() => void) | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };


  return (
    <div className="dashboard">
      {/* Notification System */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">Preferio</div>
                <nav className="nav-tabs">
                  <button
                    className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Dashboard
                  </button>
                  <button
                    className={`nav-tab ${activeTab === 'landfill' ? 'active' : ''}`}
                    onClick={() => setActiveTab('landfill')}
                  >
                    Landfill Report
                  </button>
                  <button
                    className={`nav-tab ${activeTab === 'all-reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all-reports')}
                  >
                    All Reports
                  </button>
                </nav>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">PREFERIO TRADE CO LTD</span>
              <span className="user-email">LANDFILL REPORT SYSTEM</span>
            </div>
          </div>
        </div>
        
      </header>

      {/* Secondary Navigation - only show when landfill report is selected */}
      {activeTab === 'landfill' && (
        <div className="secondary-nav">
          <div className="nav-actions">
            <button 
              className="nav-btn"
              onClick={() => {
                console.log('🖱️ Add New Report button clicked, ref available:', !!createNewReportRef.current);
                if (createNewReportRef.current) {
                  createNewReportRef.current();
                } else {
                  console.log('❌ createNewReportRef.current is null, showing loading message');
                  showNotification('Report system is loading. Please wait a moment and try again.', 'info');
                }
              }}
              title="Create a new landfill report"
            >
              ➕ Add New Report
            </button>
            <button 
              className="nav-btn"
              onClick={() => document.getElementById('file-upload-input')?.click()}
              title="Upload new file with OCR processing"
            >
              📁 Upload New File
            </button>
          </div>
        </div>
      )}

      {/* Hidden file upload input */}
      <input
        id="file-upload-input"
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            alert(`File "${e.target.files[0].name}" selected for OCR processing. This feature will be implemented soon!`);
            e.target.value = '';
          }
        }}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h1>Dashboard</h1>
                  <p>PREFERIO TRADE LANDFILL REPORT MANAGEMENT SYSTEM</p>
            </div>
            
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-icon">📊</div>
                <h3>Landfill Reports</h3>
                <p>Manage and view landfill report data</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('landfill')}
                >
                  View Reports
                </button>
              </div>
              
              <div className="dashboard-card">
                <div className="card-icon">📈</div>
                <h3>Analytics</h3>
                <p>Track performance and generate insights</p>
                <button className="btn btn-secondary" disabled>
                  Coming Soon
                </button>
              </div>
              
              <div className="dashboard-card">
                <div className="card-icon">⚙️</div>
                <h3>Settings</h3>
                <p>Configure system preferences</p>
                <button className="btn btn-secondary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        )}

            {activeTab === 'landfill' && (
              <div className="landfill-section">
                <div className="section-header">
                  <h1>Landfill Report</h1>
                  <p>PREFERIO TRADE LANDFILL REPORT MANAGEMENT SYSTEM</p>
                </div>
                <LandfillReport onCreateNewReportRef={createNewReportRef} />
              </div>
            )}

            {activeTab === 'all-reports' && (
              <div className="all-reports-section">
                <AllLandfillReports />
              </div>
            )}
      </main>
    </div>
  );
};

export default Dashboard;

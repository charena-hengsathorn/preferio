import React, { useState } from 'react';
import './Dashboard.css';
import LandfillReport from './LandfillReport';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'landfill'>('dashboard');


  return (
    <div className="dashboard">
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
            </nav>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">TPI POLENE POWER</span>
              <span className="user-email">LANDFILL REPORT SYSTEM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h1>Dashboard</h1>
              <p>TPI POLENE POWER LANDFILL REPORT MANAGEMENT SYSTEM</p>
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
              <p>TPI POLENE POWER LANDFILL REPORT MANAGEMENT</p>
            </div>
            <LandfillReport />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

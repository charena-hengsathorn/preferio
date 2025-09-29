import React, { useState, useEffect } from 'react';
import './LandfillReport.css';


interface LandfillRow {
  id?: number;
  
  // Data Source Tracking
  source?: 'ocr' | 'manual' | 'calculated';
  ocr_confidence?: number;
  
  // Weight Data
  receive_ton?: number;
  ton: number;
  total_ton: number;
  
  // Pricing Configuration
  pricing_type?: 'gcv' | 'fixed';
  gcv?: number;
  multi?: number;
  price?: number;
  
  // Calculated Fields
  baht_per_ton: number;
  amount: number;
  vat: number;
  total: number;
  
  // Metadata
  remark?: string;
  needs_review?: boolean;
  verified_by?: string;
}

interface LandfillReport {
  id?: string;
  report_info: {
    title?: string;
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

// View state interface for saving/restoring
interface ViewState {
  showAddForm: boolean;
  pricingType: 'gcv' | 'fixed';
  editingRow: number | null;
  editData: Partial<LandfillRow>;
  editingHeader: boolean;
  headerTitle: string;
  editingQuotaWeight: boolean;
  quotaWeightValue: number;
  newRow: Partial<LandfillRow>;
}

const LandfillReport: React.FC = () => {
  const [report, setReport] = useState<LandfillReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pricingType, setPricingType] = useState<'gcv' | 'fixed'>('gcv');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<LandfillRow>>({});
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('TPI POLENE POWER PUBLIC COMPANY LIMITED LANDFILL REPORT');
  const [editingQuotaWeight, setEditingQuotaWeight] = useState(false);
  const [quotaWeightValue, setQuotaWeightValue] = useState<number>(1700);
  
  // Revision Management State
  const [reportVersion, setReportVersion] = useState<number>(1);
  const [reportStatus, setReportStatus] = useState<'draft' | 'locked' | 'published' | 'archived'>('draft');
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [currentUser] = useState<string>('default_user');
  const [auditTrail] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Suppress unused variable warnings
  console.log('Revision state:', { lockedAt, auditTrail });
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showAttachments, setShowAttachments] = useState<boolean>(false);
  const [newRow, setNewRow] = useState<Partial<LandfillRow>>({
    receive_ton: undefined,
    ton: undefined,
    gcv: undefined,
    multi: undefined,
    price: undefined,
    total_ton: undefined,
    baht_per_ton: undefined,
    amount: undefined,
    vat: undefined,
    total: undefined,
    remark: ''
  });

  // Dropdown options - keeping only original data
  const companyOptions = [
    'บจก. พรีเฟอริโอ้ เทรด'
  ];

  const periodOptions = [
    '1-15/09/2025'
  ];

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // View state management functions
  const saveViewState = async () => {
    const viewState: ViewState = {
      showAddForm,
      pricingType,
      editingRow,
      editData,
      editingHeader,
      headerTitle,
      editingQuotaWeight,
      quotaWeightValue,
      newRow
    };
    
    try {
      const response = await fetch(`${API_BASE}/landfill-report/view-state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(viewState),
      });
      
      if (response.ok) {
        console.log('💾 View state saved to backend');
      } else {
        console.error('Failed to save view state to backend');
        // Fallback to localStorage
        localStorage.setItem('landfill_report_view_state', JSON.stringify(viewState));
      }
    } catch (error) {
      console.error('Error saving view state to backend:', error);
      // Fallback to localStorage
      localStorage.setItem('landfill_report_view_state', JSON.stringify(viewState));
    }
  };

  const restoreViewState = async () => {
    try {
      // Try to get from backend first
      const response = await fetch(`${API_BASE}/landfill-report/view-state`);
      
      if (response.ok) {
        const data = await response.json();
        const viewState = data.view_state;
        
        if (viewState && Object.keys(viewState).length > 0) {
          setShowAddForm(viewState.showAddForm || false);
          setPricingType(viewState.pricingType || 'gcv');
          setEditingRow(viewState.editingRow || null);
          setEditData(viewState.editData || {});
          setEditingHeader(viewState.editingHeader || false);
          setHeaderTitle(viewState.headerTitle || 'TPI POLENE POWER PUBLIC COMPANY LIMITED LANDFILL REPORT');
          setEditingQuotaWeight(viewState.editingQuotaWeight || false);
          setQuotaWeightValue(viewState.quotaWeightValue || 1700);
          setNewRow(viewState.newRow || {
            receive_ton: undefined,
            ton: undefined,
            gcv: undefined,
            multi: undefined,
            price: undefined,
            total_ton: undefined,
            baht_per_ton: undefined,
            amount: undefined,
            vat: undefined,
            total: undefined,
            remark: ''
          });
          console.log('🔄 View state restored from backend');
          return;
        }
      }
      
      // Fallback to localStorage
      const savedState = localStorage.getItem('landfill_report_view_state');
      if (savedState) {
        const viewState: ViewState = JSON.parse(savedState);
        
        if (viewState && Object.keys(viewState).length > 0) {
          setShowAddForm(viewState.showAddForm || false);
          setPricingType(viewState.pricingType || 'gcv');
          setEditingRow(viewState.editingRow || null);
          setEditData(viewState.editData || {});
          setEditingHeader(viewState.editingHeader || false);
          setHeaderTitle(viewState.headerTitle || 'TPI POLENE POWER PUBLIC COMPANY LIMITED LANDFILL REPORT');
          setEditingQuotaWeight(viewState.editingQuotaWeight || false);
          setQuotaWeightValue(viewState.quotaWeightValue || 1700);
          setNewRow(viewState.newRow || {
            receive_ton: undefined,
            ton: undefined,
            gcv: undefined,
            multi: undefined,
            price: undefined,
            total_ton: undefined,
            baht_per_ton: undefined,
            amount: undefined,
            vat: undefined,
            total: undefined,
            remark: ''
          });
          console.log('🔄 View state restored from localStorage');
        }
      }
    } catch (error) {
      console.error('Error restoring view state:', error);
    }
  };

  const clearViewState = async () => {
    try {
      // Clear from backend
      const emptyViewState = {
        showAddForm: false,
        pricingType: 'gcv',
        editingRow: null,
        editData: {},
        editingHeader: false,
        headerTitle: 'TPI POLENE POWER PUBLIC COMPANY LIMITED LANDFILL REPORT',
        editingQuotaWeight: false,
        quotaWeightValue: 1700,
        newRow: {
          receive_ton: null,
          ton: null,
          gcv: null,
          multi: null,
          price: null,
          total_ton: null,
          baht_per_ton: null,
          amount: null,
          vat: null,
          total: null,
          remark: ""
        }
      };
      
      await fetch(`${API_BASE}/landfill-report/view-state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emptyViewState),
      });
      
      // Also clear localStorage
      localStorage.removeItem('landfill_report_view_state');
      console.log('🗑️ View state cleared from backend and localStorage');
    } catch (error) {
      console.error('Error clearing view state:', error);
    }
  };

  const fetchAttachments = async () => {
    try {
      const response = await fetch(`${API_BASE}/landfill-reports/${report?.id || 'P7922'}/attachments`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data.attachments || []);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
      formData.append('report_id', report?.id || 'P7922');
      formData.append('user_id', currentUser);

      const response = await fetch(`${API_BASE}/landfill-reports/${report?.id || 'P7922'}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAttachments(prev => [...prev, ...result.attachments]);
        console.log('📎 Attachments uploaded successfully');
        alert(`Successfully uploaded ${files.length} attachment(s)`);
      } else {
        console.error('Failed to upload attachments');
        alert('Failed to upload attachments');
      }
    } catch (error) {
      console.error('Error uploading attachments:', error);
      alert('Error uploading attachments');
    }

    // Reset the input
    event.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Revision Management Functions
  const lockReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/landfill-reports/P7922/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUser })
      });
      
      if (response.ok) {
        setLockedBy(currentUser);
        setLockedAt(new Date().toISOString());
        setReportStatus('locked');
        console.log('🔒 Report locked successfully');
      } else {
        const error = await response.json();
        console.error('Failed to lock report:', error);
        alert('Failed to lock report: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error locking report:', error);
      alert('Error locking report');
    }
  };

  const unlockReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/landfill-reports/P7922/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUser })
      });
      
      if (response.ok) {
        setLockedBy(null);
        setLockedAt(null);
        setReportStatus('draft');
        console.log('🔓 Report unlocked successfully');
      } else {
        const error = await response.json();
        console.error('Failed to unlock report:', error);
        alert('Failed to unlock report: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error unlocking report:', error);
      alert('Error unlocking report');
    }
  };

  const saveReportWithVersion = async () => {
    if (!report) return;
    
    try {
      const response = await fetch(`${API_BASE}/landfill-reports/P7922/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          report_data: report,
          user_id: currentUser 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setReportVersion(result.version);
        setReportStatus('draft');
        console.log(`💾 Report saved successfully - Version ${result.version}`);
        alert(`Report saved successfully - Version ${result.version}`);
      } else {
        const error = await response.json();
        console.error('Failed to save report:', error);
        alert('Failed to save report: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error saving report');
    }
  };

  useEffect(() => {
    fetchReport();
    // Restore view state after component mounts
    restoreViewState();
    // Fetch existing attachments
    fetchAttachments();
  }, []);

  // Save view state whenever key states change
  useEffect(() => {
    saveViewState();
  }, [showAddForm, pricingType, editingRow, editingHeader, editingQuotaWeight]);

  // Track editing state
  useEffect(() => {
    const editing = editingHeader || editingQuotaWeight || editingRow !== null || showAddForm;
    setIsEditing(editing);
  }, [editingHeader, editingQuotaWeight, editingRow, showAddForm]);

  // Auto-calculate price when GCV, Multi, or Price changes
  useEffect(() => {
    if (pricingType === 'gcv' && newRow.gcv && newRow.multi && newRow.price) {
      const calculatedBahtPerTon = (newRow.gcv * newRow.multi) + newRow.price;
      setNewRow(prev => ({ ...prev, baht_per_ton: calculatedBahtPerTon }));
    }
  }, [newRow.gcv, newRow.multi, newRow.price, pricingType]);

  // Auto-update Total Ton to match Ton field
  useEffect(() => {
    if (newRow.ton) {
      setNewRow(prev => ({ ...prev, total_ton: newRow.ton }));
    }
  }, [newRow.ton]);

  // Auto-calculate amount when Total Ton or Baht/Ton changes
  useEffect(() => {
    if (newRow.total_ton && newRow.baht_per_ton) {
      const calculatedAmount = newRow.total_ton * newRow.baht_per_ton;
      setNewRow(prev => ({ ...prev, amount: calculatedAmount }));
    }
  }, [newRow.total_ton, newRow.baht_per_ton]);

  // Auto-calculate total when Amount or VAT changes
  useEffect(() => {
    if (newRow.amount && newRow.vat) {
      const calculatedTotal = newRow.amount + newRow.vat;
      setNewRow(prev => ({ ...prev, total: calculatedTotal }));
    }
  }, [newRow.amount, newRow.vat]);

  // Calculate the preview value for display
  const getCalculatedValue = () => {
    if (pricingType === 'gcv' && newRow.gcv && newRow.multi && newRow.price) {
      return ((newRow.gcv * newRow.multi) + newRow.price).toFixed(2);
    }
    return '';
  };

  // Calculate the amount value for display
  const getCalculatedAmount = () => {
    if (newRow.total_ton && newRow.baht_per_ton) {
      return (newRow.total_ton * newRow.baht_per_ton).toFixed(2);
    }
    return '';
  };

  // Calculate the total value for display
  const getCalculatedTotal = () => {
    if (newRow.amount && newRow.vat) {
      return (newRow.amount + newRow.vat).toFixed(2);
    }
    return '';
  };

  // Get placeholder text for Baht/Ton field
  const getBahtPerTonPlaceholder = () => {
    if (pricingType === 'gcv') {
      const calculated = getCalculatedValue();
      if (calculated) {
        return `Auto: ${calculated}`;
      } else {
        return '(GCV × Multi) + Price';
      }
    }
    return '';
  };

  // Get placeholder text for Amount field
  const getAmountPlaceholder = () => {
    const calculated = getCalculatedAmount();
    if (calculated) {
      return `Auto: ${calculated}`;
    } else {
      return 'Total Ton × Baht/Ton';
    }
  };

  // Get placeholder text for Total Ton field
  const getTotalTonPlaceholder = () => {
    if (newRow.ton) {
      return `Auto: ${newRow.ton}`;
    } else {
      return 'Same as Ton';
    }
  };

  // Get placeholder text for Total field
  const getTotalPlaceholder = () => {
    const calculated = getCalculatedTotal();
    if (calculated) {
      return `Auto: ${calculated}`;
    } else {
      return 'Amount + VAT';
    }
  };

  const handleCompanyChange = async (newCompany: string) => {
    if (!report) return;
    
    const updatedReport = {
      ...report,
      report_info: {
        ...report.report_info,
        company: newCompany
      }
    };
    
    try {
      const response = await fetch(`${API_BASE}/landfill-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedReport),
      });
      if (response.ok) {
        setReport(updatedReport);
      }
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handlePeriodChange = async (newPeriod: string) => {
    if (!report) return;
    
    const updatedReport = {
      ...report,
      report_info: {
        ...report.report_info,
        period: newPeriod
      }
    };
    
    try {
      const response = await fetch(`${API_BASE}/landfill-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedReport),
      });
      if (response.ok) {
        setReport(updatedReport);
      }
    } catch (error) {
      console.error('Error updating period:', error);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await fetch(`${API_BASE}/landfill-report`);
      const data = await response.json();
      if (data.message) {
        // No report exists, create a default one
        await createDefaultReport();
      } else {
        setReport(data);
        // Set header title from report data
        if (data.report_info?.title) {
          console.log('Loading title from data:', data.report_info.title);
          setHeaderTitle(data.report_info.title);
        } else {
          // Fallback to default title if no title in data
          console.log('No title in data, using default');
          setHeaderTitle('TPI POLENE POWER PUBLIC COMPANY LIMITED LANDFILL REPORT');
        }
        // Set quota weight from report data
        if (data.report_info?.quota_weight) {
          setQuotaWeightValue(data.report_info.quota_weight);
        }
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const createDefaultReport = async () => {
    const defaultReport: LandfillReport = {
      report_info: {
        title: "TPI POLENE POWER PUBLIC COMPANY LIMITED LANDFILL REPORT",
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
          receive_ton: undefined,
          ton: undefined,
          gcv: undefined,
          multi: undefined,
          price: undefined,
          total_ton: undefined,
          baht_per_ton: undefined,
          amount: undefined,
          vat: undefined,
          total: undefined,
          remark: ''
        });
        setPricingType('gcv');
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

  const handleEditRow = (id: number) => {
    const rowToEdit = report?.data_rows.find(row => row.id === id);
    if (rowToEdit) {
      setEditingRow(id);
      // Ensure all fields have proper default values
      setEditData({
        id: rowToEdit.id,
        receive_ton: rowToEdit.receive_ton || undefined,
        ton: rowToEdit.ton || 0,
        gcv: rowToEdit.gcv || undefined,
        multi: rowToEdit.multi || undefined,
        price: rowToEdit.price || undefined,
        total_ton: rowToEdit.total_ton || 0,
        baht_per_ton: rowToEdit.baht_per_ton || 0,
        amount: rowToEdit.amount || 0,
        vat: rowToEdit.vat || 0,
        total: rowToEdit.total || 0,
        remark: rowToEdit.remark || ''
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRow || !editData) return;
    
    try {
      const response = await fetch(`${API_BASE}/landfill-report/row/${editingRow}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });
      
      if (response.ok) {
        setEditingRow(null);
        setEditData({});
        fetchReport();
      }
    } catch (error) {
      console.error('Error updating row:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleEditHeader = () => {
    setEditingHeader(true);
  };

  const handleSaveHeader = async () => {
    try {
      console.log('Saving header title:', headerTitle);
      const response = await fetch(`${API_BASE}/landfill-report`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...report,
          report_info: {
            ...report?.report_info,
            title: headerTitle
          }
        }),
      });
      
      console.log('Save response status:', response.status);
      
      if (response.ok) {
        console.log('Header saved successfully');
        setEditingHeader(false);
        fetchReport(); // Refresh the report data
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        alert('Failed to save header title. Please try again.');
      }
    } catch (error) {
      console.error('Error updating header:', error);
      alert('Error saving header title. Please try again.');
    }
  };

  const handleCancelHeaderEdit = () => {
    setEditingHeader(false);
    setHeaderTitle('TPI POLENE POWER PUBLIC COMPANY LIMITED LANDFILL REPORT');
  };

  const handleEditQuotaWeight = () => {
    setEditingQuotaWeight(true);
    if (report?.report_info?.quota_weight) {
      setQuotaWeightValue(report.report_info.quota_weight);
    }
  };

  const handleSaveQuotaWeight = async () => {
    try {
      console.log('Saving quota weight:', quotaWeightValue);
      const response = await fetch(`${API_BASE}/landfill-report`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...report,
          report_info: {
            ...report?.report_info,
            quota_weight: quotaWeightValue
          }
        }),
      });
      
      console.log('Quota weight save response status:', response.status);
      
      if (response.ok) {
        console.log('Quota weight saved successfully');
        setEditingQuotaWeight(false);
        fetchReport(); // Refresh the report data
      } else {
        const errorData = await response.json();
        console.error('Quota weight save failed:', errorData);
        alert('Failed to save quota weight. Please try again.');
      }
    } catch (error) {
      console.error('Error updating quota weight:', error);
      alert('Error saving quota weight. Please try again.');
    }
  };

  const handleCancelQuotaWeightEdit = () => {
    setEditingQuotaWeight(false);
    if (report?.report_info?.quota_weight) {
      setQuotaWeightValue(report.report_info.quota_weight);
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
      {/* Revision Management Controls */}
      <div className="revision-controls">
        <div className="revision-status">
          <span className={`status-badge status-${isEditing ? 'editing' : 'saved'}`}>
            {isEditing ? 'EDITING' : 'SAVED'}
          </span>
          <span className="version-badge">v{reportVersion}</span>
          {lockedBy && (
            <span className="lock-info">
              🔒 Locked by {lockedBy}
            </span>
          )}
          <span className="last-updated">
            Last updated: {new Date().toLocaleString()} by {currentUser}
          </span>
        </div>
        
        <div className="revision-actions">
          {reportStatus === 'draft' && !lockedBy && (
            <button 
              className="btn btn-warning btn-sm"
              onClick={lockReport}
              title="Lock report for editing"
            >
              🔒 Lock
            </button>
          )}
          
          {reportStatus === 'locked' && lockedBy === currentUser && (
            <button 
              className="btn btn-warning btn-sm"
              onClick={unlockReport}
              title="Unlock report"
            >
              🔓 Unlock
            </button>
          )}
          
          {(reportStatus === 'draft' || (reportStatus === 'locked' && lockedBy === currentUser)) && (
            <button 
              className="btn btn-success btn-sm"
              onClick={saveReportWithVersion}
              title="Save with version control"
            >
              💾 Save Version
            </button>
          )}
          
          <button 
            className="btn btn-info btn-sm"
            onClick={() => setShowAttachments(!showAttachments)}
            title="View and manage attachments"
          >
            📎 Attachments ({attachments.length})
          </button>
          
          <input
            id="attachment-input"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
            style={{ display: 'none' }}
            onChange={handleAttachmentUpload}
          />
          
          <button 
            className="btn btn-danger btn-sm"
            onClick={clearViewState}
            title="Clear View"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Attachment Management Panel */}
      {showAttachments && (
        <div className="attachment-panel">
          <div className="attachment-header">
            <h3>📎 Report Attachments</h3>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => document.getElementById('attachment-input')?.click()}
            >
              + Add Files
            </button>
          </div>
          
          <div className="attachment-list">
            {attachments.length === 0 ? (
              <p className="no-attachments">No attachments yet. Click "Add Files" to upload documents.</p>
            ) : (
              attachments.map((attachment, index) => (
                <div key={attachment.id || index} className="attachment-item">
                  <div className="attachment-info">
                    <span className="attachment-name">{attachment.filename}</span>
                    <span className="attachment-size">{formatFileSize(attachment.size)}</span>
                    <span className="attachment-date">
                      {new Date(attachment.uploaded_at).toLocaleDateString()}
                    </span>
                    <span className="attachment-user">by {attachment.uploaded_by}</span>
                  </div>
                  <div className="attachment-actions">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => window.open(`${API_BASE}/attachments/${report?.id}/${attachment.saved_filename}`, '_blank')}
                    >
                      👁️ View
                    </button>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${API_BASE}/attachments/${report?.id}/${attachment.saved_filename}`;
                        link.download = attachment.filename;
                        link.click();
                      }}
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <header className="report-header">
        <div className="header-row">
          {editingHeader ? (
            <div className="header-edit-container">
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                className="header-edit-input"
                autoFocus
              />
              <div className="header-edit-buttons">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={handleSaveHeader}
                  title="Save Changes"
                >
                  ✓
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleCancelHeaderEdit}
                  title="Cancel Edit"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <h1 onClick={handleEditHeader} className="editable-header">
              {headerTitle}
              <span className="edit-icon" title="Click to edit">✏️</span>
            </h1>
          )}
        </div>
        <div className="report-info">
          <div className="info-item">
            <span className="label">Period:</span>
            <select 
              className="dropdown-select"
              value={report.report_info.period}
              onChange={(e) => handlePeriodChange(e.target.value)}
            >
              {periodOptions.map((period) => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
          <div className="info-item">
            <span className="label">Company:</span>
            <select 
              className="dropdown-select"
              value={report.report_info.company}
              onChange={(e) => handleCompanyChange(e.target.value)}
            >
              {companyOptions.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          <div className="info-item">
            <span className="label">Report ID:</span>
            <span className="value">{report.report_info.report_id}</span>
          </div>
          <div className="info-item">
            <span className="label">Quota Weight:</span>
            {editingQuotaWeight ? (
              <div className="quota-weight-edit-container">
                <input
                  type="number"
                  value={quotaWeightValue}
                  onChange={(e) => setQuotaWeightValue(parseFloat(e.target.value) || 0)}
                  className="quota-weight-edit-input"
                  autoFocus
                />
                <div className="quota-weight-edit-buttons">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={handleSaveQuotaWeight}
                    title="Save Changes"
                  >
                    ✓
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={handleCancelQuotaWeightEdit}
                    title="Cancel Edit"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <span 
                className="value editable-quota-weight" 
                onClick={handleEditQuotaWeight}
                title="Click to edit"
              >
                {report.report_info.quota_weight?.toLocaleString() || 'N/A'}
                <span className="edit-icon-small">✏️</span>
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="table-controls">
        
      </div>

      {showAddForm && (
        <div className="add-row-form">
          <h3>Add New Row</h3>
          <form onSubmit={addRow}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Pricing Type:</label>
                <select 
                  className="dropdown-select"
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as 'gcv' | 'fixed')}
                >
                  <option value="gcv">GCV Based Pricing</option>
                  <option value="fixed">Fixed Rate Pricing</option>
                </select>
              </div>
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
                  onChange={(e) => setNewRow({...newRow, ton: parseFloat(e.target.value) || undefined})}
                />
              </div>
              {pricingType === 'gcv' && (
                <>
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
                </>
              )}
              <div className="form-group">
                <label>Total Ton: (Auto-updates)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.total_ton || ''}
                  onChange={(e) => setNewRow({...newRow, total_ton: parseFloat(e.target.value) || undefined})}
                  placeholder={getTotalTonPlaceholder()}
                  className="calculated-field"
                />
              </div>
              <div className="form-group">
                <label>Baht/Ton: {pricingType === 'gcv' ? '(Auto-updates)' : ''}</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.baht_per_ton || ''}
                  onChange={(e) => setNewRow({...newRow, baht_per_ton: parseFloat(e.target.value) || undefined})}
                  placeholder={getBahtPerTonPlaceholder()}
                  className={pricingType === 'gcv' ? 'calculated-field' : ''}
                />
              </div>
              <div className="form-group">
                <label>Amount: (Auto-updates)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.amount || ''}
                  onChange={(e) => setNewRow({...newRow, amount: parseFloat(e.target.value) || undefined})}
                  placeholder={getAmountPlaceholder()}
                  className="calculated-field"
                />
              </div>
              <div className="form-group">
                <label>VAT:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.vat || ''}
                  onChange={(e) => setNewRow({...newRow, vat: parseFloat(e.target.value) || undefined})}
                />
              </div>
              <div className="form-group">
                <label>Total: (Auto-updates)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRow.total || ''}
                  onChange={(e) => setNewRow({...newRow, total: parseFloat(e.target.value) || undefined})}
                  placeholder={getTotalPlaceholder()}
                  className="calculated-field"
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

      <div className="table-header-controls">
        <div className="table-actions">
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
                <tr key={row.id} className={editingRow === row.id ? 'editing-row' : ''}>
                  {editingRow === row.id ? (
                    // Edit mode
                    <>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.receive_ton || ''}
                          onChange={(e) => setEditData({...editData, receive_ton: parseFloat(e.target.value) || undefined})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.ton || ''}
                          onChange={(e) => setEditData({...editData, ton: parseFloat(e.target.value) || 0})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.gcv || ''}
                          onChange={(e) => setEditData({...editData, gcv: parseFloat(e.target.value) || undefined})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.multi || ''}
                          onChange={(e) => setEditData({...editData, multi: parseFloat(e.target.value) || undefined})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.price || ''}
                          onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value) || undefined})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.total_ton || ''}
                          onChange={(e) => setEditData({...editData, total_ton: parseFloat(e.target.value) || 0})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.baht_per_ton || ''}
                          onChange={(e) => setEditData({...editData, baht_per_ton: parseFloat(e.target.value) || 0})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.amount || ''}
                          onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value) || 0})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.vat || ''}
                          onChange={(e) => setEditData({...editData, vat: parseFloat(e.target.value) || 0})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.total || ''}
                          onChange={(e) => setEditData({...editData, total: parseFloat(e.target.value) || 0})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editData.remark || ''}
                          onChange={(e) => setEditData({...editData, remark: e.target.value})}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={handleSaveEdit}
                            title="Save Changes"
                          >
                            ✓
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={handleCancelEdit}
                            title="Cancel Edit"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Normal display mode
                    <>
                      <td>{row.receive_ton?.toLocaleString() || ''}</td>
                      <td>{row.ton?.toLocaleString() || ''}</td>
                      <td>{row.gcv?.toLocaleString() || ''}</td>
                      <td>{row.multi?.toLocaleString() || ''}</td>
                      <td>{row.price?.toLocaleString() || ''}</td>
                      <td>{row.total_ton?.toLocaleString() || ''}</td>
                      <td>{row.baht_per_ton?.toLocaleString() || ''}</td>
                      <td>{row.amount?.toLocaleString() || ''}</td>
                      <td>{row.vat?.toLocaleString() || ''}</td>
                      <td>{row.total?.toLocaleString() || ''}</td>
                      <td>{row.remark || ''}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-edit btn-sm"
                            onClick={() => handleEditRow(row.id!)}
                            title="Edit Row"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteRow(row.id!)}
                            title="Delete Row"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              <tr className="totals-row">
                <td><strong>{report.totals.receive_ton?.toLocaleString() || ''}</strong></td>
                <td><strong>{report.totals.ton?.toLocaleString() || ''}</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td><strong>{report.totals.total_ton?.toLocaleString() || ''}</strong></td>
                <td></td>
                <td><strong>{report.totals.amount?.toLocaleString() || ''}</strong></td>
                <td><strong>{report.totals.vat?.toLocaleString() || ''}</strong></td>
                <td><strong>{report.totals.total?.toLocaleString() || ''}</strong></td>
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
            <span className="value">{report.additional_info.difference_adjustment?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Adjustment Amount:</span>
            <span className="value">{report.additional_info.adjustment_amount?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandfillReport;

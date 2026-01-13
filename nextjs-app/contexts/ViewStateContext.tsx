import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useViewStates } from '../hooks/useViewState';

interface ViewStateContextType {
  // Global UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Data lookbook state
  activeTab: number;
  setActiveTab: (tab: number) => void;
  selectedDataSource: string;
  setSelectedDataSource: (source: string) => void;
  
  // Table viewer state
  tableSearchTerm: string;
  setTableSearchTerm: (term: string) => void;
  tableSortBy: string;
  setTableSortBy: (sortBy: string) => void;
  tableSortOrder: 'asc' | 'desc';
  setTableSortOrder: (order: 'asc' | 'desc') => void;
  tablePage: number;
  setTablePage: (page: number) => void;
  tableRowsPerPage: number;
  setTableRowsPerPage: (rows: number) => void;
  
  // Interactive explorer state
  expandedNodes: string[];
  setExpandedNodes: (nodes: string[]) => void;
  selectedNode: string | null;
  setSelectedNode: (node: string | null) => void;
  
  // Data overview state
  overviewFilters: Record<string, any>;
  setOverviewFilters: (filters: Record<string, any>) => void;
  
  
  // Global preferences
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
  autoSave: boolean;
  setAutoSave: (autoSave: boolean) => void;
  
  // Utility functions
  clearAllStates: () => void;
  exportViewState: () => string;
  importViewState: (stateJson: string) => boolean;
}

const ViewStateContext = createContext<ViewStateContextType | undefined>(undefined);

interface ViewStateProviderProps {
  children: ReactNode;
}

export const ViewStateProvider: React.FC<ViewStateProviderProps> = ({ children }) => {
  const {
    viewStates,
    isLoaded,
    updateState,
    clearAllStates: clearAll
  } = useViewStates({
    // Global UI state
    sidebarOpen: true,
    
    // Data lookbook state
    activeTab: 0,
    selectedDataSource: 'landfill-report',
    
    // Table viewer state
    tableSearchTerm: '',
    tableSortBy: '',
    tableSortOrder: 'asc',
    tablePage: 0,
    tableRowsPerPage: 10,
    
    // Interactive explorer state
    expandedNodes: [],
    selectedNode: null,
    
    // Data overview state
    overviewFilters: {},
    
    
    // Global preferences
    theme: 'light',
    compactMode: false,
    autoSave: true
  });

  // Clear all states function
  const clearAllStates = () => {
    clearAll();
    console.log('🗑️ All view states cleared');
  };


  // Export view state
  const exportViewState = () => {
    return JSON.stringify(viewStates, null, 2);
  };

  // Import view state
  const importViewState = (stateJson: string) => {
    try {
      const importedState = JSON.parse(stateJson);
      
      // Validate the imported state
      if (typeof importedState === 'object' && importedState !== null) {
        Object.entries(importedState).forEach(([key, value]) => {
          updateState(key, value);
        });
        console.log('✅ View state imported successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing view state:', error);
      return false;
    }
  };

  const contextValue: ViewStateContextType = {
    // Global UI state
    sidebarOpen: viewStates.sidebarOpen,
    setSidebarOpen: (open: boolean) => updateState('sidebarOpen', open),
    
    // Data lookbook state
    activeTab: viewStates.activeTab,
    setActiveTab: (tab: number) => updateState('activeTab', tab),
    selectedDataSource: viewStates.selectedDataSource,
    setSelectedDataSource: (source: string) => updateState('selectedDataSource', source),
    
    // Table viewer state
    tableSearchTerm: viewStates.tableSearchTerm,
    setTableSearchTerm: (term: string) => updateState('tableSearchTerm', term),
    tableSortBy: viewStates.tableSortBy,
    setTableSortBy: (sortBy: string) => updateState('tableSortBy', sortBy),
    tableSortOrder: viewStates.tableSortOrder,
    setTableSortOrder: (order: 'asc' | 'desc') => updateState('tableSortOrder', order),
    tablePage: viewStates.tablePage,
    setTablePage: (page: number) => updateState('tablePage', page),
    tableRowsPerPage: viewStates.tableRowsPerPage,
    setTableRowsPerPage: (rows: number) => updateState('tableRowsPerPage', rows),
    
    // Interactive explorer state
    expandedNodes: viewStates.expandedNodes,
    setExpandedNodes: (nodes: string[]) => updateState('expandedNodes', nodes),
    selectedNode: viewStates.selectedNode,
    setSelectedNode: (node: string | null) => updateState('selectedNode', node),
    
    // Data overview state
    overviewFilters: viewStates.overviewFilters,
    setOverviewFilters: (filters: Record<string, any>) => updateState('overviewFilters', filters),
    
    
    // Global preferences
    theme: viewStates.theme,
    setTheme: (theme: 'light' | 'dark') => updateState('theme', theme),
    compactMode: viewStates.compactMode,
    setCompactMode: (compact: boolean) => updateState('compactMode', compact),
    autoSave: viewStates.autoSave,
    setAutoSave: (autoSave: boolean) => updateState('autoSave', autoSave),
    
    // Utility functions
    clearAllStates,
    exportViewState,
    importViewState
  };

  // Show loading state until view states are loaded
  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading view state...
      </div>
    );
  }

  return (
    <ViewStateContext.Provider value={contextValue}>
      {children}
    </ViewStateContext.Provider>
  );
};

export const useViewStateContext = () => {
  const context = useContext(ViewStateContext);
  if (context === undefined) {
    throw new Error('useViewStateContext must be used within a ViewStateProvider');
  }
  return context;
};

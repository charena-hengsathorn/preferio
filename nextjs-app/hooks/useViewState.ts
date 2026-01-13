import { useState, useEffect, useCallback } from 'react';

interface ViewState {
  [key: string]: any;
}

interface UseViewStateOptions {
  key: string;
  defaultValue?: any;
  persist?: boolean;
  debounceMs?: number;
}

/**
 * Custom hook for managing view state with optional persistence
 * @param key - Unique key for this view state
 * @param defaultValue - Default value if no saved state exists
 * @param persist - Whether to persist state to localStorage (default: true)
 * @param debounceMs - Debounce delay for saving state (default: 300ms)
 */
export const useViewState = <T>(
  key: string,
  defaultValue: T,
  options: Partial<UseViewStateOptions> = {}
): [T, (value: T) => void, () => void] => {
  const {
    persist = true,
    debounceMs = 300
  } = options;

  const [state, setState] = useState<T>(defaultValue);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    if (persist && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`view_state_${key}`);
        if (saved) {
          const parsedValue = JSON.parse(saved);
          setState(parsedValue);
        }
      } catch (error) {
        console.error(`Error loading view state for key "${key}":`, error);
      }
    }
  }, [key, persist]);

  // Debounced save function
  const saveState = useCallback((value: T) => {
    if (!persist || typeof window === 'undefined') return;

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(`view_state_${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving view state for key "${key}":`, error);
      }
    }, debounceMs);

    setSaveTimeout(timeout);
  }, [key, persist, debounceMs]);

  // Update state and save
  const setValue = useCallback((value: T) => {
    setState(value);
    saveState(value);
  }, [saveState]);

  // Clear saved state
  const clearState = useCallback(() => {
    if (persist && typeof window !== 'undefined') {
      localStorage.removeItem(`view_state_${key}`);
    }
    setState(defaultValue);
  }, [key, persist, defaultValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return [state, setValue, clearState];
};

/**
 * Hook for managing multiple view states at once
 */
export const useViewStates = (states: Record<string, any>) => {
  const [viewStates, setViewStates] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all states from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadedStates: Record<string, any> = {};
    
    Object.entries(states).forEach(([key, defaultValue]) => {
      try {
        const saved = localStorage.getItem(`view_state_${key}`);
        loadedStates[key] = saved ? JSON.parse(saved) : defaultValue;
      } catch (error) {
        console.error(`Error loading view state for key "${key}":`, error);
        loadedStates[key] = defaultValue;
      }
    });

    setViewStates(loadedStates);
    setIsLoaded(true);
  }, []);

  // Update a specific state
  const updateState = useCallback((key: string, value: any) => {
    setViewStates(prev => {
      const newStates = { ...prev, [key]: value };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`view_state_${key}`, JSON.stringify(value));
        } catch (error) {
          console.error(`Error saving view state for key "${key}":`, error);
        }
      }
      
      return newStates;
    });
  }, []);

  // Clear a specific state
  const clearState = useCallback((key: string) => {
    setViewStates(prev => {
      const newStates = { ...prev, [key]: states[key] };
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`view_state_${key}`);
      }
      
      return newStates;
    });
  }, [states]);

  // Clear all states
  const clearAllStates = useCallback(() => {
    if (typeof window !== 'undefined') {
      Object.keys(states).forEach(key => {
        localStorage.removeItem(`view_state_${key}`);
      });
    }
    setViewStates(states);
  }, [states]);

  return {
    viewStates,
    isLoaded,
    updateState,
    clearState,
    clearAllStates
  };
};

/**
 * Hook for managing tab state with persistence
 */
export const useTabState = (defaultTab: number = 0, key: string = 'activeTab') => {
  return useViewState(key, defaultTab, { persist: true });
};

/**
 * Hook for managing form state with persistence
 */
export const useFormState = <T>(defaultForm: T, key: string) => {
  return useViewState(key, defaultForm, { persist: true, debounceMs: 500 });
};

/**
 * Hook for managing UI preferences
 */
export const useUIPreferences = () => {
  return useViewStates({
    theme: 'light',
    sidebarOpen: true,
    compactMode: false,
    autoSave: true,
    notifications: true
  });
};

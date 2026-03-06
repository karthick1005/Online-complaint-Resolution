import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing complaint filters with URL sync
 * 
 * Features:
 * - URL state synchronization (shareable filtered URLs)
 * - Local state management
 * - Reset filters functionality
 * - Computed filter state
 * 
 * @returns {Object} Filter state and control functions
 */
export const useComplaintFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    departmentId: searchParams.get('department') || 'all',
    searchTerm: searchParams.get('search') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    slaBreached: searchParams.get('slaBreached') === 'true',
  });

  // Update a single filter
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      // Sync to URL
      const newParams = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v && v !== 'all' && v !== '' && v !== false) {
          newParams.set(k, v);
        }
      });
      setSearchParams(newParams);
      
      return newFilters;
    });
  }, [setSearchParams]);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      
      // Sync to URL
      const newParams = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        if (v && v !== 'all' && v !== '' && v !== false) {
          newParams.set(k, v);
        }
      });
      setSearchParams(newParams);
      
      return updated;
    });
  }, [setSearchParams]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      status: 'all',
      priority: 'all',
      departmentId: 'all',
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      slaBreached: false,
    };
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.priority !== 'all' ||
      filters.departmentId !== 'all' ||
      filters.searchTerm !== '' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.slaBreached === true
    );
  }, [filters]);

  // Get API-ready filter object (remove 'all' values)
  const apiFilters = useMemo(() => {
    const cleanFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '' && value !== false) {
        cleanFilters[key] = value;
      }
    });
    return cleanFilters;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      (v) => v && v !== 'all' && v !== '' && v !== false
    ).length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    apiFilters,
    activeFilterCount,
  };
};

/**
 * Hook for managing saved filter presets
 */
export const useSavedFilters = () => {
  const STORAGE_KEY = 'complaint_filter_presets';

  const [savedFilters, setSavedFilters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const saveFilter = useCallback((name, filters) => {
    const preset = {
      id: Date.now(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    
    setSavedFilters((prev) => {
      const updated = [...prev, preset];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteFilter = useCallback((id) => {
    setSavedFilters((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadFilter = useCallback((id) => {
    const preset = savedFilters.find((f) => f.id === id);
    return preset?.filters || null;
  }, [savedFilters]);

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    loadFilter,
  };
};

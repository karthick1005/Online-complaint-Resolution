/**
 * Saved Filters Hook
 * 
 * Manages saved filter presets in localStorage
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'complaint_saved_filters';

export const useSavedFilters = () => {
  const [savedFilters, setSavedFilters] = useState([]);

  // Load saved filters from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }, []);

  // Save filter preset
  const saveFilter = (filters, name) => {
    const filterName = name || prompt('Enter a name for this filter preset:');
    if (!filterName) return;

    const newFilter = {
      id: Date.now(),
      name: filterName,
      filters,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Delete filter preset
  const deleteFilter = (id) => {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Apply saved filter
  const applySavedFilter = (savedFilter) => {
    return savedFilter.filters;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSavedFilters([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    applySavedFilter,
    clearAllFilters,
  };
};

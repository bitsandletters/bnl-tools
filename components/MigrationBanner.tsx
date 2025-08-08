// ABOUTME: Migration banner to help users transition from localStorage to URL-based storage

'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/localStorage';
import { urlStorage } from '@/lib/urlStorage';

export default function MigrationBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    // Check if there's localStorage data but no URL data
    const hasLocalData = () => {
      if (typeof window === 'undefined') return false;
      
      try {
        const scales = localStorage.getItem('color-tool-scales');
        const settings = localStorage.getItem('color-tool-settings');
        return (scales && scales !== '[]') || (settings && settings !== '{}');
      } catch {
        return false;
      }
    };

    const hasUrlData = urlStorage.hasData();
    
    if (hasLocalData() && !hasUrlData) {
      setShowBanner(true);
    }
  }, []);

  const migrateData = () => {
    setIsMigrating(true);
    
    try {
      // Get data from localStorage
      const scales = storage.getScales();
      const settings = storage.getSettings();
      
      // Save to URL
      urlStorage.saveState({
        scales,
        prefix: settings.prefix,
        useThemeBlock: settings.useThemeBlock,
      });
      
      // Clear localStorage
      storage.clear();
      
      // Hide banner
      setShowBanner(false);
      
      // Reload page to apply the new state
      window.location.reload();
    } catch (error) {
      console.error('Migration failed:', error);
      setIsMigrating(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4" style={{ backgroundColor: 'var(--app-color-warning-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--app-color-text-normal)' }}>
              We've updated to URL-based storage! Your color scales are still saved locally. 
              <button
                onClick={migrateData}
                disabled={isMigrating}
                className="ml-2 underline font-semibold disabled:opacity-50"
                style={{ color: 'var(--app-color-text-normal)' }}
              >
                {isMigrating ? 'Migrating...' : 'Migrate now'}
              </button>
            </p>
          </div>
          <button
            onClick={dismissBanner}
            className="ml-4 text-sm font-medium"
            style={{ color: 'var(--app-color-text-quiet)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--app-color-text-normal)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--app-color-text-quiet)'}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
} 
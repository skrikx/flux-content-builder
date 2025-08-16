import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/store/session';
import { useBrandStore } from '@/store/brands';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, init } = useSessionStore();
  const { initFromDb, refreshFromDb } = useBrandStore();

  useEffect(() => { 
    console.log('[ProtectedRoute] Initializing session...');
    init(); 
  }, [init]);
  
  useEffect(() => { 
    if (user?.isAuthenticated) {
      console.log('[ProtectedRoute] User authenticated, initializing brands...');
      initFromDb().catch((e) => {
        console.error('[ProtectedRoute] Failed to initialize brands:', e);
      }); 
    }
  }, [user?.isAuthenticated, initFromDb]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!user?.isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
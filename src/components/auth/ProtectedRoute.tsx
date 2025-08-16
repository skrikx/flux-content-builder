import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/store/session';
import { useBrandStore } from '@/store/brands';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, init } = useSessionStore();
  const { initFromDb } = useBrandStore();

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (user?.id) initFromDb().catch(()=>{}); }, [user?.id, initFromDb]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!user?.isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
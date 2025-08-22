import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { useSessionStore } from '@/store/session';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const { user, isLoading, init, login, signup } = useSessionStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { init(); }, [init]);

  // Redirect if already authenticated
  if (user?.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(email, password);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Auth error';
      setErr(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flux-hero-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40" />
      
      <div className="relative z-10 w-full max-w-md p-6">
        <Card className="flux-panel shadow-[var(--shadow-modal)]">
          <CardHeader className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl flux-gradient-bg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold">
              {mode === 'login' ? 'Welcome Back' : 'Join FluxContent'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Sign in to start creating' : 'Create your account to get started'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              
              {err && <div className="text-destructive text-sm">{err}</div>}
              
              <Button 
                type="submit" 
                className="w-full flux-gradient-bg text-white hover:opacity-90 flux-transition"
                disabled={isLoading}
              >
                {isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Sign Up')}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost"
                className="w-full"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
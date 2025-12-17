import { useState } from 'react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Truck, Loader2, AlertCircle } from 'lucide-react';
import { login as apiLogin } from '../../services/api';

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useDemo, setUseDemo] = useState(false); // Default to API mode

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo mode - for quick testing without backend
    if (useDemo) {
      setTimeout(() => {
        if (email === 'owner@fleet.com' && password === 'password123') {
          onLogin('owner');
        } else if (email === 'supervisor@fleet.com' && password === 'password123') {
          onLogin('supervisor');
        } else if (email === 'owner' && password === 'owner') {
          onLogin('owner');
        } else if (email === 'supervisor' && password === 'supervisor') {
          onLogin('supervisor');
        } else {
          setError('Invalid credentials. Check demo credentials below.');
        }
        setLoading(false);
      }, 500);
      return;
    }

    // API mode - connect to backend
    try {
      const response = await apiLogin(email, password);
      if (response.user) {
        onLogin(response.user.role || 'supervisor');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    if (role === 'owner') {
      setEmail('owner@fleet.com');
      setPassword('password123');
    } else {
      setEmail('supervisor@fleet.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-slate-700">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-[#10b981] p-4 rounded-full">
              <Truck className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">FleetMaster Pro</CardTitle>
          <CardDescription className="text-base">
            Fleet Management & Telematics System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#0f172a] hover:bg-[#1e293b]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-center text-slate-500 mb-3">Quick Demo Login:</p>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => fillDemoCredentials('owner')}
                >
                  Owner
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => fillDemoCredentials('supervisor')}
                >
                  Supervisor
                </Button>
              </div>
              <p className="text-xs text-center text-slate-400 mt-3">
                Demo Password: password123
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDemo}
                  onChange={(e) => setUseDemo(e.target.checked)}
                  className="rounded"
                />
                Demo Mode (no backend required)
              </label>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

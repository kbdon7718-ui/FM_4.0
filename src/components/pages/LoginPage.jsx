import { useState } from 'react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card.jsx';
import { Truck, Loader2, AlertCircle } from 'lucide-react';
import { login as apiLogin } from '../../services/api';

/**
 * LoginPage
 * Supports OWNER, SUPERVISOR, FLEET
 */
export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useDemo, setUseDemo] = useState(true); // default demo ON

  /* ===============================
     DIRECT LOGIN (NO CREDENTIALS)
     =============================== */
  const directLogin = (role) => {
    // Temporary direct access (DEV ONLY)
    onLogin(role, { role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    /* ---------------- DEMO MODE ---------------- */
    if (useDemo) {
      setTimeout(() => {
        if (email.includes('owner')) onLogin('OWNER');
        else if (email.includes('supervisor')) onLogin('SUPERVISOR');
        else if (email.includes('fleet')) onLogin('FLEET');
        else setError('Invalid demo credentials');
        setLoading(false);
      }, 500);
      return;
    }

    /* ---------------- REAL LOGIN (COMMENTED FOR NOW) ---------------- */
    /*
    try {
      const response = await apiLogin(email, password);

      if (!response?.user?.role) {
        throw new Error('Invalid login response');
      }

      onLogin(response.user.role, response.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
    */

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <Card className="w-full max-w-md border-slate-700 shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 shadow-lg">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-3xl tracking-tight">
            FleetMaster Pro
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Fleet Operations, Fuel Intelligence & SLA Monitoring
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ===============================
              DIRECT LOGIN BUTTONS
              =============================== */}
          <div className="space-y-3">
            <Button
              className="w-full bg-blue-600 hover:bg-emerald-700"
              onClick={() => directLogin('OWNER')}
            >
              Login as Owner
            </Button>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => directLogin('SUPERVISOR')}
            >
              Login as Supervisor
            </Button>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => directLogin('FLEET')}
            >
              Login as Fleet
            </Button>
          </div>

          {/* ===============================
              EMAIL / PASSWORD (COMMENTED)
              =============================== */}
          {/*
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          */}

          <p className="text-xs text-center text-slate-500">
            ⚠ Direct login enabled for development only
          </p>

        </CardContent>
      </Card>
    </div>
  );
}

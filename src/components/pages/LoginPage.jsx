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

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useDemo, setUseDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (useDemo) {
      setTimeout(() => {
        if (email.includes('owner')) onLogin('owner');
        else if (email.includes('supervisor')) onLogin('supervisor');
        else setError('Invalid demo credentials');
        setLoading(false);
      }, 600);
      return;
    }

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

  const fillDemo = (role) => {
    setEmail(`${role}@fleet.com`);
    setPassword('password123');
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

        <CardContent>
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
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

            {/* Demo Section */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Demo access (no backend)</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDemo}
                    onChange={(e) => setUseDemo(e.target.checked)}
                  />
                  Enable
                </label>
              </div>

              {useDemo && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => fillDemo('owner')}
                  >
                    Owner Demo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => fillDemo('supervisor')}
                  >
                    Supervisor Demo
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

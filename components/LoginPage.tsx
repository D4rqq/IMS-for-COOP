import React, { useState, FormEvent } from 'react';
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, WarningIcon } from './icons/Icons';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic sanitization to remove potential HTML tags from the username.
    const sanitizedUsername = username.replace(/<[^>]*>?/gm, '');
    
    const success = onLogin(sanitizedUsername, password);

    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://dhvsu.edu.ph/images/about_pampanga_state_u/pampanga-state-u-logo-small.png"
            alt="PSU Logo"
            className="h-20 w-20 mb-4 mx-auto"
          />
          <h1 className="text-3xl font-extrabold text-psu-maroon tracking-wider">PSU Coop IMS</h1>
          <p className="mt-2 text-slate-500">Welcome! Please sign in to access the portal.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-2xl p-8 animate-fade-in-scale">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                 </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full rounded-md border-slate-300 py-3 pl-10 pr-3 text-black shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-psu-maroon/80 sm:text-sm"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockIcon className="h-5 w-5 text-slate-400" />
                 </div>
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-slate-300 py-3 pl-10 pr-10 text-black shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-psu-maroon/80 sm:text-sm"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-psu-maroon"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-md flex items-center space-x-3">
                  <WarningIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-psu-maroon hover:bg-psu-maroon/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-psu-maroon/80 transition-all duration-300 hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
            <div className="inline-block bg-slate-100 border border-slate-200 rounded-lg px-4 py-2">
                <p className="text-xs text-slate-500">
                    For demonstration: use <span className="font-semibold text-slate-600">admin</span> / <span className="font-semibold text-slate-600">password</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
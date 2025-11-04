'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dominant py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-secondary border border-gray-700 p-8 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent-gradient rounded-lg flex items-center justify-center">
              <span className="text-dominant font-bold text-xl font-mono">FG</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-sans">
            Sign in to FlashGenius AI
          </h2>
          <p className="mt-2 text-center text-sm text-white/75 font-mono">
            Transform your documents into intelligent flashcards
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl font-mono text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-dominant placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-start focus:border-accent-start transition-all font-mono"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-600 bg-dominant placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-start focus:border-accent-start transition-all font-mono"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-dominant bg-accent-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-start disabled:opacity-50 transition-all font-sans uppercase"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/register" className="text-accent-start hover:text-accent-end transition-colors font-mono text-sm">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
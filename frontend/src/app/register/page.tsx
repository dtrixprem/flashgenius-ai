'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
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
            <div className="flex justify-start">
          <img src="/logo.PNG" alt="FG" className="h-20 w-20" />
        </div>
          </div>
          <h2 className="mt-6 text-center text-3xl text-white font-extrabold font-sans">
            Create your FlashGenius AI account
          </h2>
          <p className="mt-2 text-center text-sm text-white/75 font-mono">
            Start generating intelligent flashcards today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl font-mono text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-600 bg-dominant placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-start focus:border-accent-start transition-all font-mono"
                placeholder="First name"
              />
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-600 bg-dominant placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-start focus:border-accent-start transition-all font-mono"
                placeholder="Last name"
              />
            </div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-600 bg-dominant placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-start focus:border-accent-start transition-all font-mono"
              placeholder="Email address"
            />
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-600 bg-dominant placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-start focus:border-accent-start transition-all font-mono"
              placeholder="Password (min. 6 characters)"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-dominant bg-accent-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-start disabled:opacity-50 transition-all font-sans uppercase"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-accent-start hover:text-accent-end transition-colors font-mono text-sm">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
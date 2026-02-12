'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      router.push('/library');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0a0a0b' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-[48px] font-bold tracking-tight mb-2" style={{ color: '#0066ff' }}>
            DELIVRD
          </h1>
          <h2 className="text-[24px] font-medium tracking-tight" style={{ color: '#f5f5f7' }}>
            War Room
          </h2>
          <p className="text-[15px] mt-4" style={{ color: '#86868b' }}>
            Command center for revenue operations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div 
              className="rounded-[12px] p-4 text-[15px] font-medium"
              style={{ 
                backgroundColor: 'rgba(255, 69, 58, 0.1)',
                border: '1px solid rgba(255, 69, 58, 0.2)',
                color: '#ff453a'
              }}
            >
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-[14px] text-[17px] font-medium tracking-tight focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#151518',
                color: '#f5f5f7',
                border: '1px solid #2c2c2e',
                caretColor: '#0066ff'
              }}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-[14px] text-[17px] font-medium tracking-tight focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#151518',
                color: '#f5f5f7',
                border: '1px solid #2c2c2e',
                caretColor: '#0066ff'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-[12px] text-[17px] font-bold tracking-tight focus:outline-none focus:ring-2 disabled:opacity-50 transition-all"
            style={{
              backgroundColor: '#0066ff',
              color: '#f5f5f7'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

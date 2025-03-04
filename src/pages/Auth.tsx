
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AtSign, Key, User, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-memorylane-bg">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <button 
            onClick={() => navigate('/')}
            className="mb-8 flex items-center text-memorylane-textSecondary hover:text-memorylane-textPrimary transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to home
          </button>
          
          <div className="glassmorphism p-8 rounded-xl shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-memorylane-textPrimary">
                {isLogin ? 'Welcome Back' : 'Join Memory Lane'}
              </h1>
              <p className="text-memorylane-textSecondary mt-2">
                {isLogin 
                  ? 'Sign in to access your memories' 
                  : 'Create an account to start capturing memories'}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-memorylane-textSecondary">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-memorylane-textTertiary" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white border border-memorylane-border text-memorylane-textPrimary text-sm rounded-lg focus:ring-memorylane-accent focus:border-memorylane-accent block w-full pl-10 p-2.5"
                      placeholder="Your username"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-memorylane-textSecondary">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign size={18} className="text-memorylane-textTertiary" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border border-memorylane-border text-memorylane-textPrimary text-sm rounded-lg focus:ring-memorylane-accent focus:border-memorylane-accent block w-full pl-10 p-2.5"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-memorylane-textSecondary">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={18} className="text-memorylane-textTertiary" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border border-memorylane-border text-memorylane-textPrimary text-sm rounded-lg focus:ring-memorylane-accent focus:border-memorylane-accent block w-full pl-10 p-2.5"
                    placeholder={isLogin ? "Your password" : "Create a password"}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-memorylane-accent text-white rounded-lg py-3 px-4 hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-memorylane-accent disabled:opacity-50"
              >
                {loading 
                  ? 'Processing...' 
                  : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-memorylane-accent hover:text-memorylane-accent/80 text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

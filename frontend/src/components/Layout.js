import React from 'react';
import { useAuth } from '../utils/AuthContext';
import { LogOut, User, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">SaaS Notes</h1>
          <div className="flex items-center space-x-4">
            {user?.tenant && (
              <div className="flex items-center space-x-1">
                {user.tenant.subscription === 'pro' && <Crown className="h-5 w-5 text-yellow-500" />}
                <span className="text-sm capitalize">{user.tenant.subscription} Plan</span>
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm ml-4">
                  {user.tenant.name}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{user.firstName} {user.lastName}</span>
              <button
                className="btn btn-secondary flex items-center"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
};

export default Layout;

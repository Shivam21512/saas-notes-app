import React, { useState } from 'react';
import Layout from '../components/Layout';
import { tenantsAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

const UpgradePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const res = await tenantsAPI.upgrade(user.tenant.slug);
      updateUser({ ...user, tenant: res.data.data.tenant });
      toast.success('Tenant upgraded to Pro!');
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto card text-center">
        <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
        <p className="mb-6">Pro Plan removes the note limit for your tenant.</p>
        {loading ? (
          <Loading />
        ) : (
          <button onClick={handleUpgrade} className="btn btn-primary text-lg px-8">
            Upgrade Now
          </button>
        )}
      </div>
    </Layout>
  );
};

export default UpgradePage;

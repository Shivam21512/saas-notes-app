import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Submitting login:', { email, password });
  const res = await login({ email, password });
  if (res.success) {
    navigate('/');
  } else {
    toast.error(res.message);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="card w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Login</h2>
        <input
          className="input mb-4"
          type="email"
          name="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}/>
        <input
          className="input mb-6"
          type="password"
          name="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}/>
        <button type="submit" className="btn btn-primary w-full">Sign in</button>
      </form>
    </div>
  );
};

export default LoginPage;

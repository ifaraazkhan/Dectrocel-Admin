import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authAPI from '../api/auth';
import toast from 'react-hot-toast';

const Login = () => {
  const [step, setStep]           = useState('credentials'); // 'credentials' | 'otp'
  const [mobile, setMobile]       = useState('');
  const [password, setPassword]   = useState('');
  const [otp, setOtp]             = useState(['', '', '', '']);
  const [mobileHint, setMobileHint] = useState('');
  const [loading, setLoading]     = useState(false);

  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const otpRefs   = [useRef(), useRef(), useRef(), useRef()];

  // ── Step 1: credentials ──────────────────────────────────────────────────────
  const handleCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login({
        mobile: Number(mobile),
        password,
      });

      if (response.status_code === 'dc200') {
        const { user_id, username, role, accessToken } = response.results;
        login({ user_id, username, role }, accessToken);
        toast.success('Login successful!');
        navigate('/');
      } else if (response.status_code === 'dc202' && response.results?.otp_required) {
        setMobileHint(response.results.mobile_hint);
        setStep('otp');
        toast.success('OTP sent to your mobile');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP ──────────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.verifyOtp({ mobile: Number(mobile), otp: otpValue, password });
      if (response.status_code === 'dc200') {
        const { user_id, username, role, accessToken } = response.results;
        login({ user_id, username, role }, accessToken);
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await authAPI.login({ mobile: Number(mobile), password });
      if (response.status_code === 'dc202') {
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
        toast.success('OTP resent');
      }
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600">DecXpert</h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Panel</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'credentials'
              ? 'Sign in to access the admin dashboard'
              : `Enter the OTP sent to ${mobileHint}`}
          </p>
        </div>

        {step === 'credentials' ? (
          <form className="mt-8 space-y-6" onSubmit={handleCredentials}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="mobile" className="sr-only">Mobile Number</label>
                <input
                  id="mobile" name="mobile" type="tel" required
                  value={mobile} onChange={e => setMobile(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Mobile Number"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password" name="password" type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            {/* 4-digit OTP boxes */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              type="submit" disabled={loading || otp.join('').length !== 4}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(['', '', '', '']); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <button
                type="button" disabled={loading}
                onClick={handleResendOtp}
                className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

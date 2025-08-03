import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Input, Alert } from '../ui';
import Layout from '../layout/Layout';
import { authService } from '../../services/api';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Try to get the email from the query params
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !verificationCode) {
      setError('Both email and verification code are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await authService.verifyEmail({ email, code: verificationCode });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Email Verified Successfully</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Your email has been verified. You will be redirected to the login page shortly.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Verify Your Email
          </h2>
          
          <p className="text-gray-600 mb-6 text-center">
            Please enter the verification code that was sent to your email.
          </p>
          
          {error && (
            <Alert type="error" className="mb-4" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              id="verificationCode"
              name="verificationCode"
              label="Verification Code"
              placeholder="Enter the 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button 
                onClick={() => {
                  // TODO: Implement resend code functionality
                  alert('Verification code resend functionality will be implemented soon.');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Resend Code
              </button>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default VerifyEmail;

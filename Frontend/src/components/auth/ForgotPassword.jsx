import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { Button, Card, Input, Alert } from '../ui';
import Layout from '../layout/Layout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState(null);

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await authService.forgotPassword(email);
      setRequestSent(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send password reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestSent) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Check Your Email</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  We've sent password reset instructions to {email}. Please check your inbox.
                </p>
              </div>
              <div className="mt-5">
                <Button onClick={() => setRequestSent(false)} variant="secondary" className="mr-3">
                  Try Different Email
                </Button>
                <Button onClick={() => window.location.href = '/login'}>
                  Back to Login
                </Button>
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
            Forgot Your Password?
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          
          {error && (
            <Alert type="error" className="mb-4" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Back to Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPassword;

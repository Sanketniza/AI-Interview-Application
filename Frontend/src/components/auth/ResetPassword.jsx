import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/api';
import { Button, Card, Input, Alert } from '../ui';
import Layout from '../layout/Layout';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    token: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract token and email from URL query params
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const email = queryParams.get('email');
    
    if (token && email) {
      setFormData(prev => ({
        ...prev,
        token,
        email
      }));
    }
  }, [location.search]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password should be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.token) {
      errors.token = 'Reset token is missing';
    }
    
    if (!formData.email) {
      errors.email = 'Email is missing';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await authService.resetPassword({
        token: formData.token,
        email: formData.email,
        password: formData.password
      });
      
      setResetSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (resetSuccess) {
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
              <h3 className="text-lg leading-6 font-medium text-gray-900">Password Reset Successful</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
              </div>
              <div className="mt-5">
                <Button onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (!formData.token || !formData.email) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Invalid Reset Link</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  This password reset link is invalid or expired. Please request a new one.
                </p>
              </div>
              <div className="mt-5">
                <Button onClick={() => navigate('/forgot-password')}>
                  Reset Password
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
            Reset Your Password
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Please enter your new password below.
          </p>
          
          {error && (
            <Alert type="error" className="mb-4" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="password"
              name="password"
              type="password"
              label="New Password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
            />
            
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword;

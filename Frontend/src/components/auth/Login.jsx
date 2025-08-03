import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authStart, authSuccess, authFail, clearError } from '../../redux/slices/authSlice';
import { authService } from '../../services/api';
import { Button, Card, Input, Alert } from '../ui';
import Layout from '../layout/Layout';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Clear any previous auth errors
    dispatch(clearError());
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [dispatch, navigate, isAuthenticated]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
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
    
    dispatch(authStart());
    
    try {
      const response = await authService.login(formData);
      dispatch(authSuccess({
        token: response.token,
        user: response.user
      }));
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      dispatch(authFail(errorMessage));
    }
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Log In to Your Account
          </h2>
          
          {error && (
            <Alert type="error" className="mb-4" dismissible onDismiss={() => dispatch(clearError())}>
              {error}
              {error.includes('verify') && (
                <div className="mt-2">
                  <Link to={`/verify-email${formData.email ? `?email=${encodeURIComponent(formData.email)}` : ''}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    Click here to verify your email
                  </Link>
                </div>
              )}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              required
            />
            
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
            />
            
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;

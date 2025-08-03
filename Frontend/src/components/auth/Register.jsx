import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authStart, authSuccess, authFail, clearError } from '../../redux/slices/authSlice';
import { authService } from '../../services/api';
import { Button, Card, Input, Alert } from '../ui';
import Layout from '../layout/Layout';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
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
    
    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = 'Name should be at least 3 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password should be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      console.log('Registering user:', { 
        name: formData.name, 
        email: formData.email
      });
      
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registration successful:', response);
      setRegistrationSuccess(true);
      
      // Clear the form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // We don't log the user in automatically because email verification is required
      dispatch(clearError());
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
        console.log('Server error response:', err.response.data);
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
        console.log('No response received:', err.request);
      } else {
        console.log('Request setup error:', err.message);
      }
      
      dispatch(authFail(errorMessage));
    }
  };
  
  if (registrationSuccess) {
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
              <h3 className="text-lg leading-6 font-medium text-gray-900">Registration Successful</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  We've sent a verification email to your inbox. Please check your email and verify your account to continue.
                </p>
              </div>
              <div className="mt-5 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                <Button onClick={() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`)}>
                  Enter Verification Code
                </Button>
                <Button variant="secondary" onClick={() => navigate('/login')}>
                  Go to Login
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
            Create Your Account
          </h2>
          
          {error && (
            <Alert type="error" className="mb-4" dismissible onDismiss={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="name"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              required
            />
            
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
            
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;

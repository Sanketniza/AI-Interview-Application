const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

let verificationCode = '';

// Function to register a new user
const registerUser = async () => {
  try {
    console.log('1. Registering new user...');
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    throw error;
  }
};

// Function to attempt login before verification
const attemptLoginBeforeVerification = async () => {
  try {
    console.log('2. Attempting to login before verification...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful (this should not happen):', response.data);
  } catch (error) {
    console.log('Login failed as expected:', error.response?.data);
  }
};

// Function to manually set verification code (in real scenario, check email)
const setVerificationCode = (code) => {
  verificationCode = code;
  console.log('3. Retrieved verification code:', verificationCode);
};

// Function to verify email
const verifyEmail = async () => {
  try {
    console.log('4. Verifying email...');
    const response = await axios.post(`${API_URL}/auth/verify-email`, {
      email: testUser.email,
      code: verificationCode
    });
    console.log('Email verification successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Email verification failed:', error.response?.data || error.message);
    throw error;
  }
};

// Function to login after verification
const loginAfterVerification = async () => {
  try {
    console.log('5. Logging in after verification...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

// Function to get user profile
const getUserProfile = async (token) => {
  try {
    console.log('6. Getting user profile...');
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('User profile retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get profile:', error.response?.data || error.message);
    throw error;
  }
};

// Main function to run all tests
const runTests = async () => {
  try {
    await registerUser();
    await attemptLoginBeforeVerification();
    
    // In a real scenario, you would get this from the email
    // For testing, we'll use a hardcoded value
    setVerificationCode('123456');
    
    await verifyEmail();
    const token = await loginAfterVerification();
    await getUserProfile(token);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test suite failed:', error.message);
  }
};

// Run the tests
// Note: You would need to set the verification code manually
// or update this script to extract it from your database
// runTests();

module.exports = {
  registerUser,
  attemptLoginBeforeVerification,
  setVerificationCode,
  verifyEmail,
  loginAfterVerification,
  getUserProfile,
  runTests
};

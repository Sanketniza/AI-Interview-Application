// Validation middleware for user inputs
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  
  // Validate name
  if (!name || name.trim().length < 3) {
    return res.status(400).json({ message: 'Name should be at least 3 characters long' });
  }
  
  // Validate email
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  
  // Validate password
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password should be at least 6 characters long' });
  }
  
  next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate email
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  
  // Validate password
  if (!password) {
    return res.status(400).json({ message: 'Please provide a password' });
  }
  
  next();
};

// Validation middleware for email verification
const validateEmailVerification = (req, res, next) => {
  const { email, code } = req.body;
  
  // Validate email
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  
  // Validate code
  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Please provide a valid 6-digit verification code' });
  }
  
  next();
};

// Validation middleware for forgot password
const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  
  // Validate email
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  
  next();
};

// Validation middleware for reset password
const validateResetPassword = (req, res, next) => {
  const { email, code, password } = req.body;
  
  // Validate email
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  
  // Validate code
  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Please provide a valid 6-digit reset code' });
  }
  
  // Validate password
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'New password should be at least 6 characters long' });
  }
  
  next();
};

// Validation middleware for change password
const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  // Validate current password
  if (!currentPassword) {
    return res.status(400).json({ message: 'Please provide your current password' });
  }
  
  // Validate new password
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password should be at least 6 characters long' });
  }
  
  // Check if passwords are different
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from current password' });
  }
  
  next();
};

// Validation middleware for profile update
const validateProfileUpdate = (req, res, next) => {
  const { name } = req.body;
  
  // Validate name if provided
  if (name && name.trim().length < 3) {
    return res.status(400).json({ message: 'Name should be at least 3 characters long' });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateEmailVerification,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateProfileUpdate
};

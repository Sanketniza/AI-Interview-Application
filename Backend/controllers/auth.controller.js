const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { generateOTP, sendEmail } = require('../utils/email.util');

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create verification code
    const verificationCode = generateOTP();
    const verificationExpires = Date.now() + 3600000; // 1 hour
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires
    });
    
    // Save user first
    await user.save();
    
    // Try to send verification email, but don't fail registration if it doesn't work
    try {
      const emailSent = await sendEmail(email, 'Email Verification', `Your verification code is: ${verificationCode}`);
      console.log(`Email sending status: ${emailSent ? 'Success' : 'Failed'}`);
      
      if (!emailSent) {
        console.warn(`Failed to send verification email to ${email}, but user was still registered`);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue with registration even if email sending fails
    }
    
    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      // Regenerate verification code if needed
      if (!user.emailVerificationCode || !user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
        const verificationCode = generateOTP();
        const verificationExpires = Date.now() + 3600000; // 1 hour
        
        user.emailVerificationCode = verificationCode;
        user.emailVerificationExpires = verificationExpires;
        await user.save();
        
        // Try to send the new verification code
        try {
          await sendEmail(email, 'Email Verification', `Your new verification code is: ${verificationCode}`);
        } catch (error) {
          console.error('Failed to send new verification code:', error);
        }
      }
      
      return res.status(400).json({ 
        message: 'Please verify your email before logging in. A verification code has been sent to your email address.' 
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Find user
    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Update user
    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create reset code
    const resetCode = generateOTP();
    const resetExpires = Date.now() + 3600000; // 1 hour
    
    // Update user
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = resetExpires;
    await user.save();
    
    // Send reset email
    await sendEmail(email, 'Password Reset', `Your password reset code is: ${resetCode}`);
    
    res.status(200).json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    
    // Find user
    const user = await User.findOne({
      email,
      passwordResetCode: code,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    
    // Update user
    user.password = password;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Sample admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@aiinterview.com',
  password: 'admin123',
  role: 'admin',
  isVerified: true
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Seed admin user
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create new admin
    adminUser.password = await hashPassword(adminUser.password);
    
    const admin = new User(adminUser);
    await admin.save();
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Run the seed function and close connection
const seedDatabase = async () => {
  try {
    await seedAdmin();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedDatabase();

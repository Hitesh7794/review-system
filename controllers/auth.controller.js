const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const emailService = require('../services/email.services');

exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Try logging in!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      role: role || 'student'
    });
    
    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);
    
    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed. Our hamsters stopped running!" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials. Are you sure you're registered?" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials. Did you forget your password?" });
    }
    
    // Check email verification
    if (!user.is_email_verified) {
      return res.status(403).json({ 
        message: "Email not verified. Check your inbox for the verification link." 
      });
    }
    
    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: "Login successful! Welcome back!",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed. Our servers need coffee!" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found. Are you lost?" });
    }
    
    if (user.is_email_verified) {
      return res.status(400).json({ message: "Email already verified. No need to do it twice!" });
    }
    
    // Update verification status
    await user.update({ is_email_verified: true });
    
    res.json({ message: "Email verified successfully! You're all set!" });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Verification link expired. Please request a new one." });
    }
    
    res.status(500).json({ message: "Email verification failed. Our pigeons got lost!" });
  }
};
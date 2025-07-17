const bcrypt = require('bcryptjs');
const { User } = require('../models');
const db = require('../config/db');
const { Institute } = require('../models');
const { geocodeAddress, validateCoordinates } = require('../services/geolocation.service');

async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'admin123'; // Change this to a strong password in production
  const first_name = 'Admin';
  const last_name = 'User';

  try {
    await db.authenticate();
    console.log('Database connected...');

    // Check if admin already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const password_hash = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      role: 'admin',
      is_email_verified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err);
    process.exit(1);
  }
}

createAdmin(); 
// Example Node.js/Express backend API
// You need to deploy this on your server

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Your license database (use a real database like MongoDB, MySQL, etc.)
const licenses = {
  'QUIZ-2024-PREMIUM': {
    email: 'premium@user.com',
    plan: 'Premium',
    expiryDate: '2025-12-31',
    active: true
  },
  'QUIZ-2024-STUDENT': {
    email: 'student@user.com',
    plan: 'Student',
    expiryDate: '2024-12-31',
    active: true
  }
};

// Verify license endpoint
app.post('/api/verify-license', (req, res) => {
  const { licenseKey } = req.body;
  
  const license = licenses[licenseKey];
  
  // Check if license exists
  if (!license) {
    return res.status(401).json({
      valid: false,
      message: 'Invalid license key'
    });
  }
  
  // Check if license is active (you can disable it from admin panel)
  if (!license.active) {
    return res.status(401).json({
      valid: false,
      message: 'License has been deactivated'
    });
  }
  
  // Check if expired
  if (license.expiryDate) {
    const today = new Date();
    const expiry = new Date(license.expiryDate);
    if (today > expiry) {
      return res.status(401).json({
        valid: false,
        message: 'License has expired'
      });
    }
  }
  
  // License is valid
  res.json({
    valid: true,
    email: license.email,
    plan: license.plan,
    expiryDate: license.expiryDate
  });
});

// Admin endpoint to deactivate a license
app.post('/api/admin/deactivate-license', (req, res) => {
  const { licenseKey, adminPassword } = req.body;
  
  // Simple admin authentication (use proper auth in production)
  if (adminPassword !== 'your-admin-password') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  if (licenses[licenseKey]) {
    licenses[licenseKey].active = false;
    res.json({ message: 'License deactivated successfully' });
  } else {
    res.status(404).json({ message: 'License not found' });
  }
});

// Admin endpoint to activate a license
app.post('/api/admin/activate-license', (req, res) => {
  const { licenseKey, adminPassword } = req.body;
  
  if (adminPassword !== 'your-admin-password') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  if (licenses[licenseKey]) {
    licenses[licenseKey].active = true;
    res.json({ message: 'License activated successfully' });
  } else {
    res.status(404).json({ message: 'License not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

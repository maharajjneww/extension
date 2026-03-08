require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const License = require('./models/License');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve admin panel at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Quiz Extension API is running' });
});

// Verify license endpoint (called by extension)
app.post('/api/verify-license', async (req, res) => {
  try {
    const { licenseKey } = req.body;
    
    if (!licenseKey) {
      return res.status(400).json({
        valid: false,
        message: 'License key is required'
      });
    }
    
    // Find license in database
    const license = await License.findOne({ licenseKey });
    
    if (!license) {
      return res.status(401).json({
        valid: false,
        message: 'Invalid license key'
      });
    }
    
    // Check if license is active
    if (!license.active) {
      return res.status(401).json({
        valid: false,
        message: 'License has been deactivated'
      });
    }
    
    // Check if expired
    if (license.expiryDate) {
      const today = new Date();
      if (today > license.expiryDate) {
        return res.status(401).json({
          valid: false,
          message: 'License has expired'
        });
      }
    }
    
    // Update last used timestamp
    license.lastUsed = new Date();
    await license.save();
    
    // License is valid
    res.json({
      valid: true,
      email: license.email,
      plan: license.plan,
      expiryDate: license.expiryDate
    });
    
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      valid: false,
      message: 'Server error'
    });
  }
});

// Admin: Create new license
app.post('/api/admin/create-license', async (req, res) => {
  try {
    const { adminPassword, licenseKey, email, plan, expiryDate } = req.body;
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const license = new License({
      licenseKey,
      email,
      plan,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      active: true
    });
    
    await license.save();
    res.json({ message: 'License created successfully', license });
    
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'License key already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Admin: Deactivate license
app.post('/api/admin/deactivate-license', async (req, res) => {
  try {
    const { adminPassword, licenseKey } = req.body;
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const license = await License.findOne({ licenseKey });
    
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }
    
    license.active = false;
    await license.save();
    
    res.json({ message: 'License deactivated successfully' });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Activate license
app.post('/api/admin/activate-license', async (req, res) => {
  try {
    const { adminPassword, licenseKey } = req.body;
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const license = await License.findOne({ licenseKey });
    
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }
    
    license.active = true;
    await license.save();
    
    res.json({ message: 'License activated successfully' });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all licenses
app.post('/api/admin/list-licenses', async (req, res) => {
  try {
    const { adminPassword } = req.body;
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const licenses = await License.find().sort({ createdAt: -1 });
    res.json({ licenses });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete license
app.post('/api/admin/delete-license', async (req, res) => {
  try {
    const { adminPassword, licenseKey } = req.body;
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const result = await License.deleteOne({ licenseKey });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'License not found' });
    }
    
    res.json({ message: 'License deleted successfully' });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

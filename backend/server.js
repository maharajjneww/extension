require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const License = require('./models/License');

const app = express();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve admin panel at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel.html'));
});

// Serve purchase page at /purchase
app.get('/purchase', (req, res) => {
  res.sendFile(path.join(__dirname, 'purchase.html'));
});

// Serve privacy policy at /privacy
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Quiz Extension API is running' });
});

// Keep-alive status endpoint
let lastPingTime = null;
app.get('/ping-status', (req, res) => {
  const now = Date.now();
  const secondsSinceLastPing = lastPingTime ? Math.floor((now - lastPingTime) / 1000) : null;
  const nextPingIn = lastPingTime ? Math.max(0, 300 - secondsSinceLastPing) : 300;
  
  res.json({
    keepAliveEnabled: true,
    lastPingTime: lastPingTime ? new Date(lastPingTime).toISOString() : 'Not yet pinged',
    secondsSinceLastPing: secondsSinceLastPing,
    nextPingIn: `${nextPingIn} seconds`,
    pingInterval: '5 minutes (300 seconds)'
  });
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

// Payment: Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Payment: Verify payment and generate license
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
    
    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    
    // Generate unique license key
    const licenseKey = `QUIZ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Create license in database
    const license = new License({
      licenseKey,
      email: 'customer@payment.com', // You can collect email during payment
      plan: 'Monthly',
      expiryDate,
      active: true
    });
    
    await license.save();
    
    res.json({
      success: true,
      licenseKey,
      expiryDate: expiryDate.toISOString()
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Keep-alive: Ping self every 5 minutes to prevent Render free tier sleep
  const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const SERVER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  
  setInterval(() => {
    const now = Date.now();
    lastPingTime = now;
    fetch(`${SERVER_URL}/`)
      .then(res => res.json())
      .then(data => console.log('✅ Keep-alive ping:', new Date().toLocaleTimeString()))
      .catch(err => console.error('❌ Keep-alive ping failed:', err.message));
  }, PING_INTERVAL);
  
  console.log('⏰ Keep-alive pings enabled (every 5 minutes)');
});

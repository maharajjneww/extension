const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  licenseKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['Trial', 'Student', 'Premium', 'Lifetime', 'Monthly']
  },
  active: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date,
    default: null
  },
  deviceId: {
    type: String,
    default: null
  },
  deviceInfo: {
    type: String,
    default: null
  },
  lastIp: {
    type: String,
    default: null
  },
  activationCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('License', licenseSchema);

const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  terms: [{
    title: String,
    content: String
  }],
  pdfUrl: {
    type: String
  },
  studentSignature: {
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: Date,
    ipAddress: String
  },
  ownerSignature: {
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: Date,
    ipAddress: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'completed', 'terminated'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contract', contractSchema);

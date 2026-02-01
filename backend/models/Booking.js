const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
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
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date
  },
  depositAmount: {
    type: Number,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'expired', 'confirmed', 'active', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'deposit_paid', 'fully_paid'],
    default: 'unpaid'
  },
  notes: String,
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookingSchema.virtual('startDate')
  .get(function() {
    return this.checkInDate;
  })
  .set(function(value) {
    this.checkInDate = value;
  });

bookingSchema.virtual('endDate')
  .get(function() {
    return this.checkOutDate;
  })
  .set(function(value) {
    this.checkOutDate = value;
  });

bookingSchema.virtual('hostId')
  .get(function() {
    return this.owner;
  })
  .set(function(value) {
    this.owner = value;
  });

module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'other',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    area: {
      type: Number,
      min: 0,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    location: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
      // GeoJSON for geo queries
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: '2dsphere',
      },
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'needs_changes', 'available', 'rented', 'reserved'],
      default: 'pending',
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    callCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ title: 'text', description: 'text', address: 'text' });
roomSchema.index({ ownerId: 1, status: 1 });

module.exports = mongoose.model('Room', roomSchema);

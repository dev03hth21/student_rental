const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    callerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

callLogSchema.index({ roomId: 1, createdAt: -1 });
callLogSchema.index({ studentId: 1, createdAt: -1 });
callLogSchema.index({ hostId: 1, isRead: 1 });

module.exports = mongoose.model('CallLog', callLogSchema);

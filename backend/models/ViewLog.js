const mongoose = require('mongoose');

const viewLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

viewLogSchema.index({ userId: 1, roomId: 1, viewedAt: -1 });

module.exports = mongoose.model('ViewLog', viewLogSchema);

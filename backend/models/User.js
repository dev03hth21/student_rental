const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'owner', 'student'],
      default: 'student',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://cdn.fakeimg.pl/200x200?text=Avatar',
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    identityCardNumber: {
      type: String,
      trim: true,
    },
    identityCardImage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

userSchema.virtual('name')
  .get(function getName() {
    return this.fullName;
  })
  .set(function setName(value) {
    this.fullName = value;
  });

module.exports = mongoose.model('User', userSchema);

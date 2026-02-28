const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName:   { type: String, required: true, trim: true },
    // Auto-generated from birthday MM/DD/YYYY → "MMDD"
    username:   { type: String, required: true, trim: true },
    // Student ID or Instructor ID
    userId:     { type: String, required: true, unique: true, trim: true },
    password:   { type: String, required: true },
    birthday:   { type: String, required: true }, // MM/DD/YYYY
    role:       { type: String, enum: ['student', 'instructor', 'admin'], required: true },
    // Shared
    college:    { type: String, default: null },
    department: { type: String, default: null },
    schoolYear: { type: String, default: null },
    // Student only
    course:  { type: String, default: null },
    section: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);

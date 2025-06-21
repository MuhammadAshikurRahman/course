const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  phone: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  yourCourses: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false },
  role: { type: String, default: 'student', enum: ['student', 'admin'] }
});

module.exports = mongoose.model('User', userSchema);

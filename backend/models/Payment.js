const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  courseId: String,
  paymentMethod: String,
  paymentPhone: String,
  transactionId: String,
  status: { type: String, default: 'pending' },
  validTill: Date, // মেয়াদ
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);


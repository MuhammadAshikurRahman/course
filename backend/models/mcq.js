const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  subject: { type: String, required: true },  // নাম দিয়ে নিবে
  chapter: { type: String, required: true },  // নাম দিয়ে নিবে
  qs: { type: String, required: true },
  options: { type: [String], required: true },
  ans: { type: Number, required: true },
  explanation: { type: String }
});

module.exports = mongoose.model('Mcq', mcqSchema);

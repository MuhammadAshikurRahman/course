// ==================== backend/models/course.js ====================
const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: String,
  videoId: String,
  image: [{ title: String, url: String }],  // image with title
  pdf: [{ title: String, url: String }]     // pdf with title
});


const subjectSchema = new mongoose.Schema({
  subjectName: String,
  chapters: [chapterSchema],
});

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  title: String,
  thumbnail: String,
  shortDescription: String,
  fullDescription: String,
  introVideoId: String,
  mentors: [String],
  subjects: [subjectSchema],
  price: Number,
  promoCode: String,
  promoDiscount: { type: Number, default: 0 }

  
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
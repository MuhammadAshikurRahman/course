const express = require('express');
const router = express.Router();
const Course = require('../models/course');


// ✅ GET all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ _id: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার সমস্যা', details: err });
  }
});

// ✅ GET single course by _id (MongoDB ObjectId)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) res.json(course);
    else res.status(404).json({ error: 'কোর্স পাওয়া যায়নি' });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার সমস্যা', details: err });
  }
});

// ✅ NEW: GET single course by courseId (custom field like "1", "2", etc.)
router.get('/byCourseId/:courseId', async (req, res) => {
  try {
    const course = await Course.findOne({ courseId: req.params.courseId });
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ error: 'courseId অনুযায়ী কোর্স পাওয়া যায়নি' });
    }
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার সমস্যা', details: err });
  }
});

// ✅ POST new course
router.post('/', async (req, res) => {
  try {
    // courseId ডুপ্লিকেট আছে কিনা চেক
    const existingCourse = await Course.findOne({ courseId: req.body.courseId });
    if (existingCourse) {
      return res.status(400).json({ error: 'এই courseId ইতিমধ্যেই ব্যবহার হয়েছে। অন্য একটি ব্যবহার করুন।' });
    }

    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ error: 'তথ্য সংরক্ষণে সমস্যা হয়েছে', details: err });
  }
});

// ✅ PUT update course by ID
router.put('/:id', async (req, res) => {
  try {
    // যদি courseId আপডেট করতে চায়, তাহলে ডুপ্লিকেট আছে কিনা চেক করুন
    if (req.body.courseId) {
      const existingCourse = await Course.findOne({ 
        courseId: req.body.courseId, 
        _id: { $ne: req.params.id } 
      });
      if (existingCourse) {
        return res.status(400).json({ error: 'এই courseId ইতিমধ্যেই ব্যবহার হয়েছে। অন্য একটি ব্যবহার করুন।' });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ error: 'কোর্স পাওয়া যায়নি' });
    }
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ error: 'আপডেট করতে সমস্যা হয়েছে', details: err });
  }
});

// ✅ DELETE course by ID
router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'কোর্স মুছে ফেলা হয়েছে' });
  } catch (err) {
    res.status(500).json({ error: 'মুছতে সমস্যা হয়েছে', details: err });
  }
});





module.exports = router;

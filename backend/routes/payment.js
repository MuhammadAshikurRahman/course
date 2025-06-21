const express = require('express');
const router = express.Router();
const Purchase = require('../models/Payment');
const Course = require('../models/course');

// Submit payment
router.post('/submit', async (req, res) => {
  const { name, phone, email, courseId, paymentMethod, paymentPhone, transactionId } = req.body;

  if (!name || !phone || !courseId || !paymentMethod || !paymentPhone || !transactionId) {
    return res.status(400).json({ error: 'সব তথ্য দিন' });
  }

  try {
    const newPurchase = new Purchase({
      name,
      phone,
      email,
      courseId,
      paymentMethod,
      paymentPhone,
      transactionId,
      status: 'pending'
    });

    await newPurchase.save();
    res.json({ message: 'পেমেন্ট তথ্য সফলভাবে জমা হয়েছে' });
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি' });
  }
});

// সব পেমেন্ট দেখানো
router.get('/all', async (req, res) => {
  try {
    const payments = await Purchase.find().sort({ createdAt: -1 });

    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const course = await Course.findOne({ courseId: payment.courseId });
        return {
          ...payment.toObject(),
          courseTitle: course?.title || 'N/A',
          coursePrice: course?.price || 0
        };
      })
    );

    res.json(enrichedPayments);
  } catch (err) {
    res.status(500).json({ error: 'সার্ভার ত্রুটি' });
  }
});

// Approve/Decline + মেয়াদ
router.post('/update-status', async (req, res) => {
  const { id, status, validTill } = req.body;

  const updateData = { status };

if (status === 'approved') {
  if (validTill) {
    updateData.validTill = new Date(validTill); // ইউজার ইনপুট থেকে
  } else {
    const defaultValidTill = new Date();
    defaultValidTill.setMonth(defaultValidTill.getMonth() + 6); // ৬ মাস ডিফল্ট
    updateData.validTill = defaultValidTill;
  }
}


  try {
    const updated = await Purchase.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ message: 'স্ট্যাটাস ও মেয়াদ আপডেট হয়েছে', data: updated });
  } catch (err) {
    res.status(500).json({ error: 'স্ট্যাটাস আপডেট ব্যর্থ' });
  }
});




router.get('/approved-courses/:phone', async (req, res) => {
  const phone = req.params.phone;

  try {
    // শুধু approved কোর্স খুঁজে বের করো
    const approvedPayments = await Purchase.find({
      phone,
      status: 'approved'
    });

    const courseIds = approvedPayments.map(p => p.courseId);

    // কোর্স ইনফো বের করো
    const courses = await Course.find({ courseId: { $in: courseIds } });

    res.json({
      yourCourses: courses.map(course => ({
        title: course.title,
        courseId: course.courseId
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'সার্ভার ত্রুটি' });
  }
});


module.exports = router;

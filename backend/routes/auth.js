const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const JWT_SECRET = 'your_jwt_secret_key_here'; // নিরাপদে .env ফাইলে রাখুন
const OTP_STORE = {}; // OTP সংরক্ষণ

// Nodemailer সেটআপ
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mdashikurrahman50000@gmail.com',
    pass: 'waqvxgfitlmwualm' // Gmail App Password
  }
});

// ১. OTP পাঠানো
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'ইমেইল আবশ্যক' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE[email] = otp;

  try {
    await transporter.sendMail({
      from: '"Acadamy" <mdashikurrahman50000@gmail.com>',
      to: email,
      subject: 'OTP Verification',
      html: `<h3>Your OTP is: ${otp}</h3>`
    });

    res.json({ message: 'OTP পাঠানো হয়েছে' });
  } catch (err) {
    console.error('OTP পাঠানোর সময় error:', err);
    res.status(500).json({ error: 'OTP ইমেইলে পাঠানো যায়নি' });
  }
});


// ২. (OTP ভেরিফাই করে)
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'ইমেইল ও OTP প্রয়োজন' });
  }

  if (OTP_STORE[email] === otp) {
    return res.json({ message: 'OTP সফলভাবে যাচাই হয়েছে' });
  } else {
    return res.status(400).json({ error: 'ভুল OTP' });
  }
});

// 3. রেজিস্ট্রেশন (ইমেইল ও ফোন নম্বর দিয়ে)
router.post('/register', async (req, res) => {
  const { name, age, phone, email, password } = req.body;

  if (!name || !age || !phone || !email || !password) {
    return res.status(400).json({ error: 'সব তথ্য দিন' });
  }

  if (phone.length !== 11) {
    return res.status(400).json({ error: 'ফোন নম্বর অবশ্যই ১১ ডিজিট হতে হবে' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'ইমেইল বা ফোন ইতিমধ্যেই ব্যবহৃত হয়েছে' });
    }

    const newUser = new User({
      name,
      age,
      phone,
      email,
      password,
      yourCourses: [],
      isVerified: true
    });

    await newUser.save();
    delete OTP_STORE[email]; // Optional: যেহেতু OTP যাচাই আলাদা, এটা মুছা যেতে পারে

    res.json({ message: 'রেজিস্ট্রেশন সফল হয়েছে' });

  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `${field} ইতিমধ্যেই ব্যবহার হয়েছে` });
    }

    console.error('❌ Registration Error:', err);
    res.status(500).json({ error: 'সার্ভার এরর হয়েছে, পরে আবার চেষ্টা করুন' });
  }
});



// 4. লগইন (আগের মতোই)
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || phone.length !== 11) {
    return res.status(400).json({ error: 'সঠিক ১১ ডিজিটের ফোন নম্বর দিন' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'সঠিক পাসওয়ার্ড দিন (কমপক্ষে ৮ অক্ষর)' });
  }

  const user = await User.findOne({ phone, password });
  if (!user) {
    return res.status(401).json({ error: 'ভুল ইউজার আইডি বা পাসওয়ার্ড' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ error: 'আপনার একাউন্ট ভেরিফাইড নয়' });
  }

  const tokenPayload = {
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    age: user.age,
    isVerified: user.isVerified,
    role: user.role,
    yourCourses: user.yourCourses // Optional: Include if needed
    // yourCourses: user.yourCourses // Optional: Include if needed
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '60d' });

  res.json({
    message: 'লগইন সফল হয়েছে',
    token,
    user: tokenPayload,
    role: user.role // 👉 Add this
  });
});



// OTP পাঠানো
router.post('/send-reset-otp', async (req, res) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });

  if (!user) return res.status(400).json({ error: 'এই ফোন নাম্বারে কোন একাউন্ট নেই' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE[phone] = { otp, email: user.email };

  // Gmail দিয়ে OTP পাঠাও
  try {
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset OTP',
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`
    });
    res.json({ message: 'OTP পাঠানো হয়েছে' });
  } catch (err) {
    res.status(500).json({ error: 'OTP পাঠাতে সমস্যা হয়েছে' });
  }
});

// OTP যাচাই
router.post('/verify-reset-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (OTP_STORE[phone] && OTP_STORE[phone].otp === otp) {
    res.json({ message: 'OTP সঠিক' });
  } else {
    res.status(400).json({ error: 'OTP ভুল' });
  }
});

// পাসওয়ার্ড রিসেট
router.post('/reset-password', async (req, res) => {
  const { phone, newPassword } = req.body;
  const user = await User.findOne({ phone });

  if (!user) return res.status(400).json({ error: 'ব্যবহারকারী পাওয়া যায়নি' });

  user.password = newPassword;
  await user.save();

  delete OTP_STORE[phone];

  res.json({ message: 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে' });
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const coursesRouter = require('./backend/routes/courses');
const UserRouter = require('./backend/routes/auth');
const UserDataRouter = require('./backend/routes/users');
const paymentRoute = require('./backend/routes/payment');
const mcqRoutes = require('./backend/routes/addmcq');



const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb+srv://mdashikurrahman50000:uel4Zcf5Rkj1DtU9@cluster0.dasvi.mongodb.net/polytechex?retryWrites=true&w=majority')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Error:', err));

// Routes
app.use('/api/courses', coursesRouter);
app.use('/api/auth', UserRouter);
app.use('/api/users', UserDataRouter);
app.use('/api/payments', paymentRoute);
app.use('/api/mcq', mcqRoutes);


// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contentmanage.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const mongoose = require('mongoose');
const Payment = require('./models/Payment'); // তোমার model path

async function autoDeclineExpiredPayments() {
  await mongoose.connect('mongodb+srv://mdashikurrahman50000:uel4Zcf5Rkj1DtU9@cluster0.dasvi.mongodb.net/polytechex?retryWrites=true&w=majority');

  const now = new Date();

  const result = await Payment.updateMany(
    {
      status: 'approved',
      validTill: { $lt: now }
    },
    {
      $set: { status: 'declined' }
    }
  );

  console.log(`✅ ${result.modifiedCount} পেমেন্ট declined করা হয়েছে।`);
  mongoose.disconnect();
}

autoDeclineExpiredPayments();

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const email = "aarav12f@gmail.com";
  
  const user1 = await User.findOne({ email });
  console.log('User found by exactly email:', user1 ? `Yes (clerkId: ${user1.clerkId})` : 'No');

  try {
    user1.username = "AaravTest";
    user1.age = 25;
    user1.gender = 'male';
    user1.profileComplete = true;
    
    await user1.save();
    console.log("Profile update successful!");
  } catch (err) {
    console.error("Profile update failed:", err.name, err.message);
    if (err.errors) console.error(err.errors);
  }

  mongoose.disconnect();
}
debug().catch(console.error);

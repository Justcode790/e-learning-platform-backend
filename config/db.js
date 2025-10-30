const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
async function connectDB() {
  // const mongoUri = process.env.MONGO_URI;
  const mongoUri = "mongodb+srv://justcode790:Ankit790@cluster0forproject1.iz7lot1.mongodb.net/elearning";
  try {
    // mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      autoIndex: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
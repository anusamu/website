const mongoose = require("mongoose");

// Function for connecting Node.js backend to MongoDB
const connectDB = async () => {
  try {
    // mongoose.connect connects to MongoDB using MONGO_URI from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If connection success, show database host in terminal
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection failed, show error
    console.error(`MongoDB Connection Error: ${error.message}`);

    // Stop backend process
    process.exit(1);
  }
};

module.exports = connectDB;
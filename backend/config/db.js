const mongoose = require("mongoose");

// Function for connecting Node.js backend to MongoDB
const connectDB = async () => {
  try {
    // mongoose.connect connects to MongoDB using MONGO_URI from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If connection success, show database host in terminal
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    try {
      const cleanupResult = await conn.connection.collection("users").updateMany(
        { phoneNumber: null },
        { $unset: { phoneNumber: "" } }
      );

      if (cleanupResult.modifiedCount > 0) {
        console.log(`Cleaned up ${cleanupResult.modifiedCount} user phone number values.`);
      }
    } catch (cleanupError) {
      console.warn("Phone number cleanup skipped:", cleanupError.message);
    }
  } catch (error) {
    // If connection failed, show error
    console.error(`MongoDB Connection Error: ${error.message}`);

    // Stop backend process
    process.exit(1);
  }
};

module.exports = connectDB;
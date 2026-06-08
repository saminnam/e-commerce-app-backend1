import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 5,  // Minimum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

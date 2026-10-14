import mongoose from "mongoose";

const connectDB = async (retries = 5, delay = 2000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i} failed: ${error.message}`);
      if (i < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("Max connection retries reached. Exiting.");
        process.exit(1);
      }
    }
  }
};

export default connectDB;

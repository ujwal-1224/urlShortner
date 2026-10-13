import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Load environment variables from .env into process.env
dotenv.config();

// Connect to MongoDB
await connectDB();

// Create the Express application
const app = express();

// --- Middleware ---
// Parse incoming JSON request bodies (e.g., { "originalUrl": "https://..." })
app.use(express.json());

// Allow cross-origin requests (needed when React dev server calls this API)
app.use(cors());

// --- Test Route ---
app.get("/", (req, res) => {
  res.json({ message: "URL Shortener API is running" });
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

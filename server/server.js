import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import urlRoutes from "./routes/url.js";
import { redirectUrl } from "./controllers/urlController.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Load environment variables from .env into process.env
dotenv.config();

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

// --- API Routes ---
app.use("/api/url", urlRoutes);

// --- Redirect Route (must be after /api routes) ---
app.get("/:code", redirectUrl);

// --- 404 & Centralized Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

// --- Connect to DB, then Start the Server ---
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

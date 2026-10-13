import { nanoid } from "nanoid";
import Url from "../models/Url.js";
import validateUrl from "../utils/validateUrl.js";

/**
 * POST /api/url/shorten
 * Accepts { originalUrl } in the request body.
 * Returns the shortened URL document.
 */
export const shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;

  // 1. Check if originalUrl was provided
  if (!originalUrl) {
    return res.status(400).json({ error: "Please provide a URL" });
  }

  // 2. Validate the URL format
  if (!validateUrl(originalUrl)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    // 3. Check if this URL has already been shortened (idempotent)
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json(existingUrl);
    }

    // 4. Generate a unique short code
    const shortCode = nanoid(7);

    // 5. Build the full short URL
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    // 6. Save to MongoDB
    const newUrl = await Url.create({
      originalUrl,
      shortCode,
    });

    // 7. Return the created document with the short URL
    return res.status(201).json({
      _id: newUrl._id,
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl,
      clicks: newUrl.clicks,
      createdAt: newUrl.createdAt,
    });
  } catch (error) {
    console.error("Error in shortenUrl:", error.message);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /:code
 * Looks up the short code, increments clicks, and redirects to the original URL.
 */
export const redirectUrl = async (req, res) => {
  const { code } = req.params;

  try {
    // Find the URL and increment clicks atomically
    const url = await Url.findOneAndUpdate(
      { shortCode: code },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // 302 redirect — temporary so every visit hits our server (tracks clicks)
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error("Error in redirectUrl:", error.message);
    return res.status(500).json({ error: "Server error" });
  }
};

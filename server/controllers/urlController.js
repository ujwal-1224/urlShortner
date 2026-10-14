import { nanoid } from "nanoid";
import Url from "../models/Url.js";
import validateUrl from "../utils/validateUrl.js";

/**
 * POST /api/url/shorten
 * Accepts { originalUrl } in the request body.
 * Returns the shortened URL document.
 */
export const shortenUrl = async (req, res, next) => {
  try {
    const { originalUrl } = req.body || {};

    // 1. Check if originalUrl was provided and is a non-empty string
    if (!originalUrl || typeof originalUrl !== "string" || !originalUrl.trim()) {
      return res.status(400).json({ error: "Please provide a valid URL" });
    }

    const trimmedUrl = originalUrl.trim();

    // 2. Validate URL format (must be valid http/https URL)
    if (!validateUrl(trimmedUrl)) {
      return res
        .status(400)
        .json({ error: "Invalid URL format. URL must start with http:// or https://" });
    }

    // 3. Prevent circular redirection / self-shortening
    if (process.env.BASE_URL) {
      try {
        const baseHost = new URL(process.env.BASE_URL).host;
        const targetHost = new URL(trimmedUrl).host;
        if (baseHost === targetHost) {
          return res
            .status(400)
            .json({ error: "Cannot shorten URLs from this shortener service" });
        }
      } catch {
        // If parsing fails for any reason, let it proceed
      }
    }

    // 4. Check if this URL has already been shortened (idempotent)
    const existingUrl = await Url.findOne({ originalUrl: trimmedUrl });
    if (existingUrl) {
      return res.status(200).json({
        _id: existingUrl._id,
        originalUrl: existingUrl.originalUrl,
        shortCode: existingUrl.shortCode,
        shortUrl: `${process.env.BASE_URL}/${existingUrl.shortCode}`,
        clicks: existingUrl.clicks,
        createdAt: existingUrl.createdAt,
      });
    }

    // 5. Generate a unique short code
    const shortCode = nanoid(7);

    // 6. Build the full short URL
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    // 7. Save to MongoDB
    const newUrl = await Url.create({
      originalUrl: trimmedUrl,
      shortCode,
    });

    // 8. Return the created document with the short URL
    return res.status(201).json({
      _id: newUrl._id,
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl,
      clicks: newUrl.clicks,
      createdAt: newUrl.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/url/:code
 * Returns URL document info (without redirecting or incrementing clicks).
 */
export const getUrlInfo = async (req, res, next) => {
  try {
    const { code } = req.params;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Short code parameter is required" });
    }

    const url = await Url.findOne({ shortCode: code.trim() });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const shortUrl = `${process.env.BASE_URL}/${url.shortCode}`;

    return res.status(200).json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /:code
 * Looks up the short code, increments clicks, and redirects to the original URL.
 */
export const redirectUrl = async (req, res, next) => {
  try {
    const { code } = req.params;

    if (!code || !code.trim()) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Find the URL and increment clicks atomically
    const url = await Url.findOneAndUpdate(
      { shortCode: code.trim() },
      { $inc: { clicks: 1 } },
      { returnDocument: "after" }
    );

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // 302 redirect — temporary so every visit hits our server (tracks clicks)
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

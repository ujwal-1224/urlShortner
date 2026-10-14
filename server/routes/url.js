import express from "express";
import { shortenUrl, getUrlInfo } from "../controllers/urlController.js";

const router = express.Router();

// POST /api/url/shorten — create a short URL
router.post("/shorten", shortenUrl);

// GET /api/url/:code — retrieve URL statistics / info (without redirecting)
router.get("/:code", getUrlInfo);

export default router;

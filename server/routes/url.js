import express from "express";
import { shortenUrl } from "../controllers/urlController.js";

const router = express.Router();

// POST /api/url/shorten — create a short URL
router.post("/shorten", shortenUrl);

export default router;

/**
 * File: src/routes/bookmarks.route.js
 * Rute untuk melihat semua markah pekerjaan milik pengguna yang sedang masuk.
 */
import { Router } from "express";
import * as bookmarksController from "../controllers/bookmarks.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyToken, bookmarksController.getAllBookmarks);

export default router;

/**
 * File: src/routes/profile.route.js
 * Rute untuk mengakses fungsionalitas profil pengguna. Seluruh rute di sini bersifat privat (protected).
 */
import { Router } from "express";
import * as profileController from "../controllers/profile.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Menerapkan middleware verifyToken ke semua rute di dalam profile router
router.use(verifyToken);

// Endpoint GET /profile (Lihat profil pengguna yang sedang masuk)
router.get("/", profileController.getProfile);

// Endpoint GET /profile/applications (Lihat daftar lamaran)
router.get("/applications", profileController.getApplications);

// Endpoint GET /profile/bookmarks (Lihat daftar pekerjaan yang disimpan)
router.get("/bookmarks", profileController.getBookmarks);

export default router;

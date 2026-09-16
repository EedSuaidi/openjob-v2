/**
 * File: src/routes/applications.route.js
 * Rute untuk mengakses fungsionalitas lamaran pekerjaan. Semua rute diproteksi.
 */
import { Router } from "express";
import * as applicationsController from "../controllers/applications.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../middlewares/validation.middleware.js";
import {
  PostApplicationSchema,
  PutApplicationStatusSchema,
} from "../validators/applications.validator.js";
import { IdParamSchema } from "../validators/params.validator.js";

const router = Router();

router.use(verifyToken);

router.post(
  "/",
  validate(PostApplicationSchema),
  applicationsController.postApplication
);
router.get("/", applicationsController.getApplications);
router.get("/user/:userId", applicationsController.getApplicationsByUser);
router.get("/job/:jobId", applicationsController.getApplicationsByJob);
router.get(
  "/:id",
  validateParams(IdParamSchema, "Lamaran tidak ditemukan."),
  applicationsController.getApplicationById
);
router.put(
  "/:id",
  validateParams(IdParamSchema, "Gagal memperbarui. Lamaran tidak ditemukan."),
  validate(PutApplicationStatusSchema),
  applicationsController.putApplication
);
router.delete(
  "/:id",
  validateParams(IdParamSchema, "Gagal menghapus. Lamaran tidak ditemukan."),
  applicationsController.deleteApplication
);

export default router;

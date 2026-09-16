/**
 * File: src/routes/jobs.route.js
 * Rute untuk mengakses fungsionalitas pekerjaan.
 */
import { Router } from "express";
import * as jobsController from "../controllers/jobs.controller.js";
import * as bookmarksController from "../controllers/bookmarks.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../middlewares/validation.middleware.js";
import { JobSchema } from "../validators/jobs.validator.js";
import {
  IdParamSchema,
  JobIdParamSchema,
  JobBookmarkParamSchema,
} from "../validators/params.validator.js";

const router = Router();

router.get("/", jobsController.getJobs);
router.get("/company/:companyId", jobsController.getJobsByCompany);
router.get("/category/:categoryId", jobsController.getJobsByCategory);
router.get(
  "/:id",
  validateParams(IdParamSchema, "Pekerjaan tidak ditemukan."),
  jobsController.getJobById
);

router.post("/", verifyToken, validate(JobSchema), jobsController.postJob);
router.put(
  "/:id",
  verifyToken,
  validateParams(
    IdParamSchema,
    "Gagal memperbarui. Pekerjaan tidak ditemukan."
  ),
  validate(JobSchema),
  jobsController.putJob
);
router.delete(
  "/:id",
  verifyToken,
  validateParams(IdParamSchema, "Gagal menghapus. Pekerjaan tidak ditemukan."),
  jobsController.deleteJob
);

router.post(
  "/:jobId/bookmark",
  verifyToken,
  validateParams(JobIdParamSchema, "Pekerjaan tidak ditemukan."),
  bookmarksController.postBookmark
);
router.get(
  "/:jobId/bookmark/:id",
  verifyToken,
  validateParams(JobBookmarkParamSchema, "Data simpanan tidak ditemukan."),
  bookmarksController.getBookmarkDetail
);
router.delete(
  "/:jobId/bookmark",
  verifyToken,
  validateParams(
    JobIdParamSchema,
    "Gagal menghapus. Data simpanan tidak ditemukan."
  ),
  bookmarksController.deleteBookmark
);

export default router;

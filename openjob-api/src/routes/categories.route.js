/**
 * File: src/routes/categories.route.js
 * Rute untuk mengakses fungsionalitas kategori.
 */
import { Router } from "express";
import * as categoriesController from "../controllers/categories.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../middlewares/validation.middleware.js";
import { CategorySchema } from "../validators/categories.validator.js";
import { IdParamSchema } from "../validators/params.validator.js";

const router = Router();

router.get("/", categoriesController.getCategories);
router.get(
  "/:id",
  validateParams(IdParamSchema, "Kategori tidak ditemukan."),
  categoriesController.getCategoryById
);

router.post(
  "/",
  verifyToken,
  validate(CategorySchema),
  categoriesController.postCategory
);
router.put(
  "/:id",
  verifyToken,
  validateParams(IdParamSchema, "Gagal memperbarui. Kategori tidak ditemukan."),
  validate(CategorySchema),
  categoriesController.putCategory
);
router.delete(
  "/:id",
  verifyToken,
  validateParams(IdParamSchema, "Gagal menghapus. Kategori tidak ditemukan."),
  categoriesController.deleteCategory
);

export default router;

/**
 * File: src/routes/companies.route.js
 * Rute untuk mengakses fungsionalitas perusahaan.
 */
import { Router } from "express";
import * as companiesController from "../controllers/companies.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../middlewares/validation.middleware.js";
import { CompanySchema } from "../validators/companies.validator.js";
import { IdParamSchema } from "../validators/params.validator.js";

const router = Router();

router.get("/", companiesController.getCompanies);
router.get(
  "/:id",
  validateParams(IdParamSchema, "Perusahaan tidak ditemukan."),
  companiesController.getCompanyById
);

router.post(
  "/",
  verifyToken,
  validate(CompanySchema),
  companiesController.postCompany
);
router.put(
  "/:id",
  verifyToken,
  validateParams(
    IdParamSchema,
    "Gagal memperbarui. Perusahaan tidak ditemukan."
  ),
  validate(CompanySchema),
  companiesController.putCompany
);
router.delete(
  "/:id",
  verifyToken,
  validateParams(IdParamSchema, "Gagal menghapus. Perusahaan tidak ditemukan."),
  companiesController.deleteCompany
);

export default router;

/**
 * File: src/routes/users.route.js
 * Rute untuk mengakses fungsionalitas entitas pengguna.
 */
import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  validate,
  validateParams,
} from "../middlewares/validation.middleware.js";
import {
  UserRegistrationSchema,
  UserUpdateSchema,
} from "../validators/users.validator.js";
import { IdParamSchema } from "../validators/params.validator.js";

const router = Router();

router.post(
  "/",
  validate(UserRegistrationSchema),
  usersController.registerUser
);

router.get(
  "/:id",
  validateParams(IdParamSchema, "Pengguna tidak ditemukan."),
  usersController.getUserById
);

router.put(
  "/:id",
  verifyToken,
  validateParams(IdParamSchema, "Pengguna tidak ditemukan."),
  validate(UserUpdateSchema),
  usersController.putUser
);

export default router;

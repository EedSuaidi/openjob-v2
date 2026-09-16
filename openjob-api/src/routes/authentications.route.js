/**
 * File: src/routes/authentications.route.js
 * Rute untuk mengelola proses autentikasi.
 */
import { Router } from "express";
import * as authenticationsController from "../controllers/authentications.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  UserLoginSchema,
  RefreshTokenSchema,
} from "../validators/authentications.validator.js";

const router = Router();

// Endpoint POST /authentications (Login)
router.post("/", validate(UserLoginSchema), authenticationsController.login);

// Endpoint PUT /authentications (Refresh Token)
router.put(
  "/",
  validate(RefreshTokenSchema),
  authenticationsController.putAuthentication
);

// Endpoint DELETE /authentications (Logout)
router.delete(
  "/",
  verifyToken,
  validate(RefreshTokenSchema),
  authenticationsController.logout
);

export default router;

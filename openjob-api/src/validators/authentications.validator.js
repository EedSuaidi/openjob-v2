/**
 * File: src/validators/authentications.validator.js
 * Skema validasi untuk entitas autentikasi menggunakan Zod.
 */
import { z } from "zod";

export const UserLoginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Kata sandi tidak boleh kosong."),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token tidak boleh kosong."),
});

/**
 * File: src/validators/applications.validator.js
 * Skema validasi untuk entitas lamaran pekerjaan menggunakan Zod.
 */
import { z } from "zod";

export const PostApplicationSchema = z.object({
  job_id: z.coerce.number().int().positive("ID Pekerjaan tidak valid."),
});

export const PutApplicationStatusSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"], {
    errorMap: () => ({
      message: "Status harus berupa 'pending', 'accepted', atau 'rejected'.",
    }),
  }),
});

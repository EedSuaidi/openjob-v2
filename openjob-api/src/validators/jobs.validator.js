/**
 * File: src/validators/jobs.validator.js
 * Skema validasi untuk entitas pekerjaan menggunakan Zod.
 */
import { z } from "zod";

export const JobSchema = z.object({
  title: z.string().min(3, "Judul pekerjaan minimal 3 karakter."),
  description: z.string().min(10, "Deskripsi pekerjaan minimal 10 karakter."),
  company_id: z.coerce.number().int().positive("ID Perusahaan tidak valid."),
  category_id: z.coerce.number().int().positive("ID Kategori tidak valid."),
});

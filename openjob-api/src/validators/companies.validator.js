/**
 * File: src/validators/companies.validator.js
 * Skema validasi untuk entitas perusahaan menggunakan Zod.
 */
import { z } from "zod";

export const CompanySchema = z.object({
  name: z.string().min(2, "Nama perusahaan harus memiliki minimal 2 karakter."),
  location: z.string().min(1, "Lokasi perusahaan harus diisi."),
  description: z.string().optional(),
});

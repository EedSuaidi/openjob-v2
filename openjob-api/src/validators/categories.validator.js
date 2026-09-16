/**
 * File: src/validators/categories.validator.js
 * Skema validasi untuk entitas kategori menggunakan Zod.
 */
import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(2, "Nama kategori harus memiliki minimal 2 karakter."),
});

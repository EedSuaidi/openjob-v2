/**
 * File: src/validators/params.validator.js
 * Skema validasi parameter URL (ID integer PostgreSQL).
 */
import { z } from "zod";

const PG_INT_MAX = 2147483647;

export const pgIntId = z.coerce.number().int().positive().max(PG_INT_MAX);

export const parsePgIntId = (value) => {
  const result = pgIntId.safeParse(value);
  return result.success ? result.data : null;
};

export const IdParamSchema = z.object({ id: pgIntId });

export const JobIdParamSchema = z.object({ jobId: pgIntId });

export const JobBookmarkParamSchema = z.object({
  jobId: pgIntId,
  id: pgIntId,
});

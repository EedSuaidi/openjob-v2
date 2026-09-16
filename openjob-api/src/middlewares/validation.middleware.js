/**
 * File: src/middlewares/validation.middleware.js
 * Middleware untuk memvalidasi request body dan parameter URL menggunakan skema Zod.
 */
import InvariantError from "../exceptions/invariant.error.js";
import NotFoundError from "../exceptions/not-found.error.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errorMessage = result.error.issues[0].message;
    return next(new InvariantError(errorMessage));
  }

  req.body = result.data;
  next();
};

export const validateParams = (schema, notFoundMessage) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    return next(
      new NotFoundError(notFoundMessage ?? "Sumber daya tidak ditemukan.")
    );
  }

  req.params = { ...req.params, ...result.data };
  next();
};

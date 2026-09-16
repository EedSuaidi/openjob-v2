/**
 * File: src/middlewares/auth.middleware.js
 * Middleware untuk memverifikasi JSON Web Token (JWT) pada rute yang diproteksi.
 */
import jwt from "jsonwebtoken";
import AuthenticationError from "../exceptions/authentication.error.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      new AuthenticationError(
        "Token akses tidak ditemukan. Harap sertakan header Authorization."
      )
    );
  }

  // Mengambil token dari format "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(
      new AuthenticationError(
        "Format token tidak valid. Gunakan format Bearer <token>."
      )
    );
  }

  try {
    // Memverifikasi token menggunakan kunci rahasia dari environment variables
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    // Menyimpan data payload (seperti id pengguna) ke objek request agar bisa diakses oleh controller
    req.user = decoded;
    next();
  } catch (error) {
    return next(
      new AuthenticationError("Token akses tidak valid atau telah kedaluwarsa.")
    );
  }
};

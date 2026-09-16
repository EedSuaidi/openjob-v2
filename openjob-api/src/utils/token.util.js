/**
 * File: src/utils/token.util.js
 * Utilitas untuk mengelola JSON Web Token (JWT).
 */
import jwt from "jsonwebtoken";

// Memenuhi kriteria Advanced: umur token 3 jam dan menggunakan environment variable
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: "3h" });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
};

export const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
  } catch (error) {
    throw new Error("Refresh token tidak valid atau telah kedaluwarsa.");
  }
};

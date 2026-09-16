/**
 * File: src/services/authentications.service.js
 * Layanan untuk mengelola logika bisnis autentikasi dan sesi pengguna.
 */
import pool from "../config/database.config.js";
import AuthenticationError from "../exceptions/authentication.error.js";
import InvariantError from "../exceptions/invariant.error.js";
import { comparePassword } from "../utils/hash.util.js";

export const verifyUserCredential = async (email, password) => {
  const query = {
    text: "SELECT id, password FROM users WHERE email = $1",
    values: [email],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new AuthenticationError("Kredensial yang Anda berikan salah.");
  }

  const { id, password: hashedPassword } = result.rows[0];
  const match = await comparePassword(password, hashedPassword);

  if (!match) {
    throw new AuthenticationError("Kredensial yang Anda berikan salah.");
  }

  return id;
};

export const addRefreshToken = async (token) => {
  const query = {
    text: "INSERT INTO authentications(token) VALUES($1)",
    values: [token],
  };

  await pool.query(query);
};

export const verifyRefreshTokenExists = async (token) => {
  const query = {
    text: "SELECT token FROM authentications WHERE token = $1",
    values: [token],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new InvariantError("Refresh token tidak valid di basis data.");
  }
};

export const deleteRefreshToken = async (token) => {
  const query = {
    text: "DELETE FROM authentications WHERE token = $1",
    values: [token],
  };

  await pool.query(query);
};

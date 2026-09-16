/**
 * File: src/services/users.service.js
 * Layanan untuk mengelola logika bisnis entitas pengguna.
 */
import pool from "../config/database.config.js";
import InvariantError from "../exceptions/invariant.error.js";
import NotFoundError from "../exceptions/not-found.error.js";
import { hashPassword } from "../utils/hash.util.js";

export const verifyNewEmail = async (email) => {
  const query = "SELECT email FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);

  if (result.rowCount > 0) {
    throw new InvariantError(
      "Gagal menambahkan pengguna. Surel sudah digunakan."
    );
  }
};

export const createUser = async ({ name, email, password, role }) => {
  await verifyNewEmail(email);

  const hashedPassword = await hashPassword(password);

  const query = {
    text: "INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING id",
    values: [name, email, hashedPassword, role],
  };

  const result = await pool.query(query);
  return result.rows[0].id;
};

export const getUserById = async (id) => {
  const query = {
    text: "SELECT id, name, email, role FROM users WHERE id = $1",
    values: [id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  return {
    ...result.rows[0],
    id: String(result.rows[0].id),
  };
};

export const updateUser = async (id, { name, email, password, role }) => {
  const fields = [];
  const values = [];
  let parameterIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${parameterIndex}`);
    values.push(name);
    parameterIndex += 1;
  }

  if (email !== undefined) {
    const emailCheckResult = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [email, id]
    );

    if (emailCheckResult.rowCount > 0) {
      throw new InvariantError(
        "Gagal memperbarui pengguna. Surel sudah digunakan."
      );
    }

    fields.push(`email = $${parameterIndex}`);
    values.push(email);
    parameterIndex += 1;
  }

  if (password !== undefined) {
    const hashedPassword = await hashPassword(password);
    fields.push(`password = $${parameterIndex}`);
    values.push(hashedPassword);
    parameterIndex += 1;
  }

  if (role !== undefined) {
    fields.push(`role = $${parameterIndex}`);
    values.push(role);
    parameterIndex += 1;
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  const query = {
    text: `UPDATE users SET ${fields.join(", ")} WHERE id = $${parameterIndex} RETURNING id, name, email, role`,
    values: [...values, id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal memperbarui. Pengguna tidak ditemukan.");
  }

  return {
    ...result.rows[0],
    id: String(result.rows[0].id),
  };
};

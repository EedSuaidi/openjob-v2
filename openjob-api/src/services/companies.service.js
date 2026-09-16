/**
 * File: src/services/companies.service.js
 * Layanan untuk mengelola operasi basis data entitas perusahaan (CRUD).
 */
import pool from "../config/database.config.js";
import NotFoundError from "../exceptions/not-found.error.js";

export const createCompany = async (
  { name, location, description = "" },
  ownerId
) => {
  const query = {
    text: "INSERT INTO companies(name, location, description, owner_id) VALUES($1, $2, $3, $4) RETURNING id",
    values: [name, location, description || "", ownerId],
  };
  const result = await pool.query(query);
  return result.rows[0].id;
};

export const getCompanies = async () => {
  const result = await pool.query("SELECT * FROM companies");
  return result.rows.map((company) => ({
    ...company,
    id: String(company.id),
  }));
};

export const getCompanyById = async (id) => {
  const query = {
    text: "SELECT * FROM companies WHERE id = $1",
    values: [id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Perusahaan tidak ditemukan.");
  }

  return {
    ...result.rows[0],
    id: String(result.rows[0].id),
  };
};

export const updateCompany = async (id, { name, location, description }) => {
  const query =
    description !== undefined
      ? {
          text: "UPDATE companies SET name = $1, location = $2, description = $3 WHERE id = $4 RETURNING id",
          values: [name, location, description, id],
        }
      : {
          text: "UPDATE companies SET name = $1, location = $2 WHERE id = $3 RETURNING id",
          values: [name, location, id],
        };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal memperbarui. Perusahaan tidak ditemukan.");
  }
};

export const deleteCompany = async (id) => {
  const query = {
    text: "DELETE FROM companies WHERE id = $1 RETURNING id",
    values: [id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal menghapus. Perusahaan tidak ditemukan.");
  }
};

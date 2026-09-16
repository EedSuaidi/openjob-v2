/**
 * File: src/services/categories.service.js
 * Layanan untuk mengelola operasi basis data entitas kategori (CRUD).
 */
import pool from "../config/database.config.js";
import NotFoundError from "../exceptions/not-found.error.js";

export const createCategory = async ({ name }) => {
  const query = {
    text: "INSERT INTO categories(name) VALUES($1) RETURNING id",
    values: [name],
  };
  const result = await pool.query(query);
  return result.rows[0].id;
};

export const getCategories = async () => {
  const result = await pool.query("SELECT * FROM categories");
  return result.rows.map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    description: cat.description || null,
    created_at: cat.created_at,
  }));
};

export const getCategoryById = async (id) => {
  const query = {
    text: "SELECT * FROM categories WHERE id = $1",
    values: [id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Kategori tidak ditemukan.");
  }

  return {
    ...result.rows[0],
    id: String(result.rows[0].id),
  };
};

export const updateCategory = async (id, { name }) => {
  const query = {
    text: "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id",
    values: [name, id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal memperbarui. Kategori tidak ditemukan.");
  }
};

export const deleteCategory = async (id) => {
  const query = {
    text: "DELETE FROM categories WHERE id = $1 RETURNING id",
    values: [id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal menghapus. Kategori tidak ditemukan.");
  }
};

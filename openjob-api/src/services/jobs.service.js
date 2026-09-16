/**
 * File: src/services/jobs.service.js
 * Layanan untuk mengelola operasi basis data entitas pekerjaan (CRUD dan Pencarian).
 */
import pool from "../config/database.config.js";
import NotFoundError from "../exceptions/not-found.error.js";
import { parsePgIntId } from "../validators/params.validator.js";

export const createJob = async ({
  title,
  description,
  company_id,
  category_id,
}) => {
  const query = {
    text: "INSERT INTO jobs(title, description, company_id, category_id) VALUES($1, $2, $3, $4) RETURNING id",
    values: [title, description, company_id, category_id],
  };
  const result = await pool.query(query);
  return result.rows[0].id;
};

export const getJobs = async (title, companyName) => {
  let text = `
    SELECT j.id, j.title, j.description, j.created_at, j.company_id, j.category_id,
           c.name AS company_name, cat.name AS category_name
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    JOIN categories cat ON j.category_id = cat.id
    WHERE 1=1
  `;
  const values = [];
  let parameterIndex = 1;

  if (title) {
    text += ` AND j.title ILIKE $${parameterIndex}`;
    values.push(`%${title}%`);
    parameterIndex++;
  }

  if (companyName) {
    text += ` AND c.name ILIKE $${parameterIndex}`;
    values.push(`%${companyName}%`);
    parameterIndex++;
  }

  text += " ORDER BY j.created_at DESC";

  const result = await pool.query({ text, values });
  return result.rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    description: row.description,
    company_id: String(row.company_id),
    category_id: String(row.category_id),
    company_name: row.company_name,
    category_name: row.category_name,
    job_type: "full-time",
    experience_level: "senior",
    location_type: "remote",
    location_city: "Jakarta",
    status: "open",
    created_at: row.created_at,
  }));
};

export const getJobById = async (id) => {
  const query = {
    text: `
      SELECT j.id, j.title, j.description, j.created_at, 
             c.id AS company_id, c.name AS company_name, 
             cat.id AS category_id, cat.name AS category_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      JOIN categories cat ON j.category_id = cat.id
      WHERE j.id = $1
    `,
    values: [id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Pekerjaan tidak ditemukan.");
  }

  const row = result.rows[0];
  return {
    ...row,
    id: String(row.id),
    company_id: String(row.company_id),
    category_id: String(row.category_id),
  };
};

export const getJobsByCompany = async (companyId) => {
  const parsedCompanyId = parsePgIntId(companyId);
  if (parsedCompanyId === null) {
    return [];
  }

  const query = {
    text: "SELECT id, title, company_id, category_id, created_at FROM jobs WHERE company_id = $1 ORDER BY created_at DESC",
    values: [parsedCompanyId],
  };

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    ...row,
    id: String(row.id),
    company_id: String(row.company_id),
    category_id: String(row.category_id),
  }));
};

export const getJobsByCategory = async (categoryId) => {
  const parsedCategoryId = parsePgIntId(categoryId);
  if (parsedCategoryId === null) {
    return [];
  }

  const query = {
    text: "SELECT id, title, company_id, category_id, created_at FROM jobs WHERE category_id = $1 ORDER BY created_at DESC",
    values: [parsedCategoryId],
  };

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    ...row,
    id: String(row.id),
    company_id: String(row.company_id),
    category_id: String(row.category_id),
  }));
};

export const updateJob = async (
  id,
  { title, description, company_id, category_id },
) => {
  const query = {
    text: "UPDATE jobs SET title = $1, description = $2, company_id = $3, category_id = $4 WHERE id = $5 RETURNING id",
    values: [title, description, company_id, category_id, id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal memperbarui. Pekerjaan tidak ditemukan.");
  }
};

export const deleteJob = async (id) => {
  const query = {
    text: "DELETE FROM jobs WHERE id = $1 RETURNING id",
    values: [id],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal menghapus. Pekerjaan tidak ditemukan.");
  }
};

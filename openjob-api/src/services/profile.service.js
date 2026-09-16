/**
 * File: src/services/profile.service.js
 * Layanan untuk mengambil data profil, lamaran, dan markah (bookmark) milik pengguna yang sedang masuk.
 */
import pool from "../config/database.config.js";
import NotFoundError from "../exceptions/not-found.error.js";

export const getUserProfile = async (userId) => {
  const query = {
    text: "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    values: [userId],
  };

  const result = await pool.query(query);

  if (result.rowCount === 0) {
    throw new NotFoundError("Profil pengguna tidak ditemukan.");
  }

  return {
    ...result.rows[0],
    id: String(result.rows[0].id),
  };
};

export const getUserApplications = async (userId) => {
  const query = {
    text: `
      SELECT a.id, a.user_id, a.job_id, a.status, a.created_at,
             a.created_at AS applied_at,
             j.title AS job_title, j.description AS job_description,
             j.company_id, c.name AS company_name, c.location AS company_location,
             j.category_id, cat.name AS category_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      JOIN categories cat ON j.category_id = cat.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
    `,
    values: [userId],
  };

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    id: String(row.id),
    user_id: String(row.user_id),
    job_id: String(row.job_id),
    status: row.status,
    created_at: row.created_at,
    applied_at: row.applied_at,
    job_title: row.job_title,
    job_description: row.job_description,
    company_id: String(row.company_id),
    company_name: row.company_name,
    company_location: row.company_location,
    category_id: String(row.category_id),
    category_name: row.category_name,
    job_type: "full-time",
    experience_level: "mid",
  }));
};

export const getUserBookmarks = async (userId) => {
  const query = {
    text: `
      SELECT b.id, b.created_at AS bookmarked_at, 
             j.id AS job_id, j.title AS job_title, 
             c.name AS company_name
      FROM bookmarks b
      JOIN jobs j ON b.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `,
    values: [userId],
  };

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    ...row,
    id: String(row.id),
    job_id: String(row.job_id),
  }));
};

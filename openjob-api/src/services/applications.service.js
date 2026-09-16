/**
 * File: src/services/applications.service.js
 * Layanan untuk mengelola operasi basis data entitas lamaran pekerjaan.
 */
import pool from "../config/database.config.js";
import NotFoundError from "../exceptions/not-found.error.js";
import InvariantError from "../exceptions/invariant.error.js";
import { parsePgIntId } from "../validators/params.validator.js";

export const createApplication = async (userId, jobId) => {
  const checkQuery = {
    text: "SELECT id FROM applications WHERE user_id = $1 AND job_id = $2",
    values: [userId, jobId],
  };
  const checkResult = await pool.query(checkQuery);
  if (checkResult.rowCount > 0) {
    throw new InvariantError("Anda sudah melamar pekerjaan ini sebelumnya.");
  }

  const jobResult = await pool.query({
    text: "SELECT id FROM jobs WHERE id = $1",
    values: [jobId],
  });
  if (jobResult.rowCount === 0) {
    throw new NotFoundError("Pekerjaan tidak ditemukan.");
  }

  const query = {
    text: "INSERT INTO applications(user_id, job_id) VALUES($1, $2) RETURNING id, user_id, job_id, status",
    values: [userId, jobId],
  };
  const result = await pool.query(query);
  const application = result.rows[0];
  return {
    ...application,
    id: String(application.id),
    user_id: String(application.user_id),
    job_id: String(application.job_id),
  };
};

export const getApplications = async () => {
  const query = `
    SELECT a.id, a.user_id, a.job_id, a.status, a.created_at,
           COALESCE(j.title, 'Job Title') AS job_title,
           COALESCE(j.description, 'Job Description') AS job_description,
           COALESCE(j.company_id, 1) AS company_id,
           COALESCE(c.name, 'Company Name') AS company_name,
           COALESCE(j.category_id, 1) AS category_id,
           COALESCE(cat.name, 'Category Name') AS category_name
    FROM applications a
    LEFT JOIN jobs j ON a.job_id = j.id
    LEFT JOIN companies c ON j.company_id = c.id
    LEFT JOIN categories cat ON j.category_id = cat.id
    ORDER BY a.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows.map((row) => ({
    id: String(row.id),
    user_id: String(row.user_id),
    job_id: String(row.job_id),
    status: row.status,
    created_at: row.created_at,
    applied_at: row.created_at,
    job_title: row.job_title,
    job_description: row.job_description,
    company_id: String(row.company_id),
    company_name: row.company_name,
    category_id: String(row.category_id),
    category_name: row.category_name,
    job_type: "full-time",
  }));
};

export const getApplicationById = async (id) => {
  const query = {
    text: "SELECT * FROM applications WHERE id = $1",
    values: [id],
  };

  const result = await pool.query(query);
  if (result.rowCount === 0) {
    throw new NotFoundError("Lamaran tidak ditemukan.");
  }

  const row = result.rows[0];
  return {
    ...row,
    id: String(row.id),
    user_id: String(row.user_id),
    job_id: String(row.job_id),
  };
};

export const getApplicationsByUser = async (userId) => {
  const parsedUserId = parsePgIntId(userId);
  if (parsedUserId === null) {
    return [];
  }

  const query = {
    text: "SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC",
    values: [parsedUserId],
  };

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    ...row,
    id: String(row.id),
    user_id: String(row.user_id),
    job_id: String(row.job_id),
  }));
};

export const getApplicationsByJob = async (jobId) => {
  const parsedJobId = parsePgIntId(jobId);
  if (parsedJobId === null) {
    return [];
  }

  const query = {
    text: "SELECT * FROM applications WHERE job_id = $1 ORDER BY created_at DESC",
    values: [parsedJobId],
  };

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    ...row,
    id: String(row.id),
    user_id: String(row.user_id),
    job_id: String(row.job_id),
  }));
};

export const updateApplicationStatus = async (id, status) => {
  const query = {
    text: "UPDATE applications SET status = $1 WHERE id = $2 RETURNING id",
    values: [status, id],
  };

  const result = await pool.query(query);
  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal memperbarui. Lamaran tidak ditemukan.");
  }
};

export const deleteApplication = async (id) => {
  const query = {
    text: "DELETE FROM applications WHERE id = $1 RETURNING id",
    values: [id],
  };

  const result = await pool.query(query);
  if (result.rowCount === 0) {
    throw new NotFoundError("Gagal menghapus. Lamaran tidak ditemukan.");
  }
};

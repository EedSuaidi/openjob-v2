/** Layanan metadata dokumen PDF yang disimpan pada filesystem server. */
import pool from "../config/database.config.js";
import NotFoundError from "../exceptions/not-found.error.js";

const toDocument = (row) => ({ ...row, id: String(row.id), user_id: String(row.user_id) });

export const createDocument = async ({ userId, filename, originalName, mimeType, size }) => {
  const result = await pool.query({
    text: `INSERT INTO documents(user_id, filename, original_name, mime_type, size)
           VALUES($1, $2, $3, $4, $5) RETURNING id, user_id, filename, original_name, mime_type, size, created_at`,
    values: [userId, filename, originalName, mimeType, size],
  });
  return toDocument(result.rows[0]);
};

export const getDocuments = async () => {
  const result = await pool.query("SELECT id, user_id, filename, original_name, mime_type, size, created_at FROM documents ORDER BY created_at DESC");
  return result.rows.map(toDocument);
};

export const getDocumentById = async (id) => {
  const result = await pool.query({
    text: "SELECT id, user_id, filename, original_name, mime_type, size, created_at FROM documents WHERE id = $1",
    values: [id],
  });
  if (result.rowCount === 0) throw new NotFoundError("Dokumen tidak ditemukan.");
  return toDocument(result.rows[0]);
};

export const deleteDocument = async (id) => {
  const result = await pool.query({
    text: "DELETE FROM documents WHERE id = $1 RETURNING id, filename",
    values: [id],
  });
  if (result.rowCount === 0) throw new NotFoundError("Dokumen tidak ditemukan.");
  return result.rows[0];
};

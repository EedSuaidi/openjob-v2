import pool from "../config/database.config.js";

export const getApplicationNotificationDetails = async (applicationId) => {
  const result = await pool.query({
    text: `
      SELECT a.created_at AS application_date,
             applicant.name AS applicant_name,
             applicant.email AS applicant_email,
             owner.email AS owner_email
      FROM applications a
      JOIN users applicant ON applicant.id = a.user_id
      JOIN jobs j ON j.id = a.job_id
      JOIN companies c ON c.id = j.company_id
      JOIN users owner ON owner.id = c.owner_id
      WHERE a.id = $1
    `,
    values: [applicationId],
  });
  if (result.rowCount === 0) {
    throw new Error("Data notifikasi lamaran tidak ditemukan.");
  }

  const row = result.rows[0];
  return {
    ownerEmail: row.owner_email,
    applicantName: row.applicant_name,
    applicantEmail: row.applicant_email,
    applicationDate: row.application_date,
  };
};

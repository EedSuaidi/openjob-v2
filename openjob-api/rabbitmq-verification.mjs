import pool from "./src/config/database.config.js";
import { createUser } from "./src/services/users.service.js";
import { createCompany } from "./src/services/companies.service.js";
import { createCategory } from "./src/services/categories.service.js";
import { createJob } from "./src/services/jobs.service.js";
import { createApplication } from "./src/services/applications.service.js";

const stamp = Date.now();
const created = {};

try {
  created.ownerId = await createUser({
    name: "MQ Owner",
    email: `mq-owner-${stamp}@example.test`,
    password: "password123",
    role: "user",
  });
  created.applicantId = await createUser({
    name: "MQ Applicant",
    email: `mq-applicant-${stamp}@example.test`,
    password: "password123",
    role: "user",
  });
  created.companyId = await createCompany(
    {
      name: "MQ Verification",
      location: "Jakarta",
      description: "Verification",
    },
    created.ownerId,
  );
  created.categoryId = await createCategory({ name: "MQ Verification" });
  created.jobId = await createJob({
    title: "MQ Verification Job",
    description: "Temporary job used for RabbitMQ verification.",
    company_id: created.companyId,
    category_id: created.categoryId,
  });

  const application = await createApplication(
    created.applicantId,
    created.jobId,
  );

  let duplicateStatus;
  try {
    await createApplication(created.applicantId, created.jobId);
  } catch (error) {
    duplicateStatus = error.statusCode;
  }

  let missingJobStatus;
  try {
    await createApplication(created.applicantId, 2147483647);
  } catch (error) {
    missingJobStatus = error.statusCode;
  }

  console.log(
    JSON.stringify({ application, duplicateStatus, missingJobStatus }),
  );
} finally {
  if (created.categoryId)
    await pool.query("DELETE FROM categories WHERE id = $1", [
      created.categoryId,
    ]);
  if (created.companyId)
    await pool.query("DELETE FROM companies WHERE id = $1", [
      created.companyId,
    ]);
  if (created.ownerId || created.applicantId) {
    await pool.query("DELETE FROM users WHERE id = ANY($1)", [
      [created.ownerId, created.applicantId].filter(Boolean),
    ]);
  }
  await pool.end();
}

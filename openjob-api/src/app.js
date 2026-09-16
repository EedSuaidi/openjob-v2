/**
 * File: src/app.js
 * Titik konfigurasi utama untuk aplikasi Express.js dan registrasi middleware.
 */
import express from "express";
import cors from "cors";

// Import Routes
import usersRoutes from "./routes/users.route.js";
import authenticationsRoutes from "./routes/authentications.route.js";
import profileRoutes from "./routes/profile.route.js";
import companiesRoutes from "./routes/companies.route.js";
import categoriesRoutes from "./routes/categories.route.js";
import jobsRoutes from "./routes/jobs.route.js";
import applicationsRoutes from "./routes/applications.route.js";
import bookmarksRoutes from "./routes/bookmarks.route.js";
import documentsRoutes from "./routes/documents.route.js";

// Import Global Error Handler
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Registrasi Routes
app.use("/users", usersRoutes);
app.use("/authentications", authenticationsRoutes);
app.use("/profile", profileRoutes);
app.use("/companies", companiesRoutes);
app.use("/categories", categoriesRoutes);
app.use("/jobs", jobsRoutes);
app.use("/applications", applicationsRoutes);
app.use("/bookmarks", bookmarksRoutes);
app.use("/documents", documentsRoutes);

// Middleware penanganan kesalahan (harus diletakkan di bagian paling bawah)
app.use(errorHandler);

export default app;

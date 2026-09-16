/** Konfigurasi upload dokumen PDF menggunakan Multer. */
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import InvariantError from "../exceptions/invariant.error.js";

export const documentsDirectory = path.resolve(
  process.cwd(),
  process.env.DOCUMENTS_UPLOAD_DIR || "uploads/documents"
);

mkdirSync(documentsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: documentsDirectory,
  filename: (req, file, callback) => callback(null, `${randomUUID()}.pdf`),
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype !== "application/pdf") {
    return callback(new InvariantError("File must be a PDF."));
  }
  return callback(null, true);
};

export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("document");

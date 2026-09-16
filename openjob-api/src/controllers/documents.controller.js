/** Pengendali upload, daftar, unduh, dan hapus dokumen PDF. */
import path from "node:path";
import { unlink } from "node:fs/promises";
import * as documentsService from "../services/documents.service.js";
import InvariantError from "../exceptions/invariant.error.js";
import { documentsDirectory } from "../middlewares/upload.middleware.js";

const removeStoredFile = async (filename) => {
  try {
    await unlink(path.join(documentsDirectory, filename));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const contentDispositionFilename = (name) => name.replace(/[\r\n"]/g, "_").replace(/[^\x20-\x7E]/g, "_");

export const postDocument = async (req, res, next) => {
  if (!req.file) return next(new InvariantError("File is required."));
  try {
    const document = await documentsService.createDocument({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
    return res.status(201).json({
      status: "success",
      data: {
        documentId: document.id,
        filename: document.filename,
        originalName: document.original_name,
        size: document.size,
      },
    });
  } catch (error) {
    try { await removeStoredFile(req.file.filename); } catch (cleanupError) { console.error("Gagal menghapus file dokumen yatim:", cleanupError); }
    return next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await documentsService.getDocuments();
    res.status(200).json({ status: "success", data: { documents } });
  } catch (error) { next(error); }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentsService.getDocumentById(req.params.id);
    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${contentDispositionFilename(document.original_name)}"`);
    res.sendFile(path.join(documentsDirectory, document.filename), (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) { next(error); }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await documentsService.deleteDocument(req.params.id);
    await removeStoredFile(document.filename);
    res.status(200).json({ status: "success", message: "Dokumen berhasil dihapus." });
  } catch (error) { next(error); }
};

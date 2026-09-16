/** Rute dokumen PDF. Upload dan penghapusan memerlukan autentikasi. */
import { Router } from "express";
import * as documentsController from "../controllers/documents.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validateParams } from "../middlewares/validation.middleware.js";
import { IdParamSchema } from "../validators/params.validator.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/", verifyToken, uploadDocument, documentsController.postDocument);
router.get("/", documentsController.getDocuments);
router.get("/:id", validateParams(IdParamSchema, "Dokumen tidak ditemukan."), documentsController.getDocumentById);
router.delete("/:id", verifyToken, validateParams(IdParamSchema, "Dokumen tidak ditemukan."), documentsController.deleteDocument);

export default router;

/**
 * File: src/controllers/applications.controller.js
 * Pengendali untuk rute lamaran pekerjaan.
 */
import * as applicationsService from "../services/applications.service.js";
import { publishApplicationNotification } from "../services/application-notification.publisher.js";

export const postApplication = async (req, res, next) => {
  try {
    const { id: userId } = req.user; // Didapat dari verifyToken
    const { job_id } = req.body;

    const application = await applicationsService.createApplication(
      userId,
      job_id
    );
    publishApplicationNotification(application.id);
    res.status(201).json({
      status: "success",
      message: "Berhasil melamar pekerjaan.",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const applications = await applicationsService.getApplications();
    res.status(200).json({ status: "success", data: { applications } });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationsService.getApplicationById(
      req.params.id
    );
    res.status(200).json({ status: "success", data: application });
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByUser = async (req, res, next) => {
  try {
    const applications = await applicationsService.getApplicationsByUser(
      req.params.userId
    );
    res.status(200).json({ status: "success", data: { applications } });
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByJob = async (req, res, next) => {
  try {
    const applications = await applicationsService.getApplicationsByJob(
      req.params.jobId
    );
    res.status(200).json({ status: "success", data: { applications } });
  } catch (error) {
    next(error);
  }
};

export const putApplication = async (req, res, next) => {
  try {
    const { status } = req.body;
    await applicationsService.updateApplicationStatus(req.params.id, status);
    res.status(200).json({
      status: "success",
      message: "Status lamaran berhasil diperbarui.",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    await applicationsService.deleteApplication(req.params.id);
    res
      .status(200)
      .json({ status: "success", message: "Lamaran berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

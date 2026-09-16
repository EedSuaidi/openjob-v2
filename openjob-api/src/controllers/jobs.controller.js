/**
 * File: src/controllers/jobs.controller.js
 * Pengendali untuk rute pekerjaan.
 */
import * as jobsService from "../services/jobs.service.js";

export const postJob = async (req, res, next) => {
  try {
    const jobId = await jobsService.createJob(req.body);
    res.status(201).json({ status: "success", data: { id: String(jobId) } });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const { title, "company-name": companyName } = req.query;
    const jobs = await jobsService.getJobs(title, companyName);
    res.status(200).json({ status: "success", data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await jobsService.getJobById(req.params.id);
    res.status(200).json({ status: "success", data: job });
  } catch (error) {
    next(error);
  }
};

export const getJobsByCompany = async (req, res, next) => {
  try {
    const jobs = await jobsService.getJobsByCompany(req.params.companyId);
    res.status(200).json({ status: "success", data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const getJobsByCategory = async (req, res, next) => {
  try {
    const jobs = await jobsService.getJobsByCategory(req.params.categoryId);
    res.status(200).json({ status: "success", data: { jobs } });
  } catch (error) {
    next(error);
  }
};

export const putJob = async (req, res, next) => {
  try {
    await jobsService.updateJob(req.params.id, req.body);
    res
      .status(200)
      .json({ status: "success", message: "Pekerjaan berhasil diperbarui." });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    await jobsService.deleteJob(req.params.id);
    res
      .status(200)
      .json({ status: "success", message: "Pekerjaan berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

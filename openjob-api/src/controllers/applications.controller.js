/**
 * File: src/controllers/applications.controller.js
 * Pengendali untuk rute lamaran pekerjaan.
 */
import * as applicationsService from "../services/applications.service.js";
import { publishApplicationNotification } from "../services/application-notification.publisher.js";
import {
  APPLICATION_LIST_CACHE_KEY,
  applicationDetailCacheKey,
  applicationsByJobCacheKey,
  applicationsByUserCacheKey,
  deleteCache,
  getCache,
  setCache,
} from "../services/cache.service.js";

export const postApplication = async (req, res, next) => {
  try {
    const { id: userId } = req.user; // Didapat dari verifyToken
    const { job_id } = req.body;

    const application = await applicationsService.createApplication(
      userId,
      job_id,
    );
    await deleteCache(
      APPLICATION_LIST_CACHE_KEY,
      applicationsByUserCacheKey(userId),
      applicationsByJobCacheKey(job_id),
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
    const cachedApplications = await getCache(APPLICATION_LIST_CACHE_KEY);
    if (cachedApplications !== null) {
      res.set("X-Data-Source", "cache");
      return res
        .status(200)
        .json({
          status: "success",
          data: { applications: cachedApplications },
        });
    }

    const applications = await applicationsService.getApplications();
    await setCache(APPLICATION_LIST_CACHE_KEY, applications);
    res.set("X-Data-Source", "database");
    res.status(200).json({ status: "success", data: { applications } });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const cacheKey = applicationDetailCacheKey(req.params.id);
    const cachedApplication = await getCache(cacheKey);
    if (cachedApplication !== null) {
      res.set("X-Data-Source", "cache");
      return res
        .status(200)
        .json({ status: "success", data: cachedApplication });
    }

    const application = await applicationsService.getApplicationById(
      req.params.id,
    );
    await setCache(cacheKey, application);
    res.set("X-Data-Source", "database");
    res.status(200).json({ status: "success", data: application });
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByUser = async (req, res, next) => {
  try {
    const cacheKey = applicationsByUserCacheKey(req.params.userId);
    const cachedApplications = await getCache(cacheKey);
    if (cachedApplications !== null) {
      res.set("X-Data-Source", "cache");
      return res
        .status(200)
        .json({
          status: "success",
          data: { applications: cachedApplications },
        });
    }

    const applications = await applicationsService.getApplicationsByUser(
      req.params.userId,
    );
    await setCache(cacheKey, applications);
    res.set("X-Data-Source", "database");
    res.status(200).json({ status: "success", data: { applications } });
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByJob = async (req, res, next) => {
  try {
    const cacheKey = applicationsByJobCacheKey(req.params.jobId);
    const cachedApplications = await getCache(cacheKey);
    if (cachedApplications !== null) {
      res.set("X-Data-Source", "cache");
      return res
        .status(200)
        .json({
          status: "success",
          data: { applications: cachedApplications },
        });
    }

    const applications = await applicationsService.getApplicationsByJob(
      req.params.jobId,
    );
    await setCache(cacheKey, applications);
    res.set("X-Data-Source", "database");
    res.status(200).json({ status: "success", data: { applications } });
  } catch (error) {
    next(error);
  }
};

export const putApplication = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await applicationsService.updateApplicationStatus(
      req.params.id,
      status,
    );
    await deleteCache(
      APPLICATION_LIST_CACHE_KEY,
      applicationDetailCacheKey(req.params.id),
      applicationsByUserCacheKey(application.user_id),
      applicationsByJobCacheKey(application.job_id),
    );
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
    const application = await applicationsService.deleteApplication(
      req.params.id,
    );
    await deleteCache(
      APPLICATION_LIST_CACHE_KEY,
      applicationDetailCacheKey(req.params.id),
      applicationsByUserCacheKey(application.user_id),
      applicationsByJobCacheKey(application.job_id),
    );
    res
      .status(200)
      .json({ status: "success", message: "Lamaran berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

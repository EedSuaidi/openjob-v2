/**
 * File: src/controllers/companies.controller.js
 * Pengendali untuk rute perusahaan.
 */
import * as companiesService from "../services/companies.service.js";
import {
  COMPANY_LIST_CACHE_KEY,
  companyDetailCacheKey,
  deleteCache,
  getCache,
  setCache,
} from "../services/cache.service.js";

export const postCompany = async (req, res, next) => {
  try {
    const companyId = await companiesService.createCompany(
      req.body,
      req.user.id
    );
    await deleteCache(COMPANY_LIST_CACHE_KEY);
    res.set("X-Data-Source", "database");
    res
      .status(201)
      .json({ status: "success", data: { id: String(companyId) } });
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const cachedCompanies = await getCache(COMPANY_LIST_CACHE_KEY);
    if (cachedCompanies !== null) {
      res.set("X-Data-Source", "cache");
      return res
        .status(200)
        .json({ status: "success", data: { companies: cachedCompanies } });
    }

    const companies = await companiesService.getCompanies();
    await setCache(COMPANY_LIST_CACHE_KEY, companies);
    res.set("X-Data-Source", "database");
    res.status(200).json({ status: "success", data: { companies } });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const cacheKey = companyDetailCacheKey(req.params.id);
    const cachedCompany = await getCache(cacheKey);
    if (cachedCompany !== null) {
      res.set("X-Data-Source", "cache");
      return res.status(200).json({ status: "success", data: cachedCompany });
    }

    const company = await companiesService.getCompanyById(req.params.id);
    await setCache(cacheKey, company);
    res.set("X-Data-Source", "database");
    res.status(200).json({ status: "success", data: company });
  } catch (error) {
    next(error);
  }
};

export const putCompany = async (req, res, next) => {
  try {
    await companiesService.updateCompany(req.params.id, req.body);
    await deleteCache(
      COMPANY_LIST_CACHE_KEY,
      companyDetailCacheKey(req.params.id)
    );
    res.set("X-Data-Source", "database");
    res
      .status(200)
      .json({ status: "success", message: "Perusahaan berhasil diperbarui." });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    await companiesService.deleteCompany(req.params.id);
    await deleteCache(
      COMPANY_LIST_CACHE_KEY,
      companyDetailCacheKey(req.params.id)
    );
    res.set("X-Data-Source", "database");
    res
      .status(200)
      .json({ status: "success", message: "Perusahaan berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

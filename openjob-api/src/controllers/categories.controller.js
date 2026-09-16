/**
 * File: src/controllers/categories.controller.js
 * Pengendali untuk rute kategori.
 */
import * as categoriesService from "../services/categories.service.js";

export const postCategory = async (req, res, next) => {
  try {
    const categoryId = await categoriesService.createCategory(req.body);
    res
      .status(201)
      .json({ status: "success", data: { id: String(categoryId) } });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoriesService.getCategories();
    res.status(200).json({ status: "success", data: { categories } });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoriesService.getCategoryById(req.params.id);
    res.status(200).json({ status: "success", data: category });
  } catch (error) {
    next(error);
  }
};

export const putCategory = async (req, res, next) => {
  try {
    await categoriesService.updateCategory(req.params.id, req.body);
    res
      .status(200)
      .json({ status: "success", message: "Kategori berhasil diperbarui." });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoriesService.deleteCategory(req.params.id);
    res
      .status(200)
      .json({ status: "success", message: "Kategori berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

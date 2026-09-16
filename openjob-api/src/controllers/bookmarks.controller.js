/**
 * File: src/controllers/bookmarks.controller.js
 * Pengendali untuk rute markah (bookmark) pekerjaan.
 */
import * as bookmarksService from "../services/bookmarks.service.js";
import {
  bookmarksByUserCacheKey,
  deleteCache,
  getCache,
  setCache,
} from "../services/cache.service.js";

export const postBookmark = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { jobId } = req.params;

    const bookmarkId = await bookmarksService.createBookmark(userId, jobId);
    await deleteCache(bookmarksByUserCacheKey(userId));
    res.status(201).json({
      status: "success",
      message: "Pekerjaan berhasil disimpan.",
      data: { id: String(bookmarkId) },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookmarkDetail = async (req, res, next) => {
  try {
    const bookmark = await bookmarksService.getBookmarkDetail(req.params.id);
    res.status(200).json({ status: "success", data: bookmark });
  } catch (error) {
    next(error);
  }
};

export const deleteBookmark = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { jobId } = req.params;

    await bookmarksService.deleteBookmark(userId, jobId);
    await deleteCache(bookmarksByUserCacheKey(userId));
    res.status(200).json({
      status: "success",
      message: "Pekerjaan berhasil dihapus dari daftar simpanan.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookmarks = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const cacheKey = bookmarksByUserCacheKey(userId);
    const cachedBookmarks = await getCache(cacheKey);

    if (cachedBookmarks !== null) {
      res.set("X-Data-Source", "cache");
      return res
        .status(200)
        .json({ status: "success", data: { bookmarks: cachedBookmarks } });
    }

    const bookmarks = await bookmarksService.getAllBookmarks(userId);
    await setCache(cacheKey, bookmarks);
    res.set("X-Data-Source", "database");
    res.status(200).json({ status: "success", data: { bookmarks } });
  } catch (error) {
    next(error);
  }
};

/**
 * File: src/controllers/profile.controller.js
 * Pengendali untuk menangani permintaan terkait data profil pengguna yang sedang terautentikasi.
 */
import * as profileService from "../services/profile.service.js";

export const getProfile = async (req, res, next) => {
  try {
    // req.user didapatkan dari middleware verifyToken
    const { id: userId } = req.user;

    const profile = await profileService.getUserProfile(userId);

    res.status(200).json({
      status: "success",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const applications = await profileService.getUserApplications(userId);

    res.status(200).json({
      status: "success",
      data: {
        applications,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookmarks = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const bookmarks = await profileService.getUserBookmarks(userId);

    res.status(200).json({
      status: "success",
      data: {
        bookmarks,
      },
    });
  } catch (error) {
    next(error);
  }
};

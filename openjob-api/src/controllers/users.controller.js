/**
 * File: src/controllers/users.controller.js
 * Pengendali untuk menangani permintaan terkait entitas pengguna.
 */
import AuthorizationError from "../exceptions/authorization.error.js";
import * as usersService from "../services/users.service.js";
import {
  deleteCache,
  getCache,
  setCache,
  userDetailCacheKey,
} from "../services/cache.service.js";

export const registerUser = async (req, res, next) => {
  try {
    const userId = await usersService.createUser(req.body);

    res.set("X-Data-Source", "database");
    res.status(201).json({
      status: "success",
      message: "Pengguna berhasil didaftarkan.",
      data: {
        id: String(userId),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const cacheKey = userDetailCacheKey(req.params.id);
    const cachedUser = await getCache(cacheKey);

    if (cachedUser !== null) {
      res.set("X-Data-Source", "cache");
      return res.status(200).json({ status: "success", data: cachedUser });
    }

    const user = await usersService.getUserById(req.params.id);
    await setCache(cacheKey, user);

    res.set("X-Data-Source", "database");
    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const putUser = async (req, res, next) => {
  try {
    const userIdFromToken = Number(req.user.id);
    const userIdFromParam = Number(req.params.id);

    if (userIdFromToken !== userIdFromParam) {
      throw new AuthorizationError(
        "Anda tidak memiliki izin untuk memperbarui data pengguna lain."
      );
    }

    const user = await usersService.updateUser(req.params.id, req.body);
    await deleteCache(userDetailCacheKey(req.params.id));

    res.set("X-Data-Source", "database");
    res.status(200).json({
      status: "success",
      message: "Pengguna berhasil diperbarui.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

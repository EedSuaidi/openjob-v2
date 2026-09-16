/**
 * File: src/controllers/authentications.controller.js
 * Pengendali untuk menangani proses masuk (login), pembaruan token, dan keluar (logout).
 */
import * as authenticationsService from "../services/authentications.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.util.js";
import InvariantError from "../exceptions/invariant.error.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verifikasi kredensial dari basis data
    const id = await authenticationsService.verifyUserCredential(
      email,
      password
    );

    // Pembuatan token JWT
    const accessToken = generateAccessToken({ id });
    const refreshToken = generateRefreshToken({ id });

    // Simpan refresh token ke basis data
    await authenticationsService.addRefreshToken(refreshToken);

    res.status(200).json({
      status: "success",
      message: "Autentikasi berhasil.",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const putAuthentication = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Pastikan refresh token ada di basis data
    await authenticationsService.verifyRefreshTokenExists(refreshToken);

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new InvariantError(
        "Refresh token tidak valid atau telah kedaluwarsa."
      );
    }

    // Buat access token baru dengan umur 3 jam (sesuai config util)
    const accessToken = generateAccessToken({ id: decoded.id });

    res.status(200).json({
      status: "success",
      message: "Access Token berhasil diperbarui.",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Validasi token dan hapus dari basis data
    await authenticationsService.verifyRefreshTokenExists(refreshToken);
    await authenticationsService.deleteRefreshToken(refreshToken);

    res.status(200).json({
      status: "success",
      message: "Refresh token berhasil dihapus. Anda berhasil keluar.",
    });
  } catch (error) {
    next(error);
  }
};

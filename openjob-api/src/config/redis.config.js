/**
 * Koneksi Redis opsional untuk cache aplikasi.
 * Aplikasi tetap dapat menggunakan PostgreSQL apabila Redis tidak tersedia.
 */
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const redisHost = process.env.REDIS_HOST;

export const redisClient = redisHost
  ? createClient({
      socket: {
        host: redisHost,
        port: Number(process.env.REDIS_PORT || 6379),
        connectTimeout: 1000,
        reconnectStrategy: false,
      },
    })
  : null;

if (redisClient) {
  redisClient.on("error", (error) => {
    console.error("Redis error:", error.message);
  });
}

export const connectRedis = async () => {
  if (!redisClient) {
    console.warn("REDIS_HOST tidak diatur; cache Redis dinonaktifkan.");
    return false;
  }

  if (redisClient.isReady) return true;

  try {
    await redisClient.connect();
    console.log("Redis terhubung.");
    return true;
  } catch (error) {
    console.error("Redis tidak tersedia; aplikasi menggunakan database tanpa cache.");
    return false;
  }
};

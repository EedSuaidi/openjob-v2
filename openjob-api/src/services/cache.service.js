/** Operasi cache yang gagal tidak menghentikan alur database utama. */
import { redisClient } from "../config/redis.config.js";

export const CACHE_TTL_SECONDS = 60 * 60;
export const COMPANY_LIST_CACHE_KEY = "companies:list";
export const USER_DETAIL_CACHE_KEY = "users";
export const companyDetailCacheKey = (id) => `companies:${id}`;
export const userDetailCacheKey = (id) => `users:${id}`;

const cacheAvailable = () => redisClient?.isReady;

export const getCache = async (key) => {
  if (!cacheAvailable()) return null;
  try {
    const value = await redisClient.get(key);
    return value === null ? null : JSON.parse(value);
  } catch (error) {
    console.error("Gagal membaca cache Redis:", error.message);
    return null;
  }
};

export const setCache = async (key, value) => {
  if (!cacheAvailable()) return;
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.error("Gagal menulis cache Redis:", error.message);
  }
};

export const deleteCache = async (...keys) => {
  if (!cacheAvailable()) return;
  try {
    await redisClient.del(keys);
  } catch (error) {
    console.error("Gagal menghapus cache Redis:", error.message);
  }
};

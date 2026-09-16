/**
 * File: src/config/database.config.js
 * Modul ini mengatur koneksi pool ke database PostgreSQL menggunakan variabel environment.
 */
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool();

export default pool;

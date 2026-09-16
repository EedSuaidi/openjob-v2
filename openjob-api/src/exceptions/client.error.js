/**
 * File: src/exceptions/client.error.js
 * Kelas dasar untuk kesalahan yang disebabkan oleh klien (HTTP 4xx).
 */
export default class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ClientError";
  }
}

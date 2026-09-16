/**
 * File: src/exceptions/authorization.error.js
 * Eksepsi untuk kegagalan otorisasi (pengguna tidak memiliki hak akses).
 */
import ClientError from "./client.error.js";

export default class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

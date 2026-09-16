/**
 * File: src/exceptions/authentication.error.js
 * Eksepsi untuk kegagalan autentikasi (kredensial tidak valid atau token kadaluarsa).
 */
import ClientError from "./client.error.js";

export default class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

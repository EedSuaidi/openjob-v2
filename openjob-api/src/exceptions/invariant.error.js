/**
 * File: src/exceptions/invariant.error.js
 * Eksepsi untuk kesalahan logika bisnis atau validasi data yang tidak sesuai.
 */
import ClientError from "./client.error.js";

export default class InvariantError extends ClientError {
  constructor(message) {
    super(message, 400);
    this.name = "InvariantError";
  }
}

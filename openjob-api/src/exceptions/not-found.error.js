/**
 * File: src/exceptions/not-found.error.js
 * Eksepsi ketika sumber daya yang dicari tidak ditemukan di server.
 */
import ClientError from "./client.error.js";

export default class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

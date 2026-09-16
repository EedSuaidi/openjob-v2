/** Publisher berumur panjang untuk notifikasi lamaran pekerjaan. */
import {
  APPLICATION_NOTIFICATION_QUEUE,
  connectRabbitMq,
} from "../config/rabbitmq.config.js";

let connection;
let channel;

const clearPublisher = () => {
  connection = undefined;
  channel = undefined;
};

export const initializeApplicationNotificationPublisher = async () => {
  if (channel) return true;

  try {
    connection = await connectRabbitMq();
    if (!connection) {
      console.warn("RabbitMQ tidak dikonfigurasi; notifikasi aplikasi dinonaktifkan.");
      return false;
    }

    connection.on("error", (error) => {
      console.error("RabbitMQ publisher error:", error.message);
    });
    connection.on("close", clearPublisher);

    channel = await connection.createChannel();
    await channel.assertQueue(APPLICATION_NOTIFICATION_QUEUE, { durable: true });
    console.log("RabbitMQ publisher terhubung.");
    return true;
  } catch (error) {
    clearPublisher();
    console.error("RabbitMQ tidak tersedia; notifikasi aplikasi tidak dipublikasikan.");
    return false;
  }
};

export const publishApplicationNotification = (applicationId) => {
  if (!channel) {
    console.error("Notifikasi aplikasi tidak dipublikasikan: RabbitMQ belum terhubung.");
    return false;
  }

  try {
    return channel.sendToQueue(
      APPLICATION_NOTIFICATION_QUEUE,
      Buffer.from(JSON.stringify({ application_id: String(applicationId) })),
      { persistent: true }
    );
  } catch (error) {
    console.error("Gagal memublikasikan notifikasi aplikasi:", error.message);
    return false;
  }
};

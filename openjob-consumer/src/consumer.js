import {
  APPLICATION_NOTIFICATION_QUEUE,
  connectRabbitMq,
} from "./config/rabbitmq.config.js";
import { getApplicationNotificationDetails } from "./services/applications.service.js";
import { sendApplicationNotificationEmail } from "./services/mail.service.js";

const processMessage = async (channel, message) => {
  let payload;
  try {
    payload = JSON.parse(message.content.toString());
    if (
      !payload ||
      Object.keys(payload).length !== 1 ||
      typeof payload.application_id !== "string"
    ) {
      throw new Error("Payload notifikasi aplikasi tidak valid.");
    }
  } catch (error) {
    console.error("Pesan RabbitMQ dibuang:", error.message);
    channel.nack(message, false, false);
    return;
  }

  try {
    const notification = await getApplicationNotificationDetails(
      payload.application_id,
    );
    await sendApplicationNotificationEmail(notification);
    channel.ack(message);
  } catch (error) {
    console.error("Gagal memproses notifikasi aplikasi:", error.message);
    channel.nack(message, false, true);
  }
};

const startConsumer = async () => {
  const connection = await connectRabbitMq();
  if (!connection) {
    throw new Error("RabbitMQ belum dikonfigurasi.");
  }

  connection.on("error", (error) => {
    console.error("RabbitMQ consumer error:", error.message);
  });

  const channel = await connection.createChannel();
  await channel.assertQueue(APPLICATION_NOTIFICATION_QUEUE, { durable: true });
  await channel.prefetch(1);
  await channel.consume(APPLICATION_NOTIFICATION_QUEUE, (message) => {
    if (message) void processMessage(channel, message);
  });

  console.log(
    `Consumer RabbitMQ berjalan pada queue ${APPLICATION_NOTIFICATION_QUEUE}.`,
  );
};

startConsumer().catch((error) => {
  console.error("Consumer RabbitMQ gagal dijalankan:", error.message);
  process.exitCode = 1;
});

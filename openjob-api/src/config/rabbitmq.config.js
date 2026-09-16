/** Konfigurasi koneksi RabbitMQ berbasis environment variables. */
import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

export const APPLICATION_NOTIFICATION_QUEUE = "application-notifications";

const getRabbitMqUrl = () => {
  if (process.env.AMQP_URL) return process.env.AMQP_URL;
  if (!process.env.RABBITMQ_HOST) return null;

  const port = process.env.RABBITMQ_PORT || 5672;
  const user = process.env.RABBITMQ_USER;
  const password = process.env.RABBITMQ_PASSWORD;
  const credentials = user
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password || "")}@`
    : "";

  return `amqp://${credentials}${process.env.RABBITMQ_HOST}:${port}`;
};

export const connectRabbitMq = async () => {
  const url = getRabbitMqUrl();
  if (!url) return null;
  return amqp.connect(url);
};

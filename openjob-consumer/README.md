# OpenJob Consumer

Consumer RabbitMQ untuk mengirim email notifikasi ketika lamaran pekerjaan dibuat.

## Menjalankan

1. Buat file `.env` dengan konfigurasi PostgreSQL, RabbitMQ, dan SMTP yang sama dengan API.
2. Instal dependency:

   ```bash
   npm install
   ```

3. Jalankan consumer:

   ```bash
   npm run start
   ```

Consumer mendengarkan queue `application-notifications`. API memublikasikan pesan ke queue tersebut dengan payload `{ "application_id": "..." }`.

## Perintah npm

| Perintah            | Kegunaan                                     |
| ------------------- | -------------------------------------------- |
| `npm run start`     | Menjalankan consumer.                        |
| `npm run start:dev` | Menjalankan consumer dengan Node watch mode. |

require("dotenv").config();
module.exports = {
  // HOST: "db", // ใช้ใน Docker
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  PORT: process.env.DB_PORT,
  // SOCKETPATH: process.env.DB_SOCKETPATH || "/var/run/mysqld/mysqld.sock", // ใช้ใน Linux หรือ Mac
};

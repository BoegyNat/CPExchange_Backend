require("dotenv").config();
module.exports = {
  // HOST: "db", // ใช้ใน Docker
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "boegy5882",
  DB: process.env.DB_NAME || "cpexchange",
  PORT: process.env.DB_PORT || "3306",
  // SOCKETPATH: process.env.DB_SOCKETPATH || "/var/run/mysqld/mysqld.sock", // ใช้ใน Linux หรือ Mac
};

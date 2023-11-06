module.exports = {
  HOST: "unihr-dev.clqbdvbor7oj.ap-southeast-1.rds.amazonaws.com",
  PORT: "3306",
  USER: "admin",
  PASSWORD: "7b7ca8c99",
  DB: "UniGA",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

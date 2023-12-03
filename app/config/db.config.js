module.exports = {
  HOST: "34.143.182.29",
  PORT: "3306",
  USER: "ant-hr-mysql",
  PASSWORD: "zicxucsI2wc2Fxdo",
  DB: "UniGA",
  dialect: "mysql",
  SOCKETPATH: "/cloudsql/anthr-320007:asia-southeast1:ant-hr-mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

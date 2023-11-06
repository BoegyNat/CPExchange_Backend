const { authJwt } = require("../middleware");
const registerOfDriverController = require("../controllers/registerOfDriver.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/allRegistersOfDriver",
    [authJwt.verifyToken],
    registerOfDriverController.getAllRegistersOfDriver
  );

  app.get(
    "/api/RegisterOfDriver/:idOrder",
    [authJwt.verifyToken],
    registerOfDriverController.getRegistersOfDriver
  );

  app.get(
    "/api/RegisterOfDriverByIdUser/:idUser",
    [authJwt.verifyToken],
    registerOfDriverController.getRegistersOfDriverByIdUser
  );

  app.post(
    "/api/RegisterOfDriverByTypeAndDate",
    [authJwt.verifyToken],
    registerOfDriverController.getRegistersOfDriverByTypeAndDate
  );

  app.get(
    "/api/RegisterOfDriverByType/:type",
    [authJwt.verifyToken],
    registerOfDriverController.getRegistersOfDriverByType
  );

  app.get(
    "/api/RegisterOfDriverByDuration/:dateStart/:dateEnd",
    [authJwt.verifyToken],
    registerOfDriverController.getRegistersOfDriverByDuration
  );

};

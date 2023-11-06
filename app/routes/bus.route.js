const { authJwt } = require("../middleware");
const busController = require("../controllers/bus.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/buses",
    [authJwt.verifyToken],
    busController.getAllBuses
  );

  app.get(
    "/api/bus/:idBus",
    [authJwt.verifyToken],
    busController.getBus
  );
};

const { authJwt } = require("../middleware");
const requestPassengerController = require("../controllers/requestPassenger.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/requestPassenger",
      [authJwt.verifyToken],
      requestPassengerController.getAllRequestsPassenger
    );
  
    app.get(
      "/api/requestPassengerByIdPassenger/:IdPassenger",
      [authJwt.verifyToken],
      requestPassengerController.getRequestsPassengerByIdPassenger
    );

    app.get(
        "/api/requestPassengerByIdDriver/:IdDriver",
        [authJwt.verifyToken],
        requestPassengerController.getRequestsPassengerByIdDriver
    );
};
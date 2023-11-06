const { authJwt } = require("../middleware");
const waitingFriendCarController = require("../controllers/waitingFriendCar.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/waitingFriendCars",
    [authJwt.verifyToken],
    waitingFriendCarController.getAllWaitingFriendCars
  );

  app.get(
    "/api/waitingFriendCar/:idDriver",
    [authJwt.verifyToken],
    waitingFriendCarController.getWaitingFriendCarsByIdDriver
  );

  app.get(
    "/api/waitingFriendCarByIdPassenger/:idPassenger",
    [authJwt.verifyToken],
    waitingFriendCarController.getWaitingFriendCarsByIdPassenger
  );

  app.post(
    "/api/waitingFriendCar/changingStatus/:idOrder/:status",
    [authJwt.verifyToken],
    waitingFriendCarController.changingStatusWaitingFriendCar
  );
};

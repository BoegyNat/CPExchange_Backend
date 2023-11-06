const { authJwt } = require("../middleware");
const PassengerFriendToFriendController = require("../controllers/passengerFriendToFriend.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/passengers_friendTofriend",
      [authJwt.verifyToken],
      PassengerFriendToFriendController.getAllPassengerFriendToFriends
    );
  
    app.get(
      "/api/passenger_friendTofriend_byId/:id",
      [authJwt.verifyToken],
      PassengerFriendToFriendController.getPassengerFriendToFriendById
    );

    app.get(
        "/api/passengers_friendTofriend_byidDriver/:idDriver",
        [authJwt.verifyToken],
        PassengerFriendToFriendController.getPassengerFriendToFriendByIdDriver
    );

    app.get(
      "/api/waitingResponse_passengers_friendTofriend_byidDriver/:idDriver",
      [authJwt.verifyToken],
      PassengerFriendToFriendController.getWaitingResponsePassengerFriendToFriendByIdDriver
    );

    app.get(
      "/api/passengers_friendTofriend_byidPassenger/:idPassenger",
      [authJwt.verifyToken],
      PassengerFriendToFriendController.getPassengerFriendToFriendByIdPassenger
    );  

    app.get(
      "/api/waitingResponse_passengers_friendTofriend_byidPassenger/:idPassenger",
      [authJwt.verifyToken],
      PassengerFriendToFriendController.getWaitingResponsePassengerFriendToFriendByIdPassenger
    );  

    app.post(
      "/api/passengers_friendTofriend_byidRegisterAndDate",
      [authJwt.verifyToken],
      PassengerFriendToFriendController.getPassengerFriendToFriendByIdRegisterAndDate
    );

    app.post(
      "/api/response_driver",
      [authJwt.verifyToken],
      PassengerFriendToFriendController.postReponseFromDriver
    );
};
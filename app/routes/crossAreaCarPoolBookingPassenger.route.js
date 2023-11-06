const { authJwt } = require("../middleware");
const CrossAreaCarPoolBookingPassengerController = require("../controllers/crossAreaCarPoolBookingPassenger.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
        "/api/cross_area_car_pool_booking_passengers",
        [authJwt.verifyToken],
        CrossAreaCarPoolBookingPassengerController.getAllCrossAreaCarPoolBookingPassengers
    );
  
    app.get(
        "/api/cross_area_car_pool_booking_passengerbyIdbooking/:idBooking",
        [authJwt.verifyToken],
        CrossAreaCarPoolBookingPassengerController.getCrossAreaCarPoolBookingPassengerByIdBooking
    );


};
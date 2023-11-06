const { authJwt } = require("../middleware");
const crossAreaCarBookingPassengerController = require("../controllers/crossAreaCarBookingPassenger.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/cross_area_car_booking_passengers",
    [authJwt.verifyToken],
    crossAreaCarBookingPassengerController.getAllCrossAreaCarBookingPassengers
  );

  app.get(
    "/api/cross_area_car_booking_passenger/:id",
    [authJwt.verifyToken],
    crossAreaCarBookingPassengerController.getCrossAreaCarBookingPassengerById
  );

  app.get(
    "/api/cross_area_car_booking_passengerbyIdbooking/:idBooking",
    [authJwt.verifyToken],
    crossAreaCarBookingPassengerController.getCrossAreaCarBookingPassengerByIdBooking
  );

  app.post(
    "/api/delete_car_cross_area_car_booking_passenger",
    [authJwt.verifyToken],
    crossAreaCarBookingPassengerController.deleteCarCrossAreaCarBookingPassenger
  );
};

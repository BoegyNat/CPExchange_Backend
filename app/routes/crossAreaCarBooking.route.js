const { authJwt } = require("../middleware");
const crossAreaCarBookingController = require("../controllers/crossAreaCarBooking.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/cross_area_car_bookings",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getAllCrossAreaCarBookings
  );

  app.get(
    "/api/cross_area_car_booking/:id",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getCrossAreaCarBookingById
  );

  app.get(
    "/api/cross_area_car_booking_byIdUser/:idUser",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getCrossAreaCarBookingByIdUser
  );

  app.get(
    "/api/cross_area_car_booking_byIdDriver/:idDriver",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getCrossAreaCarBookingByIdDriver
  );

  app.get(
    "/api/cross_area_car_booking_byIdUser_ForRating/:idUser",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getCrossAreaCarBookingByIdUserForRating
  );

  app.get(
    "/api/cross_area_car_booking_byIdApprovedUser/:idApprovedUser",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getCrossAreaCarBookingByIdApprovedUserForManager
  );

  app.post(
    "/api/cross_area_car_bookingBystartDate",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getCrossAreaCarBookingByStartDate
  );

  app.post(
    "/api/cross_area_car_bookingByStartDateAndendDate",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getCrossAreaCarBookingByStartDateAndEndDate
  );

  app.post(
    "/api/add_newcross_area_car_booking",
    [authJwt.verifyToken],
    crossAreaCarBookingController.postNewCrossAreaCarBooking
  );

  app.post(
    "/api/manage_car_cross_area_car_booking",
    [authJwt.verifyToken],
    crossAreaCarBookingController.postManageCarCrossAreaCarBooking
  );

  app.post(
    "/api/delete_car_cross_area_car_booking",
    [authJwt.verifyToken],
    crossAreaCarBookingController.deleteCarCrossAreaCarBooking
  );
  app.post(
    "/api/approved_cross_area_car_booking",
    [authJwt.verifyToken],
    crossAreaCarBookingController.postApprovedCrossAreaCarBooking
  );
  app.post(
    "/api/cross_area_car_booking_ByFilter",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getAllCrossAreaCarBookingsByFilter
  );
  app.post(
    "/api/cross_area_car_booking_ByFilter_byIdDriver",
    [authJwt.verifyToken],
    crossAreaCarBookingController.getAllCrossAreaCarBookingsByFilterByIdDriver
  );
};

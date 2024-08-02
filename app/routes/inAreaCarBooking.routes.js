const { authJwt } = require("../middleware");
const InAreaCarBookingController = require("../controllers/inAreaCarBooking.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/in_area_car_bookings",
    [authJwt.verifyToken],
    InAreaCarBookingController.getAllInAreaCarBookings
  );

  app.get(
    "/api/in_area_car_booking/:id",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingById
  );

  app.get(
    "/api/in_area_car_booking_byIdUser/:idUser",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingByIdUser
  );

  app.get(
    "/api/in_area_car_booking_byIdDriver/:idDriver",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingByIdDriver
  );

  app.get(
    "/api/in_area_car_booking_byIdApprovedUser/:idApprovedUser",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingByIdApprovedUserForManager
  );

  app.post(
    "/api/in_area_car_bookingBystartDate",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingByStartDate
  );

  app.post(
    "/api/in_area_car_bookingByStartDateAndendDate",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingByStartDateAndEndDate
  );

  app.post(
    "/api/post_New_In_Area_Car_Booking",
    [authJwt.verifyToken],
    InAreaCarBookingController.postNewInAreaCarBooking
  );
  app.post(
    "/api/manage_car_in_area_car_booking",
    [authJwt.verifyToken],
    InAreaCarBookingController.postManageCarInAreaCarBooking
  );

  app.post(
    "/api/delete_car_in_area_car_booking",
    [authJwt.verifyToken],
    InAreaCarBookingController.deleteCarInAreaCarBooking
  );
  app.post(
    "/api/approved_in_area_car_booking",
    [authJwt.verifyToken],
    InAreaCarBookingController.postApprovedInAreaCarBooking
  );
  app.get(
    "/api/in_area_car_booking_byIdUser_ForRating/:idUser",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingByIdUserForRating
  );
  app.post(
    "/api/in_area_car_booking_ByFilter",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingByFilter
  );
  app.post(
    "/api/in_area_car_booking_ByFilter_ByIdDriver",
    [authJwt.verifyToken],
    InAreaCarBookingController.getInAreaCarBookingByFilterByIdDriver
  );
};

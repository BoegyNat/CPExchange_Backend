const { authJwt } = require("../middleware");
const CrossAreaCarPoolBookingController = require("../controllers/crossAreaCarPoolBooking.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/cross_area_car_pool_bookings",
      [authJwt.verifyToken],
      CrossAreaCarPoolBookingController.getAllCrossAreaCarPoolBookings
    );
  
    app.get(
      "/api/cross_area_car_pool_booking/:id",
      [authJwt.verifyToken],
      CrossAreaCarPoolBookingController.getCrossAreaCarPoolBookingById
    );

    app.get(
      "/api/cross_area_car_pool_booking_byIdUser/:idUser",
      [authJwt.verifyToken],
      CrossAreaCarPoolBookingController.getCrossAreaCarPoolBookingByIdUser
    );
    app.post(
      "/api/add_newcross_area_car_pool_booking",
      [authJwt.verifyToken],
      CrossAreaCarPoolBookingController.postNewCrossAreaCarPoolBooking
    );
    app.post(
      "/api/approved_cross_area_car_pool_booking",
      [authJwt.verifyToken],
      CrossAreaCarPoolBookingController.postApprovedlCrossAreaCarPoolBooking
    );

    app.get(
      "/api/cross_area_car_pool_booking_byIdUser_ForRating/:idUser",
      [authJwt.verifyToken],
      CrossAreaCarPoolBookingController.getCrossAreaCarPoolBookingByIdUserForRating
    );

    app.post(
      "/api/cross_area_car_pool_booking_ByFilter",
      [authJwt.verifyToken],
      CrossAreaCarPoolBookingController.getCrossAreaCarPoolBookingByFilter
    );
};
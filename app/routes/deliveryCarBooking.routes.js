const { authJwt } = require("../middleware");
const DeliveryCarBookingController = require("../controllers/deliveryCarBooking.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/delivery_car_bookings",
      [authJwt.verifyToken],
      DeliveryCarBookingController.getAllDeliveryCarBookings
    );
  
    app.get(
      "/api/delivery_car_booking/:id",
      [authJwt.verifyToken],
      DeliveryCarBookingController.getDeliveryCarBookingById
    );

    app.get(
      "/api/delivery_car_booking_byIdUser/:idUser",
      [authJwt.verifyToken],
      DeliveryCarBookingController.getDeliveryCarBookingByIdUser
    );

    app.post(
      "/api/delivery_car_bookingBystartDate",
      [authJwt.verifyToken],
      DeliveryCarBookingController.getDeliveryCarBookingByStartDate
    );
  
    app.post(
      "/api/delivery_car_bookingByStartDateAndendDate",
      [authJwt.verifyToken],
      DeliveryCarBookingController.getDeliveryCarBookingByStartDateAndEndDate
    );
    app.post(
      "/api/delivery_car_new_booking",
      [authJwt.verifyToken],
      DeliveryCarBookingController.postNewDeliveryCarBooking
    )
    app.post(
      "/api/manage_car_delivery_car_booking",
      [authJwt.verifyToken],
      DeliveryCarBookingController.postManageCarDeliveryCarBooking
    );

    app.post(
      "/api/delete_car_delivery_car_booking",
      [authJwt.verifyToken],
      DeliveryCarBookingController.deleteCarDeliveryCarBooking
    );

    app.post(
      "/api/approved_delivery_car_booking",
      [authJwt.verifyToken],
      DeliveryCarBookingController.postApprovedlDeliveryCarBooking
    );
    app.get(
      "/api/delivery_car_booking_byIdUser_ForRating/:idUser",
      [authJwt.verifyToken],
      DeliveryCarBookingController.getDeliveryCarBookingByIdUserForRating
    );
    app.post(
      "/api/delivery_car_bookin_ByFilter",
      [authJwt.verifyToken],
      DeliveryCarBookingController.getDeliveryCarBookingByFilter
    );
};
const { authJwt } = require("../middleware");
const DriverController = require("../controllers/driverBooking.controller")
module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.post(
      "/api/add_new_driver_booking",
      [authJwt.verifyToken],
      DriverController.postNewDriverBooking
    );
    app.get(
      "/api/all_new_driver_booking",
      [authJwt.verifyToken],
      DriverController.getAllNewDriverBooking
    );
    app.post(
      "/api/manage_car_driver_booking",
      [authJwt.verifyToken],
      DriverController.postManageCarDriverBooking
    );
    app.post(
      "/api/delete_car_driver_booking",
      [authJwt.verifyToken],
      DriverController.deleteCarDriverBooking
    );
    app.get(
      "/api/all_vehicle",
      [authJwt.verifyToken],
      DriverController.getAllVehicle
    );
    app.get(
      "/api/driver_booking_byIdUser/:idUser",
      [authJwt.verifyToken],
      DriverController.getAllDriverBookingByIdUser
    );
    app.get(
      "/api/driver_booking_byIdUser_ForRating/:idUser",
      [authJwt.verifyToken],
      DriverController.getDriverBookingByIdUserForRating
    );
    app.post(
      "/api/driver_booking_byFilter",
      [authJwt.verifyToken],
      DriverController.getDriverBookingByFilter
    );
    app.post(
      "/api/driver_booking_byFilter_byIdUser",
      [authJwt.verifyToken],
      DriverController.getDriverBookingByFilterByIdUser
    );
  };
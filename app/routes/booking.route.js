const { authJwt } = require("../middleware");
const bookingController = require("../controllers/booking.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/bookings",
        [authJwt.verifyToken],
        bookingController.getAllBookings
    );

    app.get(
        "/api/booking/:idBooking",
        [authJwt.verifyToken],
        bookingController.getBooking
    );

    app.get(
        "/api/bookingType/:typeBooking",
        [authJwt.verifyToken],
        bookingController.getBookingByType
    );

    app.get(
        "/api/bookingTypeAndStartdate/:typeBooking/:start_date",
        [authJwt.verifyToken],
        bookingController.getBookingByTypeAndStartDate
    );

    app.get(
        "/api/bookingTypeAndStartdateAndEnddate/:typeBooking/:start_date/:end_date",
        [authJwt.verifyToken],
        bookingController.getBookingByTypeAndStartDateAndEndDate
    );

};
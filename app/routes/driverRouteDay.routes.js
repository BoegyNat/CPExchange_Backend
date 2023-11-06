const { authJwt } = require("../middleware");
const driverRouteDayController = require("../controllers/driverRouteDay.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/driver_route_days",
      [authJwt.verifyToken],
      driverRouteDayController.allDriverRouteDays
    );

    app.get(
      "/api/driver_route_day/:id",
      [authJwt.verifyToken],
      driverRouteDayController.getDriverRouteDayById
    );

    app.post(
        "/api/driver_route_day_by_idDriver",
        [authJwt.verifyToken],
        driverRouteDayController.getDriverRouteDayByIdDriver
    );

    app.post(
      "/api/driver_route_day_update_idVehicle",
      [authJwt.verifyToken],
      driverRouteDayController.postIdVehicle
    );

    app.post(
      "/api/driver_route_day_update_bedtime",
      [authJwt.verifyToken],
      driverRouteDayController.postBedTime
    );

    app.post(
      "/api/driver_route_day_post_start_time",
      [authJwt.verifyToken],
      driverRouteDayController.postStartTime
    );

    app.post(
      "/api/driver_route_day_post_end_time",
      [authJwt.verifyToken],
      driverRouteDayController.postEndTime
    );
  
};
const { authJwt } = require("../middleware");
const driverEmergencyController = require("../controllers/emergency.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/driver_emergency_by_id/:id",
    [authJwt.verifyToken],
    driverEmergencyController.getDriverEmergencyByIdUser
  );

  app.get(
    "/api/driver_emergency_all",
    [authJwt.verifyToken],
    driverEmergencyController.allDriverEmergency
  );

  app.post(
    "/api/post_new_driver_emergency/",
    [authJwt.verifyToken],
    driverEmergencyController.postNewDriverEmergency
  );

  app.get(
    "/api/get_update_driver_emergency/:id",
    [authJwt.verifyToken],
    driverEmergencyController.postUpdateDriverEmergency
  );

  app.get(
    "/api/driver_emergency_that_is_not_finish/",
    [authJwt.verifyToken],
    driverEmergencyController.getDriverEmergencyThatIsNotFinish
  );
  app.get(
    "/api/driver_emergency_that_is_not_finish_by_id_driver/:id",
    [authJwt.verifyToken],
    driverEmergencyController.getDriverEmergencyThatIsNotFinishByIdDriver
  );
};

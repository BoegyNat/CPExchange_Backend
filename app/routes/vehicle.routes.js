const { authJwt } = require("../middleware");
const vehicleController = require("../controllers/vehicle.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/vehicles",
    [authJwt.verifyToken],
    vehicleController.allVehicles
  );

  app.get(
    "/api/vehicle_by_usefor/:UseFor",
    [authJwt.verifyToken],
    vehicleController.getVehiclesByUseFor
  );

  app.get(
    "/api/vehicle_by_id/:id",
    [authJwt.verifyToken],
    vehicleController.getVehicleById
  );

  app.post(
    "/api/post_new_vehicle/",
    [authJwt.verifyToken],
    vehicleController.postNewVehicle
  );

  app.post(
    "/api/post_edit_vehicle/",
    [authJwt.verifyToken],
    vehicleController.postEditVehicle
  );

  app.post(
    "/api/post_delete_vehicle/",
    [authJwt.verifyToken],
    vehicleController.postDeleteVehicle
  );
};

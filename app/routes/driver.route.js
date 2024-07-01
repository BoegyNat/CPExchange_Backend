const { authJwt } = require("../middleware");
const driverController = require("../controllers/driver.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/driver_by_id/:id",
    [authJwt.verifyToken],
    driverController.getDriverById
  );

  app.get("/api/drivers", [authJwt.verifyToken], driverController.allDrivers);

  app.post(
    "/api/post_new_driver/",
    [authJwt.verifyToken],
    driverController.postNewDriver
  );

  app.post(
    "/api/post_edit_driver/",
    [authJwt.verifyToken],
    driverController.postEditDriver
  );

  app.post(
    "/api/post_delete_drivers/",
    [authJwt.verifyToken],
    driverController.deleteDrivers
  );
};

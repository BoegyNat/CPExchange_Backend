const { authJwt } = require("../middleware");
const driverController = require("../controllers/driver.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/drivers",
      [authJwt.verifyToken],
      driverController.allDrivers
    );

    app.post(
      "/api/drivers/delete",
      [authJwt.verifyToken],
      driverController.deleteDrivers
    );
  
};
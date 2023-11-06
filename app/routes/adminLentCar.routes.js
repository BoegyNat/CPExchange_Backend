const { authJwt } = require("../middleware");
const adminLentCarController = require("../controllers/adminLentCar.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/admin_lent_cars",
      [authJwt.verifyToken],
      adminLentCarController.getAllAdminLentCars
    );

};
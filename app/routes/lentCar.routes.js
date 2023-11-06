const { authJwt } = require("../middleware");
const lentCarController = require("../controllers/lentCar.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/AllLentCars",
      [authJwt.verifyToken],
      lentCarController.AllLentCars
    );

    app.get(
      "/api/getLentCarById/:idCar",
      [authJwt.verifyToken],
      lentCarController.getLentCarById
    );

    app.get(
      "/api/getLentCarsByProvince/:province",
      [authJwt.verifyToken],
      lentCarController.getLentCarsByProvince
    );

    app.get(
      "/api/getLentCarsByLenderId/:lenderId",
      [authJwt.verifyToken],
      lentCarController.getLentCarsByLenderId
    );
  };
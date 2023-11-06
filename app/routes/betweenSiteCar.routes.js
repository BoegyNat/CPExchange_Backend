const { authJwt } = require("../middleware");
const betweenSiteCarController = require("../controllers/betweenSiteCar.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/between_site_cars",
      [authJwt.verifyToken],
      betweenSiteCarController.getAllBetweenSiteCars
    );
  
    app.get(
      "/api/between_site_car/:id",
      [authJwt.verifyToken],
      betweenSiteCarController.getBetweenSiteCarById
    );

    app.get(
      "/api/between_site_car_is_notFinish/:idUser",
      [authJwt.verifyToken],
      betweenSiteCarController.getBetweenSiteCarByIdUserIsNotFinish
    );

    app.post(
      "/api/callCar",
      [authJwt.verifyToken],
      betweenSiteCarController.callCar
    );

    app.post(
      "/api/cancel_between_site_car/:idUser",
      [authJwt.verifyToken],
      betweenSiteCarController.CancelCallCar
    );

    app.get(
      "/api/between_site_car/:idDriver",
      [authJwt.verifyToken],
      betweenSiteCarController.getBetweenSiteCarByIdDriver
    );
    app.get(
      "/api/getsite",
      [authJwt.verifyToken],
      betweenSiteCarController.getSite
    );
    app.post(
      "/api/post_new_between_site_car",
      [authJwt.verifyToken],
      betweenSiteCarController.postNewBetweenSiteCar
    );
    app.post(
      "/api/update_driver_route",
      [authJwt.verifyToken],
      betweenSiteCarController.updateDriverRoute
    );
    app.post(
      "/api/otimized_route_between_site_car",
      [authJwt.verifyToken],
      betweenSiteCarController.postOptimizedRouteBetweenSiteCar
    );
    
    

};
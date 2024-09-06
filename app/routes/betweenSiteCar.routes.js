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
    "/api/set_finish_call_car",
    [authJwt.verifyToken],
    betweenSiteCarController.setFinishCallCar
  );
  app.get(
    "/api/update_target_status_call_car/:id",
    [authJwt.verifyToken],
    betweenSiteCarController.updateTargetStatus
  );

  app.post(
    "/api/cancel_between_site_car/:idUser",
    [authJwt.verifyToken],
    betweenSiteCarController.CancelCallCar
  );

  app.post(
    "/api/between_site_car_filter_by_id_driver",
    [authJwt.verifyToken],
    betweenSiteCarController.getBetweenSiteCarBookingByFilterByIdDriver
  );

  app.get(
    "/api/between_site_car_by_driver/:idDriver",
    [authJwt.verifyToken],
    betweenSiteCarController.getBetweenSiteCarByIdDriver
  );

  app.get(
    "/api/between_site_car_by_driver_is_notFinish/:idDriver",
    [authJwt.verifyToken],
    betweenSiteCarController.getBetweenSiteCarByIdDriverIsNotFinish
  );
  app.get(
    "/api/getsite",
    [authJwt.verifyToken],
    betweenSiteCarController.getSite
  );

  app.post(
    "/api/get_between_site_with_route_date",
    [authJwt.verifyToken],
    betweenSiteCarController.getBetweenSiteWithRouteDate
  );
  app.post(
    "/api/get_between_site_with_route_date_and_end_date",
    [authJwt.verifyToken],
    betweenSiteCarController.getBetweenSiteWithRouteDateAndEndDate
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

const { authJwt } = require("../middleware");
const RouteCrossAreaCarPoolsController = require("../controllers/routeCrossAreaCarPools.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.post(
      "/api/route_cross_area_car_pool_route_line",
      [authJwt.verifyToken],
      RouteCrossAreaCarPoolsController.getRouteLineByIdUserRouteDate
    );

    app.post(
      "/api/route_cross_area_car_pool_route_user",
      [authJwt.verifyToken],
      RouteCrossAreaCarPoolsController.getRouteUserByIdUser
    );

    app.post(
      "/api/route_cross_area_car_pool_routes_by_date",
      [authJwt.verifyToken],
      RouteCrossAreaCarPoolsController.getRoutesByRouteDate
    );

    app.post(
      "/api/route_cross_area_car_pool_routes_by_route_line_date",
      [authJwt.verifyToken],
      RouteCrossAreaCarPoolsController.getRoutesByRouteLineAndRouteDate
    );
    app.post(
      "/api/post_Edit_IdDriver_Route",
      [authJwt.verifyToken],
      RouteCrossAreaCarPoolsController.postEditIdDriverRoute
    );
    app.post(
      "/api/delete_Route_Cross_Pools",
      [authJwt.verifyToken],
      RouteCrossAreaCarPoolsController.deleteRouteCrossPools
    )
};
  
const { authJwt } = require("../middleware");
const routeDayController = require("../controllers/routeDay.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
        "/api/routesDay",
        [authJwt.verifyToken],
        routeDayController.allRoutesDay
    );

    app.get(
      "/api/routesDay/userRoute/:idUser",
      [authJwt.verifyToken],
      routeDayController.getUserRoute
    );

    app.post(
      "/api/routesDay/routeLine",
      [authJwt.verifyToken],
      routeDayController.getRouteLine
    );

    app.get(
      "/api/routesDay/routeDriver/:idDriver",
      [authJwt.verifyToken],
      routeDayController.getRouteByIdDriver
    );

    app.post(
      "/api/routeDay/add",
      [authJwt.verifyToken],
      routeDayController.addRoutesDay
    );

    app.post(
      "/api/routeDay/removeUserRoute/:idUser/:idDriver",
      [authJwt.verifyToken],
      routeDayController.removeUserByIdDriverAndIdUser
    );

    app.post(
      "/api/routeDay/getting_user_complete/:idUser/:idDriver",
      [authJwt.verifyToken],
      routeDayController.gettingUserComplete
    );
};
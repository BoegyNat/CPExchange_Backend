const { authJwt } = require("../middleware");
const userController = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/users/profile/:id",
    [authJwt.verifyToken],
    userController.userProfile
  );

  app.get(
    "/api/users",
    [authJwt.verifyToken],
    userController.allUser
  );

  app.get(
    "/api/users/drivers",
    [authJwt.verifyToken],
    userController.allDrivers
  )
  app.get(
    "/api/users/manager",
    [authJwt.verifyToken],
    userController.allManager
  )
  app.post(
    "/api/update_Location_User",
    //  [authJwt.verifyToken],
    userController.updateLocationUser
  );
  // app.get(
  //   "/api/test/mod",
  //   [authJwt.verifyToken, authJwt.isModerator],
  //   controller.moderatorBoard
  // );

  // app.get(
  //   "/api/test/admin",
  //   [authJwt.verifyToken, authJwt.isAdmin],
  //   controller.adminBoard
  // );
};

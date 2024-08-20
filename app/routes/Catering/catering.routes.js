const { authJwt } = require("../../middleware");
const cateringController = require("../../controllers/Catering/catering.controller");
const multer = require("multer");
const upload = multer();
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/catering/getAllCaterings",
    [authJwt.verifyToken],
    cateringController.getAllCaterings
  );

  app.get(
    "/api/catering/getCateringById/:cateringId",
    [authJwt.verifyToken],
    cateringController.getCateringById
  );

  app.put(
    "/api/catering/changeStatusById/:cateringId",
    [authJwt.verifyToken],
    cateringController.changeStatusById
  );

  app.get(
    "/api/catering/getAllRestaurants",
    [authJwt.verifyToken],
    cateringController.getAllRestaurants
  );

  app.get(
    "/api/catering/getRestaurantById/:restaurantId",
    [authJwt.verifyToken],
    cateringController.getRestaurantById
  );
  app.post(
    "/api/catering/addNewRestaurant",
    // [authJwt.verifyToken, upload.array("attachment")],
    [
      authJwt.verifyToken,
      upload.fields([{ name: "attachment" }, { name: "resFile" }]),
    ],
    cateringController.addNewRestaurant
  );
  app.post(
    "/api/catering/updateRestaurantMenu",
    [
      authJwt.verifyToken,
      upload.fields([{ name: "attachment" }, { name: "resFile" }]),
    ],
    cateringController.updateRestaurantMenu
  );
  app.delete(
    "/api/catering/deleteRestaurant/:restaurantId",
    [authJwt.verifyToken],
    cateringController.deleteRestaurantById
  );

  app.get(
    "/api/catering/getCateringType",
    [authJwt.verifyToken],
    cateringController.getCateringType
  );
  app.post(
    "/api/catering/addRequestCatering",
    [authJwt.verifyToken],
    cateringController.addRequestCatering
  );
  app.get(
    "/api/catering/getCateringRestaurantType",
    [authJwt.verifyToken],
    cateringController.getCateringRestaurantType
  );
};

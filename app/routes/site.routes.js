const { authJwt } = require("../middleware");
const SiteController = require("../controllers/site.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get(
    "/api/site_by_name/:IdScgSite",
    // [authJwt.verifyToken],
    SiteController.getSiteByName
  );
  app.post("/api/add_location_driver/add", SiteController.addLocationDriver);
  app.get(
    "/api/get_location_Driver_by_id/:idDriver",
    SiteController.getLocationDriverById
  );
  app.get("/api/get_all_site", SiteController.getAllSite);
};

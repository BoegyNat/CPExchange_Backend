const { authJwt } = require("../middleware");
const tagController = require("../controllers/tag.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/get_all_tags", [authJwt.verifyToken], tagController.getAllTags);
  app.get(
    "/api/get_all_tags_by_idUser/:idUser",
    [authJwt.verifyToken],
    tagController.getAllTagsByIdUser
  );
};

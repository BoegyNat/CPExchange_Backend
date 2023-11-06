const { authJwt } = require("../middleware");
const HistoryActionsOfLentCarController = require("../controllers/historyActionsOfLentCar.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.get(
      "/api/getAllHistoryActions",
      [authJwt.verifyToken],
      HistoryActionsOfLentCarController.getAllHistoryActions
    );

};
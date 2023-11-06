const { authJwt } = require("../middleware");
const historyLentCarController = require("../controllers/historyLentCar.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.get(
      "/api/getHistoryLentCarById/:id",
      [authJwt.verifyToken],
      historyLentCarController.getHistoryLentCarById
    );

    app.get(
      "/api/getHistoryLentCarByCarId/:idCar",
      [authJwt.verifyToken],
      historyLentCarController.getHistoryLentCarByCarId
    );

    app.get(
      "/api/getHistoryLentCarByIdLender/:idLender",
      [authJwt.verifyToken],
      historyLentCarController.getHistoryLentCarByIdLender
    );

    app.get(
        "/api/getHistoryLentCarByCarIdAndMonthLent/:idCar/:datelent",
        [authJwt.verifyToken],
        historyLentCarController.getHistoryLentCarByCarIdAndMonthLent
    );

    app.get(
      "/api/getHistoryLentCarByBorrowerId/:borrowerId/:sort",
      [authJwt.verifyToken],
      historyLentCarController.getHistoryLentCarByBorrowerId
    );

    app.get(
      "/api/getHistoryLentCarApprovedByBorrowerId/:borrowerId/:sort",
      [authJwt.verifyToken],
      historyLentCarController.getHistoryLentCarApprovedByBorrowerId
    );

    app.get(
      "/api/getHistoryLentCarWaitingByBorrowerId/:borrowerId/:sort",
      [authJwt.verifyToken],
      historyLentCarController.getHistoryLentCarWaitingByBorrowerId
    );

    app.get(
      "/api/getHistoryLentCarWaitingByLenderId/:lenderId",
      [authJwt.verifyToken],
      historyLentCarController.getHistoryLentCarWaitingByLenderId
    );
};
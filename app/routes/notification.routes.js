const { authJwt } = require("../middleware");
const notificationController = require("../controllers/notification.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/get_all_notification_by_idUser/:idUser",
    [authJwt.verifyToken],
    notificationController.getAllNotificationByIdUser
  );

  app.get(
    "/api/get_read_notification_by_idNotification/:idNotification",
    [authJwt.verifyToken],
    notificationController.getReadNotificationByIdNotification
  );
};

const { authJwt } = require("../middleware");
const DeliverySampleshuttleController = require("../controllers/deliverySampleshuttle.controller");
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

    app.get(
      "/api/delivery_sample_shuttle_byIdUser/:IdUser",
      // [authJwt.verifyToken],
      DeliverySampleshuttleController.getDeliverySampleshuttleByIdUser
    );

    app.get(
      "/api/delivery_sample_shuttle_byIdDriver/:IdDriver",
      // [authJwt.verifyToken],
      DeliverySampleshuttleController.getDeliverySampleshuttleByIdDriver
    );


    app.get(
      "/api/delivery_sample_shuttle_byIdBooking/:IdBooking",
      // [authJwt.verifyToken],
      DeliverySampleshuttleController.getDeliverySampleshuttleByIdBooking
    );

    app.post(
      "/api/delivery_sample_shuttleBystartDate",
       [authJwt.verifyToken, upload.fields([{name:"attachment"}])],
      DeliverySampleshuttleController.postDeliverySampleshuttleByStartDate
    );

    app.post(
      "/api/delivery_sample_shuttle_UpdateStatus",
      //  [authJwt.verifyToken],
      DeliverySampleshuttleController.postUpdateDeliveryStatus
    );
    app.get(
      "/api/get_delivery_sample_shuttle_by_no",
      // [authJwt.verifyToken],
      DeliverySampleshuttleController.getDeliverySampleShuttleByNo
    );
    app.post(
      "/api/get_delivery_sample_shuttle_by_filter",
      // [authJwt.verifyToken],
      DeliverySampleshuttleController.getDeliverySampleShuttleByFilter
    );
    
};
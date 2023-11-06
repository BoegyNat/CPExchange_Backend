const { authJwt } = require("../middleware");
const statusCarController = require("../controllers/statusCars.controller");

module.exports = function (app) {
    app.use(function (req, res, next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/statusCar",
        [authJwt.verifyToken],
        statusCarController.allStatusCar
    );

    app.get(
        "/api/statusCar/:idCar",
        [authJwt.verifyToken],
        statusCarController.statusCar
    );

    app.post(
        "/api/startStatusCar/:idCar/:startstatus",
        [authJwt.verifyToken],
        statusCarController.startStatusCar
    )

    app.post(
        "/api/stopStatusCar/:idCar/:stopstatus/:duration",
        [authJwt.verifyToken],
        statusCarController.stopStatusCar
    )

    app.post(
        "/api/resetStatusCar/:idCar/",
        [authJwt.verifyToken],
        statusCarController.resetStatusCar
    )

};
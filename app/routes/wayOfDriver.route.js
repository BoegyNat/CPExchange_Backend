const { authJwt } = require("../middleware");
const wayOfDriverController = require("../controllers/wayOfDriver.controller");

module.exports = function (app) {
    app.use(function (req, res, next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/wayOfDrivers",
        [authJwt.verifyToken],
        wayOfDriverController.getAllWaysOfDriver
    );

    app.get(
        "/api/wayOfDrivers/:idDriver",
        [authJwt.verifyToken],
        wayOfDriverController.getWayOfDriver
    );

    app.post(
        "/api/deleteEmployeeOfWay/:idDriver/:idEmployee",
        [authJwt.verifyToken],
        wayOfDriverController.removeEmployeeOfWay
    );

};
const { authJwt } = require("../middleware");
const vehicleBrandAndModelController = require("../controllers/vehicleBrandAndModel.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/vehicle_brandsAndmodels",
      [authJwt.verifyToken],
      vehicleBrandAndModelController.allVehicleBrandsAndModels
    );

    app.get(
      "/api/vehicle_brandsAndmodels_byIdTypeCar/:idTypeVehi",
      [authJwt.verifyToken],
      vehicleBrandAndModelController.allVehicleBrandsAndModelsByIdTypeCar
    );

    app.get(
      "/api/vehicle_BrandAndModel_byId/:Id",
      [authJwt.verifyToken],
      vehicleBrandAndModelController.getVehicleBrandAndModelById
    );

    app.get(
      "/api/vehicle_BrandAndModel_byUseForEn/:UseForEn",
      [authJwt.verifyToken],
      vehicleBrandAndModelController.getVehicleBrandAndModelByUseFor
    );

    app.get(
      "/api/vehicle_BrandAndModel_byUseForEn_VehicleType/:UseForEn/:VehicleType",
      [authJwt.verifyToken],
      vehicleBrandAndModelController.getVehicleBrandAndModelByTypeCarAndUseFor
    );
  };
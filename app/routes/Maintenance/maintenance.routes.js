const { authJwt } = require("../../middleware");
const maintenanceController = require("../../controllers/Maintenance/maintenance.controller");
const multer = require("multer");
const upload = multer();
// const fs = require('fs');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
// 			req.params.newMaintenanceId = Maintenances[Maintenances.length-1].id + 1;
// 			const dir = path.join(__dirname, '../file/maintenance/',(req.params.newMaintenanceId).toString());
// 			fs.mkdirSync(dir, { recursive: true });
//       cb(null, dir);
//     },
//     filename: function (req, file, cb) {
//     	cb(null, Date.now() + '_unknow' + '.' + file.originalname.split('.')[file.originalname.split('.').length-1])}
// });

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //add new request maintenances
  app.post(
    "/api/maintenances/add",
    [authJwt.verifyToken, upload.array("attachment")],
    maintenanceController.addNewMaintenanceRequest
  );

  //get my requested maintenances
  app.get(
    "/api/maintenances/getAllHistory",
    [authJwt.verifyToken],
    maintenanceController.getAllMyHistoryMaintenanceRequest
  );

  //get all requested maintenances for admin
  app.get(
    "/api/maintenances/getAllMaintenanceRequest",
    [authJwt.verifyToken],
    maintenanceController.getAllMaintenanceRequest
  );

  //get my requested maintenances
  app.get(
    "/api/maintenances/getMaintenanceDesc",
    [authJwt.verifyToken],
    maintenanceController.getMaintenanceDesc
  );

  //put changeStatus
  app.put(
    "/api/maintenances/putChangeStatus",
    [authJwt.verifyToken],
    maintenanceController.putChangeStatus
  );

  //post newProgressReport
  app.post(
    "/api/maintenances/newProgressReport",
    [authJwt.verifyToken],
    maintenanceController.newProgressReport
  );

  //get All Technician
  app.get(
    "/api/maintenances/getAllTechnicians",
    [authJwt.verifyToken],
    maintenanceController.getAllTechnicians
  );

  //post new technician
  app.post(
    "/api/maintenances/addTechinician",
    [authJwt.verifyToken, upload.single("image")],
    maintenanceController.newTechnician
  );
};

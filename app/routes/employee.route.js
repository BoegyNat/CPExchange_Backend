const { authJwt } = require("../middleware");
const employeeController = require("../controllers/employee.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/employees",
      [authJwt.verifyToken],
      employeeController.allEmployees
    );

    app.get(
      "/api/employess_by_idapproved/:id",
      [authJwt.verifyToken],
      employeeController.getEmployeesByIdApproved
    )
};
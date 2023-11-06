const { authJwt } = require("../middleware");
const courseController = require("../controllers/course.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/courses",
    [authJwt.verifyToken],
    courseController.allCourses
  );

  app.get(
    "/api/courses/:idCourse",
    [authJwt.verifyToken, authJwt.isManager],
    courseController.course
  );
};

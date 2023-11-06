const db = require("../models");
const Courses = db.courses;

exports.allCourses = (req, res) => {
  try {
    res.status(200).send(Courses);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.course = (req, res) => {
  try {
    console.log(req.params.idCourse)
    let result = Courses.find((course) => course.id == req.params.idCourse);

    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Course Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

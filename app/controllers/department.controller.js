const db = require("../models");
const Departments = db.departments;

exports.allDepartment = (req, res) => {
    try {
      res.status(200).send(Departments);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
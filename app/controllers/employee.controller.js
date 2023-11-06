const db = require("../models");
const Employees = db.employees;

const pool = require("../connection.js");

exports.allEmployees = async (req, res) => {

    try {
      const row = await pool.query("SELECT * FROM Employee");

      res.status(200).send(row);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
};

exports.getEmployeesByIdApproved = async (req, res) => {
  try{
    // console.log("getEmployeesByIdApproved", req.params.id);
    const data = await pool.query("SELECT * FROM Employee WHERE idEmployee = ?", [req.params.id])
    if(data.length > 0){

      res.status(200).send(data);
    }else{
      console.log("null")
    }

  }catch (error) {
    res.status(500).send({ message: error.message });
  }
}
const db = require("../models");
const VehicleTypes = db.vehicleTypes;
const pool = require("../connection.js");

exports.allVehicles = async (req, res) => {
  try {
    const row = await pool.query("SELECT * FROM VehicleTypes");
    // console.log(row)
    res.status(200).send(row);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM VehicleTypes WHERE idVehicleTypes = ?",
      [req.params.Id]
    );
    // console.log(row)

    let result = VehicleTypes.find((type) => type.id == req.params.Id);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "VehicleType not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

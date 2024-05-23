const db = require("../models");
const pool = require("../connection.js");
const Drivers = db.drivers;

exports.allDrivers = async (req, res) => {
  try {
    // let result = Drivers.filter((driver) => driver.IsActive == 0);
    const result = await pool.query("SELECT * FROM Driver WHERE IsActive = 0");
    if (result) {
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewDriver = async (req, res) => {
  try {
    const newDriver = req.body;
    console.log(newDriver);
    const result = await pool.query(
      `
      INSERT INTO 
      Driver 
          (PreName,
          FullName,
          Telephone,
          AgeYear,
          AgeMonth,
          AgeWorkingYear,
          AgeWorkingMonth,
          Company,
          WorkingCompany,
          Salary,
          CostCenter,
          CostElement,
          IsActive,
          Rating
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?,?)
      `,
      [
        newDriver.PreName,
        newDriver.FullName,
        newDriver.Telephone,
        newDriver.AgeYear,
        newDriver.AgeMonth,
        newDriver.AgeWorkingYear,
        newDriver.AgeWorkingMonth,
        newDriver.Company,
        newDriver.WorkingCompany,
        newDriver.Salary,
        newDriver.CostCenter,
        newDriver.CostElement,
        0,
        0,
      ]
    );
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: error.message });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postEditDriver = async (req, res) => {
  try {
    const newDriver = req.body[0];
    const idDriver = req.body[1];
    const result = await pool.query(
      `
      UPDATE 
      Driver SET 
      PreName = ?,
      FullName = ?,
      Telephone = ?,
      AgeYear  = ?,
      AgeMonth = ?,
      AgeWorkingYear  = ?,
      AgeWorkingMonth = ?,
      Company = ?,
      WorkingCompany = ?,
      Salary = ?,
      CostCenter = ?,
      CostElement = ? 
      WHERE 
        idDriver = ?`,
      [
        newDriver.PreName,
        newDriver.FullName,
        newDriver.Telephone,
        newDriver.AgeYear,
        newDriver.AgeMonth,
        newDriver.AgeWorkingYear,
        newDriver.AgeWorkingMonth,
        newDriver.Company,
        newDriver.WorkingCompany,
        newDriver.Salary,
        newDriver.CostCenter,
        newDriver.CostElement,
        idDriver,
      ]
    );
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: error.message });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteDrivers = async (req, res) => {
  try {
    const deleteDrivers = req.body.idDrivers;
    const rows = [];
    for (let i = 0; i < deleteDrivers.length; i++) {
      const row = await pool.query(
        `UPDATE Driver SET IsActive = ? WHERE idDriver = ?`,
        [-1, deleteDrivers[i]]
      );
      rows.push(row);
    }
    if (rows) {
      res.status(200).send(rows);
    } else {
      res.status(404).send({ message: error.message });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

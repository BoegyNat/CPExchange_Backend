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
    const lastIdUser = await pool.query(
      `SELECT idUser FROM Users ORDER BY idUser DESC LIMIT 1`
    );

    const newUser = await pool.query(
      `
      INSERT INTO
      Users
          (idUser,
          username,
          email,
          password,
          image,
          firstname,
          lastname,
          fNameThai,
          mobileNumber,
          status,
          company,
          authorities
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        lastIdUser[0].idUser + 1,
        `driver${lastIdUser[0].idUser + 1}`,
        `driver${lastIdUser[0].idUser + 1}@scg.com`,
        "driverdriver",
        "30.jpg",
        newDriver.FullName.split(" ")[0],
        newDriver.FullName.split(" ")[1],
        newDriver.FullName,
        newDriver.Telephone,
        1,
        newDriver.Company,
        "ROLE_USER,ROLE_DRIVER",
      ]
    );
    const result = await pool.query(
      `
      INSERT INTO
      Driver
          (idUser,
          PreName,
          FullName,
          Telephone,
          AgeYear,
          AgeMonth,
          AgeWorkingYear,
          AgeWorkingMonth,
          idVehicle,
          PlateNumCar,
          Company,
          WorkingCompany,
          Salary,
          CostCenter,
          CostElement,
          IsActive,
          CreatedBy,
          CreatedDate,
          image,
          Rating
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?,?,?,?,?,?,?,?)
      `,
      [
        lastIdUser[0].idUser + 1,
        newDriver.PreName,
        newDriver.FullName,
        newDriver.Telephone,
        newDriver.AgeYear,
        newDriver.AgeMonth,
        newDriver.AgeWorkingYear,
        newDriver.AgeWorkingMonth,
        newDriver.idVehicle,
        newDriver.PlateNumCar,
        newDriver.Company,
        newDriver.WorkingCompany,
        newDriver.Salary,
        newDriver.CostCenter,
        newDriver.CostElement,
        0,
        "Admin",
        new Date(),
        `${Math.floor(Math.random() * 8) + 1}.jpg`,
        0,
      ]
    );

    const driverLocation = await pool.query(
      `
      INSERT INTO
      LocationDriver
          (idDriver,
          latDriver,
          LngDriver
        )
      VALUES
        (?, ?, ?)
      `,
      [
        lastIdUser[0].idUser + 1,
        Math.floor(Math.random() * 5) + 13.1254535885,
        Math.floor(Math.random() * 10) + 100.1254535885,
      ]
    );

    if (result && newUser) {
      res.status(200).send({
        username: `driver${lastIdUser[0].idUser + 1}`,
        password: "driverdriver",
      });
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
    const newUser = await pool.query(
      `
      UPDATE 
      Users SET
          
          firstname = ?,
          lastname = ?,
          fNameThai = ?,
          mobileNumber = ?,
          company = ?
        WHERE 
        idDriver = ?
      
      `,
      [
        newDriver.FullName.split(" ")[0],
        newDriver.FullName.split(" ")[1],
        newDriver.FullName,
        newDriver.Telephone,
        newDriver.Company,
        idDriver,
      ]
    );
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
        `UPDATE Driver SET IsActive = ?, DeletedBy = ?, DeletedDate = ? WHERE idDriver = ?`,
        [-1, "Admin", new Date(), deleteDrivers[i]]
      );
      const user = await pool.query(
        `SELECT idUser FROM Driver WHERE idDriver = ?`,
        [deleteDrivers[i]]
      );

      await pool.query(`UPDATE Users SET status = ? WHERE idUser = ?`, [
        0,
        deleteDrivers[i],
      ]);
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

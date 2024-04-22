const db = require("../models");
const Users = db.users;

const pool = require("../connection.js");

exports.userProfile = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
      req.params.id,
    ]);
    if (result) {
      res.status(200).send(result[0]);
    } else {
      return res.status(404).send({ message: "User Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateLocationUser = async (req, res) => {
  try {
    // console.log(""req.body.Lng)
    const rows = await pool.query(
      "UPDATE Users SET  lat = ? WHERE idUser = ? ",
      [req.body.Lat, req.body.idUser]
    );
    const row = await pool.query("UPDATE Users SET lng = ? WHERE idUser = ? ", [
      req.body.Lng,
      req.body.idUser,
    ]);

    // console.log("ff", rows)
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.allDrivers = async (req, res) => {
  const ScanRoleDriver = (user) => {
    let resultScan = false;
    user.authorities.split(",").map((role) => {
      if (role === "ROLE_DRIVER") {
        resultScan = true;
      }
    });
    return resultScan;
  };

  try {
    const row = await pool.query("SELECT * FROM Users");

    let result = row.filter((user) => ScanRoleDriver(user));
    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "User Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.allManager = async (req, res) => {
  const ScanRoleDriver = (user) => {
    let resultScan = false;
    user.authorities.split(",").map((role) => {
      if (role === "ROLE_MANAGER") {
        resultScan = true;
      }
    });
    return resultScan;
  };

  try {
    const row = await pool.query("SELECT * FROM Users");

    let result = row.filter((user) => ScanRoleDriver(user));
    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "User Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.allUser = async (req, res) => {
  try {
    const row = await pool.query("SELECT * FROM Users");
    return res.status(200).send(row);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

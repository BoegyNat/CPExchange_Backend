const pool = require("../connection.js");

exports.userProfile = async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
      [req.params.id]
    );
    if (result) {
      res.status(200).send(result[0]);
    } else {
      return res.status(404).send({ message: "User Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.driverProfile = async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT * FROM Users LEFT JOIN Driver ON Users.idUser = Driver.idUser WHERE Users.idUser = ? AND Users.authorities = 'ROLE_USER,ROLE_DRIVER'",
      [req.params.id]
    );
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
    const rows = await pool.query(
      "UPDATE Users SET  lat = ? WHERE idUser = ? ",
      [req.body.Lat, req.body.idUser]
    );
    const row = await pool.query("UPDATE Users SET lng = ? WHERE idUser = ? ", [
      req.body.Lng,
      req.body.idUser,
    ]);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.allDrivers = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM Users LEFT JOIN Driver ON Users.idUser = Driver.idUser WHERE Users.authorities = 'ROLE_USER,ROLE_DRIVER' AND Users.status = 1 AND Driver.IsActive = 0"
    );

    if (row) {
      res.status(200).send(row);
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
    const row = await pool.query(
      "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL ;"
    );
    return res.status(200).send(row);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

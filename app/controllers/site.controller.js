const pool = require("../connection.js");

exports.getSiteByName = async (req, res) => {
  console.log(req.params.IdScgSite);
  const NoSite = parseInt(req.params.IdScgSite);
  console.log(NoSite);
  const rows = await pool.query("SELECT * FROM ScgSite WHERE idScgSite = ?", [
    NoSite,
  ]);
  // const rows = await pool.query("SELECT * FROM ScgSite")
  console.log(rows);
  return res.status(200).json(rows);
};

exports.addLocationDriver = async (req, res) => {
  const idDriver = req.body.idDriver;
  const Lat = req.body.Lat;
  const Lng = req.body.Lng;

  if (idDriver != "" && Lat != "" && Lng != "" && idDriver != null) {
    const rows = await pool.query(
      `
        INSERT INTO 
        LocationDriver 
            (idDriver, LatDriver, LngDriver) 
        VALUES 
            (?,?,?)`,
      [idDriver, Lat, Lng]
    );
    res.status(200).send(rows);
  } else {
    return res.status(500).send({ message: "error.message" });
  }
};
exports.getLocationDriverById = async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT * FROM LocationDriver WHERE idDriver = ? ORDER BY idLocationDriver DESC LIMIT 1",
      [req.params.idDriver]
    );
    const emergency = await pool.query(
      "SELECT * FROM DriverEmergency WHERE idDriver = ? AND isActive = 1 ORDER BY idDriverEmergency DESC LIMIT 1",
      [req.params.idDriver]
    );

    if (emergency.length > 0) {
      rows[0].emergency = emergency[0];
    }
    if (!rows) {
      return res.status(404).send({ message: "Not found" });
    } else return res.status(200).send(rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllLocationDriver = async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT * FROM LocationDriver ld LEFT JOIN Driver d ON ld.idDriver = d.idUser WHERE idLocationDriver IN (SELECT MAX(idLocationDriver) FROM LocationDriver GROUP BY idDriver) AND d.IsActive = 0;"
    );
    for (let i = 0; i < rows.length; i++) {
      const emergency = await pool.query(
        "SELECT * FROM DriverEmergency WHERE isActive = 1 AND idDriver = ? ORDER BY idDriverEmergency DESC LIMIT 1",
        [rows[i].idUser]
      );

      if (emergency.length > 0) {
        rows[i].emergency = emergency[0];
        rows[i].emergencyStatus = true;
      } else {
        rows[i].emergencyStatus = false;
      }
    }
    if (!rows) {
      return res.status(404).send({ message: "Not found" });
    } else return res.status(200).send(rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllSite = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ScgSite");
    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(400).send({ success: false, error: error.message });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

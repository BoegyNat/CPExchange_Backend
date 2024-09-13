const pool = require("../connection.js");
const WebSocket = require("../../server.js");

exports.allDriverEmergency = async (req, res) => {
  try {
    // let result = Drivers.filter((driver) => driver.IsActive == 0);
    const result = await pool.query("SELECT * FROM DriverEmergency");
    if (result) {
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDriverEmergencyByIdUser = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM DriverEmergency WHERE idDriver = ?",
      [req.params.id]
    );
    if (result) {
      res.status(200).send(result[0]);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewDriverEmergency = async (req, res) => {
  try {
    const { idDriver, cause } = req.body;
    const check = await pool.query(
      "SELECT * FROM DriverEmergency WHERE idDriver = ? AND isActive = 1",
      [idDriver]
    );
    if (check.length > 0) {
      // res.status(208).send({ message: "Request is recorded already" });
      const result = await pool.query(
        "UPDATE DriverEmergency SET causeEmergency = ?, isActive = 1 WHERE idDriverEmergency = ?",
        [cause, check[0].idDriverEmergency]
      );
      if (result) {
        const result1 = await pool.query(
          "SELECT * FROM DriverEmergency WHERE isActive = 1"
        );
        WebSocket.notify("emergency", JSON.stringify(result1)); // แจ้งเตือนผู้ดูแลระบบ
        res.status(200).send(result);
      } else {
        res.status(404).send({ message: error.message });
      }
    } else {
      const result = await pool.query(
        "INSERT INTO DriverEmergency SET idDriver = ?, causeEmergency = ? , isActive = ?",
        [idDriver, cause, 1]
      );

      if (result) {
        const result1 = await pool.query(
          "SELECT * FROM DriverEmergency WHERE isActive = 1"
        );
        WebSocket.notify("emergency", JSON.stringify(result1)); // แจ้งเตือนผู้ดูแลระบบ
        res.status(200).send(result);
      } else {
        res.status(404).send({ message: error.message });
      }
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postUpdateDriverEmergency = async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE DriverEmergency SET isActive = ? WHERE idDriverEmergency = ?",
      [0, req.params.id]
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

exports.getDriverEmergencyThatIsNotFinish = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM DriverEmergency WHERE isActive = 1"
    );
    if (result) {
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDriverEmergencyThatIsNotFinishByIdDriver = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM DriverEmergency WHERE isActive = 1 AND idDriver = ?",
      [req.params.id]
    );
    if (result.length > 0) {
      res.status(200).send(result[0]);
    } else {
      res.status(404).send({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

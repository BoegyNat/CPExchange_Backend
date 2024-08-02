const pool = require("../connection.js");

exports.postNewDriverBooking = async (req, res) => {
  const {
    namePlaceFrom,
    namePlaceTo,
    namePlaceFromReturn,
    namePlaceToReturn,
    startDate,
    startTime,
    endDate,
    endTime,
    startDateReturn,
    startTimeReturn,
    endDateReturn,
    endTimeReturn,
    twoWay,
    note,
    detailJourney,
    idUser,
    option,
  } = req.body[0];

  const userData = await pool.query(
    "SELECT * FROM UniHR.Employees WHERE idEmployees = ?",
    [idUser]
  );

  try {
    const rows = await pool.query(
      `
          INSERT INTO 
          DriverBooking 
              (namePlaceFrom, namePlaceTo, namePlaceFromReturn, namePlaceToReturn, startDate, startTime, endDate, endTime, startDateReturn, startTimeReturn, endDateReturn, endTimeReturn, detailJourney, note, twoWay, idUser, nameUser, addOption) 
          VALUES 
            (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        namePlaceFrom,
        namePlaceTo,
        namePlaceFromReturn,
        namePlaceToReturn,
        startDate,
        startTime,
        endDate,
        endTime,
        startDateReturn,
        startTimeReturn,
        endDateReturn,
        endTimeReturn,
        detailJourney,
        note,
        twoWay,
        idUser,
        userData[0].firstname_TH + " " + userData[0].lastname_TH,
        option,
      ]
    );
    if (rows.affectedRows > 0) {
      res.status(200).send(rows);
    } else {
      res.status(404).send("Error");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllNewDriverBooking = async (req, res) => {
  try {
    const data = await pool.query(
      "SELECT * FROM DriverBooking db LEFT JOIN UniHR.Employees e ON db.idUser = e.idEmployees LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany  WHERE db.idUser = e.idEmployees AND ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL ;"
    );

    if (data.length > 0) {
      res.status(200).send(data);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.postManageCarDriverBooking = async (req, res) => {
  try {
    if (req.body.isDriverFromCompany) {
      let row = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
        req.body.idDriver,
      ]);
      const rows = await pool.query(
        "UPDATE DriverBooking SET note = ?, isDriverFromCompany = ?, idDriver= ?, nameDriver = ?, phoneDriver = ?, statusManageCar = ? WHERE idDriverBooking = ? ",
        [
          req.body.note,
          req.body.isDriverFromCompany,
          req.body.idDriver,
          row[0].fNameThai,
          row[0].mobileNumber,
          "Success",
          req.body.id,
        ]
      );
      if (rows.affectedRows > 0) {
        res.status(200).send(rows);
      } else {
        res.status(404).send("Not Found");
      }
    } else {
      const rows = await pool.query(
        "UPDATE DriverBooking SET note = ?, isDriverFromCompany = ?, idDriver= ?, nameDriver = ?, phoneDriver = ?, statusManageCar = ? WHERE idDriverBooking = ? ",
        [
          req.body.note,
          req.body.isDriverFromCompany,
          req.body.idDriver,
          req.body.nameDriver,
          req.body.phoneDriver,
          "Success",
          req.body.id,
        ]
      );
      if (rows.affectedRows > 0) {
        res.status(200).send(rows);
      } else {
        res.status(404).send("Not Found");
      }
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.deleteCarDriverBooking = async (req, res) => {
  try {
    const rows = await pool.query(
      "DELETE FROM DriverBooking WHERE idDriverBooking = ?",
      [req.body.idDriverBooking]
    );

    if (rows.affectedRows > 0) {
      res.status(200).send(rows);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllVehicle = async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT * FROM Vehicle JOIN VehicleBrandsAndModels ON Vehicle.idVehicleBrandAndModel = VehicleBrandsAndModels.idVehicleBrandsAndModels"
    );

    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllDriverBookingByIdUser = async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT * FROM DriverBooking WHERE idUser = ?",
      [req.params.idUser]
    );

    const driver = await pool.query("SELECT * FROM Users");
    const User = await pool.query(
      "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
      [req.params.idUser]
    );

    result.map((booking) => {
      if (booking.idDriver !== null) {
        booking.driver = driver.find(
          (driver) => driver.idUser == booking.idDriver
        );
      }

      booking.user = User[0];
    });

    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDriverBookingByIdDriver = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM DriverBooking WHERE idDriver = ?",
      [req.params.idDriver]
    );

    const driver = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
      req.params.idDriver,
    ]);

    for (let booking of row) {
      if (booking.idUser !== null) {
        try {
          const User = await pool.query(
            "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
            [booking.idUser]
          );

          booking.driver = driver[0];
          booking.user = User[0];
        } catch (error) {
          console.error(
            `Error fetching user for booking with id ${booking.idUser}:`,
            error
          );
        }
      }
    }

    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDriverBookingByIdUserForRating = async (req, res) => {
  try {
    let row = await pool.query("SELECT * FROM DriverBooking WHERE idUser = ?", [
      req.params.idUser,
    ]);

    // let result = row.filter(booking => booking.idUser == req.params.idUser);
    if (row.length > 0) {
      row = row.filter((booking) => booking.statusDelivery === "Success");
      console.log(row);
      row.map((booking) => {
        // booking.user = Users.find( user => user.idUser == booking.idUser );
        // booking.vehicleBrandsAndModels = VehicleBrandsAndModels.find( vehicle => vehicle.id == booking.idVehicleBrandAndModel );
        // booking.vehicleTypes = VehicleTypes.find( vehicle => vehicle.id == booking.idTypeCar);
        // booking.passengers = CrossAreaCarBookingPassengers.filter( booking => booking.idCrossAreaCarBooking == booking.id);
        booking.typeBooking = "DriverBooking";
      });
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDriverBookingByFilter = async (req, res) => {
  try {
    const { name, from, to, status, startdate, enddate } = req.body;
    // console.log(name, from, to, status, startdate, enddate)

    let result;
    if (name === "") {
      result = await pool.query("SELECT * FROM DriverBooking");
    } else {
      result = await pool.query(`SELECT  * FROM DriverBooking WHERE
      LOWER(DriverBooking.nameUser) LIKE '%${name.toLowerCase()}%'`);
    }

    if (from === "") {
      result = result;
    } else {
      result = await pool.query(`SELECT  * FROM DriverBooking WHERE
      LOWER(DriverBooking.namePlaceFrom) LIKE '%${from.toLowerCase()}%'`);
    }

    if (to === "") {
      result = result;
    } else {
      result = await pool.query(`SELECT  * FROM DriverBooking WHERE
      LOWER(DriverBooking.namePlaceTo) LIKE '%${to.toLowerCase()}%'`);
    }

    if (status === "ทั้งหมด") {
      result = result;
    } else if (status === "สำเร็จ") {
      result = result.filter((value) => value.statusManageCar === "Success");
    } else if (status === "รอจัดคนขับรถ") {
      result = result.filter((value) => value.statusManageCar != "Success");
    }

    if (startdate === null && enddate === null) {
      result = result;
    } else if (startdate != null && enddate === null) {
      result = result.filter(
        (value) =>
          startdate < value.startDate.slice(0, 10) ||
          startdate === value.startDate.slice(0, 10)
      );
    } else if (startdate != null && enddate != null) {
      result = result.filter(
        (value) =>
          startdate < value.startDate.slice(0, 10) ||
          startdate === value.startDate.slice(0, 10)
      );
      result = result.filter(
        (value) =>
          enddate > value.startDate.slice(0, 10) ||
          enddate === value.startDate.slice(0, 10)
      );
    } else if (startdate === null && enddate != null) {
      result = result.filter(
        (value) =>
          enddate > value.startDate.slice(0, 10) ||
          enddate === value.startDate.slice(0, 10)
      );
    }
    console.log(result);
    if (result.length > 0) {
      return res
        .status(200)
        .send({ type: "success", msg: "get data success", data: { result } });
    } else {
      return res
        .status(200)
        .send({ type: "no success", msg: "no data", data: { result } });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getDriverBookingByFilterByIdUser = async (req, res) => {
  try {
    console.log(req.body);
    const { name, status, startdate, idUser } = req.body; // console.log(name, from, to, status, startdate, enddate)

    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM DriverBooking WHERE idUser =  ?",
        [idUser]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM DriverBooking WHERE
      LOWER(DriverBooking.nameUser) LIKE '%${name.toLowerCase()}%' AND idUser = ?`,
        [idUser]
      );
    }

    if (status === "ทั้งหมด") {
      result = result;
    } else if (status === "Waiting") {
      result = result.filter(
        (value) =>
          value.statusManageCar != "Success" &&
          value.statusDelivery != "Success"
      );
    } else if (status === "Approved") {
      result = result.filter(
        (value) =>
          value.statusManageCar === "Success" &&
          value.statusDelivery != "Success"
      );
    }

    if (startdate === null) {
      result = result;
    } else if (startdate != null) {
      result = result.filter(
        (value) => startdate === value.startDate.slice(0, 10)
      );
    }

    if (result.length > 0) {
      const driver = await pool.query("SELECT * FROM Users");
      const User = await pool.query(
        "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
        [req.params.idUser]
      );

      result.map((booking) => {
        if (booking.idDriver !== null) {
          booking.driver = driver.find(
            (driver) => driver.idUser == booking.idDriver
          );
        }

        booking.user = User[0];
      });
    }
    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDriverBookingByFilterByIdDriver = async (req, res) => {
  try {
    console.log(req.body);
    const { name, enddate, startdate, idDriver } = req.body;

    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM DriverBooking WHERE idDriver =  ?",
        [idDriver]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM DriverBooking WHERE
      LOWER(DriverBooking.nameUser) LIKE '%${name.toLowerCase()}%' AND idDriver = ?`,
        [idDriver]
      );
    }

    if (startdate === null) {
      result = result;
    } else if (startdate != null) {
      result = result.filter(
        (value) => startdate <= value.startDate.slice(0, 10)
      );
    }

    if (enddate === null) {
      result = result;
    } else if (enddate != null) {
      result = result.filter((value) => enddate >= value.endDate.slice(0, 10));
    }

    if (result.length > 0) {
      const driver = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
        idDriver,
      ]);
      for (let booking of result) {
        if (booking.idUser !== null) {
          try {
            const User = await pool.query(
              "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
              [booking.idUser]
            );

            booking.driver = driver[0];
            booking.user = User[0];
          } catch (error) {
            console.error(
              `Error fetching user for booking with id ${booking.idUser}:`,
              error
            );
          }
        }
      }
    }
    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

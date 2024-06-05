const pool = require("../connection.js");

exports.postNewDriverBooking = async (req, res) => {
  const {
    namePlaceFrom,
    namePlaceTo,
    startDate,
    startTime,
    endDate,
    endTime,
    note,
    detailJourney,
    idUser,
    option,
  } = req.body[0];

  const userData = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
    idUser,
  ]);

  try {
    const rows = await pool.query(
      `
          INSERT INTO 
          DriverBooking 
              (namePlaceFrom, namePlaceTo, startDate, startTime, endDate, endTime, detailJourney, note, idUser, nameUser, addOption) 
          VALUES 
            (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        namePlaceFrom,
        namePlaceTo,
        startDate,
        startTime,
        endDate,
        endTime,
        detailJourney,
        note,
        idUser,
        userData[0].fNameThai,
        option,
      ]
    );
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllNewDriverBooking = async (req, res) => {
  try {
    const data = await pool.query(
      "SELECT * FROM DriverBooking JOIN Users WHERE DriverBooking.idUser = Users.idUser"
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
    if (req.body.idDriver != undefined) {
      let row = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
        req.body.idDriver,
      ]);
      const rows = await pool.query(
        "UPDATE DriverBooking SET  idDriver= ?, nameDriver = ?, idVehicle = ?, statusManageCar = ? WHERE idDriverBooking = ? ",
        [
          req.body.idDriver,
          row[0].fNameThai,
          req.body.idVehicle,
          "Success",
          req.body.id,
        ]
      );
    } else {
      const rows = await pool.query(
        "UPDATE DriverBooking SET  idDriver= ?, nameDriver = ?, idVehicle = ?,statusManageCar = ?, WHERE idDriverBooking = ? ",
        [req.body.idDriver, null, req.body.idVehicle, "Success", req.body.id]
      );
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

    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found");
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

    console.log(result);
    if (startdate === null) {
      result = result;
    } else if (startdate != null) {
      result = result.filter(
        (value) => startdate === value.startDate.slice(0, 10)
      );
    }
    console.log(result);
    if (result) {
      return res.status(200).send(result);
    } else {
      return res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

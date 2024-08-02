const db = require("../models");
const DeliveryCarBookings = db.deliveryCarBookings;
const pool = require("../connection.js");

function convertStringDatetime(time) {
  const [hours, minutes] = time.split(":");
  const datetime = new Date();
  datetime.setHours(parseInt(hours, 10));
  datetime.setMinutes(parseInt(minutes, 10));
  return datetime;
}

exports.getAllDeliveryCarBookings = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM DeliveryCarBooking");
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliveryCarBookingById = (req, res) => {
  try {
    let result = DeliveryCarBookings.filter(
      (booking) => booking.id == req.params.id
    );
    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliveryCarBookingByIdUser = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM DeliveryCarBooking WHERE idUser = ?",
      [req.params.idUser]
    );
    // let result = DeliveryCarBookings.filter(booking => booking.idUser == req.params.idUser);
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliveryCarBookingByIdDriver = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM DeliveryCarBooking WHERE idDriver = ?",
      [req.params.idDriver]
    );
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliveryCarBookingByIdUserForRating = async (req, res) => {
  try {
    let row = await pool.query(
      "SELECT * FROM DeliveryCarBooking WHERE idUser = ?",
      [req.params.idUser]
    );
    // let result = row.filter(booking => booking.idUser == req.params.idUser);
    if (row.length > 0) {
      row.map((booking) => {
        // booking.user = Users.find( user => user.idUser == booking.idUser );
        // booking.vehicleBrandsAndModels = VehicleBrandsAndModels.find( vehicle => vehicle.id == booking.idVehicleBrandAndModel );
        // booking.vehicleTypes = VehicleTypes.find( vehicle => vehicle.id == booking.idTypeCar);
        // booking.passengers = CrossAreaCarBookingPassengers.filter( booking => booking.idCrossAreaCarBooking == booking.id);
        booking.typeBooking = "Delivery";
      });
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliveryCarBookingByStartDate = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM DeliveryCarBooking WHERE date > ?",
      [req.body.startDate]
    );

    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliveryCarBookingByStartDateAndEndDate = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM DeliveryCarBooking WHERE date BETWEEN ? AND ?",
      [req.body.startDate, req.body.endDate]
    );

    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewDeliveryCarBooking = async (req, res) => {
  try {
    // console.log("postNewDeliveryCarBooking here", req.body)
    const {
      name,
      telephoneMobile,
      email,
      section,
      department,
      weightProduct,
      detail,
      fromPlace,
      toPlace,
      nameRecipient,
      telephoneMobileRecipient,
      idTypeVehicle,
      idVehicleBrandAndModel,
      typeProduct,
      purpose,
      date,
      startTime,
      endTime,
      imageVehicle,
      costBooking,
      note,
      nameDriver,
      plate_No,
      statusApproved,
      statusManageCar,
    } = req.body[0];
    const idUser = req.body[1];
    const convertStartTime = convertStringDatetime(startTime);
    const convertEndTime = convertStringDatetime(endTime);
    // console.log(convertStartTime, convertEndTime)

    // console.log("log data", idUser, name, telephoneMobile, email, weightProduct,detail, fromPlace, toPlace, nameRecipient, telephoneMobileRecipient, idTypeVehicle, idVehicleBrandAndModel, typeProduct,
    // purpose, date, startTime, endTime, imageVehicle, costBooking)
    const rows = await pool.query(
      `
            INSERT INTO 
            DeliveryCarBooking 
                (idUser, idTypeVehicle, idVehicleBrandAndModel, name, telephoneMobile, email, section, department, nameDriver, nameRecipient, telephoneMobileRecipient,
                    note, plate_No, purpose, statusApproved, statusManageCar, toPlace, fromPlace, typeProduct, weightProduct, date, startTime, endTime,
                    detail, imageVehicle,costBooking) 
            VALUES 
              (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        idUser,
        idTypeVehicle,
        idVehicleBrandAndModel,
        name,
        telephoneMobile,
        email,
        section,
        department,
        nameDriver,
        nameRecipient,
        telephoneMobileRecipient,
        note,
        plate_No,
        purpose,
        statusApproved,
        statusManageCar,
        toPlace,
        fromPlace,
        typeProduct,
        weightProduct,
        date,
        convertStartTime,
        convertEndTime,
        detail,
        imageVehicle,
        costBooking,
      ]
    );

    if (rows) {
      res.status(200).send(rows);
    } else {
      res.status(400).send("Failed Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.postManageCarDeliveryCarBooking = async (req, res) => {
  try {
    if (req.body.isDriverFromCompany) {
      const row = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
        req.body.nameDriver,
      ]);
      const idDriver = req.body.nameDriver;
      const rows = await pool.query(
        "UPDATE DeliveryCarBooking SET  idTypeVehicle= ?, idVehicleBrandAndModel= ? ,nameDriver= ?,phoneDriver= ?, note = ?, plate_No= ?, statusManageCar = ?, isDriverFromCompany = ?, idDriver = ?, idVehicle = ? WHERE idDeliveryCarBooking = ? ",
        [
          req.body.idTypeCar,
          req.body.idVehicleBrandAndModel,
          row[0].fNameThai,
          row[0].mobileNumber,
          req.body.note,
          req.body.plate_No,
          "Succes",
          req.body.isDriverFromCompany,
          idDriver,
          req.body.idVehicle,
          req.body.id,
        ]
      );

      if (rows) {
        res.status(200).send(rows);
      } else {
        res.status(404).send("Not Found Booking");
      }
    } else {
      const rows = await pool.query(
        "UPDATE DeliveryCarBooking SET  idTypeVehicle= ?, idVehicleBrandAndModel= ? ,nameDriver= ?,phoneDriver= ?, note = ?, plate_No= ?, statusManageCar = ?, isDriverFromCompany = ?, idDriver = ?, idVehicle = ? WHERE idDeliveryCarBooking = ? ",
        [
          req.body.idTypeCar,
          req.body.idVehicleBrandAndModel,
          req.body.nameDriver,
          req.body.phoneDriver,
          req.body.note,
          req.body.plate_No,
          "Succes",
          req.body.isDriverFromCompany,
          req.body.idDriver,
          req.body.idVehicle,
          req.body.id,
        ]
      );

      if (rows) {
        res.status(200).send(rows);
      } else {
        res.status(404).send("Not Found Booking");
      }
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.deleteCarDeliveryCarBooking = async (req, res) => {
  try {
    const rows = await pool.query(
      "DELETE FROM DeliveryCarBooking WHERE idDeliveryCarBooking = ?",
      [req.body.idDeliveryCarBooking]
    );
    // console.log("Delete CarInAreaCarBookingr", req.body)
    if (rows) {
      res.status(200).send(rows);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postApprovedlDeliveryCarBooking = async (req, res) => {
  try {
    console.log("postApprovedlDeliveryCarBooking", req.body);

    const rows = await pool.query(
      "UPDATE DeliveryCarBooking SET  statusApproved = ?  , Approved= ? WHERE idDeliveryCarBooking = ? ",
      [req.body.status, req.body.status, req.body.idBooking]
    );

    if (rows) {
      const result = await pool.query("SELECT * FROM DeliveryCarBooking");
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliveryCarBookingByFilter = async (req, res) => {
  try {
    const { name, status, startdate, idUser } = req.body;
    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM DeliveryCarBooking  WHERE idUser = ?",
        [idUser]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM DeliveryCarBooking WHERE
                      LOWER(DeliveryCarBooking.name) LIKE '%${name.toLowerCase()}%' AND idUser = ?`,
        [idUser]
      );
    }

    if (status === "ทั้งหมด") {
      result = result;
    } else if (status === "Waiting") {
      result = result.filter(
        (booking) =>
          booking.statusApproved != "Success" ||
          booking.Approved != "Success" ||
          booking.statusManageCar ||
          "Success"
      );
    } else if (status === "Approved") {
      result = [];
    }
    if (startdate === null) {
      result = result;
    } else if (startdate != null) {
      result = result.filter((value) => startdate === value.date.slice(0, 10));
    }
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliveryCarBookingByFilterByIdDriver = async (req, res) => {
  try {
    const { name, enddate, startdate, idDriver } = req.body;
    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM DeliveryCarBooking WHERE idDriver = ?",
        [idDriver]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM DeliveryCarBooking WHERE
                      LOWER(DeliveryCarBooking.name) LIKE '%${name.toLowerCase()}%' AND idDriver = ?`,
        [idDriver]
      );
    }

    if (enddate === null) {
      result = result;
    } else if (enddate != null) {
      result = result.filter(
        (value) =>
          enddate >= value.date.slice(0, 10) ||
          enddate === value.date.slice(0, 10)
      );
    }
    if (startdate === null) {
      result = result;
    } else if (startdate != null) {
      result = result.filter((value) => startdate <= value.date.slice(0, 10));
    }
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

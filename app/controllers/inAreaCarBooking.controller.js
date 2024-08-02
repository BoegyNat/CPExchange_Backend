const db = require("../models");
const InAreaCarBookings = db.inAreaCarBookings;
const VehicleTypes = db.vehicleTypes;
const Users = db.users;
const pool = require("../connection.js");

function convertStringDatetime(time) {
  const [hours, minutes] = time.split(":");
  const datetime = new Date();
  datetime.setHours(parseInt(hours, 10));
  datetime.setMinutes(parseInt(minutes, 10));
  return datetime;
}

exports.getAllInAreaCarBookings = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inAreaCarBooking");
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getInAreaCarBookingById = async (req, res) => {
  try {
    let result = InAreaCarBookings.find(
      (booking) => booking.id == req.params.id
    );

    if (result) {
      result.user = Users.find((user) => user.id == result.idUser);
      result.vehicleTypes = VehicleTypes.find(
        (type) => type.id == result.idTypeCar
      );
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getInAreaCarBookingByIdUser = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM inAreaCarBooking WHERE idUser = ?",
      [req.params.idUser]
    );

    const vehicleType = await pool.query("SELECT * FROM VehicleTypes");

    if (row.length > 0) {
      row.map((booking) => {
        booking.vehicleTypes = vehicleType.find(
          (vehitype) => vehitype.idVehicleTypes == booking.idTypeCar
        );
      });

      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getInAreaCarBookingByIdDriver = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM inAreaCarBooking WHERE idDriver = ?",
      [req.params.idDriver]
    );

    if (row.length > 0) {
      for (const booking of row) {
        booking.vehicleBrandsAndModels = await pool.query(
          "SELECT * FROM VehicleBrandsAndModels WHERE idVehicleBrandsAndModels = ?",
          [booking.idVehicleBrandAndModel]
        );

        booking.vehicleTypes = await pool.query(
          "SELECT * FROM VehicleTypes WHERE idVehicleTypes = ?",
          [booking.idTypeCar]
        );
      }
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getInAreaCarBookingByIdApprovedUserForManager = async (req, res) => {
  try {
    const row = await pool.query("SELECT * FROM inAreaCarBooking");

    let result = row.filter(
      (booking) => booking.idApprovedUser == req.params.idApprovedUser
    );
    result.map((booking) => {
      booking.user = Users.find((user) => user.id == booking.idUser);
      let type = VehicleTypes.find(
        (vehitype) => vehitype.id == booking.idTypeCar
      );
      booking.vehicleTypes = type;
      booking.vehicleTypeNameEN = type.vehicleTypeNameEN;
      booking.vehicleTypeNameTH = type.vehicleTypeNameTH;
    });
    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getInAreaCarBookingByStartDate = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM inAreaCarBooking WHERE departureDate > ?",
      [req.body.startDate]
    );
    const vehicleType = await pool.query("SELECT * FROM VehicleTypes");
    row.map((booking) => {
      if (booking.isDriverFromCompany) {
        let type = vehicleType.find(
          (vehitype) => vehitype.idVehicleTypes == booking.idTypeCar
        );
        booking.vehicleTypeNameEN = type.vehicleTypeNameEN;
        booking.vehicleTypeNameTH = type.vehicleTypeNameTH;
      }
    });
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getInAreaCarBookingByStartDateAndEndDate = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM inAreaCarBooking WHERE departureDate BETWEEN ? AND ?",
      [req.body.startDate, req.body.endDate]
    );
    // let result = InAreaCarBookings.filter((booking) => {
    //   let dateBookingModel = new Date(booking.departureDate).setHours(
    //     0,
    //     0,
    //     0,
    //     0
    //   );
    //   let startDateBody = new Date(req.body.startDate).setHours(0, 0, 0, 0);
    //   let endDateBody = new Date(req.body.endDate).setHours(0, 0, 0, 0);
    //   return dateBookingModel > startDateBody && dateBookingModel < endDateBody;
    // });
    const vehicleType = await pool.query("SELECT * FROM VehicleTypes");

    row.map((booking) => {
      if (booking.isDriverFromCompany) {
        let type = vehicleType.find(
          (vehitype) => vehitype.idVehicleTypes == booking.idTypeCar
        );
        booking.vehicleTypeNameEN = type.vehicleTypeNameEN;
        booking.vehicleTypeNameTH = type.vehicleTypeNameTH;
      }
    });
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.postNewInAreaCarBooking = async (req, res) => {
  try {
    const {
      name,
      telephoneMobile,
      email,
      flight,
      fromPlace,
      toPlace,
      numberOfPassenger,
      departureDate,
      startTime,
      endTime,
      idTypeCar,
      idVehicleBrandAndModel,
      gaSite,
      purpose,
      note,
      section,
      department,
      company,
      costCenter,
      costElement,
      idApproved,
      nameApproved,
      departmentApproved,
      companyApproved,
      idUser,
    } = req.body;

    const init_status = "in progress";
    const convertStartTime = convertStringDatetime(startTime);
    const convertEndTime = convertStringDatetime(endTime);

    const rows = await pool
      .query(
        `
        INSERT INTO
        inAreaCarBooking
            (idUser, name, telephoneMobile, email, flight, fromPlace, toPlace, numberOfPassenger, departureDate, startTime, endTime, idTypeCar, idVehicleBrandAndModel, gaSite, purpose, note,section, department, company, costCenter, costElement, idApprovedUser, nameApproved, departmentApproved, companyApproved, statusApproved, Approved, statusManageCar, plate_No, nameDriver, idDriver, statusRating, idReview )
        VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          idUser,
          name,
          telephoneMobile,
          email,
          flight,
          fromPlace,
          toPlace,
          numberOfPassenger,
          departureDate,
          convertStartTime,
          convertEndTime,
          idTypeCar,
          idVehicleBrandAndModel,
          gaSite,
          purpose,
          note,
          section,
          department,
          company,
          costCenter,
          costElement,
          idApproved,
          nameApproved,
          departmentApproved,
          companyApproved,
          init_status,
          init_status,
          init_status,
          null,
          null,
          null,
          init_status,
          null,
        ]
      )
      .then((rows) => {
        if (rows) {
          return res.status(200).send({
            type: "success",
            msg: "Input success",
            returnData: {
              idUser: idUser,
              name: name,
              telephoneMobile: telephoneMobile,
              email: email,
              flight: flight,
              fromPlace: fromPlace,
              toPlace: toPlace,
              numberOfPassenger: numberOfPassenger,
              departureDate: departureDate,
              convertStartTime: convertStartTime,
              convertEndTime: convertEndTime,
              idTypeCar: idTypeCar,
              idVehicleBrandAndModel: idVehicleBrandAndModel,
              gaSite: gaSite,
              purpose: purpose,
              note: note,
              section: section,
              department: department,
              company: company,
              costCenter: costCenter,
              costElement: costElement,
              idApproved: idApproved,
              nameApproved: nameApproved,
              departmentApproved: departmentApproved,
              companyApproved: companyApproved,
            },
          });
        } else {
          return res.status(400).send({ type: "false", msg: "Input false" });
        }
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.postManageCarInAreaCarBooking = async (req, res) => {
  try {
    if (req.body[0].isDriverFromCompany) {
      const row = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
        req.body[0].nameDriver,
      ]);
      const idDriver = req.body[0].nameDriver;
      const rows = await pool.query(
        "UPDATE inAreaCarBooking SET  idTypeCar= ?, idVehicleBrandAndModel= ?, gaSite= ?,note= ?, statusManageCar = ?, idVehicle = ?, model = ? , plate_No= ?, isDriverFromCompany = ?, nameDriver = ?, phoneDriver = ?, idDriver = ? WHERE idinAreaCarBooking = ? ",
        [
          req.body[0].idTypeCar,
          req.body[0].idVehicleBrandAndModel,
          req.body[0].gaSite,
          req.body[0].note,
          "Success",
          req.body[0].idVehicle,
          req.body[0].model,
          req.body[0].plate_No,
          req.body[0].isDriverFromCompany,
          row[0].fNameThai,
          row[0].mobileNumber,
          idDriver,
          req.body[0].id,
        ]
      );
      if (rows) {
        res.status(200).send(rows);
      } else {
        res.status(404).send("Not Found Booking");
      }
    } else {
      const rows = await pool.query(
        "UPDATE inAreaCarBooking SET  idTypeCar= ?, idVehicleBrandAndModel= ?, gaSite= ?,note= ?, statusManageCar = ?, idVehicle = ?, model = ? , plate_No= ?, isDriverFromCompany = ?, nameDriver = ?, phoneDriver = ?, idDriver = ? WHERE idinAreaCarBooking = ? ",
        [
          req.body[0].idTypeCar,
          req.body[0].idVehicleBrandAndModel,
          req.body[0].gaSite,
          req.body[0].note,
          "Success",
          req.body[0].idVehicle,
          req.body[0].model,
          req.body[0].plate_No,
          req.body[0].isDriverFromCompany,
          req.body[0].nameDriver,
          req.body[0].phoneDriver,
          req.body[0].idDriver,
          req.body[0].id,
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

exports.deleteCarInAreaCarBooking = async (req, res) => {
  try {
    const rows = await pool.query(
      "DELETE FROM inAreaCarBooking WHERE idinAreaCarBooking = ?",
      [req.body.idinAreaCarBooking]
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

exports.postApprovedInAreaCarBooking = async (req, res) => {
  try {
    // const row = await pool.query("SELECT * FROM Users WHERE idUser = ?", [req.body.nameDriver])
    // const idDriver = req.body.nameDriver
    const rows = await pool.query(
      "UPDATE inAreaCarBooking SET  statusApproved = ?, Approved= ? WHERE idinAreaCarBooking = ? ",
      [req.body.status, req.body.status, req.body.idBooking]
    );

    // let manageCar = req.body;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).statusManageCar = true;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).idTypeCar = manageCar.idTypeCar;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).model = manageCar.model;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).plate_No = manageCar.plate_No;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).nameDriver = manageCar.nameDriver;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).note = manageCar.note;
    if (rows) {
      const result = await pool.query("SELECT * FROM inAreaCarBooking");
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getInAreaCarBookingByIdUserForRating = async (req, res) => {
  try {
    let row = await pool.query(
      "SELECT * FROM inAreaCarBooking WHERE idUser = ?",
      [req.params.idUser]
    );
    // let result = row.filter(booking => booking.idUser == req.params.idUser);
    if (row.length > 0) {
      row.map((booking) => {
        // booking.user = Users.find( user => user.idUser == booking.idUser );
        // booking.vehicleBrandsAndModels = VehicleBrandsAndModels.find( vehicle => vehicle.id == booking.idVehicleBrandAndModel );
        // booking.vehicleTypes = VehicleTypes.find( vehicle => vehicle.id == booking.idTypeCar);
        // booking.passengers = CrossAreaCarBookingPassengers.filter( booking => booking.idCrossAreaCarBooking == booking.id);
        booking.typeBooking = "InArea";
      });
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getInAreaCarBookingByFilter = async (req, res) => {
  try {
    const { name, status, startdate, idUser } = req.body;
    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM inAreaCarBooking  WHERE idUser = ?",
        [idUser]
      );

      result.map((booking) => {
        booking.vehicleTypes = VehicleTypes.find(
          (vehitype) => vehitype.id == booking.idTypeCar
        );
      });
    } else {
      result = await pool.query(
        `SELECT  * FROM inAreaCarBooking WHERE
                LOWER(inAreaCarBooking.name) LIKE '%${name.toLowerCase()}%' AND idUser = ?`,
        [idUser]
      );

      result.map((booking) => {
        booking.vehicleTypes = VehicleTypes.find(
          (vehitype) => vehitype.id == booking.idTypeCar
        );
      });
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
      result = result.filter(
        (value) => startdate === value.departureDate.slice(0, 10)
      );
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

exports.getInAreaCarBookingByFilterByIdDriver = async (req, res) => {
  try {
    const { name, enddate, startdate, idDriver } = req.body;
    let result;
    const VehicleType = await pool.query("SELECT * FROM VehicleTypes");
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM inAreaCarBooking  WHERE idDriver = ?",
        [idDriver]
      );

      result.map((booking) => {
        booking.vehicleTypes = VehicleType.find(
          (vehitype) => vehitype.idVehicleTypes == booking.idTypeCar
        );
      });
    } else {
      result = await pool.query(
        `SELECT  * FROM inAreaCarBooking WHERE
                LOWER(inAreaCarBooking.name) LIKE '%${name.toLowerCase()}%' AND idDriver = ?`,
        [idDriver]
      );

      result.map((booking) => {
        booking.vehicleTypes = VehicleType.find(
          (vehitype) => vehitype.idVehicleTypes == booking.idTypeCar
        );
      });
    }

    if (startdate === null) {
      result = result;
    } else if (startdate != null) {
      result = result.filter(
        (value) => startdate <= value.departureDate.slice(0, 10)
      );
    }

    if (enddate === null) {
      result = result;
    } else if (enddate != null) {
      result = result.filter(
        (value) => enddate >= value.departureDate.slice(0, 10)
      );
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

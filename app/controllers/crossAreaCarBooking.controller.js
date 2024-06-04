const db = require("../models");
const CrossAreaCarBookings = db.crossAreaCarBookings;
const CrossAreaCarBookingPassengers = db.crossAreaCarBookingPassengers;
const VehicleBrandsAndModels = db.vehicleBrandsAndModels;
const VehicleTypes = db.vehicleTypes;
const Users = db.users;

const pool = require("../connection.js");

exports.getAllCrossAreaCarBookings = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM CrossAreaCarBooking");
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getCrossAreaCarBookingById = (req, res) => {
  try {
    let result = CrossAreaCarBookings.find(
      (booking) => booking.id == req.params.id
    );
    if (result) {
      result.user = Users.find((user) => user.id == result.idUser);
      result.vehicleBrandsAndModels = VehicleBrandsAndModels.find(
        (vehicle) => vehicle.id == result.idVehicleBrandAndModel
      );
      result.vehicleTypes = VehicleTypes.find(
        (vehicle) => vehicle.id == result.idTypeCar
      );
      result.passengers = CrossAreaCarBookingPassengers.filter(
        (booking) => booking.idCrossAreaCarBooking == result.id
      );
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getCrossAreaCarBookingByIdUser = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM CrossAreaCarBooking WHERE idUser = ?",
      [req.params.idUser]
    );
    let result = row.filter((booking) => booking.idUser == req.params.idUser);
    if (result.length > 0) {
      result.map((booking) => {
        booking.user = Users.find((user) => user.idUser == booking.idUser);
        booking.vehicleBrandsAndModels = VehicleBrandsAndModels.find(
          (vehicle) => vehicle.id == booking.idVehicleBrandAndModel
        );
        booking.vehicleTypes = VehicleTypes.find(
          (vehicle) => vehicle.id == booking.idTypeCar
        );
        booking.passengers = CrossAreaCarBookingPassengers.filter(
          (booking) => booking.idCrossAreaCarBooking == booking.id
        );
      });
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getCrossAreaCarBookingByIdUserForRating = async (req, res) => {
  try {
    let row = await pool.query(
      "SELECT * FROM CrossAreaCarBooking JOIN review ON CrossAreaCarBooking.idReview = review.idreview  WHERE CrossAreaCarBooking.idUser = ?",
      [req.params.idUser]
    );
    // let result = row.filter(booking => booking.idUser == req.params.idUser);
    if (row.length > 0) {
      row.map((booking) => {
        // booking.user = Users.find( user => user.idUser == booking.idUser );
        // booking.vehicleBrandsAndModels = VehicleBrandsAndModels.find( vehicle => vehicle.id == booking.idVehicleBrandAndModel );
        // booking.vehicleTypes = VehicleTypes.find( vehicle => vehicle.id == booking.idTypeCar);
        // booking.passengers = CrossAreaCarBookingPassengers.filter( booking => booking.idCrossAreaCarBooking == booking.id);
        booking.typeBooking = "CrossArea";
      });
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getCrossAreaCarBookingByIdApprovedUserForManager = (req, res) => {
  try {
    let result = CrossAreaCarBookings.filter(
      (booking) =>
        booking.idApprovedUser == req.params.idApprovedUser &&
        booking.statusApproved == false
    );
    result.map((booking) => {
      booking.user = Users.find((user) => user.id == booking.idUser);
      let type = VehicleTypes.find(
        (vehitype) => vehitype.id == booking.idTypeCar
      );
      booking.vehicleTypes = type;
      booking.vehicleTypeNameEN = type.vehicleTypeNameEN;
      booking.vehicleTypeNameTH = type.vehicleTypeNameTH;
      let brandAndModel = VehicleBrandsAndModels.find(
        (vehibrand) => vehibrand.id == booking.idVehicleBrandAndModel
      );
      booking.vehicleBrandsAndModels = brandAndModel;
      booking.brand = brandAndModel.brand;
      booking.model = brandAndModel.model;
      booking.motor = brandAndModel.motor;
      booking.gear = brandAndModel.gear;
      booking.gas = brandAndModel.gas;
      booking.breakABS = brandAndModel.breakABS;
      booking.imagepath = brandAndModel.imagepath;
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

exports.getCrossAreaCarBookingByStartDate = async (req, res) => {
  try {
    // console.log("getCrossAreaCarBookingByStartDate", req.body)
    const data = await pool.query("SELECT * FROM CrossAreaCarBooking");
    // console.log("getCrossAreaCarBookingByStartDate", data)
    let result = data.filter((booking) => {
      let dateBookingModel = new Date(booking.departureDate).setHours(
        0,
        0,
        0,
        0
      );

      let dateBody = new Date(req.body.startDate).setHours(0, 0, 0, 0);

      return dateBookingModel > dateBody;
    });
    result.map((booking) => {
      let type = VehicleTypes.find(
        (vehitype) => vehitype.id == booking.idTypeCar
      );
      booking.vehicleTypeNameEN = type.vehicleTypeNameEN;
      booking.vehicleTypeNameTH = type.vehicleTypeNameTH;
      let brandAndModel = VehicleBrandsAndModels.find(
        (vehibrand) => vehibrand.id == booking.idVehicleBrandAndModel
      );
      booking.brand = brandAndModel.brand;
      booking.model = brandAndModel.model;
      booking.motor = brandAndModel.motor;
      booking.gear = brandAndModel.gear;
      booking.gas = brandAndModel.gas;
      booking.breakABS = brandAndModel.breakABS;
      booking.imagepath = brandAndModel.imagepath;
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

exports.getCrossAreaCarBookingByStartDateAndEndDate = (req, res) => {
  try {
    let result = CrossAreaCarBookings.filter((booking) => {
      let dateBookingModel = new Date(booking.departureDate).setHours(
        0,
        0,
        0,
        0
      );
      let startDateBody = new Date(req.body.startDate).setHours(0, 0, 0, 0);
      let endDateBody = new Date(req.body.endDate).setHours(0, 0, 0, 0);
      return dateBookingModel > startDateBody && dateBookingModel < endDateBody;
    });
    result.map((booking) => {
      let type = VehicleTypes.find(
        (vehitype) => vehitype.id == booking.idTypeCar
      );
      booking.vehicleTypeNameEN = type.vehicleTypeNameEN;
      booking.vehicleTypeNameTH = type.vehicleTypeNameTH;
      let brandAndModel = VehicleBrandsAndModels.find(
        (vehibrand) => vehibrand.id == booking.idVehicleBrandAndModel
      );
      booking.brand = brandAndModel.brand;
      booking.model = brandAndModel.model;
      booking.motor = brandAndModel.motor;
      booking.gear = brandAndModel.gear;
      booking.gas = brandAndModel.gas;
      booking.breakABS = brandAndModel.breakABS;
      booking.imagepath = brandAndModel.imagepath;
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

exports.postNewCrossAreaCarBooking = async (req, res) => {
  const {
    idCrossAreaCarBooking,
    name,
    telephoneMobile,
    email,
    flight,
    fromPlace,
    toPlace,
    fromPlaceReturn,
    toPlaceReturn,
    numberOfPassenger,
    idTypeCar,
    departureDate,
    startTime,
    endTime,
    idVehicleBrandAndModel,
    purpose,
    idApproved,
    totalPrice,
  } = req.body[0];
  const idUser = req.body[1];
  // console.log(idCrossAreaCarBooking, name, telephoneMobile, email, flight, fromPlace, toPlace, fromPlaceReturn,
  //     toPlaceReturn, numberOfPassenger, idTypeCar, departureDate, startTime, endTime, idVehicleBrandAndModel, detail, idApproved)

  try {
    const rows = await pool.query(
      `
              INSERT INTO 
              CrossAreaCarBooking 
                  (name, telephoneMobile, email, flight, fromPlace, toPlace, fromPlaceReturn,
                    toPlaceReturn, numberOfPassenger, idTypeCar, departureDate, startTime, endTime, purpose, idVehicleBrandAndModel, idUser, idApproved, totalPrice ) 
              VALUES 
                  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        telephoneMobile,
        email,
        flight,
        fromPlace,
        toPlace,
        fromPlaceReturn,
        toPlaceReturn,
        numberOfPassenger,
        idTypeCar,
        departureDate,
        startTime,
        endTime,
        purpose,
        idVehicleBrandAndModel,
        idUser,
        idApproved,
        totalPrice,
      ]
    );

    const row = await pool.query(
      "SELECT * FROM CrossAreaCarBooking  ORDER BY idCrossAreaCarBooking DESC LIMIT 1"
    );

    for (const data of Object.values(req.body[0].listPassenger)) {
      const namePassenger = data.name;
      const companyPassenger = data.company;
      const phonePassenger = data.telephoneMobile;
      const emailPassenger = data.email;
      const costCenter = data.costCenter;
      const costElement = data.costElement;
      const fromPlacePassenger = data.fromPlace;
      const idCrossAreaCar = row[0].idCrossAreaCarBooking;
      // console.log(namePassenger, companyPassenger, phonePassenger, emailPassenger, costCenter, costElement, fromPlacePassenger, idCrossAreaCar)
      const field = await pool.query(
        `
              INSERT INTO 
              CrossAreaCarPassenger 
                  (name, company, telephoneMobile, email, costCenter,
                    costElement, fromPlace, idCrossAreaCar) 
              VALUES 
                  (?,?,?,?,?,?,?,?)`,
        [
          namePassenger,
          companyPassenger,
          phonePassenger,
          emailPassenger,
          costCenter,
          costElement,
          fromPlacePassenger,
          idCrossAreaCar,
        ]
      );
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postManageCarCrossAreaCarBooking = async (req, res) => {
  try {
    const row = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
      req.body.nameDriver,
    ]);
    const idDriver = req.body.nameDriver;
    const rows = await pool.query(
      "UPDATE CrossAreaCarBooking SET  model = ?, nameDriver= ?, note= ?, plate_No= ?, statusManageCar = ?, idDriver = ?, statusApproved = ?, Approved = ? WHERE idCrossAreaCarBooking = ? ",
      [
        req.body.model,
        row[0].fNameThai,
        req.body.note,
        req.body.plate_No,
        "Success",
        idDriver,
        false,
        false,
        req.body.id,
      ]
    );

    // let manageCar = req.body;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).statusManageCar = true;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).idTypeCar = manageCar.idTypeCar;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).model = manageCar.model;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).plate_No = manageCar.plate_No;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).nameDriver = manageCar.nameDriver;
    // CrossAreaCarBookings.find(booking => booking.id == req.body.id).note = manageCar.note;
    if (rows) {
      res.status(200).send(rows);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteCarCrossAreaCarBooking = async (req, res) => {
  try {
    const rows = await pool.query(
      "DELETE FROM CrossAreaCarBooking WHERE idCrossAreaCarBooking = ?",
      [req.body.idCrossAreaCarBooking]
    );
    // console.log("Delete Route", req.body.idCrossAreaCarBooking)
    if (rows) {
      res.status(200).send(rows);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.postApprovedCrossAreaCarBooking = async (req, res) => {
  try {
    console.log("postApprovedCrossAreaCarBooking", req.body);
    // const row = await pool.query("SELECT * FROM Users WHERE idUser = ?", [req.body.nameDriver])
    // const idDriver = req.body.nameDriver
    const rows = await pool.query(
      "UPDATE CrossAreaCarBooking SET  statusApproved = ?, Approved= ? WHERE idCrossAreaCarBooking = ? ",
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
      const result = await pool.query("SELECT * FROM CrossAreaCarBooking");
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getAllCrossAreaCarBookingsByFilter = async (req, res) => {
  try {
    const { name, status, startdate, idUser } = req.body;
    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM CrossAreaCarBooking WHERE idUser = ?",
        [idUser]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM CrossAreaCarBooking WHERE
          LOWER(CrossAreaCarBooking.name) LIKE '%${name.toLowerCase()}%' AND idUser`,
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
          booking.statusManageCar != "Success"
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

const db = require("../models");
const CrossAreaCarPoolBookings = db.crossAreaCarPoolBookings;
const CrossAreaCarPoolBookingPassengers = db.crossAreaCarPoolBookingPassengers;

const pool = require("../connection.js");

exports.getAllCrossAreaCarPoolBookings = async (req, res) => {
  try {
    const rows = await pool.query("SELECT * FROM CrossAreaCarPoolBooking");
    res.status(200).send(rows);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getCrossAreaCarPoolBookingById = (req, res) => {
  try {
    let result = CrossAreaCarPoolBookings.filter(
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

exports.getCrossAreaCarPoolBookingByIdUser = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM CrossAreaCarPoolBooking  WHERE idUser = ?",
      [req.params.idUser]
    );
    const rows = await pool.query(
      "SELECT * FROM CrossAreaCarPoolBookingPassenger"
    );

    // let result = CrossAreaCarPoolBookings.filter(booking => {
    //     if(booking.idUser == req.params.idUser){
    //         return true;
    //     }else{
    //         let passenger = CrossAreaCarPoolBookingPassengers.find(passenger => passenger.idCrossAreaCarPoolBooking == booking.id && passenger.idUser == req.params.idUser);
    //         if(passenger){
    //             return true;
    //         }else{
    //             return false;
    //         }
    //     }
    // });
    if (row.length > 0) {
      row.map((booking) => {
        booking.passengers = rows.filter(
          (passenger) =>
            passenger.idCrossAreaCarPoolBooking ==
            booking.idCrossAreaCarPoolBooking
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

exports.getCrossAreaCarPoolBookingByIdUserForRating = async (req, res) => {
  try {
    let row = await pool.query(
      "SELECT * FROM CrossAreaCarPoolBooking WHERE idUser = ?",
      [req.params.idUser]
    );
    // let result = row.filter(booking => booking.idUser == req.params.idUser);
    if (row.length > 0) {
      row.map((booking) => {
        // booking.user = Users.find( user => user.idUser == booking.idUser );
        // booking.vehicleBrandsAndModels = VehicleBrandsAndModels.find( vehicle => vehicle.id == booking.idVehicleBrandAndModel );
        // booking.vehicleTypes = VehicleTypes.find( vehicle => vehicle.id == booking.idTypeCar);
        // booking.passengers = CrossAreaCarBookingPassengers.filter( booking => booking.idCrossAreaCarBooking == booking.id);
        booking.typeBooking = "CrossAreaPool";
      });
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewCrossAreaCarPoolBooking = async (req, res) => {
  const {
    idCrossAreaCarPoolBooking,
    idUser,
    name,
    telephoneMobile,
    email,
    flight,
    fromPlace,
    toPlace,
    fromPlaceReturn,
    toPlaceReturn,
    numberOfPassenger,
    departureDate,
    numberOfPassengerReturn,
  } = req.body;

  try {
    const rows = await pool.query(
      `
        INSERT INTO 
        CrossAreaCarPoolBooking 
            (idUser, name, telephoneMobile, email, flight, fromPlace, 
            toPlace, numberOfPassenger, departureDate, fromPlaceReturn,
              toPlaceReturn, numberOfPassengerReturn) 
        VALUES 
          (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        idUser,
        name,
        telephoneMobile,
        email,
        flight,
        fromPlace,
        toPlace,
        numberOfPassenger,
        new Date(departureDate),
        fromPlaceReturn,
        toPlaceReturn,
        numberOfPassengerReturn,
      ]
    );
    const row = await pool.query(
      "SELECT * FROM CrossAreaCarPoolBooking  ORDER BY idCrossAreaCarPoolBooking DESC LIMIT 1"
    );
    let success_Passenger = true;
    for (const data of Object.values(req.body.listPassenger)) {
      const namePassenger = data.name;
      const departmentPassenger = data.option.departmentName;
      const companyPassenger = data.company;
      const phonePassenger = data.telephoneMobile;
      const emailPassenger = data.email;
      const costCenter = data.costCenter;
      const costElement = data.costElement;
      const fromPlacePassenger = data.fromPlace;
      const idUser = data.option.idEmployees;
      const toPlace = data.toPlace;
      const roundTime = data.roundTime;
      const purpose = data.purpose;
      const noteDeparture = data.noteDeparture;
      const fromPlaceReturn = data.fromPlaceReturn;
      const toPlaceReturn = data.toPlaceReturn;
      const endTimeReturn = data.endTime;
      const idCrossAreaCarPool = row[0].idCrossAreaCarPoolBooking;
      const field = await pool.query(
        `
                  INSERT INTO 
                  CrossAreaCarPoolBookingPassenger 
                      (idCrossAreaCarPoolBooking, idUser, name,telephoneMobile, email, department, company, costCenter,
                        costElement, fromPlace, toPlace, roundTime, purpose, noteDeparture, fromPlaceReturn, toPlaceReturn, endTimeReturn) 
                  VALUES 
                      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          idCrossAreaCarPool,
          idUser,
          namePassenger,
          phonePassenger,
          emailPassenger,
          departmentPassenger,
          companyPassenger,
          costCenter,
          costElement,
          fromPlacePassenger,
          toPlace,
          roundTime,
          purpose,
          noteDeparture,
          fromPlaceReturn,
          toPlaceReturn,
          endTimeReturn,
        ]
      );
      const resdataid = await pool.query(
        "SELECT * FROM CrossAreaCarPoolBookingPassenger  ORDER BY idCrossAreaCarPoolBookingPassenger DESC LIMIT 1"
      );
      const resdataUser = await pool.query(
        "SELECT latAddress as lat, lngAddress as lng FROM UniHR.Employees  where idEmployees = ?",
        [idUser]
      );

      const res = await pool.query(
        `
                INSERT INTO 
                routeCrossAreaCarPools 
                    (idCrossAreaCarPoolBookingPassenger, createDate, idUser, routeDate, routeLine, latUser, lngUser,  routeTimeOptimized, idDriver, idVehicle, routeStatus, statusGetting, routeCrossAreaCarPoolscol, point, comment) 
                VALUES 
                    (?,?,?,?,?,?,?,null,null,null,null,null,null,null,null)`,
        [
          resdataid[0].idCrossAreaCarPoolBookingPassenger,
          new Date(),
          idUser,
          new Date(departureDate),
          idCrossAreaCarPool,
          resdataUser[0].lat,
          resdataUser[0].lng,
        ]
      );
      if (!res || !field) {
        success_Passenger = false;
      }
    }
    if (success_Passenger && rows) {
      res.status(200).send(rows);
    } else {
      res.status(400).send("Failed Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postApprovedlCrossAreaCarPoolBooking = async (req, res) => {
  try {
    const rows = await pool.query(
      "UPDATE CrossAreaCarPoolBooking SET  statusApproved = ?  , Approved= ? WHERE idCrossAreaCarPoolBooking = ? ",
      [req.body.status, req.body.status, req.body.idBooking]
    );

    if (rows) {
      const result = await pool.query("SELECT * FROM CrossAreaCarPoolBooking");
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getCrossAreaCarPoolBookingByFilter = async (req, res) => {
  try {
    const { name, status, startdate, idUser } = req.body;
    let result;

    if (name === "") {
      result = await pool.query(
        "SELECT * FROM CrossAreaCarPoolBooking  WHERE idUser = ?",
        [idUser]
      );

      const rows = await pool.query(
        "SELECT * FROM CrossAreaCarPoolBookingPassenger"
      );
      result.map((booking) => {
        booking.passengers = rows.filter(
          (passenger) =>
            passenger.idCrossAreaCarPoolBooking ==
            booking.idCrossAreaCarPoolBooking
        );
      });
    } else {
      result = await pool.query(
        `SELECT  * FROM CrossAreaCarPoolBooking WHERE
          LOWER(CrossAreaCarPoolBooking.name) LIKE '%${name.toLowerCase()}%' AND idUser = ?`,
        [idUser]
      );
      const rows = await pool.query(
        "SELECT * FROM CrossAreaCarPoolBookingPassenger"
      );
      result.map((booking) => {
        booking.passengers = rows.filter(
          (passenger) =>
            passenger.idCrossAreaCarPoolBooking ==
            booking.idCrossAreaCarPoolBooking
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

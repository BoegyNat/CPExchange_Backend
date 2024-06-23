const db = require("../models");
const RouteCrossAreaCarPools = db.routeCrossAreaCarPool;
const Drivers = db.drivers;
const Vehicles = db.vehicles;
const Users = db.users;
const CrossAreaCarPoolBokingPassengers = db.crossAreaCarPoolBookingPassengers;

const pool = require("../connection.js");

const CompareDate = (date1, date2) => {
  let routeDate = new Date(date1).setHours(0, 0, 0, 0);
  let reqDate = new Date(date2).setHours(0, 0, 0, 0);
  return routeDate > reqDate;
};

exports.getRouteLineByIdUserRouteDate = (req, res) => {
  try {
    let passengerIdUser = RouteCrossAreaCarPools.find((route) => {
      if (route.idUser == req.body.idUser) {
        return CompareDate(route.routeDate, req.body.routeDate);
      }
      return false;
    });
    if (passengerIdUser) {
      let result = RouteCrossAreaCarPools.filter((route) => {
        if (route.routeLine == passengerIdUser.routeLine) {
          return CompareDate(route.routeDate, passengerIdUser.routeDate);
        }
        return false;
      });
      result.map((route) => {
        let user = Users.find((user) => user.id == route.idUser);
        route.fNameThai = user.fNameThai;
        route.departmentThai = user.departmentShortName;
        route.telephoneMobile = user.mobileNumber;
        let driver = Drivers.find(
          (driver) => driver.idDriver == route.idDriver
        );
        route.fullnameDriver = driver.FullName;
        route.mobileNumberDriver = driver.Telephone;
        route.rating = driver.Rating;
        let vehicle = Vehicles.find(
          (vehicle) => vehicle.idVehicle == route.idVehicle
        );
        route.plateNo = vehicle.Plate_No;
      });
      if (result.length > 0) {
        res.status(200).send(result);
      } else {
        res.status(404).send("Not Found Passenger");
      }
    } else {
      res.status(404).send("Not Found Passenger");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getRouteUserByIdUser = (req, res) => {
  try {
    let passengerIdUser = RouteCrossAreaCarPools.find((route) => {
      if (route.idUser == req.body.idUser) {
        return CompareDate(route.routeDate, req.body.routeDate);
      }
      return false;
    });
    if (passengerIdUser) {
      let user = Users.find((user) => user.id == passengerIdUser.idUser);
      passengerIdUser.fNameThai = user.fNameThai;
      passengerIdUser.departmentThai = user.departmentShortName;
      passengerIdUser.telephoneMobile = user.mobileNumber;
      passengerIdUser.image = user.image;
      let driver = Drivers.find(
        (driver) => driver.idDriver == passengerIdUser.idDriver
      );
      passengerIdUser.fullnameDriver = driver.FullName;
      passengerIdUser.mobileNumberDriver = driver.Telephone;
      passengerIdUser.rating = driver.Rating;
      let vehicle = Vehicles.find(
        (vehicle) => vehicle.idVehicle == passengerIdUser.idVehicle
      );
      passengerIdUser.plateNo = vehicle.Plate_No;
      passengerIdUser.fromPlace = CrossAreaCarPoolBokingPassengers.find(
        (booking) =>
          booking.id == passengerIdUser.idCrossAreaCarPoolBookingPassenger
      ).fromPlace;

      res.status(200).send(passengerIdUser);
    } else {
      res.status(404).send("Not Found Passenger");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getRoutesByRouteDate = async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT * FROM routeCrossAreaCarPools rcacp  WHERE rcacp.routeDate  >= ?",
      [req.body.routeDate]
    );
    if (rows.length > 0) {
      let queryPassenger = "";
      for (let i = 0; i < rows.length; i++) {
        if (i == 0) {
          queryPassenger += `SELECT * FROM CrossAreaCarPoolBookingPassenger WHERE idCrossAreaCarPoolBookingPassenger = ${rows[i].idCrossAreaCarPoolBookingPassenger}`;
        } else {
          queryPassenger += ` OR idCrossAreaCarPoolBookingPassenger = ${rows[i].idCrossAreaCarPoolBookingPassenger}`;
        }
      }
      const passengers = await pool.query(queryPassenger);
      rows.map((route) => {
        let user = passengers.find(
          (user) =>
            user.idCrossAreaCarPoolBookingPassenger ==
            route.idCrossAreaCarPoolBookingPassenger
        );
        route.detail = user;
      });
      res.status(200).send(rows);
    } else {
      res.status(404).send({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getRoutesByRouteLineAndRouteDate = async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT * FROM routeCrossAreaCarPools WHERE routeDate BETWEEN ? AND ?",
      [req.body.routeDateStart, req.body.routeDateEnd]
    );
    if (rows.length > 0) {
      let queryPassenger = "";
      for (let i = 0; i < rows.length; i++) {
        if (i == 0) {
          queryPassenger += `SELECT * FROM CrossAreaCarPoolBookingPassenger WHERE idCrossAreaCarPoolBookingPassenger = ${rows[i].idCrossAreaCarPoolBookingPassenger}`;
        } else {
          queryPassenger += ` OR idCrossAreaCarPoolBookingPassenger = ${rows[i].idCrossAreaCarPoolBookingPassenger}`;
        }
      }
      const passengers = await pool.query(queryPassenger);
      rows.map((route) => {
        let user = passengers.find(
          (user) =>
            user.idCrossAreaCarPoolBookingPassenger ==
            route.idCrossAreaCarPoolBookingPassenger
        );
        route.detail = user;
      });
      res.status(200).send(rows);
    } else {
      res.status(404).send({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postEditIdDriverRoute = async (req, res) => {
  try {
    const rows = await pool.query(
      "UPDATE routeCrossAreaCarPools SET idDriver = ?, idVehicle=?, comment=? WHERE routeLine = ? ",
      [
        req.body.AnswerFromInput.idDriver,
        req.body.AnswerFromInput.idVehicle,
        req.body.AnswerFromInput.DetailManageCar,
        req.body.routeLine,
      ]
    );
    res.status(200).send(rows);
    // else{
    //     res.status(404).send({ message: "Not Found" });
    // }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.deleteRouteCrossPools = async (req, res) => {
  try {
    const row = await pool.query(
      "DELETE FROM routeCrossAreaCarPools WHERE routeLine = ?",
      [req.body.route[0].routeLine]
    );
    res.status(200).send(row);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

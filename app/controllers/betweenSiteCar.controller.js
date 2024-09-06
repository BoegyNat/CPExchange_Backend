const db = require("../models");
const BetweenSiteCars = db.betweenSiteCars;
const Users = db.users;
const Vehicles = db.vehicles;
const VehicleTypes = db.vehicleTypes;
const haversine = require("haversine-distance");
const pool = require("../connection.js");
const axios = require("axios");
const dayjs = require("dayjs");

dayjs.locale("th");

const GOOGLE_MAPS_API_KEY = "AIzaSyBOI0pcf56o-9yK_XoUxhZ3IOCulmr89T8";

exports.getAllBetweenSiteCars = async (req, res) => {
  try {
    // BetweenSiteCars.map(calling => {
    //     let User = Users.find( user => user.id == calling.idUser );
    //     calling.firstname = User.firstname;
    //     calling.lastname = User.lastname;
    // });
    let result = await pool.query(
      "SELECT * FROM BetweenSiteCar JOIN Users ON BetweenSiteCar.idUser=Users.idUser"
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getBetweenSiteCarById = (req, res) => {
  try {
    let result = BetweenSiteCars.find((calling) => calling.id == req.params.id);
    if (result) {
      let User = Users.find((user) => user.Id == result.idUser);
      result.firstname = User.firstname;
      result.lastName = User.lastname;
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found This Id");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getBetweenSiteCarByIdUserIsNotFinish = async (req, res) => {
  try {
    console.log(req.params.idUser);
    const result = await pool.query(
      "SELECT * FROM BetweenSiteCar WHERE BetweenSiteCar.idUser = ? AND BetweenSiteCar.isFinish = ?  ORDER BY idBetweenSiteCar DESC LIMIT 1",
      [req.params.idUser, false]
    );
    if (result.length > 0) {
      const data = await getNearestTime(
        result[0].gettingPlace,
        result[0].toPlace,
        result[0].idDriverRouteDay
      );
      // let result = BetweenSiteCars.find(
      //   (calling) =>
      //     calling.idUser == req.params.idUser && calling.isFinish == false
      // );

      res.status(200).send({ result, data });
    } else {
      res.status(204).send("no unfinished bookings");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.callCar = (req, res) => {
  try {
    let calling = req.body;
    calling.id = BetweenSiteCars.length + 1;
    calling.idVehicle = null;
    calling.arrivedTime = null;
    calling.isFinish = false;
    BetweenSiteCars.push(calling);
    res.status(200).send(calling);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.CancelCallCar = async (req, res) => {
  try {
    const lastBooking = await pool.query(
      "SELECT idBetweenSiteCar FROM BetweenSiteCar WHERE idUser = ? ORDER BY idBetweenSiteCar DESC LIMIT 1",
      [req.params.idUser]
    );

    const row = await pool.query(
      "UPDATE BetweenSiteCar SET isFinish = ? WHERE idBetweenSiteCar = ? AND isFinish = ?",
      [true, lastBooking[0].idBetweenSiteCar, false]
    );
    if (row) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found This Id");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.setFinishCallCar = async (req, res) => {
  try {
    const row = await pool.query(
      "UPDATE BetweenSiteCar SET isFinish = ? WHERE idBetweenSiteCar = ? AND isFinish = ?",
      [true, req.body.id, false]
    );
    if (row) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found This Id");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateTargetStatus = async (req, res) => {
  try {
    const row = await pool.query(
      "UPDATE BetweenSiteCar SET targetStatus = ? WHERE idBetweenSiteCar = ? AND isFinish = ?",
      ["ToPlace", req.params.id, false]
    );
    if (row) {
      let result = await pool.query(
        "SELECT * FROM BetweenSiteCar WHERE BetweenSiteCar.idBetweenSiteCar = ? ",
        [req.params.id]
      );
      if (result.length > 0) {
        const User = await pool.query(
          "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
          [result[0].idUser]
        );
        const fromPlace = await pool.query(
          "SELECT * FROM ScgSite WHERE idScgSite = ?",
          [result[0].gettingPlace]
        );
        const toPlace = await pool.query(
          "SELECT * FROM ScgSite WHERE idScgSite = ?",
          [result[0].toPlace]
        );
        result[0].fromPlaceName =
          fromPlace[0].noSite !== null
            ? `Site${fromPlace[0].noSite}: ${fromPlace[0].nameSite}`
            : `${fromPlace[0].nameSite}`;
        result[0].toPlaceName =
          toPlace[0].noSite !== null
            ? `Site${toPlace[0].noSite}: ${toPlace[0].nameSite}`
            : `${toPlace[0].nameSite}`;
        result[0].user = User[0];
        result[0].fromPlace = fromPlace[0];
        result[0].toPlace = toPlace[0];
      }
      if (result) {
        res.status(200).send(result[0]);
      } else {
        res.status(404).send("Not Found This Id");
      }
    } else {
      res.status(404).send("Not Found This Id");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.AcceptPassenger = (req, res) => {
  try {
    let index = BetweenSiteCars.find(
      (calling) => calling.idUser == req.body.id && calling.isFinish == false
    );
    BetweenSiteCars[index].idVehicle = req.body.idVehicle;
    BetweenSiteCars[index].arrivedTime = new Date();
    res.status(200).send(BetweenSiteCars[index]);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getBetweenSiteCarByIdDriver = async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT * FROM BetweenSiteCar WHERE BetweenSiteCar.idDriverRouteDay = ?",
      [req.params.idDriver]
    );

    if (result.length > 0) {
      const Drivers = await pool.query(
        "SELECT * FROM Driver LEFT JOIN Users ON Driver.idUser = Users.idUser WHERE Users.idUser = ?",
        [req.params.idDriver]
      );

      const Vehicles = await pool.query(
        "SELECT * FROM Vehicle JOIN VehicleBrandsAndModels ON Vehicle.idVehicleBrandAndModel = VehicleBrandsAndModels.idVehicleBrandsAndModels LEFT JOIN VehicleTypes ON Vehicle.idVehicleType = VehicleTypes.idVehicleTypes WHERE idVehicle = ?",
        [Drivers[0].idVehicle]
      );

      for (let booking of result) {
        if (booking.idUser !== null) {
          try {
            const User = await pool.query(
              "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
              [booking.idUser]
            );
            const fromPlace = await pool.query(
              "SELECT * FROM ScgSite WHERE idScgSite = ?",
              [booking.gettingPlace]
            );
            const toPlace = await pool.query(
              "SELECT * FROM ScgSite WHERE idScgSite = ?",
              [booking.toPlace]
            );
            booking.fromPlaceName =
              fromPlace[0].noSite !== null
                ? `Site${fromPlace[0].noSite}: ${fromPlace[0].nameSite}`
                : `${fromPlace[0].nameSite}`;
            booking.toPlaceName =
              toPlace[0].noSite !== null
                ? `Site${toPlace[0].noSite}: ${toPlace[0].nameSite}`
                : `${toPlace[0].nameSite}`;
            booking.user = User[0];
          } catch (error) {
            console.error(
              `Error fetching user for booking with id ${booking.idUser}:`,
              error
            );
          }
        }
        booking.driver = Drivers[0];
        booking.vehicle = Vehicles[0];
      }

      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found This Id");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getBetweenSiteCarByIdDriverIsNotFinish = async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT * FROM BetweenSiteCar WHERE BetweenSiteCar.idDriverRouteDay = ? AND BetweenSiteCar.isFinish = ?",
      [req.params.idDriver, false]
    );
    if (result.length > 0) {
      const User = await pool.query(
        "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
        [result[0].idUser]
      );
      const fromPlace = await pool.query(
        "SELECT * FROM ScgSite WHERE idScgSite = ?",
        [result[0].gettingPlace]
      );
      const toPlace = await pool.query(
        "SELECT * FROM ScgSite WHERE idScgSite = ?",
        [result[0].toPlace]
      );
      result[0].fromPlaceName =
        fromPlace[0].noSite !== null
          ? `Site${fromPlace[0].noSite}: ${fromPlace[0].nameSite}`
          : `${fromPlace[0].nameSite}`;
      result[0].toPlaceName =
        toPlace[0].noSite !== null
          ? `Site${toPlace[0].noSite}: ${toPlace[0].nameSite}`
          : `${toPlace[0].nameSite}`;
      result[0].user = User[0];
      result[0].fromPlace = fromPlace[0];
      result[0].toPlace = toPlace[0];
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found This Id");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getSite = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM ScgSite");
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewBetweenSiteCar = async (req, res) => {
  try {
    const { toPlace, gettingPlace, idUser } = req.body;

    const data = await getNearestDriver(gettingPlace, toPlace);
    const user = await pool.query(
      "SELECT firstname_TH,lastname_TH FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
      [idUser]
    );
    const result = await pool.query(
      "INSERT INTO BetweenSiteCar (idUser,name, gettingPlace,toPlace,idDriverRouteDay,date,arrivedTime,isFinish) VALUES (?,?,?,?,?,?,?,?)",
      [
        idUser,
        user[0].firstname_TH + " " + user[0].lastname_TH,
        gettingPlace,
        toPlace,
        data.nearestDriverId,
        new Date(),
        data.eta,
        false,
      ]
    );
    if (result) {
      res.status(200).send({ result, data });
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.updateDriverRoute = async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE BetweenSiteCar SET idDriverRouteDay = ? WHERE idBetweenSiteCar=?",
      [req.body.idDriverRouteDay, req.body.idBetweenSiteCar]
    );

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Can't Update");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getBetweenSiteWithRouteDate = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM BetweenSiteCar WHERE arrivedTime >= ?",
      [req.body.startDate]
    );
    if (result.length > 0) {
      for (let index = 0; index < result.length; index++) {
        const user = await pool.query(
          "SELECT firstname_TH,lastname_TH FROM UniHR.Employees WHERE idEmployees = ?",
          [result[index].idUser]
        );
        const driver = await pool.query(
          "SELECT * FROM Users WHERE idUser = ?",
          [result[index].idDriverRouteDay]
        );
        const gettingPlace = await pool.query(
          "SELECT * FROM ScgSite WHERE idScgSite = ?",
          [result[index].gettingPlace]
        );
        const toPlace = await pool.query(
          "SELECT * FROM ScgSite WHERE idScgSite = ?",
          [result[index].toPlace]
        );
        result[index].driver = driver[0];
        result[index].user = user[0];
        result[index].gettingPlace = gettingPlace[0];
        result[index].toPlace = toPlace[0];
      }
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getBetweenSiteWithRouteDateAndEndDate = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM BetweenSiteCar WHERE arrivedTime >= ? AND arrivedTime <= ?",
      [req.body.startDate, req.body.endDate]
    );
    console.log(result);
    if (result.length > 0) {
      for (let index = 0; index < result.length; index++) {
        const user = await pool.query(
          "SELECT firstname_TH,lastname_TH FROM UniHR.Employees WHERE idEmployees = ?",
          [result[index].idUser]
        );
        const driver = await pool.query(
          "SELECT * FROM Users WHERE idUser = ?",
          [result[index].idDriverRouteDay]
        );
        const gettingPlace = await pool.query(
          "SELECT * FROM ScgSite WHERE idScgSite = ?",
          [result[index].gettingPlace]
        );
        const toPlace = await pool.query(
          "SELECT * FROM ScgSite WHERE idScgSite = ?",
          [result[index].toPlace]
        );
        result[index].driver = driver[0];
        result[index].user = user[0];
        result[index].gettingPlace = gettingPlace[0];
        result[index].toPlace = toPlace[0];
      }
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postOptimizedRouteBetweenSiteCar = (req, res) => {
  try {
    let date = new Date();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getNearestDriver = async (getting, to) => {
  const gettingSite = await pool.query(
    "SELECT * FROM ScgSite WHERE idScgSite = ?",
    [getting]
  );
  const toSite = await pool.query("SELECT * FROM ScgSite WHERE idScgSite = ?", [
    to,
  ]);

  const gettingLat = parseFloat(gettingSite[0].Lat);
  const gettingLng = parseFloat(gettingSite[0].Long);
  const targetLat = parseFloat(toSite[0].Lat);
  const targetLng = parseFloat(toSite[0].Long);

  const results = await pool.query(`
      SELECT idDriver, LatDriver, LngDriver
      FROM LocationDriver
      WHERE (idDriver, idLocationDriver) IN (
        SELECT idDriver, MAX(idLocationDriver)
        FROM LocationDriver
        GROUP BY idDriver
      )
    `);

  let nearestDriver = null;
  let minDistance = Infinity;
  const targetLocation = { lat: gettingLat, lng: gettingLng };

  results.forEach((row) => {
    const driverLocation = {
      lat: parseFloat(row.LatDriver),
      lng: parseFloat(row.LngDriver),
    };
    const distance = haversine(targetLocation, driverLocation);

    if (distance < minDistance) {
      minDistance = distance;
      nearestDriver = row;
    }
  });

  // const time = await axios
  //   .post(
  //     "https://routes.googleapis.com/directions/v2:computeRoutes",
  //     {
  //       origin: {
  //         location: {
  //           latLng: {
  //             latitude: nearestDriver.LatDriver,
  //             longitude: nearestDriver.LngDriver,
  //           },
  //         },
  //       },
  //       destination: {
  //         location: {
  //           latLng: {
  //             latitude: targetLat,
  //             longitude: gettingLng,
  //           },
  //         },
  //       },
  //       travelMode: "DRIVE",
  //     },
  //     {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-Goog-Api-Key": "AIzaSyBOI0pcf56o-9yK_XoUxhZ3IOCulmr89T8",
  //         "X-Goog-FieldMask":
  //           "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
  //       },
  //     }
  //   )
  //   .then((res) => {
  //     return res.data;
  //   })
  //   .catch((error) => {
  //     console.log(error.response.data);
  //     console.log(error.response.data.error.details);
  //   });

  // if (time) {
  //   return res.status(200).send({ travel: time, driver: nearestDriver });
  // } else {
  //   return res.status(404).send({ message: "No time found" });
  // }
  const driver = await pool.query(
    "SELECT * FROM Driver LEFT JOIN Vehicle ON Driver.idVehicle = Vehicle.idVehicle LEFT JOIN VehicleTypes ON Vehicle.idVehicleType = VehicleTypes.idVehicleTypes WHERE idUser = ?",
    [nearestDriver.idDriver]
  );

  const origin = `${nearestDriver.LatDriver},${nearestDriver.LngDriver}`;
  const destination = `${gettingLat},${gettingLng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await axios.get(url);

  if (response.data.status === "OK" && response.data.rows.length > 0) {
    const element = response.data.rows[0].elements[0];
    if (element.status === "OK") {
      const durationText = element.duration.text; // ระยะเวลาในการเดินทาง (เช่น "1 hour 45 mins")
      const durationValue = element.duration.value; // ระยะเวลาในการเดินทางในหน่วยวินาที
      const currentTime = new Date();
      console.log("currentTime", currentTime);
      const eta = new Date(currentTime.getTime() + durationValue * 1000);
      console.log("eta", eta);
      const etaTimeString = dayjs(eta).format("HH:mm");
      console.log("etaTimeString", etaTimeString);

      return {
        driver: driver[0],
        travel: element,
        gettingPlace: { lat: gettingLat, lng: gettingLng },
        targetPlace: { lat: targetLat, lng: targetLng },
        nearestDriverId: nearestDriver.idDriver,
        duration: durationText,
        etaTimeString: etaTimeString,
        eta: dayjs(eta).format("YYYY-MM-DD HH:mm:ss"),
      };
    }
  }
};

const getNearestTime = async (getting, to, idUser) => {
  const gettingSite = await pool.query(
    "SELECT * FROM ScgSite WHERE idScgSite = ?",
    [getting]
  );
  const toSite = await pool.query("SELECT * FROM ScgSite WHERE idScgSite = ?", [
    to,
  ]);

  const gettingLat = parseFloat(gettingSite[0].Lat);
  const gettingLng = parseFloat(gettingSite[0].Long);
  const targetLat = parseFloat(toSite[0].Lat);
  const targetLng = parseFloat(toSite[0].Long);

  const results = await pool.query(
    `
      SELECT idDriver, LatDriver, LngDriver
      FROM LocationDriver
      WHERE idDriver = ?
    `,
    [idUser]
  );

  let nearestDriver = results[0];

  // const time = await axios
  //   .post(
  //     "https://routes.googleapis.com/directions/v2:computeRoutes",
  //     {
  //       origin: {
  //         location: {
  //           latLng: {
  //             latitude: nearestDriver.LatDriver,
  //             longitude: nearestDriver.LngDriver,
  //           },
  //         },
  //       },
  //       destination: {
  //         location: {
  //           latLng: {
  //             latitude: targetLat,
  //             longitude: gettingLng,
  //           },
  //         },
  //       },
  //       travelMode: "DRIVE",
  //     },
  //     {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-Goog-Api-Key": "AIzaSyBOI0pcf56o-9yK_XoUxhZ3IOCulmr89T8",
  //         "X-Goog-FieldMask":
  //           "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
  //       },
  //     }
  //   )
  //   .then((res) => {
  //     return res.data;
  //   })
  //   .catch((error) => {
  //     console.log(error.response.data);
  //     console.log(error.response.data.error.details);
  //   });

  // if (time) {
  //   return res.status(200).send({ travel: time, driver: nearestDriver });
  // } else {
  //   return res.status(404).send({ message: "No time found" });
  // }
  const driver = await pool.query(
    "SELECT * FROM Driver LEFT JOIN Vehicle ON Driver.idVehicle = Vehicle.idVehicle LEFT JOIN VehicleTypes ON Vehicle.idVehicleType = VehicleTypes.idVehicleTypes WHERE idUser = ?",
    [nearestDriver.idDriver]
  );

  const origin = `${nearestDriver.LatDriver},${nearestDriver.LngDriver}`;
  const destination = `${gettingLat},${gettingLng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await axios.get(url);

  if (response.data.status === "OK" && response.data.rows.length > 0) {
    const element = response.data.rows[0].elements[0];
    if (element.status === "OK") {
      const durationText = element.duration.text; // ระยะเวลาในการเดินทาง (เช่น "1 hour 45 mins")
      const durationValue = element.duration.value; // ระยะเวลาในการเดินทางในหน่วยวินาที
      const currentTime = new Date();
      console.log("cur : " + currentTime);
      const eta = new Date(currentTime.getTime() + durationValue * 1000);
      console.log("eta : " + eta);
      const etaTimeString = dayjs(eta).format("HH:mm");
      console.log("etaTimeString : " + etaTimeString);

      // const currentTime = dayjs();
      // const eta = dayjs(currentTime).add(durationValue * 1000, "s");

      return {
        driver: driver[0],
        travel: element,
        gettingPlace: { lat: gettingLat, lng: gettingLng },
        targetPlace: { lat: targetLat, lng: targetLng },
        nearestDriverId: nearestDriver.idDriver,
        duration: durationText,
        etaTimeString: etaTimeString,
        eta: dayjs(eta).format("YYYY-MM-DD HH:mm:ss"),
      };
    }
  }
};

exports.getBetweenSiteCarBookingByFilterByIdDriver = async (req, res) => {
  const { name, startdate, enddate, idDriver } = req.body;
  try {
    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM BetweenSiteCar WHERE BetweenSiteCar.idDriverRouteDay = ?",
        [idDriver]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM BetweenSiteCar WHERE
                LOWER(BetweenSiteCar.name) LIKE '%${name.toLowerCase()}%' AND idDriverRouteDay = ?`,
        [idDriver]
      );
    }

    if (startdate && enddate) {
      result = result.filter(
        (value) =>
          startdate <= value.date.slice(0, 10) &&
          enddate >= value.date.slice(0, 10)
      );
    } else if (startdate) {
      result = result.filter((value) => startdate <= value.date.slice(0, 10));
    } else if (enddate) {
      result = result.filter((value) => enddate >= value.date.slice(0, 10));
    }

    if (result.length > 0) {
      const Drivers = await pool.query(
        "SELECT * FROM Driver LEFT JOIN Users ON Driver.idUser = Users.idUser WHERE Users.idUser = ?",
        [idDriver]
      );

      const Vehicles = await pool.query(
        "SELECT * FROM Vehicle JOIN VehicleBrandsAndModels ON Vehicle.idVehicleBrandAndModel = VehicleBrandsAndModels.idVehicleBrandsAndModels LEFT JOIN VehicleTypes ON Vehicle.idVehicleType = VehicleTypes.idVehicleTypes WHERE idVehicle = ?",
        [Drivers[0].idVehicle]
      );

      for (let booking of result) {
        if (booking.idUser !== null) {
          try {
            const User = await pool.query(
              "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
              [booking.idUser]
            );
            const fromPlace = await pool.query(
              "SELECT * FROM ScgSite WHERE idScgSite = ?",
              [booking.gettingPlace]
            );
            const toPlace = await pool.query(
              "SELECT * FROM ScgSite WHERE idScgSite = ?",
              [booking.toPlace]
            );
            booking.fromPlaceName =
              fromPlace[0].noSite !== null
                ? `Site${fromPlace[0].noSite}: ${fromPlace[0].nameSite}`
                : `${fromPlace[0].nameSite}`;
            booking.toPlaceName =
              toPlace[0].noSite !== null
                ? `Site${toPlace[0].noSite}: ${toPlace[0].nameSite}`
                : `${toPlace[0].nameSite}`;
            booking.user = User[0];
          } catch (error) {
            console.error(
              `Error fetching user for booking with id ${booking.idUser}:`,
              error
            );
          }
        }
        booking.driver = Drivers[0];
        booking.vehicle = Vehicles[0];
      }

      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found This Id");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

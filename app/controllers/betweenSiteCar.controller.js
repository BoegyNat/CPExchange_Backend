const db = require("../models");
const BetweenSiteCars = db.betweenSiteCars;
const Users = db.users;
const Vehicles = db.vehicles;
const VehicleTypes = db.vehicleTypes;
const pool = require("../connection.js");

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

exports.getBetweenSiteCarByIdUserIsNotFinish = (req, res) => {
  try {
    let result = BetweenSiteCars.find(
      (calling) =>
        calling.idUser == req.params.idUser && calling.isFinish == false
    );
    if (result) {
      let User = Users.find((user) => user.id == result.idUser);
      result.firstname = User.firstname;
      result.lastName = User.lastname;
      result.vehicle = Vehicles.find(
        (vehicle) => vehicle.idVehicle == result.idVehicle
      );
      result.vehicleTypes = VehicleTypes.find(
        (type) => type.id == result.vehicle.idVehicleType
      );
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found This Id");
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

exports.CancelCallCar = (req, res) => {
  try {
    BetweenSiteCars.find(
      (calling) =>
        calling.idUser == req.params.idUser && calling.isFinish == false
    ).isFinish = true;
    res.status(200).send(BetweenSiteCars);
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

exports.getBetweenSiteCarByIdDriver = (req, res) => {
  try {
    let result = BetweenSiteCars.find(
      (calling) => calling.id == req.params.idDriver
    );
    if (result) {
      let User = Users.find((user) => user.Id == result.idUser);
      result.firstname = User.firstname;
      result.lastName = User.lastname;
      result.vehicle = Vehicles.find(
        (vehicle) => vehicle.idVehicle == result.idVehicle
      );
      result.vehicleTypes = VehicleTypes.find(
        (type) => type.id == result.vehicle.idVehicleType
      );
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
    console.log(toPlace, gettingPlace, idUser);

    let result = await pool.query(
      "INSERT INTO BetweenSiteCar (idUser, gettingPlace,toPlace,isFinish) VALUES (?,?,?,?)",
      [idUser, gettingPlace, toPlace, false]
    );
    // let result = await pool.query("SELECT * FROM ScgSite")
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.updateDriverRoute = async (req, res) => {
  try {
    console.log(req.body);
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

exports.getDriverWithDriverRouteDay = async (req, res) => {
  try {
    console.log("getDriverWithRouteDay");
    
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postOptimizedRouteBetweenSiteCar = (req, res) =>{
  try{
    let date = new Date()
  }catch (error){
    res.status(500).send({ message: error.message });

  }
}

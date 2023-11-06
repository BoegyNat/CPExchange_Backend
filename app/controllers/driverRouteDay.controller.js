const { vehicles } = require("../models");
const db = require("../models");
const DriverRouteDays = db.driverRouteDays;
const Drivers = db.drivers;
const Vehicles = db.vehicles;
const VehicleBrandAndModel = db.vehicleBrandsAndModels;
const VehicleTypes = db.vehicleTypes;

const pool = require("../connection.js")

const CompareDate = (date1, date2) => {
  let routeDate = new Date(date1).setHours(0,0,0,0);
  let reqDate = new Date(date2).setHours(0,0,0,0);
  return (routeDate == reqDate);
}

exports.allDriverRouteDays = (req, res) => {
  try {
    res.status(200).send(DriverRouteDays);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDriverRouteDayById = (req, res) => {
    try {
        DriverRouteDays.find( driver => driver.id == req.params.id );
        res.status(200).send(DriverRouteDays);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
  
};

exports.getDriverRouteDayByIdDriver = async (req, res) => {
    try {
      // console.log("driver.route.controoler", req.body)
      let driverRoute = await pool.query("SELECT * FROM DriverRouteDays WHERE idDriver = ?", [req.body.idDriver])
        // let driver = DriverRouteDays.find( driver => driver.idDriver == req.body.idDriver && CompareDate(driver.routeDate, req.body.routeDate));
        // // console.log("driverRouteCon", driver)
        // if(driver){
        //   let vehicle = Vehicles.find( vehicle => vehicle.idVehicle == driver.idVehicle );
        //   driver.vehiclePlateNo = vehicle.Plate_No;
        //   driver.vehicleVendor = vehicle.Vendor;
        //   driver.vehicleImagePath = VehicleBrandAndModel.find( brandAndModel => brandAndModel.id == vehicle.idVehicleBrandAndModel ).imagepath;
        //   res.status(200).send(driver);
        // }else{
        //   res.status(404).send({message:"Not Found Driver"});
        // }
        if(driverRoute){
          let vehicle = await pool.query("SELECT * FROM Vehicle WHERE idVehicle = ?", [parseInt(driverRoute[0].idVehicle)])
          driverRoute[0].vehiclePlateNo = vehicle[0].Plate_No;
          driverRoute[0].vehicleVendor = vehicle[0].Vendor;
          res.status(200).send(driverRoute[0]);
        }else{
            res.status(404).send({message:"Not Found Driver"});
          }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.postIdVehicle = (req, res) => {
  try {
      let index = DriverRouteDays.findIndex( driver => driver.idDriver == req.body.idDriver );
      DriverRouteDays[index].idVehicle = req.body.idVehicle;
      res.status(200).send(DriverRouteDays[index]);
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
};

exports.postBedTime = async (req, res) => {
  try {
    console.log("postBedTime",req.body)
      const result = await pool.query("UPDATE DriverRouteDays SET bedTime = ? WHERE idDriver = ?",[req.body.bedTime, req.body.idDriver])
      // let index = DriverRouteDays.findIndex( driver => driver.idDriver == req.body.idDriver && driver.routeDate == req.body.routeDate );
      // DriverRouteDays[index].bedTime = req.body.bedTime;
      // console.log(result)
      res.status(200).send(result);
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
};

exports.postStartTime = (req, res) => {
  try {
      let index = DriverRouteDays.findIndex( driver => driver.idDriver == req.body.idDriver && driver.routeDate == req.body.routeDate);
      DriverRouteDays[index].startTime = req.body.startTime;
      res.status(200).send(DriverRouteDays[index]);
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
};

exports.postEndTime = (req, res) => {
  try {
      let index = DriverRouteDays.findIndex( driver => driver.idDriver == req.body.idDriver && driver.routeDate == req.body.routeDate);
      DriverRouteDays[index].endTime = req.body.endTime;
      DriverRouteDays[index].duration = req.body.duration;
      res.status(200).send(DriverRouteDays[index]);
  } catch (error) {
      res.status(500).send({ message: error.message });
  }

};


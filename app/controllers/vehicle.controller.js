const { vehicleBrandsAndModels } = require("../models");
const db = require("../models");
const pool = require("../connection.js")

const Vehicles = db.vehicles;
const VehicleTypes = db.vehicleTypes;
const VehicleBrandsAndModels = db.vehicleBrandsAndModels;

exports.allVehicles = async (req, res) => {
  try {
    const row = await pool.query("SELECT * FROM Vehicle JOIN VehicleTypes ON Vehicle.idVehicleType = VehicleTypes.idVehicleTypes");
    console.log(row)
    // row.map( vehi => {
    //   let type = VehicleType.find( typeVehi => typeVehi.idVehicleTypes == vehi.idVehicleType );
    //   vehi.vehicleTypeNameEN = type.vehicleTypeNameEN;
    //   vehi.vehicleTypeNameTH = type.vehicleTypeNameTH;
    //   // let brandAndModel = VehicleBrandsAndModels.find( vehibrand => vehibrand.id == vehi.idVehicleBrandAndModel );
    //   // vehi.imagepath = brandAndModel.imagepath;
    // });
    res.status(200).send(row);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};

exports.getVehiclesByUseFor = (req,res) => {
  try {
    let result = Vehicles.filter( vehicle => vehicle.UseForEN == req.params.UseFor );
    if(result.length > 0){
      result.map( vehicle => {
        let vehicleType = VehicleTypes.find( type => type.id == vehicle.idVehicleType );
        vehicle.vehicleTypeNameEN = vehicleType.vehicleTypeNameEN;
        vehicle.vehicleTypeNameTH = vehicleType.vehicleTypeNameTH;
        let vehicleBrandAndModel = VehicleBrandsAndModels.find( brandAndModel => brandAndModel.id == vehicle.idVehicleBrandAndModel );
        vehicle.brand = vehicleBrandAndModel.brand;
        vehicle.model = vehicleBrandAndModel.model;
        vehicle.motor = vehicleBrandAndModel.motor;
        vehicle.gear = vehicleBrandAndModel.gear;
        vehicle.gas = vehicleBrandAndModel.gas;
        vehicle.breakABS = vehicleBrandAndModel.breakABS;
        vehicle.capacity = vehicleBrandAndModel.capacity;
        vehicle.imagepath = vehicleBrandAndModel.imagepath;
      });
      res.status(200).send(result);
    }else{
      res.status(404).send("Not Found Vehicles");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getVehicleById = (req,res) => {
  try {
    let result = Vehicles.find( vehicle => vehicle.idVehicle == req.params.id );
    if(result){
      result.map( vehicle => {
        vehicle.vehicleType = VehicleTypes.find( type => type.id == vehicle.idVehicleType );
        vehicle.vehicleBrandAndModel = VehicleBrandsAndModels.find( brandAndModel => brandAndModel.id == vehicle.idVehicleBrandAndModel );
      });
      res.status(200).send(result);
    }else{
      res.status(404).send("Not Found Vehicle");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewVehicle = async (req,res) => {
  try {
    // console.log("postNewVehicle", req.body[0][0])
    const {idVehicleType, Plate_No, UseFor, Vendor, RentDate, ExpireDate, Cost, CostBooking, site, Agency, CostCenter, CostElement} = req.body[0]
    const rows = await pool.query(
      `
      INSERT INTO 
      Vehicle 
          (idVehicleType, Plate_No, UseFor, Vendor, Agency, Cost, CostBooking, CostCenter, CostElement, site, ExpireDate, RentDate) 
      VALUES 
        (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [idVehicleType, Plate_No, UseFor, Vendor, Agency, Cost, CostBooking, CostCenter, CostElement, site, ExpireDate, RentDate]
    );
    // console.log(idVehicleType, Plate_No, UseFor, Vendor, RentDate, ExpireDate, Cost, CostBooking, site, Agency, CostCenter, CostElement)
    // let result = Vehicles.find( vehicle => vehicle.idVehicle == req.params.id );
    if(rows){
      res.status(200).send(rows);
    }else{
      res.status(404).send("Error");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
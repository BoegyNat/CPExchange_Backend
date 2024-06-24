const { vehicleBrandsAndModels } = require("../models");
const db = require("../models");
const pool = require("../connection.js");

const Vehicles = db.vehicles;
const VehicleTypes = db.vehicleTypes;
const VehicleBrandsAndModels = db.vehicleBrandsAndModels;

exports.allVehicles = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM Vehicle JOIN VehicleBrandsAndModels ON Vehicle.idVehicleBrandAndModel = VehicleBrandsAndModels.idVehicleBrandsAndModels JOIN VehicleTypes ON Vehicle.idVehicleType = VehicleTypes.idVehicleTypes"
    );
    res.status(200).send(row);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getVehiclesByUseFor = (req, res) => {
  try {
    let result = Vehicles.filter(
      (vehicle) => vehicle.UseForEN == req.params.UseFor
    );
    if (result.length > 0) {
      result.map((vehicle) => {
        let vehicleType = VehicleTypes.find(
          (type) => type.id == vehicle.idVehicleType
        );
        vehicle.vehicleTypeNameEN = vehicleType.vehicleTypeNameEN;
        vehicle.vehicleTypeNameTH = vehicleType.vehicleTypeNameTH;
        let vehicleBrandAndModel = VehicleBrandsAndModels.find(
          (brandAndModel) => brandAndModel.id == vehicle.idVehicleBrandAndModel
        );
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
    } else {
      res.status(404).send("Not Found Vehicles");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getVehicleById = (req, res) => {
  try {
    let result = Vehicles.find((vehicle) => vehicle.idVehicle == req.params.id);
    if (result) {
      result.map((vehicle) => {
        vehicle.vehicleType = VehicleTypes.find(
          (type) => type.id == vehicle.idVehicleType
        );
        vehicle.vehicleBrandAndModel = VehicleBrandsAndModels.find(
          (brandAndModel) => brandAndModel.id == vehicle.idVehicleBrandAndModel
        );
      });
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Vehicle");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewVehicle = async (req, res) => {
  try {
    // console.log("postNewVehicle", req.body[0][0])
    const {
      idVehicleType,
      Plate_No,
      UseFor,
      UseForEN,
      Vendor,
      RentDate,
      ExpireDate,
      Cost,
      CostBooking,
      site,
      Agency,
      CostCenter,
      CostElement,
      idVehicleBrandAndModel,
    } = req.body[0];
    const rows = await pool.query(
      `
      INSERT INTO 
      Vehicle 
          (idVehicleType, Plate_No, UseFor, UseForEN, Vendor, Agency, Cost, CostBooking, CostCenter, CostElement, site, ExpireDate, RentDate, idVehicleBrandAndModel) 
      VALUES 
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        idVehicleType,
        Plate_No,
        UseFor,
        UseForEN,
        Vendor,
        Agency,
        Cost,
        CostBooking,
        CostCenter,
        CostElement,
        site,
        ExpireDate,
        RentDate,
        idVehicleBrandAndModel,
      ]
    );
    // console.log(idVehicleType, Plate_No, UseFor, Vendor, RentDate, ExpireDate, Cost, CostBooking, site, Agency, CostCenter, CostElement)
    // let result = Vehicles.find( vehicle => vehicle.idVehicle == req.params.id );
    if (rows) {
      res.status(200).send(rows);
    } else {
      res.status(404).send("Error");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postEditVehicle = async (req, res) => {
  try {
    const {
      idVehicleType,
      Plate_No,
      UseFor,
      Vendor,
      RentDate,
      ExpireDate,
      Cost,
      CostBooking,
      site,
      Agency,
      CostCenter,
      CostElement,
    } = req.body[0];
    const idVehicle = req.body[1];
    const rows = await pool.query(
      `
      UPDATE 
      Vehicle SET
          idVehicleType = ?, Plate_No = ?, UseFor = ?, Vendor = ?, Agency = ?, Cost = ?, CostBooking = ?, CostCenter = ?, CostElement = ?, site = ?, ExpireDate = ?, RentDate = ?
      WHERE
        idVehicle = ?`,
      [
        idVehicleType,
        Plate_No,
        UseFor,
        Vendor,
        Agency,
        Cost,
        CostBooking,
        CostCenter,
        CostElement,
        site,
        ExpireDate,
        RentDate,
        idVehicle,
      ]
    );
    if (rows) {
      res.status(200).send(rows);
    } else {
      res.status(404).send("Error");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postDeleteVehicle = async (req, res) => {
  try {
    const idVehicle = req.body[0].idVehicle;
    const rows = [];
    for (let i = 0; i < req.body[0].idVehicle.length; i++) {
      const row = await pool.query("DELETE FROM Vehicle WHERE idVehicle = ?", [
        idVehicle[i],
      ]);
      rows.push(row);
    }
    if (rows) {
      res.status(200).send(rows);
    } else {
      res.status(404).send("Error");
    }
    console.log(req.body[0].idVehicle);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

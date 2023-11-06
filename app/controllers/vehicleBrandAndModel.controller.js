const db = require("../models");
const VehicleBrandsAndModels = db.vehicleBrandsAndModels;
const VehicleTypes = db.vehicleTypes;
const Vehicles = db.vehicles;

const pool = require("../connection.js");

exports.allVehicleBrandsAndModels = async (req, res) => {
    try {
      // const VehicleTypes = await pool.query("SELECT * FROM VehicleTypes")
      // VehicleBrandsAndModels = await pool.query("SELECT * FROM VehicleBrandsAndModels")
      // console.log("allVehicleBrandsAndModels", VehicleTypes,)
      VehicleBrandsAndModels.map( vehibrand => {
        let type = VehicleTypes.find( typeVehi => typeVehi.id == vehibrand.idType );
        vehibrand.vehicleTypeNameEN = type.vehicleTypeNameEN;
        vehibrand.vehicleTypeNameTH = type.vehicleTypeNameTH;
      })
      res.status(200).send(VehicleBrandsAndModels);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
};

exports.allVehicleBrandsAndModelsByIdTypeCar = (req, res) => {
  try {
    let TypeCar = VehicleTypes.find( typeVehi => typeVehi.id == req.params.idTypeVehi );
    let result = VehicleBrandsAndModels.filter( vehibrand => vehibrand.idType == req.params.idTypeVehi );
    result.map( vehi => {
      vehi.vehicleTypeNameEN = TypeCar.vehicleTypeNameEN;
      vehi.vehicleTypeNameTH = TypeCar.vehicleTypeNameTH;
    })
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getVehicleBrandAndModelById = (req, res) => {
  try {
    let result = VehicleBrandsAndModels.find( vehibrand => vehibrand.id == req.params.Id );
    let TypeCar = VehicleTypes.find( typeVehi => typeVehi.id == result.idType );
    result.vehicleTypeNameEN = TypeCar.vehicleTypeNameEN;
    result.vehicleTypeNameTH = TypeCar.vehicleTypeNameTH;
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getVehicleBrandAndModelByUseFor = (req,res) => {
  try {
    let vehicleUseFor = Vehicles.filter( vehicle => vehicle.UseForEN == req.params.UseForEn );
    if(vehicleUseFor.length > 0){
      let ListVehicleDistinct = Array.from(new Set(vehicleUseFor.map( vehicle => vehicle.idVehicleBrandAndModel )))
        .map( idVehicleBrandAndModel => {
          let vehicleBrandAndType =  VehicleBrandsAndModels.find( brandAndType => brandAndType.id == idVehicleBrandAndModel );
          let vehicle = vehicleUseFor.find( typeCar => typeCar.idVehicleBrandAndModel == idVehicleBrandAndModel );
          return {...vehicleBrandAndType,costBooking:vehicle.CostBooking};
        });
        return res.status(200).send(ListVehicleDistinct);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getVehicleBrandAndModelByTypeCarAndUseFor = async (req,res) => {

  try {
    const vehicleBrandsAndModelss = await pool.query("SELECT * FROM VehicleBrandsAndModels");
    const vehicleTypes = await pool.query("SELECT * FROM VehicleTypes");
    // const vehicles = await pool.query("SELECT * FROM Vehicle JOIN VehicleBrandsAndModels ON Vehicle.idVehicleBrandAndModel = VehicleBrandsAndModels.idVehicleBrandsAndModels")
    let ListVehiclesUseFor = await pool.query("SELECT * FROM Vehicle JOIN VehicleBrandsAndModels ON Vehicle.idVehicleBrandAndModel = VehicleBrandsAndModels.idVehicleBrandsAndModels")
 
    if(ListVehiclesUseFor.length > 0){
      let ListVehicleTypeCar = ListVehiclesUseFor.filter( vehicle => vehicle.idType == req.params.VehicleType);
      if(ListVehicleTypeCar.length > 0){
        // let ListVehicleDistinct = Array.from(new Set(ListVehicleTypeCar.map( vehicle => vehicle.idVehicleTypes )))
        // .map( idVehicleBrandAndModel => {

        //   let vehicleBrandAndType =  vehicleBrandsAndModelss.find( brandAndType => brandAndType.idType == idVehicleBrandAndModel );
        //   let vehicle = ListVehicleTypeCar.find( typeCar => typeCar.idVehicleTypes == idType );
        //   return {...ListVehiclesUseFor,costBooking:vehicle.CostBooking};
        // });
        return res.status(200).send(ListVehicleTypeCar);
      }else{
        return res.status(200).send([])

      }
    }
    return res.status(404).send([])
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}
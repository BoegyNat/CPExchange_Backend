const db = require("../models");
const Drivers = db.drivers;

exports.allDrivers = (req, res) => {
  try {
    let result = Drivers.filter((driver) => driver.IsActive == 0);
    if(result){
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};

exports.deleteDrivers = (req, res) => {
  try {
    Drivers.forEach((driver) => {
      if(req.body.idDrivers.indexOf(driver.idDriver) > -1){
        driver.IsActive = -1;
      }
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};
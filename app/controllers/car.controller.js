const db = require("../models");
const Cars = db.cars;

exports.getAllCars = (req, res) => {
  try {
    res.status(200).send(Cars);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getCar = (req, res) => {
  try {
    let result = Cars.find((car) => car.id == req.params.idCar);

    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Car Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

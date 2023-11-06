const db = require("../models");
const Buses = db.buses;

exports.getAllBuses = (req, res) => {
  try {
    res.status(200).send(Buses);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getBus = (req, res) => {
  try {
    let result = Buses.find((bus) => bus.id == req.params.idBus);

    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Bus Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

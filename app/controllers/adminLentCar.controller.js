const db = require("../models");
const AdminLentCars = db.adminLentCars;

exports.getAllAdminLentCars = (req,res) => {
    try {
        res.status(200).send([...AdminLentCars].reverse());
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


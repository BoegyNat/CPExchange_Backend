const db = require("../models");
const StatusCar = db.statusCar;

exports.allStatusCar = (req,res) => {
    try {
        res.status(200).send(StatusCar);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.statusCar = (req,res) => {
    try {
        let result = StatusCar.find((status) => status.idCar == req.params.idCar);
        if(result){
            res.status(200).send(result);
        } else {
            let lastId = StatusCar.length;
            let newStatusCar = {
                id:lastId+1,
                idCar: parseInt(req.params.idCar),
                idDriver: 32,
                startDriving: "",
                endDriving: "",
                duration: "",
            };
            StatusCar.push(newStatusCar);
            return res.status(200).send(newStatusCar);
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.startStatusCar = (req,res) => {
    try {
        StatusCar.find((status) => status.idCar == req.params.idCar).startDriving = req.params.startstatus;
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.stopStatusCar = (req,res) => {
    try {
        StatusCar.find((status) => status.idCar == req.params.idCar).endDriving = req.params.stopstatus;
        StatusCar.find((status) => status.idCar == req.params.idCar).duration = req.params.duration;
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.resetStatusCar = (req,res) => {
    try {
        StatusCar.find((status) => status.idCar == req.params.idCar).startDriving = "";
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const db = require("../models");
const wayOfDriver = db.wayOfDriver;

exports.getAllWaysOfDriver = (req,res) => {
    try {
        res.status(200).send(wayOfDriver);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getWayOfDriver = (req,res) => {
    try {
        let result = wayOfDriver.find((way) => way.idDriver == req.params.idDriver);
        if(result){
            res.status(200).send(result);
        }else{
            return res.status(404).send({ message: "Car Not Found."});
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.removeEmployeeOfWay = (req,res) => {
    try {
        let route = wayOfDriver.find((way) => 
            way.idDriver == req.params.idDriver
        ).route.filter((employee) => 
            employee.idEmployee != req.params.idEmployee
        );
        wayOfDriver.find((way) => way.idDriver == req.params.idDriver).route = route;
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


const db = require("../models");
const RequestsPassenger = db.requestsPassenger;

exports.getAllRequestsPassenger = (req,res) => {
    try {
        res.status(200).send(RequestsPassenger);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getRequestsPassengerByIdPassenger = (req,res) => {
    try {
        console.log(req.params.IdPassenger);
        let requestsPassengerIdPassenger = RequestsPassenger.filter(request => request.idPassenger == req.params.IdPassenger);
        if(requestsPassengerIdPassenger.length > 0){
            res.status(200).send(requestsPassengerIdPassenger);
        }else{
            return res.status(404).send({ message: "request of Passenger not found. "})
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getRequestsPassengerByIdDriver = (req,res) => {
    try {
        let requestsPassengerIdPassenger = RequestsPassenger.filter(request => request.idDriver == req.params.IdDriver);
        if(requestsPassengerIdPassenger.length > 0){
            res.status(200).send(requestsPassengerIdPassenger);
        }else{
            return res.status(404).send({ message: "request of Passenger not found. "})
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
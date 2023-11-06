const db = require("../models");
const WaitingFriendCars = db.waitingFriendCars;

exports.getAllWaitingFriendCars = (req,res) => {
    try {
        res.status(200).send(WaitingFriendCars);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getWaitingFriendCarsByIdPassenger = (req,res) => {
    try{
        let result = WaitingFriendCars.filter((value) => value.idPassenger == req.params.idPassenger);
        if(result.length > 0){
            res.status(200).send({result,stateFind:"Found"});
        }else{
            res.status(200).send({message:"Not Have Any Order.",stateFind:"Not_Found"});
        }
    }catch(error){
        res.status(500).send({ message: error.message });
    }
};

exports.getWaitingFriendCarsByIdDriver = (req,res) => {
    try{
        let result = WaitingFriendCars.filter((value) => value.idDriver == req.params.idDriver && value.status == "waiting");
        if(result.length > 0){
            res.status(200).send({result,stateFind:"Found"});
        }else{
            res.status(200).send({message:"Not Have Any Order.",stateFind:"Not_Found"});
        }
    }catch(error){
        res.status(500).send({ message: error.message });
    }
};

exports.changingStatusWaitingFriendCar = (req,res) => {
    try {
        WaitingFriendCars.find((value) => value.id == req.params.idOrder).status = req.params.status;
        res.status(200).send({message:"Finished"});
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

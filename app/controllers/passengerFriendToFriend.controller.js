const db = require("../models");
const PassengerFriendToFriends = db.passengerFriendToFriends;
const RegisterOfDrivers = db.registersOfDriver; 
const Users = db.users;

exports.getAllPassengerFriendToFriends = (req,res) => {
    try {
        res.status(200).send(PassengerFriendToFriends);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getPassengerFriendToFriendById = (req,res) => {
    try {
        let result = PassengerFriendToFriends.find(passenger => passenger.id == req.params.id);
        if(result){
            result.user = Users.find( user => user.id == result.idUser );
            res.status(200).send(result);
        }else{
            res.status(404).send("Not Found This Id");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getPassengerFriendToFriendByIdDriver = (req,res) => {
    try {
        let result = PassengerFriendToFriends.filter(passenger => {
            let register = RegisterOfDrivers.find( register => register.id == passenger.idRegister );
            if(register.idUser == req.params.idDriver){
                return true;
            }
            else{
                return false;
            }
        });
        if(result.length > 0){
            result.map( passenger => {
                passenger.user = Users.find( user => user.id == passenger.idUser );
            });
            res.status(200).send(result);
        }else{
            res.status(404).send("Not Found This Id");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getPassengerFriendToFriendByIdRegisterAndDate = (req,res) => {
    try {
        let result = PassengerFriendToFriends.filter(passenger => {
            if(passenger.status == true && passenger.joined == true && passenger.idRegister == req.body.idRegister){
                let inputDate = new Date(req.body.date).setHours(0,0,0,0);
                let startDate = new Date(passenger.startDate).setHours(0,0,0,0);
                let endDate = new Date(passenger.endDate).setHours(0,0,0,0);
                if(inputDate >= startDate && inputDate <= endDate){
                    return true;
                }
            }
            return false;
        });
        if(result.length > 0){
            result.map( passenger => {
                passenger.user = Users.find( user => user.id == passenger.idUser );
            });
            res.status(200).send(result);
        }else{
            res.status(404).send("Not Found");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getWaitingResponsePassengerFriendToFriendByIdDriver = (req,res) => {
    try {
        let result = PassengerFriendToFriends.filter(passenger => {
            if(passenger.status == false){
                let register = RegisterOfDrivers.find( register => register.id == passenger.idRegister );
                if(register.idUser == req.params.idDriver){
                    return true;
                }
            }
            return false;
        });
        if(result.length > 0){
            result.map( passenger => {
                passenger.user = Users.find( user => user.id == passenger.idUser );
                let registerOfPassenger = RegisterOfDrivers.find( register => register.id == passenger.idRegister );
                passenger.fromPlace =  registerOfPassenger.fromPlace;
                passenger.toPlace =  registerOfPassenger.toPlace;
                passenger.time = registerOfPassenger.time;
            });
            res.status(200).send(result);
        }else{
            res.status(404).send("Not Found This Id");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.postReponseFromDriver = (req,res) => {
    try {
        PassengerFriendToFriends.find( passenger => passenger.id == req.body.id ).status = true;
        PassengerFriendToFriends.find( passenger => passenger.id == req.body.id ).joined = req.body.response;
        res.status(200).send(PassengerFriendToFriends.find( passenger => passenger.id == req.body.id ));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getPassengerFriendToFriendByIdPassenger = (req,res) => {
    try {
        let result = PassengerFriendToFriends.filter(passenger => passenger.idUser == req.params.idPassenger && passenger.status == true && passenger.joined == true);
        if(result.length > 0){
            result.map( passenger => {
                let registerOfPassenger = RegisterOfDrivers.find( register => register.id == passenger.idRegister );
                passenger.register = registerOfPassenger;
            });
            res.status(200).send(result);
        }else{
            res.status(404).send("Not Found This Id");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getWaitingResponsePassengerFriendToFriendByIdPassenger = (req,res) => {
    try {
        let result = PassengerFriendToFriends.filter(passenger => passenger.idUser == req.params.idPassenger && passenger.status == false);
        if(result.length > 0){
            result.map( passenger => {
                let registerOfPassenger = RegisterOfDrivers.find( register => register.id == passenger.idRegister );
                passenger.register = registerOfPassenger;
                passenger.driver = Users.find( user => user.id == registerOfPassenger.idUser );
            });
            res.status(200).send(result);
        }else{
            res.status(404).send("Not Found This Id");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
const db = require("../models");
const RegistersOfDriver = db.registersOfDriver;
const PassengerFriendToFriends = db.passengerFriendToFriends;
const Users = db.users;

exports.getAllRegistersOfDriver = (req,res) => {
    try {
        res.status(200).send(RegistersOfDriver);   
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getRegistersOfDriver = (req,res) => {
    try{
        let result = RegistersOfDriver.find((value) => value.id == req.params.idOrder);
        if(result){
            let User = Users.find( user => user.id == result.idUser);
            result.user = User;
            res.status(200).send(result);
        }else{
            res.status(404).send({message:"Not Have Any Register."});
        }
    }catch(error){
        res.status(500).send({ message: error.message });
    }
};

exports.getRegistersOfDriverByType = (req,res) => {
    try{
        let result = RegistersOfDriver.filter((value) => value.type == req.params.type);
        if(result){
            result.map( register => {
                let User = Users.find( user => user.id == register.idUser);
                register.user = User;
            });
            res.status(200).send({result,stateFind:"Found"});
        }else{
            res.status(200).send({message:"Not Have Any Register.",stateFind:"Not_Found"});
        }
    }catch(error){
        res.status(500).send({ message: error.message });
    }
};

exports.getRegistersOfDriverByIdUser = (req,res) => {
    try{
        let result = RegistersOfDriver.filter((value) => value.idUser == req.params.idUser);
        if(result){
            res.status(200).send({result,stateFind:"Found"});
        }else{
            res.status(200).send({message:"Not Have Any Register.",stateFind:"Not_Found"});
        }
    }catch(error){
        res.status(500).send({ message: error.message });
    }
};

exports.getRegistersOfDriverByTypeAndDate = (req,res) => {
    try{
        let result = RegistersOfDriver.filter((value) => {
            if(value.type == req.body.type && 
               (new Date(value.startDate).setHours(0,0,0,0) >= new Date(req.body.startDate).setHours(0,0,0,0) ||
               new Date(value.endDate).setHours(0,0,0,0) >= new Date(req.body.startDate).setHours(0,0,0,0))
            ){
                return true;
            }
            else{
                return false;
            }
        });
        if(result){
            result.map( register => {
                register.driver = Users.find( user => user.id == register.idUser );
            });
            res.status(200).send(result);
        }else{
            res.status(404).send({message:"Not Have Any Register."});
        }
    }catch(error){
        res.status(500).send({ message: error.message });
    }
};

exports.getRegistersOfDriverByDuration = (req,res) => {
    try{
        let result = RegistersOfDriver.filter((value) => {
            if(new Date(value.startDate).setHours(0,0,0,0) >= new Date(req.params.dateStart).setHours(0,0,0,0) 
            && new Date(value.startDate).setHours(0,0,0,0) <= new Date(req.params.dateEnd).setHours(0,0,0,0)){
                return true;
            }
            else{
                return false;
            }
        });
        if(result){
            result.map( register => {
                register.driver = Users.find( user => user.id == register.idUser );
                register.requestPassenger = PassengerFriendToFriends.filter( passenger => passenger.idRegister == register.id ).length;
            });
            res.status(200).send({result,stateFind:"Found"});
        }else{
            res.status(200).send({message:"Not Have Any Register.",stateFind:"Not_Found"});
        }
    }catch(error){
        res.status(500).send({ message: error.message });
    }
};
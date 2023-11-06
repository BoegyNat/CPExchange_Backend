const db = require("../models");
const LentCars = db.lentcar;
const Users = db.users;
const Options = db.options;

exports.AllLentCars = (req,res) => {
    try {
        let result = [];
        LentCars.map((lentcar)=>{
            let objTmp = {}
            let Lender = Users.find((user)=> user.id == lentcar.lenderId);
            let OptionCar = Options.find((option)=> option.idCar == lentcar.carId);
            objTmp.firstnamelender = Lender.firstname;
            objTmp.lastnamelender = Lender.lastname;
            result.push({...OptionCar,...lentcar,...objTmp});
        })
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getLentCarById = (req,res) => {
    try {
        let Lentcar = LentCars.find((car)=>car.carId == req.params.idCar);
        let optionlentcar = Options.find((option)=> option.idCar == Lentcar.carId);
        let result = {...Lentcar,...optionlentcar};
        if(result){
            res.status(200).send(result);
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getLentCarsByProvince = (req,res) => {
    try {
        let result = LentCars.filter((car)=>car.province == req.params.province);
        if(result){
            res.status(200).send(result);
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getLentCarsByLenderId = (req,res) => {
    try {
        let result = LentCars.filter((car)=>car.lenderId == req.params.lenderId);
        if(result){
            res.status(200).send(result);
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

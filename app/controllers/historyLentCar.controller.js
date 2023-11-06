const db = require("../models");
const HistoryLentCars = db.historyLentCars;
const Users = db.users;

exports.getHistoryLentCarById = (req,res) => {
    try {
        let HistorySelected = HistoryLentCars.find((car)=>car.id == req.params.id);
        if(HistorySelected){
            let objTmp = {};
            let UserProfileLender = Users.find((user)=>user.id == HistorySelected.lenderId);
            let UserProfileBorrower = Users.find((user)=>user.id == HistorySelected.borrowerId);
            objTmp.firstnamelender = UserProfileLender.firstname;
            objTmp.lastnamelender = UserProfileLender.lastname;
            objTmp.imageUserlender = UserProfileLender.image;
            objTmp.firstnameborrower = UserProfileBorrower.firstname;
            objTmp.lastnameborrower = UserProfileBorrower.lastname;
            objTmp.imageUserborrower = UserProfileBorrower.image;
            objTmp.provinceborrower = UserProfileBorrower.province;
            objTmp.districtborrower = UserProfileBorrower.district;
            let result = {...HistorySelected,...objTmp};
            if(result){
                res.status(200).send(result);
            }
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getHistoryLentCarByCarId = (req,res) => {
    try {
        let HistorySelected = HistoryLentCars.filter((car)=>car.carId == req.params.idCar);
        if(HistorySelected){
            let result = [];
            HistorySelected.map((history)=>{
                let objTmp = {};
                let UserProfileLender = Users.find((user)=>user.id == history.lenderId);
                let UserProfileBorrower = Users.find((user)=>user.id == history.borrowerId);
                objTmp.firstnamelender = UserProfileLender.firstname;
                objTmp.lastnamelender = UserProfileLender.lastname;
                objTmp.imageUserlender = UserProfileLender.image;
                objTmp.firstnameborrower = UserProfileBorrower.firstname;
                objTmp.lastnameborrower = UserProfileBorrower.lastname;
                objTmp.imageUserborrower = UserProfileBorrower.image;
                objTmp.provinceborrower = UserProfileBorrower.province;
                objTmp.districtborrower = UserProfileBorrower.district;
                result.push({...history,...objTmp});
            })
            if(result){
                res.status(200).send(result);
            }
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getHistoryLentCarByIdLender = (req,res) => {
    try {
        let HistorySelected = HistoryLentCars.filter((car)=>car.lenderId == req.params.idLender);
        if(HistorySelected){
            let result = [];
            HistorySelected.map((history)=>{
                let objTmp = {};
                let UserProfileLender = Users.find((user)=>user.id == history.lenderId);
                let UserProfileBorrower = Users.find((user)=>user.id == history.borrowerId);
                objTmp.firstnamelender = UserProfileLender.firstname;
                objTmp.lastnamelender = UserProfileLender.lastname;
                objTmp.imageUserlender = UserProfileLender.image;
                objTmp.firstnameborrower = UserProfileBorrower.firstname;
                objTmp.lastnameborrower = UserProfileBorrower.lastname;
                objTmp.imageUserborrower = UserProfileBorrower.image;
                objTmp.provinceborrower = UserProfileBorrower.province;
                objTmp.districtborrower = UserProfileBorrower.district;
                result.push({...history,...objTmp});
            })
            if(result){
                res.status(200).send(result);
            }
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getHistoryLentCarByCarIdAndMonthLent = (req,res) => {
    try {
        let result = HistoryLentCars.filter((car)=>car.carId == req.params.idCar && new Date(car.datelent).getMonth() == req.params.datelent);
        if(result){
            res.status(200).send(result);
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getHistoryLentCarByBorrowerId = (req,res) => {
    try {
        let HistorySelected = HistoryLentCars.filter((car)=>car.borrowerId == req.params.borrowerId);
        if(HistorySelected){
            let result = [];
            HistorySelected.map((history)=>{
                let objTmp = {};
                let UserProfileLender = Users.find((user)=>user.id == history.lenderId);
                let UserProfileBorrower = Users.find((user)=>user.id == history.borrowerId);
                objTmp.firstnamelender = UserProfileLender.firstname;
                objTmp.lastnamelender = UserProfileLender.lastname;
                objTmp.imageUserlender = UserProfileLender.image;
                objTmp.firstnameborrower = UserProfileBorrower.firstname;
                objTmp.lastnameborrower = UserProfileBorrower.lastname;
                objTmp.imageUserborrower = UserProfileBorrower.image;
                result.push({...history,...objTmp});
            })
            if(result){
                if(req.params.sort == "Oldest"){
                    res.status(200).send(result.reverse());
                }else{
                    res.status(200).send(result);
                }
            }
        }else{
            res.status(404).send({ message: "Not found any car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getHistoryLentCarApprovedByBorrowerId = (req,res) => {
    try {
        let HistorySelected = HistoryLentCars.filter((car)=>car.borrowerId == req.params.borrowerId && car.status == "Approved");
        if(HistorySelected){
            let result = [];
            HistorySelected.map((history)=>{
                let objTmp = {};
                let UserProfileLender = Users.find((user)=>user.id == history.lenderId);
                let UserProfileBorrower = Users.find((user)=>user.id == history.borrowerId);
                objTmp.firstnamelender = UserProfileLender.firstname;
                objTmp.lastnamelender = UserProfileLender.lastname;
                objTmp.imageUserlender = UserProfileLender.image;
                objTmp.firstnameborrower = UserProfileBorrower.firstname;
                objTmp.lastnameborrower = UserProfileBorrower.lastname;
                objTmp.imageUserborrower = UserProfileBorrower.image;
                result.push({...history,...objTmp});
            })
            if(result){
                if(req.params.sort == "Oldest"){
                    res.status(200).send(result.reverse());
                }else{
                    res.status(200).send(result);
                }
            }
        }else{
            res.status(404).send({ message: "Not found any car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getHistoryLentCarWaitingByBorrowerId = (req,res) => {
    try {
        let HistorySelected = HistoryLentCars.filter((car)=>car.borrowerId == req.params.borrowerId && car.status == "Waiting");
        if(HistorySelected){
            let result = [];
            HistorySelected.map((history)=>{
                let objTmp = {};
                let UserProfileLender = Users.find((user)=>user.id == history.lenderId);
                let UserProfileBorrower = Users.find((user)=>user.id == history.borrowerId);
                objTmp.firstnamelender = UserProfileLender.firstname;
                objTmp.lastnamelender = UserProfileLender.lastname;
                objTmp.imageUserlender = UserProfileLender.image;
                objTmp.firstnameborrower = UserProfileBorrower.firstname;
                objTmp.lastnameborrower = UserProfileBorrower.lastname;
                objTmp.imageUserborrower = UserProfileBorrower.image;
                result.push({...history,...objTmp});
            })
            if(result){
                if(req.params.sort == "Oldest"){
                    res.status(200).send(result.reverse());
                }else{
                    res.status(200).send(result);
                }
            }
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getHistoryLentCarWaitingByLenderId = (req,res) => {
    try {
        let HistorySelected = HistoryLentCars.filter((car)=>car.lenderId == req.params.lenderId && car.status == "Waiting");
        if(HistorySelected){
            let result = [];
            HistorySelected.map((history)=>{
                let objTmp = {};
                let UserProfileLender = Users.find((user)=>user.id == history.lenderId);
                let UserProfileBorrower = Users.find((user)=>user.id == history.borrowerId);
                objTmp.firstnamelender = UserProfileLender.firstname;
                objTmp.lastnamelender = UserProfileLender.lastname;
                objTmp.imageUserlender = UserProfileLender.image;
                objTmp.pointLender = UserProfileLender.pointLentCar;
                objTmp.firstnameborrower = UserProfileBorrower.firstname;
                objTmp.lastnameborrower = UserProfileBorrower.lastname;
                objTmp.imageUserborrower = UserProfileBorrower.image;
                objTmp.pointBorrower = UserProfileBorrower.pointLentCar;
                objTmp.provinceborrower = UserProfileBorrower.province;
                objTmp.districtborrower = UserProfileBorrower.district;
                result.push({...history,...objTmp});
            })
            if(result){
                res.status(200).send(result);
            }
        }else{
            res.status(404).send({ message: "Not found this car." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
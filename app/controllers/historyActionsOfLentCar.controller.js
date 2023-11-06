const db = require("../models");
const HistoryActionsOfLentCar = db.historyActionsOfLentCar;
const Users = db.users;

exports.getAllHistoryActions = (req,res) => {
    try {
        let result = [];
        HistoryActionsOfLentCar.map((history)=>{
            let objTmp = {};
            let UserProfileActions = Users.find((user)=>user.id == history.userId);
            objTmp.firstname = UserProfileActions.firstname;
            objTmp.lastname = UserProfileActions.lastname;
            objTmp.mobileNumber = UserProfileActions.mobileNumber;
            objTmp.imagepath = UserProfileActions.image;
            objTmp.pointLentCar = UserProfileActions.pointLentCar;
            if(history.action == "Register"){
                objTmp.email = UserProfileActions.email;
                objTmp.image = UserProfileActions.image;
                objTmp.province = UserProfileActions.province;
                objTmp.district = UserProfileActions.district;
            }
            result.push({...history,...objTmp});
        })
        result.reverse();
        if(result){
            res.status(200).send(result);
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}
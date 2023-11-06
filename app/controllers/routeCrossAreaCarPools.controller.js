const db = require("../models");
const RouteCrossAreaCarPools = db.routeCrossAreaCarPool;
const Drivers = db.drivers;
const Vehicles = db.vehicles;
const Users = db.users;
const CrossAreaCarPoolBokingPassengers = db.crossAreaCarPoolBookingPassengers;

const pool = require("../connection.js")

const CompareDate = (date1, date2) => {

    let routeDate = new Date(date1).setHours(0,0,0,0);
    let reqDate = new Date(date2).setHours(0,0,0,0);
    console.log("ffff", routeDate, reqDate)
    return (routeDate > reqDate);
}

exports.getRouteLineByIdUserRouteDate = (req,res) => {
    try {

        let passengerIdUser = RouteCrossAreaCarPools.find( route => {
            if(route.idUser == req.body.idUser){
                return CompareDate(route.routeDate, req.body.routeDate);
            }
            return (false);
        });
        if(passengerIdUser){
            let result = RouteCrossAreaCarPools.filter( route => {
                if(route.routeLine == passengerIdUser.routeLine){
                    return CompareDate(route.routeDate, passengerIdUser.routeDate);
                }
                return (false);
            });
            result.map( route => {
                let user = Users.find( user => user.id == route.idUser );
                route.fNameThai = user.fNameThai;
                route.departmentThai = user.departmentShortName;
                route.telephoneMobile = user.mobileNumber;
                let driver = Drivers.find( driver => driver.idDriver == route.idDriver );
                route.fullnameDriver = driver.FullName;
                route.mobileNumberDriver = driver.Telephone;
                route.rating = driver.Rating;
                let vehicle = Vehicles.find( vehicle => vehicle.idVehicle == route.idVehicle );
                route.plateNo = vehicle.Plate_No;
            });
            if(result.length > 0){
                res.status(200).send(result);
            }
            else{
                res.status(404).send("Not Found Passenger");
            }
        }
        else{
            res.status(404).send("Not Found Passenger");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


exports.getRouteUserByIdUser = (req,res) => {
    try {
        let passengerIdUser = RouteCrossAreaCarPools.find( route => {
            // console.log("route : ",route);
            if(route.idUser == req.body.idUser){
                return CompareDate(route.routeDate, req.body.routeDate);
            }
            return (false);
        });
        if(passengerIdUser){
            // console.log("passengerIdUserBefore : ",passengerIdUser);
            let user = Users.find( user => user.id == passengerIdUser.idUser );
            passengerIdUser.fNameThai = user.fNameThai;
            passengerIdUser.departmentThai = user.departmentShortName;
            passengerIdUser.telephoneMobile = user.mobileNumber;
            passengerIdUser.image = user.image;
            let driver = Drivers.find( driver => driver.idDriver == passengerIdUser.idDriver );
            passengerIdUser.fullnameDriver = driver.FullName;
            passengerIdUser.mobileNumberDriver = driver.Telephone;
            passengerIdUser.rating = driver.Rating;
            let vehicle = Vehicles.find( vehicle => vehicle.idVehicle == passengerIdUser.idVehicle );
            passengerIdUser.plateNo = vehicle.Plate_No;
            passengerIdUser.fromPlace = CrossAreaCarPoolBokingPassengers.find( booking => booking.id == passengerIdUser.idCrossAreaCarPoolBookingPassenger).fromPlace;
            // console.log("passengerIdUserAfter : ",passengerIdUser);
            res.status(200).send(passengerIdUser);
        }
        else{
            res.status(404).send("Not Found Passenger");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getRoutesByRouteDate = async (req,res) => {
    try {
        console.log("DDDDD")
        const row = await pool.query("SELECT * FROM routeCrossAreaCarPools");
        const rows = await pool.query("SELECT * FROM Users");
        const rowsData = await pool.query("SELECT * FROM CrossAreaCarPoolBookingPassenger");

        const date = req.body.routeDate
        
        let routes = RouteCrossAreaCarPools.filter( route =>  CompareDate(route.routeDate, req.body.routeDate));

        // let routess = row.filter( route => CompareDate(route.routeDate.slice(0, 10), new Date(date).toLocaleDateString('en-GB', {
        //     year: 'numeric',
        //     month: '2-digit',
        //     day: '2-digit',
            
        // }).split('/').reverse().join('-')));
        let routess = row.filter( route => CompareDate(route.routeDate, req.body.routeDate))
        console.log("dddd", routess)
        if(routess.length > 0){
            routess.map( route => {
                let passenger = rows.find( user => user.idUser === route.idUser );
                route.passengerFNameThai = passenger.fNameThai;
                route.passengerDepartment = passenger.department;
                route.passengerMobileNumber = passenger.mobileNumber;
                let passengerBooking = rowsData.find( user => user.idUser == route.idUser );
                route.passengerDeparture = passengerBooking.fromPlace;
            });
            res.status(200).send(routess);

        }
        // if(routes.length > 0){
        //     routes.map( route => {
        //         let passenger = Users.find( user => user.id == route.idUser );
        //         console.log("ddd", route)
        //         console.log("dsdsd", passenger)
        //         route.passengerFNameThai = passenger.fNameThai;
        //         route.passengerDepartment = passenger.department;
        //         route.passengerMobileNumber = passenger.mobileNumber;
        //         let passengerBooking = CrossAreaCarPoolBokingPassengers.find( user => user.idUser == route.idUser );
        //         route.passengerDeparture = passengerBooking.fromPlace;
        //     });

        //     res.status(200).send(routes);
        // }
        else{
            res.status(404).send({ message: "Not Found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getRoutesByRouteLineAndRouteDate = (req,res) => {
    try {
        let routes = RouteCrossAreaCarPools.filter( route => route.routeLine == req.body.routeLine && CompareDate(route.routeDate,req.body.routeDate));
        if(routes.length > 0){
            routes.map( route => {
                let user = Users.find( user => user.id == route.idUser );
                route.fNameThaiUser = user.fNameThai;
                route.departmentUser = user.department;
                route.mobileNumberUser = user.mobileNumber;
                route.imageUser = user.image;
                let passenger = CrossAreaCarPoolBokingPassengers.find( booking => booking.id == route.idCrossAreaCarPoolBookingPassenger );
                route.fromPlace = passenger.fromPlace;
            });
            res.status(200).send(routes);
        }else{
            res.status(404).send({ message: "Not Found." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.postEditIdDriverRoute = async (req,res) => {
    try {
        console.log(req.body.AnswerFromInput.idDriver)
        const rows = await pool.query("UPDATE routeCrossAreaCarPools SET idDriver = ?, idVehicle=?, comment=? WHERE routeLine = ? ", [req.body.AnswerFromInput.idDriver, req.body.AnswerFromInput.idVehicle, req.body.AnswerFromInput.DetailManagecar, req.body.routeLine])

        // console.log("postEditIdDriverRoute ติด", rows)

        // else{
        //     res.status(404).send({ message: "Not Found" });
        // }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.deleteRouteCrossPools = async (req, res) =>{
    try{
        const row = await pool.query("DELETE FROM routeCrossAreaCarPools WHERE routeLine = ?", [req.body.route[0].routeLine])
        console.log("Delete Route", req.body)
    } catch (error){
        res.status(500).send({ message: error.message });
    }
}
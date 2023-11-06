const db = require("../models");
const CrossAreaCarBookingPassengers = db.crossAreaCarBookingPassengers;
const pool = require("../connection.js");

exports.getAllCrossAreaCarBookingPassengers = (req,res) => {
    try {
        res.status(200).send(CrossAreaCarBookingPassengers);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getCrossAreaCarBookingPassengerById = (req,res) => {
    try {
        let result = CrossAreaCarBookingPassengers.filter(booking => booking.id == req.params.id);
        if(result.length > 0){
            res.status(200).send(result);
        }else{
            res.status(404).send("Not Found Booking");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getCrossAreaCarBookingPassengerByIdBooking = async (req,res) => {
    try {
        const row = await pool.query("SELECT * FROM CrossAreaCarPassenger WHERE idCrossAreaCar = ?", [req.params.idBooking])
        // console.log("getCrossAreaCarBookingPassengerByIdBooking", row)
        // let result = CrossAreaCarBookingPassengers.filter(booking => booking.idCrossAreaCarBooking == req.params.idBooking);
        if(row.length > 0){
            res.status(200).send(row);
        }else{
            res.status(404).send("Not Found Booking");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.deleteCarCrossAreaCarBookingPassenger = async (req, res) =>{
    try{
        const rows = await pool.query("DELETE FROM CrossAreaCarPassenger WHERE idCrossAreaCar = ?", [req.body.idCrossAreaCarBooking])
        // console.log("Delete RoutePassenger", req.body.idCrossAreaCarBooking)
        if(rows){
            res.status(200).send(rows);
        }else{
            res.status(404).send("Not Found Booking");
        }
    } catch (error){
        res.status(500).send({ message: error.message });
    }
}
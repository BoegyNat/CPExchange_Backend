// const { pool } = require('../config/db.config');
const db = require('../models');
const CrossAreaCarPoolBookingPassengers = db.crossAreaCarPoolBookingPassengers;

const pool = require("../connection.js")

exports.getAllCrossAreaCarPoolBookingPassengers = (req,res) => {
    try {
        res.status(200).send(CrossAreaCarPoolBookingPassengers);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getCrossAreaCarPoolBookingPassengerByIdBooking = async (req,res) => {
    try {
        const row = await pool.query("SELECT * FROM CrossAreaCarPoolBookingPassenger WHERE idCrossAreaCarPoolBooking = ?", [req.params.idBooking])
        // console.log("getCrossAreaCarPoolBookingPassengerByIdBooking", req.params.idBooking)
        // let result = CrossAreaCarPoolBookingPassengers.filter(booking => booking.idCrossAreaCarPoolBooking == req.params.idBooking);
        if(row.length > 0){
            res.status(200).send(row);
        }else{
            res.status(404).send("Not Found Booking");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

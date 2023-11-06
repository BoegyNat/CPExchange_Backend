const db = require("../models");
const Bookings = db.bookings;

exports.getAllBookings = (req,res) => {
    try {
        res.status(200).send(Bookings);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getBooking = (req,res) => {
    try {
        let result = Bookings.find((order) => order.id == req.params.idBooking);

        if(result){
            res.status(200).send(result);
        }else{
            return res.status(404).send({ message: "Booking not found." })
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getBookingByType = (req,res) => {
    try {
        let result = Bookings.filter((order) => order.type == req.params.typeBooking).reverse();
        if(result.length > 0){
            res.status(200).send(result);
        }else{
            return res.status(404).send({ message: "Booking not found. "})
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getBookingByTypeAndStartDate = (req,res) => {
    try {
        let result = Bookings.filter((order) => order.type == req.params.typeBooking && new Date(order.departureDate).setHours(0,0,0,0) == new Date(req.params.start_date).setHours(0,0,0,0) ).reverse();
        if(req.params.typeBooking == "DeliveryItem"){
            result = Bookings.filter((order) => order.type == req.params.typeBooking && new Date(order.Date).setHours(0,0,0,0) >= new Date(req.params.start_date).setHours(0,0,0,0)).reverse();
        }
        else if(req.params.typeBooking == "CrossArea"){
            result = Bookings.filter((order) => order.type == req.params.typeBooking && new Date(order.departureDate).setHours(0,0,0,0) >= new Date(req.params.start_date).setHours(0,0,0,0)).reverse();
        }
        else if(req.params.typeBooking == "InArea"){
            result = Bookings.filter((order) => order.type == req.params.typeBooking && new Date(order.Date).setHours(0,0,0,0) >= new Date(req.params.start_date).setHours(0,0,0,0)).reverse();
        }
        if(result.length > 0){
            res.status(200).send(result);
        }else{
            return res.status(404).send({ message: "Booking not found. "})
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getBookingByTypeAndStartDateAndEndDate = (req,res) => {
    try {
        let timeStart;
        let result;
        if(req.params.typeBooking == "DeliveryItem"){
            result = Bookings.filter((order) => order.type == req.params.typeBooking && new Date(order.Date).setHours(0,0,0,0) >= new Date(req.params.start_date).setHours(0,0,0,0) && new Date(order.Date).setHours(0,0,0,0) <= new Date(req.params.end_date).setHours(0,0,0,0) ).reverse();
        }
        else if(req.params.typeBooking == "CrossArea"){
            result = Bookings.filter((order) => order.type == req.params.typeBooking && new Date(order.departureDate).setHours(0,0,0,0) >= new Date(req.params.start_date).setHours(0,0,0,0) && new Date(order.departureDate).setHours(0,0,0,0) <= new Date(req.params.end_date).setHours(0,0,0,0) ).reverse();
        }
        else if(req.params.typeBooking == "InArea"){
            result = Bookings.filter((order) => order.type == req.params.typeBooking && new Date(order.Date).setHours(0,0,0,0) >= new Date(req.params.start_date).setHours(0,0,0,0) && new Date(order.Date).setHours(0,0,0,0) <= new Date(req.params.end_date).setHours(0,0,0,0) ).reverse();
        }
        if(result.length > 0){
            res.status(200).send(result);
        }else{
            return res.status(404).send({ message: "Booking not found. "})
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


const db = require("../models");
const Reviews = db.reviews;
const pool = require("../connection.js");

exports.getAllReviews = (req, res) => {
  try {
    res.status(200).send(Reviews);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getReviewsByCarId = (req, res) => {
  try {
    let result = Reviews.filter((review) => review.carId == req.params.carId);
    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Review Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewReview = async (req, res) => {
  try {
    console.log("postNewReview", req.body.infor.idNewMeetingRoom);
    const typeBooking = req.body.infor.typeBooking;
    // console.log("postNewReview", typeBooking, req.body.info.idNewMeetingRoom);

    if (typeBooking === "CrossArea") {
      const resdata = await pool.query(
        `INSERT INTO review (idUser, idDriver, idMeetingRoom, rating, comment, date) VALUES (?,?,?,?,?,?)`,
        [
          req.body.infor.idUser,
          req.body.infor.idDriver,
          req.body.infor.idNewMeetingRoom,
          req.body.rating,
          req.body.comment,
          new Date(),
        ]
      );
      const result = await pool.query(
        "UPDATE CrossAreaCarBooking SET  statusRating = ?, idReview= ? WHERE idCrossAreaCarBooking = ? ",
        ["Success", resdata.insertId, req.body.infor.idCrossAreaCarBooking]
      );
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    } else if (typeBooking === "CrossAreaPool") {
      // const resdata = await pool.query(
      //   `INSERT INTO review (idUser, idDriver, rating, comment, date) VALUES (?,?,?,?,?)`,
      //   [
      //     req.body.infor.idUser,
      //     req.body.infor.idDriver,
      //     req.body.rating,
      //     req.body.comment,
      //     new Date(),
      //   ]
      // );
      // const result = await pool.query(
      //   "UPDATE CrossAreaCarPoolBooking SET  statusRating = ?, idReview= ? WHERE idCrossAreaCarPoolBooking = ? ",
      //   ["Success",  resdata.insertId, req.body.infor.idCrossAreaCarPoolBooking]
      // );
      // if (result) {
      //   res.status(200).send(result);
      // } else {
      //   return res.status(404).send({ message: "Reviews can not Update" });
      // }
    } else if (typeBooking === "InArea") {
      const resdata = await pool.query(
        `INSERT INTO review (idUser, idDriver, idMeetingRoom, rating, comment, date) VALUES (?,?,?,?,?,?)`,
        [
          req.body.infor.idUser,
          req.body.infor.idDriver,
          req.body.infor.idNewMeetingRoom,
          req.body.rating,
          req.body.comment,
          new Date(),
        ]
      );
      const result = await pool.query(
        "UPDATE inAreaCarBooking SET  statusRating = ?, idReview= ? WHERE idinAreaCarBooking = ? ",
        ["Success", resdata.insertId, req.body.infor.idinAreaCarBooking]
      );
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    } else if (typeBooking === "Delivery") {
      const resdata = await pool.query(
        `INSERT INTO review (idUser, idDriver, idMeetingRoom, rating, comment, date) VALUES (?,?,?,?,?,?)`,
        [
          req.body.infor.idUser,
          req.body.infor.idDriver,
          req.body.infor.idNewMeetingRoom,
          req.body.rating,
          req.body.comment,
          new Date(),
        ]
      );
      const result = await pool.query(
        "UPDATE DeliveryCarBooking SET  statusRating = ?, idReview= ? WHERE idDeliveryCarBooking = ? ",
        ["Success", resdata.insertId, req.body.infor.idDeliveryCarBooking]
      );
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    } else if (typeBooking === "MeetingRoom") {
      const resdata = await pool.query(
        `INSERT INTO review (idUser, idDriver, idMeetingRoom, rating, comment, date) VALUES (?,?,?,?,?,?)`,
        [
          req.body.infor.idUser,
          req.body.infor.idDriver,
          req.body.infor.idNewMeetingRoom,
          req.body.rating,
          req.body.comment,
          new Date(),
        ]
      );
      const result = await pool.query(
        "UPDATE NewMeetingRoomBooking SET  statusRating = ?, idReview= ? WHERE idNewMeetingRoomBooking = ? ",
        ["Success", resdata.insertId, req.body.infor.idNewMeetingRoomBooking]
      );
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    } else if (typeBooking === "DriverBooking") {
      const resdata = await pool.query(
        `INSERT INTO review (idUser, idDriver, idMeetingRoom, rating, comment, date) VALUES (?,?,?,?,?,?)`,
        [
          req.body.infor.idUser,
          req.body.infor.idDriver,
          req.body.infor.idNewMeetingRoom,
          req.body.rating,
          req.body.comment,
          new Date(),
        ]
      );
      const result = await pool.query(
        "UPDATE DriverBooking SET  statusRating = ?, idReview= ? WHERE idDriverBooking = ? ",
        ["Success", resdata.insertId, req.body.infor.idDriverBooking]
      );
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllReviewsBySearch = async (req, res) => {
  try {
    let typeBooking = req.query.TypeOfBooking;
    if (typeBooking === "CrossArea") {
      let result;
      if (req.query.status === "1") {
        result = await pool.query(
          `SELECT * FROM CrossAreaCarBooking WHERE idUser = ? AND statusRating IS NULL AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "CrossArea";
        });
      } else if (req.query.status === "2") {
        result = await pool.query(
          `SELECT * FROM CrossAreaCarBooking WHERE idUser = ? AND statusRating = ? AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "CrossArea";
        });
      } else {
        result = await pool.query(
          `SELECT * FROM CrossAreaCarBooking WHERE idUser = ? AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "CrossArea";
        });
      }
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    } else if (typeBooking === "CrossAreaPool") {
      // const resdata = await pool.query(
      //   `INSERT INTO review (idUser, idDriver, rating, comment, date) VALUES (?,?,?,?,?)`,
    } else if (typeBooking === "InArea") {
      let result;
      if (req.query.status === "1") {
        result = await pool.query(
          `SELECT * FROM inAreaCarBooking WHERE idUser = ? AND statusRating IS NULL AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "InArea";
        });
      } else if (req.query.status === "2") {
        result = await pool.query(
          `SELECT * FROM inAreaCarBooking WHERE idUser = ? AND statusRating = ? AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "InArea";
        });
      } else {
        result = await pool.query(
          `SELECT * FROM inAreaCarBooking WHERE idUser = ? AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "InArea";
        });
      }
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    } else if (typeBooking === "Delivery") {
      let result;
      if (req.query.status === "1") {
        result = await pool.query(
          `SELECT * FROM DeliveryCarBooking WHERE idUser = ? AND statusRating IS NULL AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "Delivery";
        });
      } else if (req.query.status === "2") {
        result = await pool.query(
          `SELECT * FROM DeliveryCarBooking WHERE idUser = ? AND statusRating = ? AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "Delivery";
        });
      } else {
        result = await pool.query(
          `SELECT * FROM DeliveryCarBooking WHERE idUser = ? AND statusApproved = ? AND Approved = ? AND statusManageCar = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "Delivery";
        });
      }
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    } else if (typeBooking === "MeetingRoom") {
      let result;
      if (req.query.status === "1") {
        result = await pool.query(
          `SELECT * FROM NewMeetingRoomBooking WHERE idUser = ? AND statusRating IS NULL AND statusApprove = ? AND statusPayment = ?`,
          [parseInt(req.query.idUser), "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "MeetingRoom";
        });
      } else if (req.query.status === "2") {
        result = await pool.query(
          `SELECT * FROM NewMeetingRoomBooking WHERE idUser = ? AND statusRating = ? AND statusApprove = ? AND statusPayment = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "MeetingRoom";
        });
      } else {
        result = await pool.query(
          `SELECT * FROM NewMeetingRoomBooking WHERE idUser = ? AND statusApprove = ? AND statusPayment = ?`,
          [parseInt(req.query.idUser), "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "MeetingRoom";
        });
      }
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    } else if (typeBooking === "DriverBooking") {
      let result;
      if (req.query.status === "1") {
        result = await pool.query(
          `SELECT * FROM DriverBooking WHERE idUser = ? AND statusRating IS NULL AND statusManageCar = ? AND statusDelivery = ?`,
          [parseInt(req.query.idUser), "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "DriverBooking";
        });
      } else if (req.query.status === "2") {
        result = await pool.query(
          `SELECT * FROM DriverBooking WHERE idUser = ? AND statusRating = ? AND statusManageCar = ? AND statusDelivery = ?`,
          [parseInt(req.query.idUser), "Success", "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "DriverBooking";
        });
      } else {
        result = await pool.query(
          `SELECT * FROM DriverBooking WHERE idUser = ? AND statusManageCar = ? AND statusDelivery = ?`,
          [parseInt(req.query.idUser), "Success", "Success"]
        );
        result.map((booking) => {
          booking.typeBooking = "DriverBooking";
        });
      }
      if (result) {
        res.status(200).send(result);
      } else {
        return res.status(404).send({ message: "Reviews can not Update" });
      }
    }
    // res.status(200).send(Reviews);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

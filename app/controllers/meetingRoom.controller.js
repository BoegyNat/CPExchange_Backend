const db = require("../models");
const pool = require("../connection.js");
const bucketService = require("../service/bucket");
exports.postNewMeetingRoom = async (req, res) => {
  const {
    nameMeetingRoom,
    place,
    province,
    numberOfPeople,
    detail,
    nameApproved,
    phone,
    email,
    price,
  } = JSON.parse(req.body.data);
  // console.log(req.body.data, req.files);
  const files = req.files;

  try {
    let lastedNewMeetingRoom = await pool.query(
      "SELECT * FROM NewMeetingRoom  ORDER BY idNewMeetingRoom DESC LIMIT 1"
    );
    let lastedidNewMeetingRoom = 0;

    if (lastedNewMeetingRoom.length == 0) {
      lastedidNewMeetingRoom = lastedidNewMeetingRoom + 1;
    } else {
      lastedidNewMeetingRoom =
        parseInt(lastedNewMeetingRoom[0].idNewMeetingRoom) + 1;
    }

    const attachment = [];
    // console.log(
    //   lastedNewMeetingRoom[0].idNewMeetingRoom,
    //   nameMeetingRoom,
    //   place,
    //   province,
    //   numberOfPeople,
    //   detail,
    //   nameApproved,
    //   phone,
    //   email,
    //   price,
    //   req.body.fields
    // );
    for (let i = 0; i < files.length; i++) {
      let fileName;
      if (i == 0) {
        fileName =
          "unknow" +
          "." +
          files[i].originalname.split(".")[
            files[i].originalname.split(".").length - 1
          ];
      } else {
        fileName =
          "unknow" +
          "(" +
          i +
          ")" +
          "." +
          files[i].originalname.split(".")[
            files[i].originalname.split(".").length - 1
          ];
      }

      bucketService.uploadFile(
        `meetingroom/${lastedidNewMeetingRoom}/${fileName}`,
        files[i]
      );
      attachment.push({
        // fileName: files[i].originalname,
        path: `${lastedidNewMeetingRoom}/${fileName}`,
      });
    }
    const rows = await pool.query(
      `
        INSERT INTO 
        NewMeetingRoom 
            (nameMeetingRoom, place, province, numberOfPeople, detail, nameManager, phoneManager, emailManager, facilities, price,imagePath) 
        VALUES 
          (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nameMeetingRoom,
        place,
        province,
        numberOfPeople,
        detail,
        nameApproved,
        phone,
        email,
        req.body.fields,
        price,
        JSON.stringify(attachment),
      ]
    );
    // const dataId = await pool.query(
    //   "SELECT idNewMeetingRoom FROM NewMeetingRoom ORDER BY idNewMeetingRoom DESC LIMIT 1;"
    // );

    // for (const val of req.body[2]) {
    //   const row = await pool.query(
    //     `
    //         INSERT INTO
    //         NewMeetingRoomImage
    //             (imageBase64, idNewMeetingRoom)
    //         VALUES
    //           (?,?)`,
    //     [val, dataId[0].idNewMeetingRoom]
    //   );
    // }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postNewMeetingRoomBooking = async (req, res) => {

  try {
    const {
      idUser,
      startDate,
      endDate,
      timeStart,
      timeEnd,
      numOfPeople,
      totalPrice,
      idMeetingRoom,
    } = req.body[0];
    // console.log(startDate,timeStart)
    // console.log((new Date(startDate+", " + timeStart)).toString())
    const data = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
      idUser,
    ]);
    const nameUser = data[0].fNameThai;
    const phoneUser = data[0].mobileNumber;
    const emailUser = data[0].email;
    const rows = await pool.query(
      `
        INSERT INTO 
        NewMeetingRoomBooking 
            (idUser,
              nameUser,
              phoneUser,
              emailUser, startDate, endDate, timeStart, timeEnd, numOfPeople, totalPrice, idMeetingRoom) 
        VALUES 
          (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        idUser,
        nameUser,
        phoneUser,
        emailUser,
        (new Date(startDate+", " + timeStart)).toString(),
        (new Date(endDate+", " + timeEnd)).toString(),
        timeStart,
        timeEnd,
        numOfPeople,
        totalPrice,
        idMeetingRoom,
      ]
    );
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllNewMeetingRoom = async (req, res) => {
  try {
    let row = await pool.query("SELECT * FROM NewMeetingRoom");
    let dataResult = [];
    if (row) {
      dataResult = await Promise.all(
        row.map(async (t, index) => {
          if (JSON.parse(t.imagePath).length > 0) {
            let datapath = await bucketService.getSignedUrl(
              `meetingroom/${JSON.parse(t.imagePath)[0].path}`
            );
            return {
              ...t,
              fileUrl: datapath,
            };
          } else {
            return {
              ...t,
              fileUrl: [],
            };
          }
        })
      );
    }
    if (dataResult.length > 0) {
      res.status(200).send(dataResult);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllMeetingRoomById = async (req, res) => {
  try {
    let row = await pool.query(
      "SELECT * FROM NewMeetingRoom WHERE idNewMeetingRoom = ?",
      [req.params.id]
    );
    if (row) {
      const data = JSON.parse(row[0].imagePath);
      if (data.length > 0) {
        row[0].fileUrl = await Promise.all(
          data.map(async (value) => {
            let datapath = await bucketService.getSignedUrl(
              `meetingroom/${value.path}`
            );

            return datapath;
          })
        );
      } else {
        row[0].fileUrl = [];
      }
    }

    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllImageNewMeetingRoomById = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM NewMeetingRoomImage WHERE idNewMeetingRoom = ?",
      [req.params.id]
    );
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getMeetingRoomBookingByIdUser = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM NewMeetingRoomBooking WHERE idUser = ? ",
      [req.params.idUser]
    );
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllNewMeetingRoomBooking = async (req, res) => {
  try {
    const row = await pool.query("SELECT * FROM NewMeetingRoomBooking");
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllMeetingRoomBookingAndAllMeetingRoom = async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT * FROM NewMeetingRoomBooking JOIN NewMeetingRoom WHERE NewMeetingRoomBooking.idMeetingRoom = NewMeetingRoom.idNewMeetingRoom"
    );
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postApprovedlMeetingRoomBooking = async (req, res) => {
  try {
    // console.log("postApprovedlMeetingRoomBooking", req.body);

    const rows = await pool.query(
      "UPDATE NewMeetingRoomBooking SET  statusApprove = ? WHERE idNewMeetingRoomBooking = ? ",
      [req.body.status, req.body.idBooking]
    );

    if (rows) {
      const result = await pool.query("SELECT * FROM NewMeetingRoomBooking");
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getMeetingRoomBookingByIdUserForRating = async (req, res) => {
  try {
    // let row = await pool.query("SELECT * FROM NewMeetingRoomBooking WHERE idUser = ?", [req.params.idUser]);
    let row = await pool.query(
      "SELECT * FROM NewMeetingRoomBooking join NewMeetingRoom ON NewMeetingRoomBooking.idMeetingRoom = NewMeetingRoom.idNewMeetingRoom WHERE idUser = ?",
      [req.params.idUser]
    );

    // let result = row.filter(booking => booking.idUser == req.params.idUser);
    if (row.length > 0) {
      row.map((booking) => {
        // booking.user = Users.find( user => user.idUser == booking.idUser );
        // booking.vehicleBrandsAndModels = VehicleBrandsAndModels.find( vehicle => vehicle.id == booking.idVehicleBrandAndModel );
        // booking.vehicleTypes = VehicleTypes.find( vehicle => vehicle.id == booking.idTypeCar);
        // booking.passengers = CrossAreaCarBookingPassengers.filter( booking => booking.idCrossAreaCarBooking == booking.id);
        booking.typeBooking = "MeetingRoom";
      });
      res.status(200).send(row);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getMeetingRoomBookingByFilter = async (req, res) => {
  try {
    const { name, status, startdate, idUser } = req.body;
    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM NewMeetingRoomBooking  WHERE idUser = ?",
        [idUser]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM NewMeetingRoomBooking WHERE
                LOWER(NewMeetingRoomBooking.nameUser) LIKE '%${name.toLowerCase()}%' AND idUser = ?`,
        [idUser]
      );
    }

    if (status === "ทั้งหมด") {
      result = result;
    } else if (status === "Waiting") {
      result = result.filter(
        (booking) =>
          booking.statusApprove != "Success" ||
          booking.Approved != "Success" ||
          booking.statusManageCar ||
          "Success"
      );
    } else if (status === "Approved") {
      result = [];
    }

    if (startdate === null) {
      result = result;
    } else if (startdate != null) {
      result = result.filter(
        (value) => startdate === JSON.stringify(new Date(value.startDate)).slice(1, 11)
      );
    }
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send("Not Found Booking");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getAllMeetingRoomBookingByIdMeetingRoom = async (req, res) => {
  try {
    // console.log(new Date().toISOString().substring(0, 10))
    
    let row = await pool.query(
      "SELECT * FROM NewMeetingRoomBooking WHERE idMeetingRoom = ? ",
      [parseInt(req.params.id)]
    );


    row = row.filter((value)=> ((new Date(value.startDate)).toString().substring(0, 15) === (new Date()).toString().substring(0, 15) ))
    // row = row.filter((value)=> console.log((new Date(value.startDate)).toString().substring(0, 15) === (new Date()).toString().substring(0, 15) ))

    // console.log(new Date(row[0].startDate).toISOString().substring(0, 10))
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(200).send(row);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.getAllMeetingRoomBooking = async (req, res) => {
  try {
    // console.log(new Date().toISOString().substring(0, 10))
    
    let row = await pool.query(
      "SELECT * FROM NewMeetingRoomBooking WHERE idMeetingRoom = ? ",
      [parseInt(req.params.id)]
    );


    row = row.filter((value)=> ((new Date(value.startDate)).toString().substring(0, 15) === (new Date()).toString().substring(0, 15) ))
    // row = row.filter((value)=> console.log((new Date(value.startDate)).toString().substring(0, 15) === (new Date()).toString().substring(0, 15) ))

    // console.log(new Date(row[0].startDate).toISOString().substring(0, 10))
    if (row.length > 0) {
      res.status(200).send(row);
    } else {
      res.status(200).send(row);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
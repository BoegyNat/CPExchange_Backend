const db = require("../models");
const DeliverySampleshuttle = db.deliverySampleshyttle;
const Users = db.users;
const VehicleBrandsAndModels = db.vehicleBrandsAndModels;
const VehicleTypes = db.vehicleTypes;
const fs = require("fs");
const path = require("path");
const bucketService = require("../service/bucket");

const pool = require("../connection.js");

setInterval(async () => {
  const rows = await pool.query("SELECT * FROM DeliverySampleShuttle");
  const today = new Date().getTime();
  for (let i = 0; i < rows.length; i++) {
    const date = new Date(rows[i].date).getTime() + 2592000000;
    if (date < today && rows[i].isExp === 0) {
      const deleteFiles = JSON.parse(rows[i].path);
      for (let j = 0; j < deleteFiles.length; j++) {
        bucketService.deleteFile(
          `deliverySampleShuttle/${deleteFiles[j].path}`
        );
      }
      const result = await pool.query(
        "UPDATE DeliverySampleShuttle SET isExp = ? WHERE idDeliverySampleShuttle = ?",
        [1, rows[i].idDeliverySampleShuttle]
      );
    }
  }
}, 86400000); //ลบไฟล์เก่าทุกๆ 24 ชั่วโมง

const getUrlFormPath = async (rows, id) => {
  for (let i = 0; i < rows.length; i++) {
    let urlFiles = [];
    const pathArray = JSON.parse(rows[i].path);
    await Promise.all(
      pathArray.map(async (element) => {
        urlFiles.push(
          await bucketService.getSignedUrl(
            `deliverySampleShuttle/${element.path}`
          )
        );
        return Promise.resolve();
      })
    );
    rows[i].urlFiles = urlFiles;
  }
  // console.log(id);
  return rows;
};

exports.getDeliverySampleshuttleAll = async (req, res) => {
  const rows = await pool.query(
    "SELECT * FROM DeliverySampleShuttle WHERE idUser = ?",
    [req.params.IdU]
  );
  const result = await getUrlFormPath(rows, 1);
  return res.status(200).json(result);
};

exports.getDeliverySampleshuttleByIdUser = async (req, res) => {
  const rows = await pool.query(
    "SELECT * FROM DeliverySampleShuttle WHERE idUser = ? OR idRecipient = ?",
    [req.params.IdUser, req.params.IdUser]
  );
  const result = await getUrlFormPath(rows, 2);
  return res.status(200).json(result);
};
exports.getDeliverySampleShuttleByNo = async (req, res) => {
  try {
    const rows = await pool.query(
      "SELECT * FROM DeliverySampleShuttle  ORDER BY idDeliverySampleShuttle DESC LIMIT 1"
    );
    const result = await getUrlFormPath(rows, 3);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliverySampleshuttleByIdDriver = async (req, res) => {
  const rows = await pool.query(
    "SELECT * FROM DeliverySampleShuttle WHERE idDriver = ? or idDriver is NULL",
    [req.params.IdDriver]
  );
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].idDriver) {
      const driver = await pool.query("SELECT * FROM Users WHERE idUser = ?", [
        rows[i].idDriver,
      ]);
      rows[i].driver = driver[0];
    } else {
      rows[i].driver = null;
    }
    const User = await pool.query(
      "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
      [rows[i].idUser]
    );
    rows[i].user = User[0];
    if (rows[i].idSender) {
      const Sender = await pool.query(
        "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
        [rows[i].idRecipient]
      );
      rows[i].sender = Sender[0];
    } else {
      rows[i].sender = null;
    }

    const fromPlace = await pool.query(
      "SELECT * FROM ScgSite WHERE idScgSite = ?",
      [rows[i].fromPlace]
    );
    const toPlace = await pool.query(
      "SELECT * FROM ScgSite WHERE idScgSite = ?",
      [rows[i].toPlace]
    );
    rows[i].fromPlaceName =
      fromPlace[0].noSite !== null
        ? `Site${fromPlace[0].noSite}: ${fromPlace[0].nameSite}`
        : `${fromPlace[0].nameSite}`;
    rows[i].toPlaceName =
      toPlace[0].noSite !== null
        ? `Site${toPlace[0].noSite}: ${toPlace[0].nameSite}`
        : `${toPlace[0].nameSite}`;
  }
  const result = await getUrlFormPath(rows, 4);
  // console.log(rows, "llll")
  // if(typeof rows[1] === 'undefined'){
  //     const rows = await pool.query("SELECT * FROM DeliverySampleShuttle WHERE idDriver IS NULL")
  //     return res.status(200).json(rows);
  // }
  // else {
  // let data = rows.find(row => row.status === "ส่งสินค้าเรียบร้อย")
  // console.log(data, "hhhh")

  // if(typeof data[1] !== 'undefined'){
  //     return res.status(200).json(rows);
  // }
  // else{
  //     const rows = await pool.query("SELECT * FROM DeliverySampleShuttle WHERE idDriver IS NULL")
  //     return res.status(200).json(rows);
  // }
  // const rows = await pool.query("SELECT * FROM DeliverySampleShuttle");
  return res.status(200).json(result);

  // }
};

exports.getDeliverySampleshuttleByIdBooking = async (req, res) => {
  const rows = await pool.query(
    "SELECT * FROM DeliverySampleShuttle WHERE idDeliverySampleShuttle = ?",
    [req.params.IdBooking]
  );

  const fromPlace = await pool.query(
    "SELECT * FROM ScgSite WHERE idScgSite = ?",
    [rows[0].fromPlace]
  );
  const toPlace = await pool.query(
    "SELECT * FROM ScgSite WHERE idScgSite = ?",
    [rows[0].toPlace]
  );
  rows[0].fromPlaceName =
    fromPlace[0].noSite !== null
      ? `Site${fromPlace[0].noSite}: ${fromPlace[0].nameSite}`
      : `${fromPlace[0].nameSite}`;
  rows[0].toPlaceName =
    toPlace[0].noSite !== null
      ? `Site${toPlace[0].noSite}: ${toPlace[0].nameSite}`
      : `${toPlace[0].nameSite}`;

  const result = await getUrlFormPath(rows, 5);
  return res.status(200).json(result[0]);
};

exports.postDeliverySampleshuttleByStartDate = async (req, res) => {
  console.log(req.body);
  const {
    IdUser,
    IdDriver,
    NameSample,
    NameGrade,
    LotNumber,
    idSender,
    NameSender,
    PhoneSender,
    date,
    startTime,
    fromPlace,
    toPlace,
    idRecipient,
    NameRecipient,
    PhoneRecipient,
    detail,
    status,
    no,
  } = JSON.parse(req.body.mydata);
  const files = req.files;
  let lastedDeliverySampleShuttle = await pool.query(
    "SELECT * FROM DeliverySampleShuttle  ORDER BY idDeliverySampleShuttle DESC LIMIT 1"
  );
  let lastedDeliverySampleShuttleId = 0;
  if (lastedDeliverySampleShuttle.length == 0) {
    lastedDeliverySampleShuttleId = lastedDeliverySampleShuttleId + 1;
  } else {
    lastedDeliverySampleShuttleId =
      parseInt(lastedDeliverySampleShuttle[0].idDeliverySampleShuttle) + 1;
  }
  // if (
  //   fs.existsSync(
  //     path.join(
  //       __dirname,
  //       `../image/deliverySampleShuttle/${lastedDeliverySampleShuttleId}`
  //     )
  //   )
  // ) {
  //   fs.rmSync(
  //     path.join(
  //       __dirname,
  //       `../image/deliverySampleShuttle/${lastedDeliverySampleShuttleId}`
  //     ),
  //     { recursive: true, force: true }
  //   );
  // }
  // fs.mkdirSync(
  //   path.join(
  //     __dirname,
  //     `../image/deliverySampleShuttle/${lastedDeliverySampleShuttleId}`
  //   )
  // );

  const attachment = [];

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
      const d = new Date();
      let ms = d.getMilliseconds();
      fileName =
        "unknow" +
        "(" +
        (i * 1000 + ms) +
        ")" +
        "." +
        files[i].originalname.split(".")[
          files[i].originalname.split(".").length - 1
        ];
    }
    // let filePath = path.join(
    //   __dirname,
    //   `../image/deliverySampleShuttle/${lastedDeliverySampleShuttleId}/${fileName}`
    // );
    // fs.writeFileSync(filePath, files[i].buffer);
    // console.log(filePath);
    bucketService.uploadFile(
      `deliverySampleShuttle/${lastedDeliverySampleShuttleId}/${fileName}`,
      files[i]
    );
    attachment.push({
      fileName: files[i].originalname,
      path: `${lastedDeliverySampleShuttleId}/${fileName}`,
    });
  }
  await pool
    .query(
      `
      INSERT INTO
      DeliverySampleShuttle
          (idUser,idDriver,no,nameSample, nameGrade, lotNumber,idSender, nameSender, phonesender, date, startTime, fromPlace, toPlace,idRecipient, nameRecipient, phoneRecipient, detail,status,path)
      VALUES
          (?,?,?,?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`,
      [
        IdUser,
        IdDriver,
        no,
        NameSample,
        NameGrade,
        LotNumber,
        idSender,
        NameSender,
        PhoneSender,
        date,
        startTime,
        fromPlace,
        toPlace,
        idRecipient,
        NameRecipient,
        PhoneRecipient,
        detail,
        status,
        JSON.stringify(attachment),
      ]
    )
    .then((rows) => {
      if (rows.insertId > 0) {
        return res.status(200).send({
          type: "success",
          msg: "Input success",
          returnData: {
            IdUser: IdUser,
            IdDriver: IdDriver,
            NameSample: NameSample,
            PhoneSender: PhoneSender,
            LotNumber: LotNumber,
            idSender: idSender,
            NameSender: NameSender,
            date: date,
            startTime: startTime,
            fromPlace: fromPlace,
            toPlace: toPlace,
            idRecipient: idRecipient,
            NameRecipient: NameRecipient,
            PhoneRecipient: PhoneRecipient,
            detail: detail,
            status: status,
            no: no,
          },
        });
      } else {
        return res.status(200).send({ type: "false", msg: "Input false" });
      }
    });
};

exports.postUpdateDeliveryStatus = async (req, res) => {
  const check = await pool.query(
    "SELECT status FROM DeliverySampleShuttle WHERE idDeliverySampleShuttle = ?",
    [req.body.newData.id]
  );
  // console.log("check", check[0].status)

  if (check[0].status == "รอรับสินค้า") {
    const rows = await pool.query(
      "UPDATE DeliverySampleShuttle SET  status = ?, idDriver = ? WHERE idDeliverySampleShuttle = ? ",
      ["รับสินค้าเรียบร้อย", req.body.newData.idDriver, req.body.newData.id]
    );
    return res.status(200).send({ type: "success", msg: "update success" });
  } else if (check[0].status == "รับสินค้าเรียบร้อย") {
    const rows = await pool.query(
      "UPDATE DeliverySampleShuttle SET sendDate = ? ,status = ? WHERE idDeliverySampleShuttle = ? ",
      [new Date(), "ส่งสินค้าเรียบร้อย", req.body.newData.id]
    );
    return res.status(200).send({ type: "success", msg: "update success" });
  } else {
    const rows = await pool.query(
      "UPDATE DeliverySampleShuttle SET status = ? WHERE idDeliverySampleShuttle = ? ",
      ["ได้รับสินค้าเรียบร้อย", req.body.newData.id]
    );
    return res.status(200).send({ type: "success", msg: "update success" });
  }
};

exports.getDeliverySampleShuttleByFilter = async (req, res) => {
  try {
    const { nameSample, fromSite, toSite, status, startdate, enddate, idUser } =
      req.body;
    // console.log(nameSample, fromSite, toSite, status, startdate, enddate);
    let result;
    if (nameSample === "") {
      result = await pool.query(
        "SELECT * FROM DeliverySampleShuttle WHERE idUser = ? OR idRecipient = ?",
        [idUser, idUser]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM DeliverySampleShuttle WHERE
      LOWER(DeliverySampleShuttle.nameSample) LIKE '%${nameSample.toLowerCase()}%' AND (idUser = ? OR idRecipient = ?)`,
        [idUser, idUser]
      );
    }

    if (fromSite === "ทั้งหมด") {
      result = result;
    } else {
      result = result.filter((value) => parseInt(value.fromPlace) === fromSite);
    }

    if (toSite === "ทั้งหมด") {
      result = result;
    } else {
      result = result.filter((value) => parseInt(value.toPlace) === toSite);
    }

    if (status === "ทั้งหมด") {
      result = result;
    } else if (status === "รอรับสินค้า") {
      result = result.filter((value) => value.status === "รอรับสินค้า");
    } else if (status === "รับสินค้าเรียบร้อย") {
      result = result.filter((value) => value.status === "รับสินค้าเรียบร้อย");
    } else if (status === "ส่งสินค้าเรียบร้อย") {
      result = result.filter((value) => value.status === "ส่งสินค้าเรียบร้อย");
    } else if (status === "ได้รับสินค้าเรียบร้อย") {
      result = result.filter(
        (value) => value.status === "ได้รับสินค้าเรียบร้อย"
      );
    }

    if (startdate === null && enddate === null) {
      result = result;
    } else if (startdate != null && enddate === null) {
      result = result.filter(
        (value) =>
          startdate < value.date.slice(0, 10) ||
          startdate === value.date.slice(0, 10)
      );
    } else if (startdate != null && enddate != null) {
      console.log("in");
      result = result.filter(
        (value) =>
          startdate < value.date.slice(0, 10) ||
          startdate === value.date.slice(0, 10)
      );
      result = result.filter(
        (value) =>
          enddate > value.date.slice(0, 10) ||
          enddate === value.date.slice(0, 10)
      );
    } else if (startdate === null && enddate != null) {
      console.log("in");
      result = result.filter(
        (value) =>
          enddate > value.date.slice(0, 10) ||
          enddate === value.date.slice(0, 10)
      );
    }
    for (let i = 0; i < result.length; i++) {
      if (result[i].idDriver) {
        const driver = await pool.query(
          "SELECT * FROM Users WHERE idUser = ?",
          [result[i].idDriver]
        );
        result[i].driver = driver[0];
      } else {
        result[i].driver = null;
      }
      const User = await pool.query(
        "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
        [result[i].idUser]
      );
      result[i].user = User[0];
      if (result[i].idSender) {
        const Sender = await pool.query(
          "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
          [result[i].idRecipient]
        );
        result[i].sender = Sender[0];
      } else {
        result[i].sender = null;
      }

      const fromPlace = await pool.query(
        "SELECT * FROM ScgSite WHERE idScgSite = ?",
        [result[i].fromPlace]
      );
      const toPlace = await pool.query(
        "SELECT * FROM ScgSite WHERE idScgSite = ?",
        [result[i].toPlace]
      );
      result[i].fromPlaceName =
        fromPlace[0].noSite !== null
          ? `Site${fromPlace[0].noSite}: ${fromPlace[0].nameSite}`
          : `${fromPlace[0].nameSite}`;
      result[i].toPlaceName =
        toPlace[0].noSite !== null
          ? `Site${toPlace[0].noSite}: ${toPlace[0].nameSite}`
          : `${toPlace[0].nameSite}`;
    }
    const final_result = await getUrlFormPath(result, 6);
    if (result.length > 0) {
      return res.status(200).send({
        type: "success",
        msg: "get data success",
        data: { final_result },
      });
    } else {
      return res
        .status(200)
        .send({ type: "no success", msg: "no data", data: { final_result } });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postEditDeliverySampleShuttle = async (req, res) => {
  try {
    const {
      //เปลี่ยนเป็น Object จะเร็วขึ้น
      IdUser,
      IdDriver,
      NameSample,
      NameGrade,
      LotNumber,
      idSender,
      NameSender,
      PhoneSender,
      date,
      startTime,
      fromPlace,
      toPlace,
      idRecipient,
      NameRecipient,
      PhoneRecipient,
      detail,
      status,
      no,
      deleteOldFile,
    } = JSON.parse(req.body.mydata);

    const idDeliverySampleShuttle = req.params.IdDeliverySampleShuttle;
    const files = req.files;
    // if (
    //   fs.existsSync(
    //     //check ว่ามีไฟล์อยู่ไหม
    //     path.join(
    //       __dirname,
    //       `../image/deliverySampleShuttle/${idDeliverySampleShuttle}`
    //     )
    //   )
    // ) {
    //   fs.rmSync(
    //     //ลบไฟล์และไดเร็กทอรี
    //     path.join(
    //       __dirname,
    //       `../image/deliverySampleShuttle/${idDeliverySampleShuttle}`
    //     ),
    //     { recursive: true, force: true }
    //   );
    // }
    // fs.mkdirSync(
    //   //สร้างไดเร็กทอรี
    //   path.join(
    //     __dirname,
    //     `../image/deliverySampleShuttle/${idDeliverySampleShuttle}`
    //   )
    // );
    console.log("start");
    const [stringPath] = await pool.query(
      "SELECT path FROM DeliverySampleShuttle WHERE idDeliverySampleShuttle = ?",
      [idDeliverySampleShuttle]
    );
    let attachment = JSON.parse(stringPath.path);
    console.log("end attachment : " + attachment);
    console.log(deleteOldFile);
    if (files.length > 0) {
      console.log("add files");
      for (let i = 0; i < files.length; i++) {
        let fileName;
        if (i == 0 && attachment.length == 0) {
          fileName =
            "unknow" +
            "." +
            files[i].originalname.split(".")[
              files[i].originalname.split(".").length - 1
            ];
        } else {
          const d = new Date();
          let ms = d.getMilliseconds();
          fileName =
            "unknow" +
            "(" +
            ((i + attachment.length + 1) * 1000 + ms) +
            ")" +
            "." +
            files[i].originalname.split(".")[
              files[i].originalname.split(".").length - 1
            ];
        }
        // let filePath = path.join(
        //   __dirname,
        //   `../image/deliverySampleShuttle/${idDeliverySampleShuttle}/${fileName}`
        // );
        // fs.writeFileSync(filePath, files[i].buffer);
        bucketService.uploadFile(
          `deliverySampleShuttle/${idDeliverySampleShuttle}/${fileName}`,
          files[i]
        );
        console.log(attachment);
        console.log("123456789");
        attachment.push({
          //ตรงนี้พัง!!!!!!!!!!!!!!
          fileName: files[i].originalname,
          path: `${idDeliverySampleShuttle}/${fileName}`,
        });
      }
    }
    console.log("1111111111");
    //deleteOldFile
    if (deleteOldFile) {
      console.log("0");
      let attachment_Temp = attachment;
      console.log(attachment);
      console.log(attachment_Temp);
      for (let i = 0; i < deleteOldFile.length; i++) {
        console.log("1");
        bucketService.deleteFile(
          `deliverySampleShuttle/${deleteOldFile[i].path}`
        );
        let attachment_Temp2 = [];
        console.log("2");
        for (let j = 0; j < attachment_Temp.length; j++) {
          console.log(deleteOldFile[i].path);
          if (attachment_Temp[j].path !== deleteOldFile[i].path) {
            attachment_Temp2.push(attachment_Temp[j]);
            console.log(attachment_Temp[j]);
          }
        }
        attachment_Temp = attachment_Temp2;
      }
      console.log(attachment_Temp);
      attachment = attachment_Temp;
      console.log("deleteOldFile");
      console.log(deleteOldFile[0].path);
    }

    console.log(attachment);
    const result = await pool
      .query(
        "UPDATE DeliverySampleShuttle SET nameSample = ? , nameGrade = ? , lotNumber = ? , idSender = ?, nameSender = ? , phoneSender = ? , date = ? , startTime = ? , fromPlace = ? , toPlace = ? , idRecipient = ?, nameRecipient = ? , phoneRecipient = ? , detail = ? , status = ? , path = ? WHERE idDeliverySampleShuttle = ?",
        [
          NameSample,
          NameGrade,
          LotNumber,
          idSender,
          NameSender,
          PhoneSender,
          date,
          startTime,
          fromPlace,
          toPlace,
          idRecipient,
          NameRecipient,
          PhoneRecipient,
          detail,
          status,
          JSON.stringify(attachment),
          idDeliverySampleShuttle,
        ]
      )
      .then((rows) => {
        if (rows) {
          return res.status(200).send({
            type: "success",
            msg: "Input success",
            returnData: {
              IdUser: IdUser,
              IdDriver: IdDriver,
              NameSample: NameSample,
              PhoneSender: PhoneSender,
              LotNumber: LotNumber,
              idSender: idSender,
              NameSender: NameSender,
              date: date,
              startTime: startTime,
              fromPlace: fromPlace,
              toPlace: toPlace,
              idRecipient: idRecipient,
              NameRecipient: NameRecipient,
              PhoneRecipient: PhoneRecipient,
              detail: detail,
              status: status,
              no: no,
            },
          });
        } else {
          return res.status(200).send({ type: "false", msg: "Input false" });
        }
      });
    console.log("finished");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postDeleteDeliverySampleShuttle = async (req, res) => {
  try {
    const id = req.body.myData.id;
    const list = await pool.query("SELECT * FROM DeliverySampleShuttle");
    const check = list.find((value) => value.idDeliverySampleShuttle === id);
    console.log(check);
    if (check) {
      const deleteFiles = JSON.parse(check.path);
      for (let i = 0; i < deleteFiles.length; i++) {
        bucketService.deleteFile(
          `deliverySampleShuttle/${deleteFiles[i].path}`
        );
        console.log(deleteFiles[i].path);
      }
      const result = await pool.query(
        "DELETE FROM DeliverySampleShuttle WHERE idDeliverySampleShuttle = ?",
        [id]
      );
      return res
        .status(200)
        .send({ type: "success", msg: "delete success", data: { result } });
    } else {
      return res
        .status(200)
        .send({ type: "no success", msg: "no data", data: { result } });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDeliverySampleShuttleByFilterByIdDriver = async (req, res) => {
  try {
    const { name, startdate, enddate, idDriver } = req.body;
    // console.log(nameSample, fromSite, toSite, status, startdate, enddate);
    let result;
    if (name === "") {
      result = await pool.query(
        "SELECT * FROM DeliverySampleShuttle WHERE idDriver = ?",
        [idDriver]
      );
    } else {
      result = await pool.query(
        `SELECT  * FROM DeliverySampleShuttle WHERE
      LOWER(DeliverySampleShuttle.nameSender) LIKE '%${name.toLowerCase()}%' AND idDriver = ?`,
        [idDriver]
      );
    }

    if (startdate === null && enddate === null) {
      result = result;
    } else if (startdate != null && enddate === null) {
      result = result.filter(
        (value) =>
          startdate < value.date.slice(0, 10) ||
          startdate === value.date.slice(0, 10)
      );
    } else if (startdate != null && enddate != null) {
      result = result.filter(
        (value) =>
          startdate < value.date.slice(0, 10) ||
          startdate === value.date.slice(0, 10)
      );
      result = result.filter(
        (value) =>
          enddate > value.date.slice(0, 10) ||
          enddate === value.date.slice(0, 10)
      );
    } else if (startdate === null && enddate != null) {
      console.log("in");
      result = result.filter(
        (value) =>
          enddate > value.date.slice(0, 10) ||
          enddate === value.date.slice(0, 10)
      );
    }
    for (let i = 0; i < result.length; i++) {
      if (result[i].idDriver) {
        const driver = await pool.query(
          "SELECT * FROM Users WHERE idUser = ?",
          [result[i].idDriver]
        );
        result[i].driver = driver[0];
      } else {
        result[i].driver = null;
      }
      const User = await pool.query(
        "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
        [result[i].idUser]
      );
      result[i].user = User[0];
      if (result[i].idSender) {
        const Sender = await pool.query(
          "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL)",
          [result[i].idRecipient]
        );
        result[i].sender = Sender[0];
      } else {
        result[i].sender = null;
      }

      const fromPlace = await pool.query(
        "SELECT * FROM ScgSite WHERE idScgSite = ?",
        [result[i].fromPlace]
      );
      const toPlace = await pool.query(
        "SELECT * FROM ScgSite WHERE idScgSite = ?",
        [result[i].toPlace]
      );
      result[i].fromPlaceName =
        fromPlace[0].noSite !== null
          ? `Site${fromPlace[0].noSite}: ${fromPlace[0].nameSite}`
          : `${fromPlace[0].nameSite}`;
      result[i].toPlaceName =
        toPlace[0].noSite !== null
          ? `Site${toPlace[0].noSite}: ${toPlace[0].nameSite}`
          : `${toPlace[0].nameSite}`;
    }

    console.log(result);
    const final_result = await getUrlFormPath(result, 6);
    console.log(final_result);
    if (final_result.length > 0) {
      return res
        .status(200)
        .send({ type: "success", msg: "have data", data: final_result });
    } else {
      return res
        .status(200)
        .send({ type: "no success", msg: "no data", data: {} });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

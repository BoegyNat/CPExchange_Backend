const db = require("../../models");
const User = db.users;
const Maintenances = db.maintenances;
const MaintenanceTechnicians = db.maintenanceTechnicians;
const MaintenanceDeliveries = db.maintenanceProgressReport;
const MaintenanceNotificationTypes = db.maintenanceNotificationTypes;
const MaintenanceNotifications = db.maintenanceNotifications;

const fs = require("fs");
const path = require("path");

const bucketService = require("../../service/bucket");

const pool = require("../../connection.js");
const { da } = require("date-fns/locale");

//add new maintenance request
exports.addNewMaintenanceRequest = async (req, res) => {
  console.log(req)
  try {
    const {
      idUser,
      maintenanceType,
      requestorName,
      phoneNumber,
      email,
      company,
      agency,
      costCenter,
      costElement,
      location,
      locationDetail,
      startDate,
      description,
    } = req.body;
    const createdAt = new Date();
    const updatedAt = new Date();
    const files = req.files;

    if (
      !maintenanceType ||
      !requestorName ||
      !phoneNumber ||
      !email ||
      !company ||
      !agency ||
      !costCenter ||
      !costElement ||
      !location ||
      !locationDetail ||
      !startDate ||
      !description
    ) {
      return res.status(500).send({
        success: false,
        error: "incomplete information",
      });
    }

    // let lastedMaintenanceId = Maintenances.length > 0 ? +(Maintenances[Maintenances.length-1].id + 1) : 1;
    let lastedMaintenance = await pool.query(
      "SELECT * FROM Maintenances  ORDER BY idMaintenances DESC LIMIT 1"
    );
    let lastedMaintenanceId = 0;

    if (lastedMaintenance.length == 0) {
      lastedMaintenanceId = lastedMaintenanceId + 1;
    } else {
      lastedMaintenanceId = parseInt(lastedMaintenance[0].idMaintenances) + 1;
    }
    if (
      fs.existsSync(
        path.join(__dirname, `../../file/maintenance/${lastedMaintenanceId}`)
      )
    ) {
      fs.rmSync(
        path.join(__dirname, `../../file/maintenance/${lastedMaintenanceId}`),
        { recursive: true, force: true }
      );
    }
    fs.mkdirSync(
      path.join(__dirname, `../../file/maintenance/${lastedMaintenanceId}`)
    );

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
      let filePath = path.join(
        __dirname,
        `../../file/maintenance/${lastedMaintenanceId}/${fileName}`
      );
      fs.writeFileSync(filePath, files[i].buffer);
      bucketService.uploadFile(
        `maintenance/${lastedMaintenanceId}/${fileName}`,
        files[i]
      );
      attachment.push({
        // fileName: files[i].originalname,
        path: `${lastedMaintenanceId}/${fileName}`,
      });
    }
    const rows = await pool.query(
      `
				  INSERT INTO 
				  Maintenances 
					  (idUser, maintenanceType, requestorName, phoneNumber, email, company, agency,
						costCenter, costElement, location, locationDetail, startDate, description, status, progress,createdAt,updatedAt,attachment,technicianId) 
				  VALUES 
					  (?,?,?,?,?,?,?,?,?,?,?,?,?,"1",0,?,?,?,"[]")`,
      [
        idUser,
        maintenanceType,
        requestorName,
        phoneNumber,
        email,
        company,
        agency,
        costCenter,
        costElement,
        location,
        locationDetail,
        startDate,
        description,
        createdAt,
        updatedAt,
        JSON.stringify(attachment),
      ]
    );

    if (rows) {
      const newMaintenance = {
        idMaintenances: lastedMaintenanceId,
        userId: +req.body.idUser,
        maintenanceType: +req.body.maintenanceType,
        requestorName: req.body.requestorName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        company: req.body.company,
        agency: req.body.agency,
        costCenter: req.body.costCenter,
        costElement: req.body.costElement,
        location: req.body.location,
        locationDetail: req.body.locationDetail,
        startDate: new Date(req.body.startDate),
        description: req.body.description,
        attachment: attachment,
        status: 1,
        progress: 0,
        technicianId: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return res.status(200).send({
        success: true,
        data: newMaintenance,
        error: null,
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

//get all my history requested maintenance
exports.getAllMyHistoryMaintenanceRequest = async (req, res) => {
  try {
    if (Object.keys(req.query).length == 1) {
      const result = await pool.query(
        "SELECT * FROM Maintenances WHERE idUser = ?",
        [req.query.idUser]
      );
      if (result) {
        return res.status(200).send({
          success: true,
          data: result,
          error: null,
        });
      } else {
        return res.status(404).send({ error: "Not found Maintenance" });
      }
    } else {
      let result = await pool.query(
        "SELECT * FROM Maintenances WHERE idUser = ?",
        [req.query.idUser]
      );
      if (req.query.maintenanceType) {
        result = result.filter(
          (m) =>
            parseInt(m.maintenanceType) === +parseInt(req.query.maintenanceType)
        );
      }
      if (req.query.status) {
        result = result.filter(
          (m) => parseInt(m.status) === +parseInt(req.query.status)
        );
      }
      if (req.query.date) {
        result = result.filter((m) => {
          const checkDate = new Date(m.createdAt);
          const compareDate = new Date(req.query.date.replace(/\"/g, ""));
          return (
            checkDate.getFullYear() === compareDate.getFullYear() &&
            checkDate.getMonth() === compareDate.getMonth() &&
            checkDate.getDate() === compareDate.getDate()
          );
        });
      }
      if (result) {
        return res.status(200).send({
          success: true,
          data: result,
          error: null,
        });
      } else {
        return res.status(404).send({ error: "Not found Maintenance" });
      }
    }
    // const { maintenanceType, status, date } = req.query;
    // let result = Maintenances.filter(
    //   (m) => m.userId === +req.params.currentId
    // ).reverse();
    // if (maintenanceType) {
    //   result = result.filter((m) => m.maintenanceType === +maintenanceType);
    // }

    // if (status) {
    //   result = result.filter((m) => m.status === +status);
    // }

    // if (date) {
    //   result = result.filter((m) => {
    //     const checkDate = new Date(m.createdAt);
    //     const compareDate = new Date(date.replace(/\"/g, ""));
    //     return (
    //       checkDate.getFullYear() === compareDate.getFullYear() &&
    //       checkDate.getMonth() === compareDate.getMonth() &&
    //       checkDate.getDate() === compareDate.getDate()
    //     );
    //   });
    // }
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

//get all requested maintenance
exports.getAllMaintenanceRequest = async (req, res) => {
  try {
    // console.log(req.query)
    // const authorized = User.find((u) => +req.params.currentId === u.id);
    // if (!authorized.authorities.includes("ROLE_ADMIN")) {
    //   return res.status(403).send({
    //     success: false,
    //     error: "no permission to access",
    //   });
    // }

    const { maintenanceType, status, date } = req.query;
    // let result = [...Maintenances].reverse();
    let result = await pool.query("SELECT * FROM Maintenances");

    if (maintenanceType) {
      result = result.filter(
        (m) => parseInt(m.maintenanceType) === +parseInt(maintenanceType)
      );
    }

    if (status) {
      result = result.filter((m) => parseInt(m.status) === +parseInt(status));
    }

    if (date) {
      result = result.filter((m) => {
        const checkDate = new Date(m.createdAt);
        const compareDate = new Date(date.replace(/\"/g, ""));
        return (
          checkDate.getFullYear() === compareDate.getFullYear() &&
          checkDate.getMonth() === compareDate.getMonth() &&
          checkDate.getDate() === compareDate.getDate()
        );
      });
    }

    if (result) {
      return res.status(200).send({
        success: true,
        data: result.map((x) => {
          const {
            idMaintenances,
            idUser,
            maintenanceType,
            location,
            createdAt,
            startDate,
            status,
          } = x;
          return {
            idMaintenances,
            idUser,
            maintenanceType,
            location,
            createdAt,
            startDate,
            status,
          };
        }),
        error: null,
      });
    } else {
      return res.status(404).send({ error: "Not found Maintenance" });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

//get getMaintenanceDesc
exports.getMaintenanceDesc = async (req, res) => {
  try {
    const isAdmin = req.query.roles.includes("ROLE_ADMIN");
    let result = await pool.query(
      "SELECT * FROM Maintenances WHERE idMaintenances = ?",
      [req.query.maintenanceId]
    );

    let technician = [];
    if (JSON.parse(result[0].technicianId).length > 0) {
      let maintenanceTechnicians = await pool.query(
        "SELECT * FROM MaintenanceTechnicians"
      );
      technician = JSON.parse(result[0].technicianId).map((tId) =>
        maintenanceTechnicians.find(
          (t) => parseInt(t.idMaintenanceTechnicians) === parseInt(tId)
        )
      );
      technician = await Promise.all(technician.map(async (t, index)=>{
        if(JSON.parse(t.image).length > 0){
          let datapath = await bucketService.getSignedUrl(`technician/${JSON.parse(t.image)[0].path}`)
          return {
            ...t,
            fileUrl : datapath
          }
        }
        
      }))

    }
    const deliveries = await pool.query(
      "SELECT * FROM MaintenanceDeliveries WHERE idMaintenances = ?",
      [req.query.maintenanceId]
    );

    let notifications = await pool.query(
      "SELECT * FROM MaintenanceNotifications WHERE idMaintenances = ?",
      [req.query.maintenanceId]
    );

    let notificationsType = await pool.query(
      "SELECT * FROM MaintenanceNotificationTypes"
    );

    let notificationss = notifications.map((n) => {
      let type = notificationsType.find(
        (t) =>
          parseInt(n.notificationType) ===
          parseInt(t.idMaintenanceNotificationTypes)
      );

      return {
        ...n,
        text: type.text,
      };
    });

    if (result) {
      const data = JSON.parse(result[0].attachment);

      if (data.length > 0) {
        result[0].fileUrl = await Promise.all(
          data.map(async (value) => {
            let products = {};
            let datapath = await bucketService.getSignedUrl(
              `maintenance/${value.path}`
            );
            products.file = datapath;
            return products;
          })
        );
      }
      return res.status(200).send({
        success: true,
        data: {
          ...result,
          technician: technician,
          delivery: deliveries,
          notification: notificationss,
        },
        isAdmin: isAdmin,
        error: null,
      });
    } else {
      return res.status(404).send({
        success: false,
        data: null,
        error: "not found maintenance.",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

//put changeStatus
exports.putChangeStatus = async (req, res) => {
  try {
    // if (!req.params.currentRoles.includes("ROLE_ADMIN")) {
    //   return res.status(403).send({
    //     success: false,
    //     error: "no permission to access",
    //   });
    // }

    // let maintenanceIndex = Maintenances.findIndex(
    //   (m) => m.id === +req.body.maintenanceId
    // );
    // if (maintenanceIndex !== -1) {
    //   Maintenances[maintenanceIndex] = {
    //     ...Maintenances[maintenanceIndex],
    //     status: +req.body.status,
    //   };
    //   if (req.body.technicianId) {
    //     Maintenances[maintenanceIndex].technicianId = req.body.technicianId;
    //   }
    //   MaintenanceNotifications.push({
    //     id:
    //       MaintenanceNotifications[MaintenanceNotifications.length - 1].id + 1,
    //     maintenanceId: +req.body.maintenanceId,
    //     notificationType: +req.body.status,
    //     createdAt: new Date(),
    //   });
    let result = await pool.query(
      "UPDATE Maintenances SET status = ?, createdAt=?, technicianId=? WHERE idMaintenances = ? ",
      [
        req.body.status,
        new Date(),
        JSON.stringify(req.body.technicianId),
        req.body.maintenanceId,
      ]
    );
    let resultTechnician = await Promise.all(
      req.body.technicianId.map(async (value) => {
        const resultTechnicianById = await pool.query(
          "SELECT * FROM MaintenanceTechnicians WHERE idMaintenanceTechnicians = ?",
          [value]
        );
        const resultUpdateTechnician = await pool.query(
          "UPDATE MaintenanceTechnicians SET totalWork = ? WHERE idMaintenanceTechnicians = ?",
          [parseInt(resultTechnicianById[0].totalWork) + 1, value]
        );
      })
    );
    let notiResult = await pool.query(
      "INSERT INTO MaintenanceNotifications (idMaintenances, notificationType, createdAt) VALUES (?,?,?)",
      [req.body.maintenanceId, req.body.status, new Date()]
    );
    if (result) {
      return res.status(200).send({
        success: true,
        data: req.body,
        error: null,
      });
    } else {
      return res.status(404).send({ message: "Not found maintenance" });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.newProgressReport = async (req, res) => {
  try {
    // if (!req.params.currentRoles.includes("ROLE_ADMIN")) {
    //   return res.status(403).send({
    //     success: false,
    //     error: "no permission to access",
    //   });
    // }

    const { addPercent, maintenanceId, text, technician } = req.body;
    if (!maintenanceId || !text) {
      return res.status(500).send({
        success: false,
        error: "incomplete information",
      });
    }

    const resData = await pool.query(
      "SELECT * FROM MaintenanceDeliveries ORDER BY idMaintenanceDeliveries DESC LIMIT 1"
    );

    let lastedProgressReportId = 0;
    if (resData.length == 0) {
      lastedProgressReportId = lastedProgressReportId + 1;
    } else {
      lastedProgressReportId = resData[0].idMaintenanceDeliveries + 1;
    }

    // const lastedProgressReportId =
    //   MaintenanceDeliveries.length > 0
    //     ? +(MaintenanceDeliveries[MaintenanceDeliveries.length - 1].id + 1)
    //     : 1;

    const indexOfMaintenance = await pool.query(
      "SELECT * FROM Maintenances WHERE idMaintenances = ?",
      [maintenanceId]
    );
    // const indexOfMaintenance = Maintenances.findIndex(
    //   (m) => m.id === maintenanceId
    // );

    const newProgressReport = {
      id: lastedProgressReportId,
      maintenanceId: maintenanceId,
      text: text,
      createdAt: new Date(),
    };

    let newNotification = null;
    let status = null;

    const resultQuery = await pool.query(
      `INSERT INTO MaintenanceDeliveries (idMaintenances, text, createdAt) VALUES (?,?,?)`,
      [newProgressReport.maintenanceId, newProgressReport.text, new Date()]
    );

    if (addPercent) {
      let newPercent = indexOfMaintenance[0].progress;
      newPercent = parseInt(newPercent) + addPercent;

      let result = await pool.query(
        "UPDATE Maintenances SET progress = ?, createdAt=? WHERE idMaintenances = ? ",
        [newPercent, new Date(), newProgressReport.maintenanceId]
      );
      let resultCheck = await pool.query(
        "SELECT * FROM Maintenances WHERE idMaintenances = ?",
        [newProgressReport.maintenanceId]
      );

      if (resultCheck[0].progress >= 100) {
        newNotification = {
          maintenanceId: maintenanceId,
          notificationType: 3,
          createdAt: new Date(),
        };

        const result = await pool.query(
          `INSERT INTO MaintenanceNotifications (idMaintenances, notificationType, createdAt) VALUES (?, ?, ?)`,
          [maintenanceId, 3, new Date()]
        );
        const resultMaintenances = await pool.query(
          `UPDATE Maintenances SET status = ?, createdAt = ? WHERE idMaintenances = ? `,
          [3, new Date(), maintenanceId]
        );
        const resultTechnician = await Promise.all(
          technician.map(async (value) => {
            const resultUpdateTechnician = await pool.query(
              `UPDATE MaintenanceTechnicians SET completeWork = ? WHERE idMaintenanceTechnicians = ? `,
              [parseInt(value.completeWork) + 1, value.idMaintenanceTechnicians]
            );
          })
        );
      }

      status = 3;
    }

    let notificationsType = await pool.query(
      "SELECT * FROM MaintenanceNotificationTypes"
    );

    let progress = await pool.query(
      "SELECT * FROM Maintenances WHERE idMaintenances = ?",
      [maintenanceId]
    );

    return res.status(200).send({
      success: true,
      data: {
        status: status,
        delivery: newProgressReport,
        progress: progress[0].progress,
        notification: newNotification
          ? {
              ...newNotification,
              text: notificationsType.find(
                (n) =>
                  n.idMaintenanceNotificationTypes ===
                  newNotification.notificationType
              ).text,
            }
          : null,
      },
      error: null,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.getAllTechnicians = async (req, res) => {
  try {
    // if (!req.params.currentRoles.includes("ROLE_ADMIN")) {
    //   return res.status(403).send({
    //     success: false,
    //     error: "no permission to access",
    //   });
    // }

    // let result = [...MaintenanceTechnicians].reverse();
    let result = await pool.query("SELECT * FROM MaintenanceTechnicians");
    let resultMaintenances = await pool.query("SELECT * FROM Maintenances");
    const { fullName, type } = req.query;

    if (fullName) {
      result = result.filter((m) => m.fullName.includes(fullName));
    }

    if (type) {
      result = result.filter((m) => m.types.includes(type));
    }

    result = result.map((t) => {
      return {
        ...t,
        upComingWork: resultMaintenances.filter(
          (m) => JSON.parse(m.technicianId).includes(t.idMaintenanceTechnicians)
          //console.log(JSON.parse(m.technicianId))
          // parseInt(m.technicianId) === parseInt(t.idMaintenanceTechnicians) &&
          // parseInt(m.status) === 2
          //m.technicianId.includes(t.idMaintenanceTechnicians) && m.status === 2
        ),
        //.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
      };
    });
    if(result){
      const data = result[0].image
      console.log(data)
      result = await Promise.all(result.map(async (t, index)=>{
        if(JSON.parse(t.image).length > 0){
          let datapath = await bucketService.getSignedUrl(`technician/${JSON.parse(t.image)[0].path}`)
          return {
            ...t,
            fileUrl : datapath
          }
        }
        
      }))
    }
    
    console.log(result);

    return res.status(200).send({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.newTechnician = async (req, res) => {
  try {
    // if (!req.params.currentRoles.includes("ROLE_ADMIN")) {
    //   return res.status(403).send({
    //     success: false,
    //     error: "no permission to access",
    //   });
    // }

    const { fullName, phoneNumber, email, types, description } = req.body;
    const file = req.file;

    if (
      !fullName ||
      !phoneNumber ||
      !email ||
      !types ||
      !description ||
      !file
    ) {
      return res.status(500).send({
        success: false,
        error: "incomplete information",
      });
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
      return res.status(500).send({
        success: false,
        error: "invalid file type.",
      });
    }
    let lastedTechnician = await pool.query(
      "SELECT * FROM MaintenanceTechnicians  ORDER BY idMaintenanceTechnicians DESC LIMIT 1"
    );
    let lastedTechnicianId = 0;

    if (lastedTechnician.length == 0) {
      lastedTechnicianId = lastedTechnicianId + 1;
    } else {
      lastedTechnicianId =
        parseInt(lastedTechnician[0].idMaintenanceTechnicians) + 1;
    }

    // let lastedTechnicianId =
    //   MaintenanceTechnicians.length > 0
    //     ? +(MaintenanceTechnicians[MaintenanceTechnicians.length - 1].id + 1)
    //     : 1;

    const avatarName =
      "unknow" +
      "." +
      file.originalname.split(".")[file.originalname.split(".").length - 1];
    const avatarPath = path.join(
      __dirname,
      `../../image/maintenance/technician/${lastedTechnicianId}/${avatarName}`
    );

    // console.log(path.join(__dirname, `../image/maintenance/technician/${lastedTechnicianId}`));
    if (
      fs.existsSync(
        path.join(
          __dirname,
          `../../image/maintenance/technician/${lastedTechnicianId}`
        )
      )
    ) {
      fs.rmSync(
        path.join(
          __dirname,
          `../../image/maintenance/technician/${lastedTechnicianId}`
        ),
        { recursive: true, force: true }
      );
    }
    fs.mkdirSync(
      path.join(
        __dirname,
        `../../image/maintenance/technician/${lastedTechnicianId}`
      )
    );
    fs.writeFileSync(avatarPath, file.buffer);
    bucketService.uploadFile(`technician/${lastedTechnicianId}/${avatarName}`,file)
    const attachment = [];
    attachment.push({
      // fileName: file.originalname,
      path: `${lastedTechnicianId}/${avatarName}`,
    });
    const rows = await pool.query(
      `
				  INSERT INTO 
				  MaintenanceTechnicians 
					  (fullName, phoneNumber, email, types, description, totalWork, completeWork,
              image) 
				  VALUES 
					  (?,?,?,?,?,0,0,?)`,
      [
        fullName,
        phoneNumber,
        email,
        types,
        description,
        JSON.stringify(attachment),
      ]
    );

    const newTechnicianData = {
      image: `${lastedTechnicianId}/${avatarName}`,
      id: lastedTechnicianId,
      fullName: fullName,
      phoneNumber: phoneNumber,
      email: email,
      types: types.split(","),
      description: description,
      totalWork: 0,
      completeWork: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // MaintenanceTechnicians.push(newTechnicianData);

    return res.status(200).send({
      success: true,
      data: newTechnicianData,
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

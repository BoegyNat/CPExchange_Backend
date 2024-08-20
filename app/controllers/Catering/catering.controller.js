const db = require("../../models");
const Caterings = db.caterings;
const OrderFoods = db.orderFoods;
const Foods = db.foods;
const Restaurants = db.restaurants;
const RestaurantRatings = db.restaurantRatings;
const Users = db.users;
const pool = require("../../connection.js");
const bucketService = require("../../service/bucket");

exports.getAllCaterings = async (req, res) => {
  try {
    const { status, date } = req.body;
    let result;
    if (status && date) {
      result = await pool.query(
        "SELECT * FROM CateringRequest WHERE status = ? AND date = ?",
        [status, date]
      );
    } else if (status) {
      result = await pool.query(
        "SELECT * FROM CateringRequest WHERE status = ?",
        [status]
      );
    } else if (date) {
      result = await pool.query(
        "SELECT * FROM CateringRequest WHERE date = ?",
        [date]
      );
    } else {
      result = await pool.query("SELECT * FROM CateringRequest");
    }
    return res.status(200).send({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.getCateringType = async (req, res) => {
  try {
    // let result = [...Caterings].reverse();
    let result = await pool.query("SELECT * FROM CateringType");
    // if (status) {
    //   result = result.filter((catering) => catering.status === status);
    // }
    return res.status(200).send({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.getCateringById = async (req, res) => {
  try {
    // let result = Caterings.find((c) => c.id === +req.params.cateringId);
    let result = await pool.query(
      "SELECT * FROM CateringRequest WHERE idCateringRequest = ?",
      [parseInt(req.params.cateringId)]
    );

    if (result) {
      let AllOrderFood = await pool.query(
        "SELECT * FROM CateringRequestFoodList"
      );
      let orderFoods = AllOrderFood.filter(
        (o) =>
          parseInt(result[0].idCateringRequest) ===
          parseInt(o.idCateringRequest)
      ).reverse();
      let cateringType = await pool.query(
        "SELECT * FROM CateringType WHERE idCateringType = ?",
        [parseInt(result[0].cateringType)]
      );
      let AllFood = await pool.query("SELECT * FROM CateringFood");
      let AllRestaurant = await pool.query("SELECT * FROM CateringRestaurant");
      orderFoods = await Promise.all(
        orderFoods.map(async (o) => {
          let food = AllFood.find(
            (f) => parseInt(o.idCateringFood) === parseInt(f.idCateringFood)
          );

          if (JSON.parse(food.image).length > 0) {
            food.fileUrl = await Promise.all(
              JSON.parse(food.image).map(async (value) => {
                let datapath = await bucketService.getSignedUrl(
                  `catering/cateringFood/${value.path}`
                );

                return datapath;
              })
            );
          } else {
            food.fileUrl = [];
          }
          // food.fileUrl= await Promise.all(

          // );

          let restaurant = AllRestaurant.find(
            (r) =>
              parseInt(food.idCateringRestaurant) ===
              parseInt(r.idCateringRestaurant)
          );
          food = { ...food, restaurant: restaurant };
          return {
            ...o,
            food,
          };
        })
      );
      // console.log(orderFoods,"orderFoods")

      let totalPrice = orderFoods.reduce(
        (a, b) => a + parseFloat(b.food.price) * b.quantity,
        0
      );

      // let requester = Users.find((u) => result.requesterId === u.id);

      let requester = {
        // image: result.image,
        firstname: result[0].name.split(" ")[0],
        lastname: result[0].name.split(" ")[1],
      };

      return res.status(200).send({
        success: true,
        data: {
          ...result[0],
          cateringTypeName: cateringType[0].Type,
          orderFoods: orderFoods,
          totalPrice: totalPrice,
          requester: requester,
        },
        error: null,
      });
    } else {
      return res.status(404).send({
        success: false,
        error: "not found",
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.changeStatusById = async (req, res) => {
  try {
    // console.log(req.body, req.params.cateringId);
    const { status } = req.body;

    if (
      status !== "pending" &&
      status !== "approved" &&
      status !== "disapproved"
    ) {
      return res.status(500).send({
        success: false,
        error: "invalid status",
      });
    }

    // const cateringId = +req.params.cateringId;
    // const cateringIndex = Caterings.findIndex((c) => c.id === cateringId);

    // Caterings[cateringIndex].status = status;

    const result = await pool.query(
      "UPDATE CateringRequest SET status = ? WHERE idCateringRequest = ?",
      [status, req.params.cateringId]
    );
    return res.status(200).send({
      success: true,
      data: { status: status },
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM CateringRestaurant");

    result = await Promise.all(
      result.map(async (value) => {
        if (value.image) {
          if (JSON.parse(value.image).length > 0) {
            let datapath = await bucketService.getSignedUrl(
              `catering/cateringRestaurant/${JSON.parse(value.image)[0].path}`
            );
            return {
              ...value,
              fileUrl: datapath,
            };
          }
          return {
            ...value,
            fileUrl: null,
          };
        } else {
          return {
            ...value,
            fileUrl: null,
          };
        }
      })
    );
    let AllFood = await pool.query("SELECT * FROM CateringFood");
    let allfood = [];
    result = await Promise.all(
      result.map(async (r) => {
        const foods = AllFood.filter(
          (f) =>
            parseInt(r.idCateringRestaurant) ===
            parseInt(f.idCateringRestaurant)
        );
        if (foods.length > 0) {
          allfood = await Promise.all(
            foods.map(async (value, index) => {
              if (value.image) {
                if (JSON.parse(value.image).length > 0) {
                  let datapath = await bucketService.getSignedUrl(
                    `catering/cateringFood/${JSON.parse(value.image)[0].path}`
                  );
                  return {
                    ...value,
                    fileUrl: datapath,
                  };
                } else {
                  return {
                    ...value,
                    fileUrl: null,
                  };
                }
              } else {
                return {
                  ...value,
                  fileUrl: null,
                };
              }
            })
          );
        }
        const ratings = RestaurantRatings.filter(
          (rating) => rating.restaurantId === r.id
        );
        const numberOfRatings = ratings.length;

        let rating = 0;
        if (numberOfRatings > 0) {
          rating =
            ratings.reduce((pre, current) => pre + current.rating, 0) /
            numberOfRatings;
        }

        return {
          ...r,
          foods: allfood,
          rating: Math.round(rating * 100) / 100,
          numberOfRatings: numberOfRatings,
        };
      })
    );

    return res.status(200).send({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    let AllRestaurant = await pool.query("SELECT * FROM CateringRestaurant");
    let result = AllRestaurant.find(
      (r) =>
        parseInt(r.idCateringRestaurant) === parseInt(req.params.restaurantId)
    );
    if (!result) {
      return res.status(404).send({
        success: false,
        error: "not found",
      });
    }
    if (result.image) {
      if (JSON.parse(result.image).length > 0) {
        result.fileUrl = await bucketService.getSignedUrl(
          `catering/cateringRestaurant/${JSON.parse(result.image)[0].path}`
        );
      } else {
        result.fileUrl = null;
      }
    } else {
      result.fileUrl = null;
    }
    // console.log(result);
    let allfood = [];

    let AllFood = await pool.query("SELECT * FROM CateringFood");
    // const foods = Foods.filter((f) => result.id === f.restaurantId);
    const foods = AllFood.filter(
      (f) =>
        parseInt(result.idCateringRestaurant) ===
        parseInt(f.idCateringRestaurant)
    );
    if (foods.length > 0) {
      allfood = await Promise.all(
        foods.map(async (value, index) => {
          if (value.image) {
            if (JSON.parse(value.image).length > 0) {
              let datapath = await bucketService.getSignedUrl(
                `catering/cateringFood/${JSON.parse(value.image)[0].path}`
              );
              return {
                ...value,
                fileUrl: datapath,
              };
            } else {
              return {
                ...value,
                fileUrl: null,
              };
            }
          } else {
            return {
              ...value,
              fileUrl: null,
            };
          }
        })
      );
    }

    return res.status(200).send({
      success: true,
      data: { ...result, foods: allfood },
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};
exports.deleteRestaurantById = async (req, res) => {
  try {
    const restaurant = await pool.query(
      "SELECT * FROM CateringRestaurant WHERE idCateringRestaurant = ?",
      [req.params.restaurantId]
    );

    if (restaurant[0].image) {
      const image = JSON.parse(restaurant[0].image);
      bucketService.deleteFile(`catering/cateringRestaurant/${image[0].path}`);
    }
    const food = await pool.query(
      "SELECT * FROM CateringFood WHERE idCateringRestaurant = ?",
      [req.params.restaurantId]
    );
    for (let i = 0; i < food.length; i++) {
      if (food[i].image) {
        const image = JSON.parse(food[i].image);
        bucketService.deleteFile(`catering/cateringFood/${image[0].path}`);
      }
    }
    const deleteFood = await pool.query(
      "DELETE FROM CateringFood WHERE idCateringRestaurant = ?",
      [req.params.restaurantId]
    );
    const result = await pool.query(
      "DELETE FROM CateringRestaurant WHERE idCateringRestaurant = ?",
      [req.params.restaurantId]
    );
    return res.status(200).send({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};
exports.addNewRestaurant = async (req, res) => {
  try {
    const file = req.files?.attachment;
    const fileRes = req.files?.resFile;
    console.log(
      // JSON.parse(req.body.Result),
      req.files.resFile,
      req.files.attachment
    );
    // // console.log(req.body.length)
    const { nameRestaurant, categories, location, name, phone, email } =
      JSON.parse(req.body.Result).Restaurant.data;
    const { locationfrommap, Lat, Lng } = JSON.parse(req.body.Result).Restaurant
      .dataMap[0];
    // console.log(
    //   nameRestaurant,
    //   categories,
    //   location,
    //   name,
    //   phone,
    //   email,
    //   locationfrommap,
    //   Lat,
    //   Lng
    // );

    const resultId = await pool.query(
      "SELECT * FROM CateringRestaurant ORDER BY idCateringRestaurant DESC LIMIT 1"
    );

    let lastedCateringRestaurantId = 0;
    if (resultId.length == 0) {
      lastedCateringRestaurantId = lastedCateringRestaurantId + 1;
    } else {
      lastedCateringRestaurantId =
        parseInt(resultId[0].idCateringRestaurant) + 1;
    }

    let resultData;
    if (fileRes !== null && fileRes !== undefined) {
      const avatarNameRes =
        "unknow" +
        "." +
        fileRes[0].originalname.split(".")[
          fileRes[0].originalname.split(".").length - 1
        ];
      bucketService.uploadFile(
        `catering/cateringRestaurant/${lastedCateringRestaurantId}/${avatarNameRes}`,
        fileRes[0]
      );
      const attachment = [];

      attachment.push({
        // fileName: file.originalname,
        path: `${lastedCateringRestaurantId}/${avatarNameRes}`,
      });

      resultData = await pool.query(
        "INSERT INTO CateringRestaurant (nameRestaurant, categories, location,image, name, phone, email,locationfrommap, Lat, Lng) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [
          nameRestaurant,
          categories,
          location,
          JSON.stringify(attachment),
          name,
          phone,
          email,
          locationfrommap,
          Lat,
          Lng,
        ]
      );
    } else {
      resultData = await pool.query(
        "INSERT INTO CateringRestaurant (nameRestaurant, categories, location, name, phone, email,locationfrommap, Lat, Lng) VALUES (?,?,?,?,?,?,?,?,?)",
        [
          nameRestaurant,
          categories,
          location,
          name,
          phone,
          email,
          locationfrommap,
          Lat,
          Lng,
        ]
      );
    }

    if (JSON.parse(req.body.Result).Menu.length > 0) {
      let file_index = 0;
      for (let i = 0; i < JSON.parse(req.body.Result).Menu.length; i++) {
        const { menuName, price, detail, fileAdded } = JSON.parse(
          req.body.Result
        ).Menu[i];
        // console.log(menuName, price, detail);
        const resultDataId = await pool.query(
          "SELECT * FROM CateringRestaurant ORDER BY idCateringRestaurant DESC LIMIT 1"
        );
        // const resultDataIdFood = await pool.query(
        //   "SELECT * FROM CateringFood ORDER BY idCateringFood DESC LIMIT 1"
        // );
        let lastedMaintenanceId = 0;

        if (resultDataId.length == 0) {
          lastedMaintenanceId = lastedMaintenanceId + 1;
        } else {
          lastedMaintenanceId =
            parseInt(resultDataId[0].idCateringRestaurant) + 1;
        }
        // console.log(lastedMaintenanceId);
        if (fileAdded) {
          const avatarName =
            "unknow" +
            file_index +
            "." +
            file[file_index].originalname.split(".")[
              file[file_index].originalname.split(".").length - 1
            ];
          bucketService.uploadFile(
            `catering/cateringFood/${lastedMaintenanceId}/${avatarName}`,
            file[file_index]
          );
          const attachment = [];

          attachment.push({
            // fileName: file.originalname,
            path: `${lastedMaintenanceId}/${avatarName}`,
          });
          // console.log(resultDataId[0].idRestaurant);
          const res = await pool.query(
            "INSERT INTO CateringFood (menuName, price,detail,image,idCateringRestaurant) VALUES (?,?,?,?,?)",
            [
              menuName,
              price,
              detail,
              JSON.stringify(attachment),
              resultDataId[0].idCateringRestaurant,
            ]
          );

          file_index = file_index + 1;
        } else {
          const res = await pool.query(
            "INSERT INTO CateringFood (menuName, price,detail,idCateringRestaurant) VALUES (?,?,?,?)",
            [menuName, price, detail, resultDataId[0].idCateringRestaurant]
          );
        }
      }
    }

    if (resultData) {
      return res.status(200).send({
        success: true,
        data: resultData,
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

exports.updateRestaurantMenu = async (req, res) => {
  try {
    const file = req.files.attachment;
    const fileRes = req.files.resFile;
    // console.log(
    //   JSON.parse(req.body.Result),
    //   req.files.resFile,
    //   req.files.attachment
    // );
    // console.log(req.body.length)
    const {
      nameRestaurant,
      categories,
      location,
      name,
      phone,
      email,
      idCateringRestaurant,
    } = JSON.parse(req.body.Result).Restaurant.data;
    const { locationfrommap, Lat, Lng } = JSON.parse(req.body.Result).Restaurant
      .dataMap[0];
    // console.log(
    //   nameRestaurant,
    //   categories,
    //   location,
    //   name,
    //   phone,
    //   email,
    //   locationfrommap,
    //   Lat,
    //   Lng
    // );
    let resultData = null;
    if (fileRes) {
      const avatarNameRes =
        "unknow" +
        "." +
        fileRes[0].originalname.split(".")[
          fileRes[0].originalname.split(".").length - 1
        ];
      bucketService.uploadFile(
        `catering/cateringRestaurant/${idCateringRestaurant}/${avatarNameRes}`,
        fileRes[0]
      );
      const attachment = [];

      attachment.push({
        path: `${idCateringRestaurant}/${avatarNameRes}`,
      });

      resultData = await pool.query(
        "UPDATE CateringRestaurant SET nameRestaurant = ?, categories = ?, location = ?, image = ?, name = ?, phone = ?, email = ?,locationfrommap = ?, Lat = ?, Lng = ? WHERE idCateringRestaurant = ?",
        [
          nameRestaurant,
          categories,
          location,
          JSON.stringify(attachment),
          name,
          phone,
          email,
          locationfrommap,
          Lat,
          Lng,
          idCateringRestaurant,
        ]
      );
    } else {
      resultData = await pool.query(
        "UPDATE CateringRestaurant SET nameRestaurant = ?, categories = ?, location = ?, name = ?, phone = ?, email = ?,locationfrommap = ?, Lat = ?, Lng = ? WHERE idCateringRestaurant = ?",
        [
          nameRestaurant,
          categories,
          location,
          name,
          phone,
          email,
          locationfrommap,
          Lat,
          Lng,
          idCateringRestaurant,
        ]
      );
    }

    if (JSON.parse(req.body.Result).deletedMenu.length > 0) {
      for (let i = 0; i < JSON.parse(req.body.Result).deletedMenu.length; i++) {
        const { idCateringFood, image } = JSON.parse(req.body.Result)
          .deletedMenu[i];
        const res = await pool.query(
          "DELETE FROM CateringFood WHERE idCateringFood = ?",
          [idCateringFood]
        );
        bucketService.deleteFile(`catering/cateringFood/${image}`);
      }
    }

    if (JSON.parse(req.body.Result).Menu.length > 0) {
      let file_index = 0;
      for (let i = 0; i < JSON.parse(req.body.Result).Menu.length; i++) {
        const { old } = JSON.parse(req.body.Result).Menu[i];
        if (old) {
          const { menuName, price, detail, idCateringFood, fileChanged } =
            JSON.parse(req.body.Result).Menu[i];
          if (fileChanged) {
            const avatarName =
              "unknow" +
              file_index +
              "." +
              file[file_index].originalname.split(".")[
                file[file_index].originalname.split(".").length - 1
              ];
            bucketService.uploadFile(
              `catering/cateringFood/${idCateringRestaurant + 1}/${avatarName}`,
              file[file_index]
            );
            const attachment = [];

            attachment.push({
              path: `${idCateringRestaurant + 1}/${avatarName}`,
            });
            const res = await pool.query(
              "UPDATE CateringFood SET menuName = ?, price = ?, detail = ?, image = ? WHERE idCateringFood = ?",
              [
                menuName,
                price,
                detail,
                JSON.stringify(attachment),
                idCateringFood,
              ]
            );
            file_index++;
          } else {
            const res = await pool.query(
              "UPDATE CateringFood SET menuName = ?, price = ?, detail = ? WHERE idCateringFood = ?",
              [menuName, price, detail, idCateringFood]
            );
          }
        } else {
          const { menuName, price, detail, fileAdded } = JSON.parse(
            req.body.Result
          ).Menu[i];
          if (fileAdded) {
            const avatarName =
              "unknow" +
              i +
              "." +
              file[file_index].originalname.split(".")[
                file[file_index].originalname.split(".").length - 1
              ];
            bucketService.uploadFile(
              `catering/cateringFood/${idCateringRestaurant + 1}/${avatarName}`,
              file[file_index]
            );
            const attachment = [];

            attachment.push({
              path: `${idCateringRestaurant + 1}/${avatarName}`,
            });
            const res = await pool.query(
              "INSERT INTO CateringFood (menuName, price,detail,image,idCateringRestaurant) VALUES (?,?,?,?,?)",
              [
                menuName,
                price,
                detail,
                JSON.stringify(attachment),
                idCateringRestaurant,
              ]
            );
            file_index++;
          } else {
            const res = await pool.query(
              "INSERT INTO CateringFood (menuName, price,detail,idCateringRestaurant) VALUES (?,?,?,?)",
              [menuName, price, detail, idCateringRestaurant]
            );
          }
        }
      }
    }
    if (resultData) {
      return res.status(200).send({
        success: true,
        data: resultData,
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

exports.addRequestCatering = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      company,
      department,
      costCenter,
      costElement,
      date,
      startTimeHour,
      startTimeMinute,
      numberOfPeople,
      sendTo,
      cateringType,
      objective,
      description,
      idApproved,
      nameApproved,
      companyApproved,
      departmentApproved,
      budget,
    } = req.body[0];
    // console.log(
    //   name,
    //   phoneNumber,
    //   email,
    //   company,
    //   department,
    //   costCenter,
    //   costElement,
    //   date,
    //   startTimeHour,
    //   startTimeMinute,
    //   numberOfPeople,
    //   sendTo,
    //   cateringType,
    //   objective,
    //   description,
    //   idApproved,
    //   nameApproved,
    //   companyApproved,
    //   departmentApproved
    // );

    const time =
      startTimeHour.toString().padStart(2, "0") +
      ":" +
      startTimeMinute.toString().padStart(2, "0");

    const result = await pool.query(
      `INSERT INTO CateringRequest (name, phoneNumber,email,company,department,costCenter,costElement,date,time, numberOfPeople,sendTo,cateringType,objective,description,idApproved,nameApproved,companyApproved,departmentApproved,additionalOption,status,budget)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,"pending",?)
      `,
      [
        name,
        phoneNumber,
        email,
        company,
        department,
        costCenter,
        costElement,
        date,
        time,
        numberOfPeople,
        sendTo,
        cateringType,
        objective,
        description,
        idApproved,
        nameApproved,
        companyApproved,
        departmentApproved,
        JSON.stringify(req.body[1]),
        budget,
      ]
    );
    const resultDataId = await pool.query(
      "SELECT * FROM CateringRequest ORDER BY idCateringRequest DESC LIMIT 1"
    );
    if (req.body[2] != null) {
      const restaurantId = req.body[2].id.restaurantId;
      req.body[2].allFood.map(async (value) => {
        const { idCateringFood, menuName, price, quantity } = value;
        const resultdata = await pool.query(
          `INSERT INTO CateringRequestFoodList (idCateringFood, menuName,price,quantity,totalPrice,idCateringRequest,idCateringRestaurant)
      VALUES (?,?,?,?,?,?,?)
    `,
          [
            idCateringFood,
            menuName,
            price,
            quantity,
            quantity * parseFloat(price),
            resultDataId[0].idCateringRequest,
            restaurantId,
          ]
        );
      });
    }

    return res.status(200).send({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.getCateringRestaurantType = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM CateringRestaurantType");

    return res.status(200).send({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

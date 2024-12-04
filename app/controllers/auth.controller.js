// const db = require("../models");
const config = require("../config/auth.config");
// const Users = db.users;

const pool = require("../connection.js");

var jwt = require("jsonwebtoken");

exports.signin = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  await pool
    .query(
      `
  SELECT
        firstname_TH , lastname_TH , email , username , password 
      FROM
        user
      WHERE
        username = ? OR email = ?
      LIMIT
        1;

        `,
      [username.toUpperCase(), username.toUpperCase()]
    )

    .then((rows) => {
      if (rows.length > 0) {
        // if (rows[0].password == null) {
        //   if (password == rows[0].personalID) {
        //     var token = jwt.sign(
        //       { idUser: rows[0].idEmployees },
        //       config.secret,
        //       {
        //         expiresIn: 86400, // 24 hours
        //       }
        //     );

        //     if (token) {
        //       return res.status(200).send({
        //         type: "success",
        //         msg: "Login success",
        //         returnData: {
        //           fullname: rows[0].firstname_TH + " " + rows[0].lastname_TH,
        //           firstname_TH: rows[0].firstname_TH,
        //           lastname_TH: rows[0].lastname_TH,
        //           email: rows[0].email,
        //           idUser: rows[0].idEmployees,
        //           username: rows[0].username,
        //           roles:
        //             rows[0].roleName === "ROLE_ADMIN" ||
        //             rows[0].roleName === "ROLE_MANAGER"
        //               ? rows[0].roleName + ",ROLE_USER"
        //               : rows[0].roleName,
        //           image: rows[0].imageName,
        //           accessToken: token,
        //         },
        //       });
        //     }
        //   } else {
        //     return res.status(200).send({
        //       type: "password_invalid",
        //       msg: "Password Not Correct",
        //     });
        //   }
        // }
        if (rows[0].password === password) {
          //password ถูก

          var token = jwt.sign({ idUser: rows[0].id }, config.secret, {
            expiresIn: 86400, // 24 hours
          });

          if (token) {
            return res.status(200).send({
              type: "success",
              msg: "Login success",
              returnData: {
                fullname: rows[0].firstname + " " + rows[0].lastname,
                firstname_TH: rows[0].firstname,
                lastname_TH: rows[0].lastname,
                email: rows[0].email,
                idUser: rows[0].id,
                username: rows[0].username,
                roles: "ROLE_ADMIN",
                image: "imageName",
                accessToken: token,
              },
            });
          }
        } else {
          //password ไม่ถูก
          return res
            .status(200)
            .send({ type: "password_invalid", msg: "Password Not Correct" });
        }
      } else {
        return res
          .status(200)
          .send({ type: "not_found", msg: "User Not Found" });
      }
    });
};

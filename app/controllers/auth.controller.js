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
        *
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
                idUser: rows[0].idUser,
                fullname: rows[0].firstname_TH + " " + rows[0].lastname_TH,
                firstname_TH: rows[0].firstname_TH,
                lastname_TH: rows[0].lastname_TH,
                firstname_EN: rows[0].firstname_EN,
                lastname_EN: rows[0].lastname_EN,
                profileName: rows[0].profileName,
                studentCode: rows[0].studentCode,
                email: rows[0].email,
                idUser: rows[0].idUser,
                username: rows[0].username,
                roles: rows[0].role,
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

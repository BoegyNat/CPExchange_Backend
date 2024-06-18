// const db = require("../models");
const config = require("../config/auth.config");
// const Users = db.users;

const pool = require("../connection.js");

var jwt = require("jsonwebtoken");

exports.signin = async (req, res) => {
  const { username, password } = req.body;
  const isDriver = username.includes("driver");

  if (isDriver) {
    await pool
      .query(
        `SELECT username , password , idUser , authorities  , image FROM Users WHERE username = ? LIMIT 1;`,
        [username]
      )
      .then((rows) => {
        if (rows.length > 0) {
          if (rows[0].password === password) {
            //password ถูก

            var token = jwt.sign({ idUser: rows[0].idUser }, config.secret, {
              expiresIn: 86400, // 24 hours
            });

            if (token) {
              return res.status(200).send({
                type: "success",
                msg: "Login success",
                returnData: {
                  idUser: rows[0].idUser,
                  username: rows[0].username,
                  roles: rows[0].authorities,
                  image: rows[0].image,
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
            .send({ type: "not_found", msg: "Driver Not Found" });
        }
      });
  } else {
    await pool
      .query(
        `
SELECT 
      username , password , idEmployees , e.idRole  , imageName ,personalID ,r.roleName 
    FROM 
      UniHR.Employees e 
      LEFT JOIN UniHR.Role r ON r.idRole = e.idRole 
    WHERE 
      username = ?
    LIMIT 
      1;
      
      `,
        [username]
      )

      .then((rows) => {
        if (rows.length > 0) {
          if (rows[0].password == null) {
            if (password == rows[0].personalID) {
              var token = jwt.sign(
                { idUser: rows[0].idEmployees },
                config.secret,
                {
                  expiresIn: 86400, // 24 hours
                }
              );

              if (token) {
                return res.status(200).send({
                  type: "success",
                  msg: "Login success",
                  returnData: {
                    idUser: rows[0].idEmployees,
                    username: rows[0].username,
                    roles:
                      rows[0].roleName === "ROLE_ADMIN" ||
                      rows[0].roleName === "ROLE_MANAGER"
                        ? rows[0].roleName + ",ROLE_USER"
                        : rows[0].roleName,
                    image: rows[0].imageName,
                    accessToken: token,
                  },
                });
              }
            } else {
              return res.status(200).send({
                type: "password_invalid",
                msg: "Password Not Correct",
              });
            }
          }
          if (rows[0].password === password) {
            //password ถูก

            var token = jwt.sign(
              { idUser: rows[0].idEmployees },
              config.secret,
              {
                expiresIn: 86400, // 24 hours
              }
            );

            if (token) {
              return res.status(200).send({
                type: "success",
                msg: "Login success",
                returnData: {
                  idUser: rows[0].idEmployees,
                  username: rows[0].username,
                  roles:
                    rows[0].roleName === "ROLE_ADMIN" ||
                    rows[0].roleName === "ROLE_MANAGER"
                      ? rows[0].roleName + ",ROLE_USER"
                      : rows[0].roleName,
                  image: rows[0].imageName,
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
  }
  // try {
  //   let result = Users.find((user) => user.username === req.body.username);

  //   if (result) {
  //     var passwordIsValid = req.body.password == result.password;

  //     if (!passwordIsValid) {
  //       return res.status(401).send({
  //         accessToken: null,
  //         message: "Invalid Password!",
  //       });
  //     }

  //     var token = jwt.sign({ id: result.id }, config.secret, {
  //       expiresIn: 86400, // 24 hours
  //     });

  //     var authorities = result.authorities;

  //     res.status(200).send({
  //       id: result.id,
  //       username: result.username,
  //       roles: authorities,
  //       image: result.image,
  //       accessToken: token,
  //     });
  //   } else {
  //     return res.status(404).send({ message: "User Not found." });
  //   }
  // } catch (error) {
  //   res.status(500).send({ message: err.message });
  // }
};

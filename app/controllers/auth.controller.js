// const db = require("../models");
const e = require("express");
const config = require("../config/auth.config");
const math = require("mathjs");

// const Users = db.users;

const pool = require("../connection.js");

var jwt = require("jsonwebtoken");
const { ro } = require("date-fns/locale");

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
                image: rows[0].imagePath,
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

exports.signup = async (req, res) => {
  const {
    firstname_TH,
    lastname_TH,
    firstname_EN,
    lastname_EN,
    email,
    username,
    password,
    profileName,
  } = req.body;

  const randomNum = math.floor(math.random() * 21) + 1;
  const imagePath = randomNum + ".jpg";

  await pool
    .query(
      `
  INSERT INTO user (firstname_TH, lastname_TH, firstname_EN, lastname_EN, email, username, password, role, profileName, imagePath)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
      [
        firstname_TH,
        lastname_TH,
        firstname_EN,
        lastname_EN,
        email,
        username,
        password,
        "ROLE_USER",
        profileName,
        imagePath,
      ]
    )
    .then((rows) => {
      if (rows) {
        var token = jwt.sign({ idUser: rows.insertId }, config.secret, {
          expiresIn: 86400, // 24 hours
        });

        if (token) {
          return res.status(200).send({
            type: "success",
            msg: "Login success",
            returnData: {
              idUser: rows.insertId,
              fullname: firstname_TH + " " + lastname_TH,
              firstname_TH: firstname_TH,
              lastname_TH: lastname_TH,
              firstname_EN: firstname_EN,
              lastname_EN: lastname_EN,
              profileName: profileName,
              studentCode: null,
              email: email,
              username: username,
              roles: "ROLE_USER",
              image: imagePath,
              accessToken: token,
            },
          });
        }
      } else {
        return res.status(200).send({ type: "fail", msg: "Register fail" });
      }
    });
};

exports.checkUserName = async (req, res) => {
  const username = req.body[0];

  let result = await pool.query(
    `
  SELECT
        *
      FROM
        user
      WHERE
        username = ?

        `,
    [username]
  );

  if (result.length > 0) {
    return res
      .status(200)
      .send({ exists: true, type: "fail", msg: "Username is used" });
  } else {
    return res
      .status(200)
      .send({ exists: false, type: "success", msg: "Username is ok" });
  }
};

exports.editProfileName = async (req, res) => {
  const { idUser, password, profileName } = req.body;
  console.log(req.body);
  try {
    let result = await pool.query(
      `
      SELECT
        *
      FROM
        user
      WHERE
        idUser = ?
      `,
      [idUser]
    );
    const user = result[0];
    if (result.length > 0) {
      if (user.password === password) {
        console.log("Before update:", user.profileName);
        await pool.query(
          `
          UPDATE user
          SET profileName = ?
          WHERE idUser = ?
          `,
          [profileName, idUser]
        );
        console.log("After update:", profileName);
        return res
          .status(200)
          .send({ valid: true, msg: "Profile name updated successfully" });
      } else {
        return res
          .status(200)
          .send({ valid: false, msg: "Password is incorrect" });
      }
    } else {
      return res.status(404).send({ valid: false, msg: "User not found" });
    }
  } catch (error) {
    console.error("Error verifying password", error);
    return res.status(500).send({ valid: false, msg: "Internal server error" });
  }
};

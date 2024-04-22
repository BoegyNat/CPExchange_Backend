const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const Users = db.users;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.params.currentId = decoded.id;
    req.params.currentRoles = decoded.roles;
    next();
  });
};

isAdmin = (req, res, next) => {
  let result = Users.find((user) => user.id === req.params.currentId);
  for (let i = 0; i < result.authorities.length; i++) {
    if (result.authorities[i] === "ROLE_ADMIN") {
      next();
      return;
    }
  }

  res.status(403).send({
    message: "Require Admin Role!",
  });
};

isManager = (req, res, next) => {
  let result = Users.find((user) => user.id === req.params.currentId);
  for (let i = 0; i < result.authorities.length; i++) {
    if (result.authorities[i] === "ROLE_MANAGER") {
      next();
      return;
    }
  }

  res.status(403).send({
    message: "Require Manager Role!",
  });
};

// isModeratorOrAdmin = (req, res, next) => {
//   User.findByPk(req.userId).then((user) => {
//     user.getRoles().then((roles) => {
//       for (let i = 0; i < roles.length; i++) {
//         if (roles[i].name === "moderator") {
//           next();
//           return;
//         }

//         if (roles[i].name === "admin") {
//           next();
//           return;
//         }
//       }

//       res.status(403).send({
//         message: "Require Moderator or Admin Role!",
//       });
//     });
//   });
// };

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isManager: isManager,
};
module.exports = authJwt;

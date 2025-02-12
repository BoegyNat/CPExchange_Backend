const pool = require("../connection.js");

exports.userProfile = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM user WHERE idUser = ?", [
      req.params.id,
    ]);
    if (result) {
      res.status(200).send(result[0]);
    } else {
      return res.status(404).send({ message: "User Not found." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.allUser = async (req, res) => {
  try {
    const row = await pool.query("SELECT * FROM user ;");
    return res.status(200).send(row);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const pool = require("../connection.js");

exports.userProfile = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM user WHERE idUser = ?", [
      req.params.id,
    ]);
    if (result.length > 0) {
      res.status(200).send(result[0]);
    } else {
      return res.status(404).send({ message: "User Not found." });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error); // เพิ่มบรรทัดนี้เพื่อแสดงข้อผิดพลาดใน console
    res.status(500).send({ message: error.message });
  }
};

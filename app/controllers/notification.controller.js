const pool = require("../connection.js");

exports.getAllNotificationByIdUser = async (req, res) => {
  try {
    const { idUser } = req.params;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;
    let result = await pool.query(
      `SELECT * FROM notification WHERE notification.idUser = ? ORDER BY notification.timeStamp DESC LIMIT ? OFFSET ?;`,
      [idUser, limit, offset]
    );
    for (let i = 0; i < result.length; i++) {
      const sender = await pool.query(
        "SELECT imagePath FROM user WHERE idUser = ?",
        [result[i].idSender]
      );
      result[i].sender = sender[0].imagePath;
    }

    let countNotification = await pool.query(
      `SELECT COUNT(*) AS count FROM notification WHERE idUser = ? AND idNotificationStatus = 1;`,
      [idUser]
    );

    if (result) {
      res
        .status(200)
        .send({ result: result, count: countNotification[0].count });
    } else {
      return res.status(404).send({ message: "Don't have notification" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getReadNotificationByIdNotification = async (req, res) => {
  try {
    const { idNotification } = req.params;
    let result = await pool.query(
      "UPDATE notification SET idNotificationStatus = 2 WHERE idNotification = ?",
      [idNotification]
    );
    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Don't have notification" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

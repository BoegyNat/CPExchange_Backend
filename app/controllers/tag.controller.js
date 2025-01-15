const pool = require("../connection.js");

exports.getAllTags = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM  tag");
    if (result) {
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Don't have tag" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getAllTagsByIdUser = async (req, res) => {
  try {
    let result = await pool.query(
      `
      SELECT t.*, utp.priority FROM  tag t 
      LEFT JOIN usertagpriority utp ON t.idTag = utp.idTag AND utp.idUser = ? 
      ORDER BY utp.priority DESC`,
      [req.params.idUser]
    );
    if (result) {
      for (let i = 0; i < result.length; i++) {
        let subtag = await pool.query(
          `
          SELECT st.*, ustp.priority FROM  subtag st 
          LEFT JOIN usersubtagpriority ustp ON st.idSubTag = ustp.idSubTag AND ustp.idUser = ? 
          WHERE st.idTag = ? 
          ORDER BY ustp.priority DESC`,
          [req.params.idUser, result[i].idTag]
        );
        result[i].subtag = subtag;
      }
      res.status(200).send(result);
    } else {
      return res.status(404).send({ message: "Don't have tag" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

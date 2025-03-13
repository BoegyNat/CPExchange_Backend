const pool = require("../connection.js");

setInterval(async () => {
  const checkSubTag = await pool.query(
    `
    SELECT * FROM subtag WHERE idSubTag NOT IN (
      SELECT idSubTag FROM postsubtag
    )`
  );

  for (let i = 0; i < checkSubTag.length; i++) {
    await pool.query(`DELETE FROM usersubtagpriority WHERE idSubTag = ?`, [
      checkSubTag[i].idSubTag,
    ]);
    await pool.query(`DELETE FROM subtag WHERE idSubTag = ?`, [
      checkSubTag[i].idSubTag,
    ]);
  }
  const checkTag = await pool.query(
    `
    SELECT * FROM tag WHERE idTag NOT IN (
      SELECT idTag FROM posttag
    )`
  );

  for (let i = 0; i < checkTag.length; i++) {
    await pool.query(`DELETE FROM usertagpriority WHERE idTag = ?`, [
      checkTag[i].idTag,
    ]);
    await pool.query(`DELETE FROM tag WHERE idTag = ?`, [checkTag[i].idTag]);
  }
  console.log("The subtag and tag have been deleted", checkSubTag, checkTag);
}, 1296000000); // ลบ subtag และ tag ทุกๆ 15 วัน
exports.getAllTags = async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM  tag");

    if (result) {
      for (let i = 0; i < result.length; i++) {
        let subtag = await pool.query("SELECT * FROM  subtag WHERE idTag = ?", [
          result[i].idTag,
        ]);
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

const pool = require("../connection.js");

exports.getSiteByName = async (req, res) => {
  const rows = await pool.query("SELECT * FROM ScgSite WHERE NoSite = ?", [
    req.params.IdScgSite,
  ]);
  // const rows = await pool.query("SELECT * FROM ScgSite")

  return res.status(200).json(rows);
};

exports.addLocationDriver = async (req, res) => {
  const idDriver = req.body.idDriver;
  const Lat = req.body.Lat;
  const Lng = req.body.Lng;

  if (idDriver != "" && Lat != "" && Lng != "" && idDriver != null) {
    const rows = await pool.query(
      `
        INSERT INTO 
        LocationDriver 
            (idDriver, LatDriver, LngDriver) 
        VALUES 
            (?,?,?)`,
      [idDriver, Lat, Lng]
    );
    res.status(200).send(rows);
  } else {
    return res.status(500).send({ message: "error.message" });
  }
};
exports.getLocationDriverById = async (req, res) => {
  const rows = await pool.query("SELECT * FROM LocationDriver WHERE idDriver = ? ORDER BY idLocationDriver DESC LIMIT 1", [
    req.params.idDriver,
  ]);

  res.status(200).send(rows);
};
exports.getAllSite = async (req,res) =>{
  try {
    const result = await pool.query("SELECT * FROM ScgSite")
    if(result){
      return res.status(200).send(result)
    }else{
      return res.status(400).send({success: false,
        error: error.message,})
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error.message,
    });
  }
}
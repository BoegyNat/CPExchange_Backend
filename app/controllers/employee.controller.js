const db = require("../models");
const Employees = db.employees;

const pool = require("../connection.js");

exports.allEmployees = async (req, res) => {
  try {
    const row = await pool.query(
      // "SELECT * FROM Employee ;"
      "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL ;"
    );

    res.status(200).send(row);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getEmployeesById = async (req, res) => {
  try {
    // console.log("getEmployeesByIdApproved", req.params.id);
    const data = await pool.query(
      "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
      [req.params.id]
    );
    if (data.length > 0) {
      res.status(200).send(data);
    } else {
      console.log("null");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getEmployeesByIdApproved = async (req, res) => {
  try {
    // console.log("getEmployeesByIdApproved", req.params.id);
    const data = await pool.query(
      "SELECT e.idManagerLV1,e.idManagerLV2 FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
      [req.params.id]
    );
    let Managers = [];
    if (data[0].idManagerLV1 !== null) {
      const ManagerLV1 = await pool.query(
        "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
        [data[0].idManagerLV1]
      );

      const ManagerLV2 = await pool.query(
        "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
        [data[0].idManagerLV2]
      );
      if (ManagerLV1.length > 0) {
        Managers.push(ManagerLV1[0]);
      }
      if (ManagerLV2.length > 0) {
        Managers.push(ManagerLV2[0]);
      }
      // const Managers = [ManagerLV1[0], ManagerLV2[0]];

      res.status(200).send(Managers);
    } else {
      res.status(404).send(Managers);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getEmployeesByPage = async (req, res) => {
  try {
    console.log(req.params.page);
    const page = parseInt(req.params.page);
    const Start = (page - 1) * 100 + 1;
    const End = page * 100;
    const data = await pool.query(
      "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE e.idEmployees BETWEEN ? AND ? AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ;",
      [Start, End]
    );
    if (data.length > 0) {
      res.status(200).send(data);
    } else {
      console.log("null");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getEmployeesByCompany = async (req, res) => {
  try {
    const data = await pool.query(
      "SELECT * FROM UniHR.Employees e LEFT JOIN UniHR.EmployeePosition ep ON e.idEmployees = ep.idEmployees  LEFT JOIN UniHR.`Position` p ON ep.idPosition = p.idPosition LEFT JOIN UniHR.`Section` s ON p.idSection = s.idSection LEFT JOIN UniHR.Department d ON p.idDepartment = d.idDepartment LEFT JOIN UniHR.Division d2 ON p.idDivision = d2.idDivision LEFT JOIN UniHR.BusinessUnit bu ON p.idBusinessUnit = bu.idBusinessUnit LEFT JOIN UniHR.Company c ON p.idCompany = c.idCompany WHERE p.idCompany = ?  AND (ep.`start` <= CURDATE() AND ep.`end` >= CURDATE() OR ep.`end` IS NULL) ",
      [req.params.idCompany]
    );
    if (data.length > 0) {
      res.status(200).send(data);
    } else {
      console.log("null");
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.postEditProfileEmployee = async (req, res) => {
  try {
    const data = await pool.query(
      "UPDATE UniHR.Employees SET houseNo=?, villageNo=?, road=?, subDistrict=?, district=?, provience=?, areaCode=?, latAddress=?, lngAddress=? WHERE idEmployees = ?",
      [
        req.body.houseNo,
        req.body.villageNo,
        req.body.road,
        req.body.subDistrict,
        req.body.district,
        req.body.provience,
        req.body.areaCode,
        req.body.latAddress,
        req.body.lngAddress,
        req.body.idEmployees,
      ]
    );
    if (data) {
      res.status(200).send({ message: "Update Success" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const db = require("../models");
const RoutesDay = db.routesDay;
const Employees = db.employees;
const Drivers = db.drivers;
const Users = db.users;

let CompareDate = (date, dateData) => {
  let dateCompare = new Date(date).setHours(0,0,0,0);
  let dateDataCompare = new Date(dateData).setHours(0,0,0,0);
  return dateCompare == dateDataCompare;
};

exports.allRoutesDay = (req, res) => {
  try {
    let result = [];
    RoutesDay.map( route => {
      let objTmp = {};
      let UserProfile = Employees.find( user => user.idUser == route.idUser );
      if(UserProfile.lat){
        objTmp.lat = UserProfile.lat;
      }else{
        objTmp.lat = null;
      }
      if(UserProfile.long){
        objTmp.long = UserProfile.long;
      }else{
        objTmp.long = null;
      }
      objTmp.fNameThai = UserProfile.fNameThai;
      result.push({...route,...objTmp});
    })
    if(result.length > 0){
      res.status(200).send(result);
    }else{
      res.status(500).send({message: "error"});
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
  
};

exports.addRoutesDay = (req, res) => {
  try {
      console.log(req.body);
      RoutesDay = RoutesDay.push(req.body);
      res.status(200).send();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
  
};

exports.getUserRoute = (req, res) => {
  try {
    const UserRoute = RoutesDay.find( route => route.idUser == req.params.idUser );
    const DriverProfile = Drivers.find( driver => driver.idDriver == UserRoute.idDriver );
    const EmployeeProfile = Employees.find( emp => emp.idUser == req.params.idUser );
    let result = {...UserRoute, fullnameDriver: DriverProfile.FullName, mobileNumberDriver: DriverProfile.Telephone, plateNo: DriverProfile.PlateNumCar, rating: DriverProfile.Rating, latUser: EmployeeProfile.lat, lngUser: EmployeeProfile.long }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};

exports.getRouteLine = (req, res) => {
  try {
    const RouteUser = RoutesDay.find( route => route.idUser == req.body.idUser && CompareDate(route.routeDate,req.body.routeDate));
    if(RouteUser){
      const RouteLine = RoutesDay.filter( route => {
        return (
          route.idUser !== 2221 &&
          CompareDate(route.routeDate,RouteUser.routeDate) && 
          route.routeLine == RouteUser.routeLine && 
          route.routeDayShift == RouteUser.routeDayShift && 
          route.routeSite == RouteUser.routeSite 
        )
      });
      RouteLine.map( route => {
        let User = Employees.find( emp => emp.idUser == route.idUser );
        route.fnameThai = User.fNameThai;
        route.departmentThai = User.departmentName;
        route.telephoneMobile = User.mobileNumber;
      });
      res.status(200).send(RouteLine);
    }
    else{
      res.status(404).send({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};

exports.getRouteByIdDriver = (req, res) => {
  try {
    const RouteLine = RoutesDay.filter( route => route.routeStatus == true && route.idDriver == req.params.idDriver);
    let result = [];
    RouteLine.map( route => {
      if(route.idUser !== 2221){
        let objTmp = {};
        let EmployeeProfile = Users.find( user => user.id === route.idUser);
        objTmp.fNameThaiUser = EmployeeProfile.fNameThai;
        objTmp.departmentUser = EmployeeProfile.department;
        objTmp.mobileNumberUser = EmployeeProfile.mobileNumber;
        objTmp.imageUser = EmployeeProfile.image;
        objTmp.latUser = EmployeeProfile.lat,
        objTmp.lngUser = EmployeeProfile.long,
        objTmp.addressNumberUser = EmployeeProfile.addressNumber;
        objTmp.villageSoiUser = EmployeeProfile.villageSoi;
        objTmp.streetRoadUser = EmployeeProfile.streetRoad;
        objTmp.subdistrictTambolUser = EmployeeProfile.subdistrictTambol;
        objTmp.districtUser = EmployeeProfile.district;
        objTmp.provinceUser = EmployeeProfile.province;
        objTmp.postalCodeUser = EmployeeProfile.postalCode;
        objTmp.workingLocationUser = EmployeeProfile.workingLocation;
        result.push({...route,...objTmp});
      }
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};

exports.removeUserByIdDriverAndIdUser = (req, res) => {
  try {
    const RouteLine = RoutesDay.find( route => route.idUser == req.params.idUser && route.idDriver == req.params.idDriver);
    if(RouteLine){
      RouteLine.routeStatus = false;
    }
    const ListRouteLine = RoutesDay.filter( route => route.routeStatus == true && route.idDriver == req.params.idDriver);
    let result = [];
    ListRouteLine.map( route => {
      if(route.idUser !== 2221){
        let objTmp = {};
        let EmployeeProfile = Users.find( user => user.id === route.idUser);
        objTmp.fNameThaiUser = EmployeeProfile.fNameThai;
        objTmp.departmentUser = EmployeeProfile.department;
        objTmp.mobileNumberUser = EmployeeProfile.mobileNumber;
        objTmp.imageUser = EmployeeProfile.image;
        objTmp.latUser = EmployeeProfile.lat,
        objTmp.lngUser = EmployeeProfile.long,
        objTmp.addressNumberUser = EmployeeProfile.addressNumber;
        objTmp.villageSoiUser = EmployeeProfile.villageSoi;
        objTmp.streetRoadUser = EmployeeProfile.streetRoad;
        objTmp.subdistrictTambolUser = EmployeeProfile.subdistrictTambol;
        objTmp.districtUser = EmployeeProfile.district;
        objTmp.provinceUser = EmployeeProfile.province;
        objTmp.postalCodeUser = EmployeeProfile.postalCode;
        result.push({...route,...objTmp});
      }
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};

exports.gettingUserComplete = (req, res) => {
  try {
    RoutesDay.find( route => route.idUser == req.params.idUser && route.idDriver == req.params.idDriver ).statusGetting = true;
    const RouteLine = RoutesDay.filter( route => route.routeStatus == true && route.idDriver == req.params.idDriver);
    let result = [];
    RouteLine.map( route => {
      if(route.idUser !== 2221){
        let objTmp = {};
        let EmployeeProfile = Users.find( user => user.id === route.idUser);
        objTmp.fNameThaiUser = EmployeeProfile.fNameThai;
        objTmp.departmentUser = EmployeeProfile.department;
        objTmp.mobileNumberUser = EmployeeProfile.mobileNumber;
        objTmp.imageUser = EmployeeProfile.image;
        objTmp.latUser = EmployeeProfile.lat;
        objTmp.lngUser = EmployeeProfile.long;
        objTmp.addressNumberUser = EmployeeProfile.addressNumber;
        objTmp.villageSoiUser = EmployeeProfile.villageSoi;
        objTmp.streetRoadUser = EmployeeProfile.streetRoad;
        objTmp.subdistrictTambolUser = EmployeeProfile.subdistrictTambol;
        objTmp.districtUser = EmployeeProfile.district;
        objTmp.provinceUser = EmployeeProfile.province;
        objTmp.postalCodeUser = EmployeeProfile.postalCode;
        result.push({...route,...objTmp});
      }
    });
    res.status(200).send(RoutesDay);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};

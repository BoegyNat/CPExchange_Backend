const db = require("../models");
const Routes = db.routes;

exports.allRoutes = (req, res) => {
    try {
      res.status(200).send(Routes);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
};

exports.getRoutesBySiteShift = (req, res) => {
  try {
    let result = Routes.filter((route)=> route.routeSite == req.body.routeSite && route.routeShift == req.body.routeShift );
    if(result){
      res.status(200).send(Routes);
    }
    else{
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

};


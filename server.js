const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: [
    "http://localhost:8081",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://uniadmin.co.s3-website-ap-southeast-1.amazonaws.com",
    "https://uniadmin.co",
  ],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: "50mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/image", express.static("./app/image"));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Uni admin" });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/course.routes")(app);
require("./app/routes/department.routes")(app);
require("./app/routes/car.routes")(app);
require("./app/routes/statusCar.routes")(app);
require("./app/routes/wayOfDriver.route")(app);
require("./app/routes/bus.route")(app);
require("./app/routes/booking.route")(app);
require("./app/routes/waitingFriendCar.route")(app);
require("./app/routes/registerOfDriver.routes")(app);
require("./app/routes/route.route")(app);
require("./app/routes/employee.route")(app);
require("./app/routes/routeDay.route")(app);
require("./app/routes/driver.route")(app);
require("./app/routes/vehicle.routes")(app);
require("./app/routes/lentCar.routes")(app);
require("./app/routes/review.route")(app);
require("./app/routes/historyLentCar.route")(app);
require("./app/routes/historyActionsOfLentCar.routes")(app);
require("./app/routes/google_map.routes")(app);
require("./app/routes/requestPassenger.route")(app);
require("./app/routes/crossAreaCarBooking.route")(app);
require("./app/routes/crossAreaCarBookingPassenger.route")(app);
require("./app/routes/vehicleType.routes")(app);
require("./app/routes/vehicleBrandAndModel.routes")(app);
require("./app/routes/inAreaCarBooking.routes")(app);
require("./app/routes/deliveryCarBooking.routes")(app);
require("./app/routes/betweenSiteCar.routes")(app);
require("./app/routes/passengerFriendToFriend.routes")(app);
require("./app/routes/crossAreaCarPoolBooking.routes")(app);
require("./app/routes/crossAreaCarPoolBookingPassenger.route")(app);
require("./app/routes/driverRouteDay.routes")(app);
require("./app/routes/adminLentCar.routes")(app);
require("./app/routes/routeCrossAreaCarPool.routes")(app);
require("./app/routes/deliverySampleshuttle.routes")(app);

require("./app/routes/site.routes")(app);

require("./app/routes/review.route")(app);

// Catering
require("./app/routes/Catering/catering.routes")(app);

// Maintenances
require("./app/routes/Maintenance/maintenance.routes")(app);

//MeetingRoom
require("./app/routes/meetingRoom.routes")(app);

//DriverBooking
require("./app/routes/driverBooking.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// function initial() {
//   Role.create({
//     id: 1,
//     name: "user"
//   });

//   Role.create({
//     id: 2,
//     name: "moderator"
//   });

//   Role.create({
//     id: 3,
//     name: "admin"
//   });
// }

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http"); // Import HTTP to combine with WebSocket
const WebSocket = require("ws"); // Import WebSocket

const app = express();

var corsOptions = {
  origin: [
    "http://localhost:8081",
    "http://localhost:3000",
    "http://localhost:3001",
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
  res.json({ message: "Welcome to bezkoder application." });
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
require("./app/routes/emergency.route")(app);
require("./app/routes/site.routes")(app);
require("./app/routes/review.route")(app);

// Catering
require("./app/routes/Catering/catering.routes")(app);

// Maintenances
require("./app/routes/Maintenance/maintenance.routes")(app);

// MeetingRoom
require("./app/routes/meetingRoom.routes")(app);

// DriverBooking
require("./app/routes/driverBooking.routes")(app);

// Create an HTTP server and attach the Express app
const server = http.createServer(app);

// Create WebSocket server using the same HTTP server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  // Example: Send a welcome message to the client
  ws.send(JSON.stringify({ type: "welcome", message: "WebSocket connected!" }));
});

// Broadcast function to notify all connected clients
exports.notify = function notify(type, message) {
  const data = {
    type: type,
    message: message,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// set port, listen for requests
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

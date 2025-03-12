const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./socket.js");
require("dotenv").config();

const app = express();

const origin_url = () => {
  const listurl = process.env.ORIGIN_URL;
  if (!listurl) {
    console.error("You must set the ORIGIN_URL environment variable.");
    process.exit(1);
  }

  return listurl.split(",");
};

var corsOptions = {
  origin: origin_url(),
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: "50mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/file", express.static("./app/file"));

app.use("/api/user", express.static("./app/user"));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/tag.routes")(app);
require("./app/routes/post.routes")(app);
require("./app/routes/comment.routes")(app);
require("./app/routes/reply.routes")(app);
require("./app/routes/notification.routes")(app);

// Create an HTTP server and attach the Express app
const server = http.createServer(app);

initializeSocket(server, origin_url());

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

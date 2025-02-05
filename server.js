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
    "http://localhost:5172",
    "https://uniadmin.co",
  ],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: "50mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/file", express.static("./app/file"));

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

// Create an HTTP server and attach the Express app
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

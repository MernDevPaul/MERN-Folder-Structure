"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const app = express();
const xss = require("xss-clean");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const config = require("./src/utils/config");
const { notFound, errorHandler } = require("./src/utils/error_handler");
const Service = require("./src/utils/service");
//db connect
const serviceInstance = new Service();
serviceInstance.dbConnect();
//init
serviceInstance.init();
// path access 
app.use("/public/uploads/", express.static(path.join(__dirname, "public/uploads")));
//Allow Cross-Origin requests
app.use(cors());
// Set security HTTP headers
app.use(helmet());
// Prevent http param pollution
app.use(hpp());
// Log HTTP requests
app.use(morgan("dev")); //combined dev
// Limit request from the same API
const limiter = rateLimit({
  max: 5000,
  windowMs: 60 * 60 * 1000,
  message: "Too Many Request from this IP, please try again in an hour",
});
app.use("/api", limiter);
// Body parser, reading data from body into req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Data sanitization against Nosql query injection
app.use(mongoSanitize());
// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());
//routes
app.use(require("./src/route"));
//image request
const arr = [];
app.post("/", (req, res) => {
  arr.push(req.body);
  res.send(arr);
});
app.get("/", (req, res) => {
  res.send("Server is Online");
});
//Error Handler
app.use(notFound);
app.use(errorHandler);
//Create Server
app.listen(config.PORT, () => {
  console.log(`Server is running at post ${config.PORT}`);
});


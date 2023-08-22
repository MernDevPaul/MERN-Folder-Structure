const express = require("express");
const app = express.Router();
const admin_url = "/api/v1/admin";

app.
  //admin routes
  use(admin_url, require("./admin_route"));

module.exports = app;
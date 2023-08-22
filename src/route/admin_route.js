const express = require("express");
const app = express.Router();
const service = require("../utils/service");
const serviceInstance = new service();
const authVerify = serviceInstance.auth.bind(serviceInstance);
app.use('/',require('../controller/admin/admin_controller'))
app.use("/sample",authVerify, require("../controller/admin/sample_controller"));


module.exports = app;
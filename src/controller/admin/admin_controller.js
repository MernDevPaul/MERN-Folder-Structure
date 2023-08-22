const BaseController = require("../base_controller");
const { Router } = require("express");
const Admin = require("../../models/admin_model");

class AdminController extends BaseController {
  constructor() {
    super();
    this.router = Router();
    this.model = Admin;
    this.router.post("/register", this.asyncHandler(this.create));
    this.router.post("/login", this.asyncHandler(this.login));
  }
  //register
  create = async (req, res) => {
    try {
      const { email, phone } = req.body;
      const check_email = await this.findOne(this.model, { email });
      const check_phone = await this.findOne(this.model, { phone });
      if (check_email) throw new Error("Email already exists");
      if (check_phone) throw new Error("Phone already exists");
      const create = await this.create(this.model, req.body);
      const token = await this.createToken(create?._id);
      this.success(res, 200, true, "Admin created", data, token);
    } catch (error) {
      throw new Error(error);
    }
  };
  //login
  login = async (req, res) => {
    try {
      const { phone, password } = req.body;
      const check = await this.findOne(this.model,{ phone, password });
      if (!check) throw new Error("Invalid email or password");
      const token = await this.createToken(check?._id);
      this.success(res, 200, true, "Login success", check, token);
    } catch (error) {
      throw new Error(error);
    }
  };
}

module.exports = new AdminController().router;
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const config = require("./config");
const mongoose = require("mongoose");
const Admin = require("../models/admin_model");
const multer = require("multer");
const { admin } = require("../utils/init");
const asyncHandler = require("express-async-handler");
class Service {
  constructor() {
    this.model = null;
    this.admin = Admin;
    this.jwt = jwt;
    this.nodemailer = nodemailer;
    this.config = config;
    this.mongoose = mongoose;
    this.asyncHandler = asyncHandler;
  }
  async create(model, data) {
    return await model.create(data);
  }

  async createMany(model, data) {
    return await model.insertMany(data);
  }

  async update(model, conditions, update, options) {
    return await model.findOneAndUpdate(conditions, update, options);
  }

  async updateById(model, id, update, options) {
    return await model.findByIdAndUpdate(id, update, options);
  }

  async updateMany(model, conditions, update, options) {
    return await model.updateMany(conditions, update, options);
  }

  async delete(model, conditions) {
    return await model.findOneAndDelete(conditions);
  }

  async deleteById(model, id) {
    return await model.findByIdAndDelete(id);
  }

  async deleteMany(model, conditions) {
    return await model.deleteMany(conditions);
  }

  async findOne(model, query, projection, extension={}) {
    const { options, populate } = extension;
    return await model
      .findOne(query, projection, options)
      .populate(populate)
      .exec();
  }

  async findOneById(model, id, projection, extension={}) {
    const { options, populate } = extension;
    return await model
      .findById(id, projection, options)
      .populate(populate)
      .exec();
  }

  async find(model, query, projection, extension={}) {
    const { populate, sort, limit, options, count } = extension;
    let queryObj = model.find(query, projection, options);
    if (populate) queryObj = queryObj.populate(populate);
    if (sort) queryObj = queryObj.sort(sort);
    if (limit) queryObj = queryObj.limit(limit);

    const execQuery = queryObj.exec();
    if (count) {
      const countResult = this.model.countDocuments(query);
      return Promise.all([execQuery, countResult]).then(([data, count]) => ({
        data,
        count,
      }));
    }

    return execQuery;
  }

  async getAggregation(model, query, extension={}) {
    const { populate } = extension;
    let aggregation = model.aggregate(query);
    if (populate) aggregation = aggregation.populate({ path: populate });
    return aggregation.exec();
  }

  async getCount(model, conditions) {
    return await model.countDocuments(conditions);
  }

  async createToken(id) {
    return await this.jwt.sign({ id }, this.config.JWT_SECRET, { expiresIn: "30d" });
  }

  async verifyToken(token) {
    return await this.jwt.verify(token, this.config.JWT_SECRET);
  }

  uploadSingle(image) {
    let storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/uploads");
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + Math.random() + ".webp");
      },
    });
    let upload = multer({ storage: storage });
    return upload.single(image);
  }

  uploadMultiple(image) {
    let storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/uploads");
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + Math.random() + ".webp");
      },
    });
    let upload = multer({ storage: storage });
    return upload.array(image);
  }

  async success(res, status, success, message, data, token) {
    res.statusMessage = message;
    res.status(status).json({ status, success, message, data, token }).end();
  }

  async error(res, status, error, message) {
    res.statusMessage = message;
    res.status(status).json({ status, error, message }).end();
  }

  async sendMail(options) {
    const transporter = nodemailer.createTransport({
      host: this.config.SMPT_HOST,
      port: this.config.SMPT_PORT,
      service: this.config.SMPT_SERVICE,
      auth: {
        user: this.config.SMPT_MAIL,
        pass: this.config.SMPT_PASSWORD,
      },
    });

    const mailOptions = {
      from: this.config.SMPT_MAIL,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    await transporter.sendMail(mailOptions);
  }

  async validateId(id, meg) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new Error(`${meg ?? "This id"} is Invalid!`);
  }

  async dbConnect() {
    try {
      await mongoose.connect(config.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`DB connected successfully ${config.MONGO_URI}`);
    } catch (error) {
      console.error(`DB connection error: ${error.message}`);
    }
  }

  async init() {
    const check_admin = await this.admin.find().countDocuments();
    if (check_admin < 1) {
      await this.create(this.admin, admin[0]);
    }
  }

  async auth(req, res, next) {
    const token = req?.headers?.authorization?.split(" ")[1];
    if(!token) return this.error(res, 401, true, "Unauthorized");
    const decoded = await this.verifyToken(token);
    if (!decoded) return this.error(res, 401, true, "Unauthorized");
    const verify_admin = await this.admin.findOne({ _id: decoded.id });
    if (!verify_admin) return this.error(res, 401, true, "Unauthorized");
    req.admin = verify_admin;
    next();
  }
}

module.exports = Service;
